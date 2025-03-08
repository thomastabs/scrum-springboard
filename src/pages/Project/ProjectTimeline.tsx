
import React from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Project } from '@/types';

interface ProjectContextType {
  project: Project;
}

const ProjectTimeline: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useOutletContext<ProjectContextType>();
  
  return (
    <div className="mt-6">
      <div className="bg-black border border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Project Timeline</h2>
        <p className="text-gray-400 mb-6">View your project timeline and milestones</p>
        
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <h3 className="text-xl font-medium mb-2">Timeline Feature Coming Soon</h3>
          <p className="text-gray-400">
            This feature is under development
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
