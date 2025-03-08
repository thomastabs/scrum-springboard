
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProject } from '@/context/ProjectContext';
import NavBar from '@/components/NavBar';

const SprintForm: React.FC = () => {
  const { projectId, sprintId } = useParams<{ projectId: string; sprintId: string }>();
  const navigate = useNavigate();
  const { getProject, getSprint, addSprint, updateSprint } = useProject();
  
  const project = getProject(projectId || '');
  const sprint = sprintId ? getSprint(sprintId) : undefined;
  const isEditing = !!sprint;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'pending'
  });
  
  useEffect(() => {
    if (sprint) {
      setFormData({
        name: sprint.name,
        description: sprint.description,
        startDate: formatDateForInput(sprint.startDate),
        endDate: formatDateForInput(sprint.endDate),
        status: sprint.status
      });
    } else {
      // Set default dates for new sprint (current date to 2 weeks later)
      const today = new Date();
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(today.getDate() + 14);
      
      setFormData(prev => ({
        ...prev,
        startDate: formatDateForInput(today.toISOString()),
        endDate: formatDateForInput(twoWeeksLater.toISOString())
      }));
    }
  }, [sprint]);
  
  if (!project) {
    navigate('/');
    return null;
  }
  
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && sprint) {
      updateSprint(sprint.id, {
        name: formData.name,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: formData.status as 'pending' | 'active' | 'completed'
      });
    } else {
      addSprint({
        name: formData.name,
        description: formData.description,
        projectId: project.id,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: 'pending'
      });
    }
    
    navigate(`/projects/${project.id}`);
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar title="Scrumify Hub" />
      
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button 
            variant="link" 
            className="text-gray-400 hover:text-white p-0"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Project
          </Button>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h1 className="text-2xl font-bold mb-6">
            {isEditing ? 'Edit Sprint' : 'Create New Sprint'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Sprint Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-black border-gray-700"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="bg-black border-gray-700 min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="bg-black border-gray-700"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="bg-black border-gray-700"
                  required
                />
              </div>
            </div>
            
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-gray-700 rounded-md p-2"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
            
            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/projects/${project.id}`)}
                className="border-gray-700 text-white"
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Create Sprint'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SprintForm;
