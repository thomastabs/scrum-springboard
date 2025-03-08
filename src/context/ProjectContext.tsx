
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Sprint, Task, BurndownData } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface ProjectContextProps {
  projects: Project[];
  sprints: Sprint[];
  tasks: Task[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  getProject: (id: string) => Project | undefined;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addSprint: (sprint: Omit<Sprint, 'id'>) => void;
  getSprint: (id: string) => Sprint | undefined;
  getSprintsByProject: (projectId: string) => Sprint[];
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  getTasksBySprintId: (sprintId: string) => Task[];
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getBurndownData: (projectId: string) => BurndownData[];
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load data from localStorage on mount
    const storedProjects = localStorage.getItem('projects');
    const storedSprints = localStorage.getItem('sprints');
    const storedTasks = localStorage.getItem('tasks');

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedSprints) setSprints(JSON.parse(storedSprints));
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    
    // Add sample data if none exists
    if (!storedProjects) {
      const sampleProject: Project = {
        id: '1',
        name: 'Teste1',
        description: 'Testeeeeeeee',
        endGoal: 'Talvez testarrrrr',
        createdAt: '3/6/2025',
        owner: '1'
      };
      setProjects([sampleProject]);
      localStorage.setItem('projects', JSON.stringify([sampleProject]));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('sprints', JSON.stringify(sprints));
  }, [sprints]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleDateString()
    };
    
    setProjects(prev => [...prev, newProject]);
    toast({
      title: "Project created",
      description: "Your new project has been created successfully"
    });
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      )
    );
    toast({
      title: "Project updated",
      description: "The project has been updated successfully"
    });
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    // Also delete associated sprints and tasks
    const projectSprintIds = sprints
      .filter(sprint => sprint.projectId === id)
      .map(sprint => sprint.id);
    
    setSprints(prev => prev.filter(sprint => sprint.projectId !== id));
    setTasks(prev => prev.filter(task => !projectSprintIds.includes(task.sprintId)));
    
    toast({
      title: "Project deleted",
      description: "The project and all associated data have been deleted"
    });
  };

  const addSprint = (sprint: Omit<Sprint, 'id'>) => {
    const newSprint: Sprint = {
      ...sprint,
      id: Date.now().toString()
    };
    
    setSprints(prev => [...prev, newSprint]);
    toast({
      title: "Sprint created",
      description: "Your new sprint has been created successfully"
    });
  };

  const getSprint = (id: string) => {
    return sprints.find(sprint => sprint.id === id);
  };

  const getSprintsByProject = (projectId: string) => {
    return sprints.filter(sprint => sprint.projectId === projectId);
  };

  const updateSprint = (id: string, updates: Partial<Sprint>) => {
    setSprints(prev => 
      prev.map(sprint => 
        sprint.id === id ? { ...sprint, ...updates } : sprint
      )
    );
    toast({
      title: "Sprint updated",
      description: "The sprint has been updated successfully"
    });
  };

  const deleteSprint = (id: string) => {
    setSprints(prev => prev.filter(sprint => sprint.id !== id));
    // Also delete associated tasks
    setTasks(prev => prev.filter(task => task.sprintId !== id));
    
    toast({
      title: "Sprint deleted",
      description: "The sprint and all associated tasks have been deleted"
    });
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    };
    
    setTasks(prev => [...prev, newTask]);
    toast({
      title: "Task created",
      description: "Your new task has been created successfully"
    });
  };

  const getTasksBySprintId = (sprintId: string) => {
    return tasks.filter(task => task.sprintId === sprintId);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
    toast({
      title: "Task updated",
      description: "The task has been updated successfully"
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully"
    });
  };

  const getBurndownData = (projectId: string): BurndownData[] => {
    // In a real app, this would calculate real burndown data
    // For now, we'll return mock data for demonstration
    const projectSprints = sprints.filter(sprint => sprint.projectId === projectId);
    
    if (projectSprints.length === 0) {
      return [];
    }
    
    // Find the earliest sprint start date and latest end date
    const startDates = projectSprints.map(sprint => new Date(sprint.startDate).getTime());
    const endDates = projectSprints.map(sprint => new Date(sprint.endDate).getTime());
    
    const projectStartDate = new Date(Math.min(...startDates));
    const projectEndDate = new Date(Math.max(...endDates));
    
    // Generate dates between start and end
    const dates: BurndownData[] = [];
    const currentDate = new Date(projectStartDate);
    const totalDays = Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get total story points
    const projectTasks = tasks.filter(task => 
      projectSprints.some(sprint => sprint.id === task.sprintId)
    );
    
    const totalStoryPoints = projectTasks.reduce((sum, task) => sum + task.storyPoints, 0);
    
    // Create ideal burndown line
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      
      const idealRemaining = totalStoryPoints - (totalStoryPoints * (i / totalDays));
      
      dates.push({
        date: date.toLocaleDateString(),
        ideal: Math.max(0, Math.round(idealRemaining * 10) / 10),
        actual: 0 // We'll calculate this below
      });
    }
    
    // Calculate actual burndown (simplified for demo)
    // In real app, this would use task completion dates
    dates.forEach((data, index) => {
      // Mock actual data that somewhat follows the ideal line with some variations
      if (index === 0) {
        data.actual = totalStoryPoints;
      } else if (index === dates.length - 1) {
        data.actual = Math.random() * 2; // Close to zero but not quite
      } else {
        // Add some randomness to make it look realistic
        const variance = (Math.random() - 0.5) * 2; // between -1 and 1
        data.actual = Math.max(0, data.ideal + variance);
      }
    });
    
    return dates;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        sprints,
        tasks,
        addProject,
        getProject,
        updateProject,
        deleteProject,
        addSprint,
        getSprint,
        getSprintsByProject,
        updateSprint,
        deleteSprint,
        addTask,
        getTasksBySprintId,
        updateTask,
        deleteTask,
        getBurndownData
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
