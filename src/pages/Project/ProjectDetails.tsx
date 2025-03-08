
import React, { useState } from 'react';
import { useParams, useNavigate, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProject } from '@/context/ProjectContext';
import NavBar from '@/components/NavBar';
import ProjectTabs from '@/components/ProjectTabs';
import { confirmDialog } from '@/utils/confirmDialog';

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    getProject, 
    updateProject, 
    deleteProject,
  } = useProject();
  
  const project = getProject(projectId || '');
  
  // Extract active tab from URL
  const pathSegments = location.pathname.split('/');
  const activeTab = pathSegments[pathSegments.length - 1] === projectId 
    ? 'sprints' 
    : pathSegments[pathSegments.length - 1];
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    endGoal: project?.endGoal || ''
  });
  
  if (!project) {
    return <Navigate to="/" />;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProject(project.id, formData);
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteProject = async () => {
    const confirmed = await confirmDialog(
      'Delete Project', 
      'Are you sure you want to delete this project? This action cannot be undone.'
    );
    
    if (confirmed) {
      deleteProject(project.id);
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar title="Scrumify Hub" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button 
            variant="link" 
            className="text-gray-400 hover:text-white p-0"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Projects
          </Button>
        </div>
        
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2 h-auto text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={() => {
                    setFormData({
                      name: project.name,
                      description: project.description,
                      endGoal: project.endGoal
                    });
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Pencil size={16} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2 h-auto text-red-500 hover:text-red-400 hover:bg-gray-800"
                  onClick={handleDeleteProject}
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
            <p className="text-gray-400 mt-2">{project.description}</p>
          </div>
          
          {activeTab === 'sprints' && (
            <Button 
              onClick={() => navigate(`/projects/${project.id}/new-sprint`)}
              className="bg-white text-black hover:bg-gray-200"
            >
              <Plus size={16} className="mr-2" />
              New Sprint
            </Button>
          )}
        </div>
        
        <ProjectTabs projectId={project.id} activeTab={activeTab} />
        
        <div className="mt-6">
          <Outlet context={{ project }} />
        </div>
      </div>
      
      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateProject} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="endGoal">End Goal</Label>
              <Input
                id="endGoal"
                name="endGoal"
                value={formData.endGoal}
                onChange={handleInputChange}
                className="bg-black border-gray-700"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-700 text-white"
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetails;
