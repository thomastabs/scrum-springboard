
import React from 'react';
import { Edit, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sprint } from '@/types';

interface SprintCardProps {
  sprint: Sprint;
  onEdit: (id: string) => void;
  onViewBoard: (id: string) => void;
}

const SprintCard: React.FC<SprintCardProps> = ({ sprint, onEdit, onViewBoard }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className={cn(
      "w-full bg-black border border-gray-800 rounded-lg overflow-hidden animate-fade-up",
      sprint.status === 'completed' && "border-green-500"
    )}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-medium text-white">{sprint.name}</h3>
            {sprint.status === 'completed' && (
              <span className="px-2 py-1 bg-green-500 text-xs font-medium rounded-full text-white flex items-center">
                Completed
              </span>
            )}
          </div>
          
          <div className="flex items-center text-gray-400 text-sm">
            <Calendar size={14} className="mr-1" />
            <span>
              {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
            </span>
          </div>
          
          <p className="text-gray-400 mt-2">{sprint.description}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between p-0 border-t border-gray-800 divide-x divide-gray-800">
        <Button 
          onClick={() => onEdit(sprint.id)}
          className="flex-1 rounded-none py-4 bg-transparent hover:bg-gray-800 transition-colors text-white"
        >
          <Edit size={16} className="mr-2" />
          Edit
        </Button>
        <Button 
          onClick={() => onViewBoard(sprint.id)}
          className="flex-1 rounded-none py-4 bg-transparent hover:bg-gray-800 transition-colors text-white"
        >
          View Board
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SprintCard;
