
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/context/ProjectContext";
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
import { format, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const BurndownChart: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject } = useProjects();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const project = getProject(projectId || "");
  
  useEffect(() => {
    const fetchBurndownData = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        const { data: burndownData, error } = await supabase
          .from('burndown_data')
          .select('*')
          .eq('project_id', projectId)
          .order('date', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        if (burndownData && burndownData.length > 0) {
          // Format the data for the chart
          const formattedData = burndownData.map((item) => ({
            date: item.date,
            ideal: item.ideal_points,
            actual: item.actual_points,
            formattedDate: format(parseISO(item.date), "MMM dd"),
          }));
          
          setChartData(formattedData);
          console.log("Fetched burndown data:", formattedData);
        } else {
          // Generate default data if none exists
          const defaultData = generateDefaultData();
          setChartData(defaultData);
          
          // Create default data in the database
          await createDefaultBurndownData(projectId, defaultData);
        }
      } catch (error) {
        console.error("Error fetching burndown data:", error);
        toast.error("Failed to load burndown data");
        setChartData(generateDefaultData());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBurndownData();
  }, [projectId]);
  
  const generateDefaultData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      data.push({
        date: dateStr,
        ideal: 100 - (i * (100 / 13)),
        actual: i === 0 ? 100 : null,
        formattedDate: format(date, "MMM dd"),
      });
    }
    
    return data;
  };
  
  const createDefaultBurndownData = async (projectId: string, defaultData: any[]) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      const userId = userData.user.id;
      
      // Insert all default burndown data points
      const dataToInsert = defaultData.map(item => ({
        project_id: projectId,
        date: item.date,
        ideal_points: item.ideal,
        actual_points: item.actual || 0,
        user_id: userId
      }));
      
      const { error } = await supabase
        .from('burndown_data')
        .insert(dataToInsert);
        
      if (error) {
        console.error("Error creating default burndown data:", error);
      }
    } catch (error) {
      console.error("Error creating default burndown data:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-scrum-accent"></div>
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
              dot={true}
              activeDot={{ r: 8 }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BurndownChart;
