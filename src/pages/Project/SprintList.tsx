
import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { useProject } from '@/context/ProjectContext';
import { Project, Sprint } from '@/types';
import SprintCard from '@/components/SprintCard';

interface ProjectContextType {
  project: Project;
}

const SprintList: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useOutletContext<ProjectContextType>();
  const { getSprintsByProject } = useProject();
  const navigate = useNavigate();
  
  const [projectSprints, setProjectSprints] = useState<Sprint[]>([]);
  
  useEffect(() => {
    if (projectId) {
      const sprints = getSprintsByProject(projectId);
      // Sort sprints by date (newest first)
      sprints.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      setProjectSprints(sprints);
    }
  }, [projectId, getSprintsByProject]);
  
  const handleEditSprint = (sprintId: string) => {
    navigate(`/projects/${projectId}/sprints/${sprintId}/edit`);
  };
  
  const handleViewBoard = (sprintId: string) => {
    navigate(`/projects/${projectId}/sprints/${sprintId}/board`);
  };
  
  return (
    <div>
      {projectSprints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {projectSprints.map(sprint => (
            <SprintCard 
              key={sprint.id} 
              sprint={sprint} 
              onEdit={handleEditSprint} 
              onViewBoard={handleViewBoard} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900 rounded-lg mt-6">
          <h3 className="text-xl font-medium mb-2">No sprints yet</h3>
          <p className="text-gray-400 mb-6">Create your first sprint to start tracking your project</p>
        </div>
      )}
    </div>
  );
};

export default SprintList;
