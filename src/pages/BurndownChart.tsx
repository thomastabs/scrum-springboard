
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { supabase, fetchBurndownData, upsertBurndownData } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO, startOfDay, addDays, min, max, differenceInDays, isBefore, isAfter, isToday } from "date-fns";
import { toast } from "sonner";
import { Task } from "@/types";

interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number | null;
  formattedDate: string;
}

const BurndownChart: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject, getTasksBySprint, getSprintsByProject, tasks, sprints } = useProjects();
  const { user } = useAuth();
  const [chartData, setChartData] = useState<BurndownDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const dataFetchedRef = useRef(false);
  
  const project = getProject(projectId || "");
  
  useEffect(() => {
    // Only fetch burndown data once when component mounts
    // or when project ID changes
    if (!projectId || !user || dataFetchedRef.current) return;
    
    const loadBurndownData = async () => {
      setIsLoading(true);
      try {
        // Try to load existing data from database first
        const existingData = await fetchBurndownData(projectId, user.id);
        
        if (existingData && existingData.length > 0) {
          // Add formatted date for display
          const formattedData = existingData.map(item => ({
            ...item,
            formattedDate: format(parseISO(item.date), "MMM dd")
          }));
          setChartData(formattedData);
        } else {
          // Generate new data if none exists
          await generateAndSaveBurndownData();
        }
      } catch (error) {
        console.error("Error loading burndown data:", error);
        // If loading fails, fall back to generating new data
        await generateAndSaveBurndownData();
      } finally {
        setIsLoading(false);
        dataFetchedRef.current = true;
      }
    };
    
    loadBurndownData();
  }, [projectId, user]);
  
  // Separate effect to handle task changes after initial load
  useEffect(() => {
    // Skip if not loaded yet or currently updating
    if (!projectId || !user || isLoading || isUpdating || !dataFetchedRef.current) return;
    
    const projectSprints = getSprintsByProject(projectId || "");
    if (projectSprints.length > 0) {
      const updateBurndownData = async () => {
        try {
          setIsUpdating(true);
          await generateAndSaveBurndownData();
        } catch (error) {
          console.error("Error updating burndown data:", error);
        } finally {
          setIsUpdating(false);
        }
      };
      
      updateBurndownData();
    }
  }, [tasks, sprints]);
  
  const generateAndSaveBurndownData = async () => {
    try {
      // Generate burndown data based on current tasks
      const burndownData = await generateBurndownData();
      setChartData(burndownData);
      
      // Save to database
      const saved = await upsertBurndownData(projectId || "", user?.id || "", burndownData);
      if (!saved) {
        console.warn("Failed to save burndown data to database");
      }
      
      return burndownData;
    } catch (error) {
      console.error("Error generating burndown data:", error);
      toast.error("Failed to generate burndown chart data");
      return [];
    }
  };
  
  const generateBurndownData = async (): Promise<BurndownDataPoint[]> => {
    const data: BurndownDataPoint[] = [];
    const today = startOfDay(new Date());
    
    // Get all sprints for the project
    const projectSprints = getSprintsByProject(projectId || "");
    
    if (projectSprints.length === 0) {
      // If no sprints exist, use default 21-day range
      return generateDefaultTimeframe(today, 21);
    }
    
    // Find earliest sprint start date and latest sprint end date
    let earliestStartDate: Date | null = null;
    let latestEndDate: Date | null = null;
    
    for (const sprint of projectSprints) {
      const startDate = parseISO(sprint.startDate);
      const endDate = parseISO(sprint.endDate);
      
      if (!earliestStartDate || isBefore(startDate, earliestStartDate)) {
        earliestStartDate = startDate;
      }
      
      if (!latestEndDate || isAfter(endDate, latestEndDate)) {
        latestEndDate = endDate;
      }
    }
    
    // Ensure we have valid dates
    if (!earliestStartDate || !latestEndDate) {
      return generateDefaultTimeframe(today, 21);
    }
    
    // Calculate days between earliest and latest dates
    const daysInProject = differenceInDays(latestEndDate, earliestStartDate) + 1;
    
    // Ensure we have at least 7 days for visibility
    const timeframeDays = Math.max(daysInProject, 7);
    
    // Get all tasks across all sprints
    const allTasks: Task[] = [];
    for (const sprint of projectSprints) {
      const sprintTasks = getTasksBySprint(sprint.id);
      allTasks.push(...sprintTasks);
    }
    
    // Calculate total story points across all tasks
    const totalStoryPoints = allTasks.reduce((sum, task) => {
      return sum + (task.storyPoints || 0);
    }, 0);
    
    // If no story points, set a default value
    if (totalStoryPoints === 0) {
      return generateDefaultTimeframe(today, timeframeDays);
    }
    
    // Create a map to track completed tasks by date
    const completedTasksByDate = new Map<string, number>();
    
    // Populate the map with completed tasks
    allTasks.forEach(task => {
      if (task.status === "done" && task.updatedAt && task.storyPoints) {
        const completionDate = task.updatedAt.split('T')[0];
        const currentPoints = completedTasksByDate.get(completionDate) || 0;
        completedTasksByDate.set(completionDate, currentPoints + task.storyPoints);
      }
    });
    
    // Generate data points for each day in the project timeframe
    let remainingPoints = totalStoryPoints;
    let actualRemainingPoints = totalStoryPoints;
    const pointsPerDay = totalStoryPoints / timeframeDays;
    
    for (let i = 0; i < timeframeDays; i++) {
      const date = addDays(earliestStartDate, i);
      const dateStr = date.toISOString().split('T')[0];
      const formattedDate = format(date, "MMM dd");
      
      // Calculate ideal burndown - linear decrease over the project timeframe
      const idealRemaining = Math.max(0, totalStoryPoints - (i * pointsPerDay));
      
      // For past dates, reduce actual points based on completed tasks
      let actualPoints: number | null = null;
      
      if (isBefore(date, today) || isToday(date)) {
        const completedPoints = completedTasksByDate.get(dateStr) || 0;
        actualRemainingPoints = Math.max(0, actualRemainingPoints - completedPoints);
        actualPoints = actualRemainingPoints;
      }
      
      data.push({
        date: dateStr,
        ideal: Math.round(idealRemaining),
        actual: actualPoints,
        formattedDate
      });
    }
    
    return data;
  };
  
  const generateDefaultTimeframe = (startDate: Date, days: number): BurndownDataPoint[] => {
    const data: BurndownDataPoint[] = [];
    const totalPoints = 100;
    const pointsPerDay = totalPoints / days;
    const today = startOfDay(new Date());
    
    for (let i = 0; i < days; i++) {
      const date = addDays(startDate, i - Math.floor(days / 3)); // Start a bit in the past
      const dateStr = date.toISOString().split('T')[0];
      const idealRemaining = Math.max(0, totalPoints - (i * pointsPerDay));
      
      // Only include actual data for dates up to today
      const actual = isBefore(date, today) || isToday(date) 
        ? Math.round(idealRemaining * (0.8 + Math.random() * 0.4)) // Random variation around ideal
        : null;
      
      data.push({
        date: dateStr,
        ideal: Math.round(idealRemaining),
        actual: actual,
        formattedDate: format(date, "MMM dd"),
      });
    }
    
    return data;
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading burndown chart data...</p>
      </div>
    );
  }
  
  // Get today's date for reference line
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIndex = chartData.findIndex(d => d.date === todayStr);
  const todayLabel = todayIndex >= 0 ? chartData[todayIndex].formattedDate : format(new Date(), "MMM dd");
  
  // Find the last actual data point to display a circle marker there
  const lastActualIndex = chartData.reduce((lastIdx, point, idx) => {
    return point.actual !== null ? idx : lastIdx;
  }, -1);
  
  return (
    <div>
      <div className="scrum-card mb-6">
        <h2 className="text-xl font-bold mb-2">Project Burndown Chart</h2>
        <p className="text-scrum-text-secondary">
          Tracking progress across all sprints in {project?.title || "this project"}
        </p>
      </div>
      
      <div className="scrum-card h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="formattedDate"
              stroke="#777"
              tick={{ fill: "#777" }}
              axisLine={{ stroke: "#444" }}
            />
            <YAxis
              label={{ value: "Story Points Remaining", angle: -90, position: "insideLeft", fill: "#777" }}
              stroke="#777"
              tick={{ fill: "#777" }}
              axisLine={{ stroke: "#444" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const idealValue = payload[0]?.value;
                  const actualValue = payload.length > 1 ? payload[1]?.value : null;
                  
                  return (
                    <div className="bg-scrum-card border border-scrum-border p-3 rounded">
                      <p className="font-medium">{payload[0].payload.formattedDate}</p>
                      <div className="mt-2 space-y-1">
                        <p className="flex items-center text-sm">
                          <span className="h-2 w-2 rounded-full bg-[#8884d8] mr-2"></span>
                          <span>Ideal: {idealValue} points</span>
                        </p>
                        {actualValue !== null && (
                          <p className="flex items-center text-sm">
                            <span className="h-2 w-2 rounded-full bg-[#82ca9d] mr-2"></span>
                            <span>Actual: {actualValue} points</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ color: "#fff" }}
            />
            <ReferenceLine 
              x={todayLabel} 
              stroke="#ccc" 
              strokeDasharray="3 3" 
              label={{ 
                value: "Today", 
                position: "top", 
                fill: "#ccc" 
              }} 
            />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#8884d8"
              name="Ideal Burndown"
              dot={false}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#82ca9d"
              name="Actual Burndown"
              dot={(props) => {
                // Only render dots for actual data points (not null)
                const { cx, cy, payload, index } = props;
                if (payload.actual === null) return null;
                
                // Only show dot for the last actual data point
                if (index === lastActualIndex) {
                  return (
                    <svg x={cx - 5} y={cy - 5} width={10} height={10}>
                      <circle cx={5} cy={5} r={5} fill="#82ca9d" />
                    </svg>
                  );
                }
                
                return null;
              }}
              activeDot={{ r: 8 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="scrum-card mt-6 p-4">
        <h3 className="text-lg font-medium mb-3">How to Read the Burndown Chart</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-scrum-text-secondary">
          <li>
            <strong>Ideal Burndown</strong>: Shows the theoretical perfect progress where work is completed at a constant rate.
          </li>
          <li>
            <strong>Actual Burndown</strong>: Shows the actual remaining work based on completed tasks.
          </li>
          <li>
            When the Actual line is <strong>above</strong> the Ideal line, the project is <strong>behind schedule</strong>.
          </li>
          <li>
            When the Actual line is <strong>below</strong> the Ideal line, the project is <strong>ahead of schedule</strong>.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BurndownChart;
