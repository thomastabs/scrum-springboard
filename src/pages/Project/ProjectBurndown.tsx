
import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useProject } from '@/context/ProjectContext';
import { Project, BurndownData } from '@/types';
import BurndownChart from '@/components/BurndownChart';

interface ProjectContextType {
  project: Project;
}

const ProjectBurndown: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useOutletContext<ProjectContextType>();
  const { getBurndownData } = useProject();
  
  const [burndownData, setBurndownData] = useState<BurndownData[]>([]);
  
  useEffect(() => {
    if (projectId) {
      const data = getBurndownData(projectId);
      setBurndownData(data);
    }
  }, [projectId, getBurndownData]);
  
  return (
    <div className="mt-6">
      <div className="bg-black border border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Project Burndown Chart</h2>
        <p className="text-gray-400 mb-6">Tracking progress across all sprints in this project</p>
        
        {burndownData.length > 0 ? (
          <BurndownChart 
            data={burndownData} 
            title="Project Burndown Chart" 
            subtitle="Tracking progress across all sprints in this project"
          />
        ) : (
          <div className="text-center py-12 bg-gray-900 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No burndown data available</h3>
            <p className="text-gray-400 mb-2">
              Add tasks to your sprints to start seeing burndown progress
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectBurndown;
