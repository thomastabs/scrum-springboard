
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full bg-black border border-gray-800 rounded-lg overflow-hidden animate-fade-up">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-white">{project.name}</h3>
          <span className="text-sm text-gray-400">{project.createdAt}</span>
        </div>
        <p className="mt-2 text-gray-400">{project.description}</p>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500">End goal:</p>
          <p className="text-white">{project.endGoal}</p>
        </div>
      </CardContent>
      
      <CardFooter className="bg-black p-0">
        <Button 
          onClick={() => navigate(`/projects/${project.id}`)}
          className="w-full rounded-none py-4 bg-transparent hover:bg-gray-800 transition-colors border-t border-gray-800 text-white"
        >
          Open Project
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
