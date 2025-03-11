
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, startOfDay, addDays } from "date-fns";
import { toast } from "sonner";

interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number;
  formattedDate: string;
}

const BurndownChart: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject } = useProjects();
  const { user } = useAuth();
  const [chartData, setChartData] = useState<BurndownDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const project = getProject(projectId || "");
  
  useEffect(() => {
    const fetchBurndownData = async () => {
      if (!projectId || !user) return;
      
      setIsLoading(true);
      try {
        // Fetch burndown data from Supabase
        const { data, error } = await supabase
          .from('burndown_data')
          .select('*')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .order('date', { ascending: true });
          
        if (error) throw error;
        
        let burndownData: BurndownDataPoint[] = [];
        
        if (!data || data.length === 0) {
          // If no data exists, generate default data
          burndownData = generateDefaultBurndownData();
          
          // Save default data to database
          await Promise.all(
            burndownData.map(async (point) => {
              await supabase.from('burndown_data').insert({
                project_id: projectId,
                user_id: user.id,
                date: point.date,
                ideal_points: point.ideal,
                actual_points: point.actual
              });
            })
          );
        } else {
          // Format the existing data for the chart
          burndownData = data.map((item) => ({
            date: item.date,
            ideal: item.ideal_points,
            actual: item.actual_points,
            formattedDate: format(parseISO(item.date), "MMM dd"),
          }));
        }
        
        setChartData(burndownData);
      } catch (error) {
        console.error("Error fetching burndown data:", error);
        toast.error("Failed to load burndown chart data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBurndownData();
  }, [projectId, user]);
  
  const generateDefaultBurndownData = (): BurndownDataPoint[] => {
    const data: BurndownDataPoint[] = [];
    const today = startOfDay(new Date());
    
    // Generate data for 3 weeks
    for (let i = 0; i < 21; i++) {
      const date = addDays(today, i);
      const dateStr = date.toISOString().split('T')[0];
      
      // For demo purposes, create a simple ideal burndown line
      // In a real app, this would be based on total story points
      const totalPoints = 100;
      const idealRemaining = Math.max(0, totalPoints - (i * (totalPoints / 20)));
      
      // For actual, start with the same as ideal and then
      // it will get updated as tasks are completed
      const actualRemaining = idealRemaining;
      
      data.push({
        date: dateStr,
        ideal: idealRemaining,
        actual: actualRemaining,
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
              label={{ value: "Story Points", angle: -90, position: "insideLeft", fill: "#777" }}
              stroke="#777"
              tick={{ fill: "#777" }}
              axisLine={{ stroke: "#444" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                border: "1px solid #444",
                borderRadius: "4px",
                color: "#fff",
              }}
            />
            <Legend
              wrapperStyle={{ color: "#fff" }}
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
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BurndownChart;
