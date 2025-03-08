
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, ListChecks, Clock, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabProps {
  projectId: string;
  activeTab: string;
}

const ProjectTabs: React.FC<TabProps> = ({ projectId, activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    { id: 'sprints', label: 'Sprints', icon: <Layout size={18} /> },
    { id: 'backlog', label: 'Product Backlog', icon: <ListChecks size={18} /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={18} /> },
    { id: 'burndown', label: 'Burndown Chart', icon: <LineChart size={18} /> }
  ];
  
  const handleTabClick = (tabId: string) => {
    navigate(`/projects/${projectId}/${tabId}`);
  };
  
  return (
    <div className="flex space-x-2 overflow-x-auto scrollbar-none p-2 bg-gray-900 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
            activeTab === tab.id 
              ? "bg-black text-white border border-gray-700" 
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          )}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProjectTabs;
