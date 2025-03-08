
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import NavBar from '@/components/NavBar';
import ProjectCard from '@/components/ProjectCard';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';

interface ProjectFormData {
  name: string;
  description: string;
  endGoal: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, addProject } = useProject();
  const navigate = useNavigate();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    endGoal: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    addProject({
      ...formData,
      owner: user.id
    });
    
    // Reset form and close dialog
    setFormData({ name: '', description: '', endGoal: '' });
    setIsDialogOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar title="Scrumify Hub" subtitle="Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-gray-900 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-black">
                <Folder size={18} className="mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-black">
                <Folder size={18} className="mr-2" />
                My Projects
              </TabsTrigger>
              <TabsTrigger value="collaborations" className="data-[state=active]:bg-black">
                <Users size={18} className="mr-2" />
                My Collaborations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Welcome to Scrumify Hub</h2>
              <p className="text-gray-400 mb-6">Your central workspace for agile project management</p>
              {/* Overview content would go here */}
            </TabsContent>
            
            <TabsContent value="projects" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Projects</h2>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-black hover:bg-gray-200">
                      <Plus size={16} className="mr-2" />
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
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
                          onClick={() => setIsDialogOpen(false)}
                          className="border-gray-700 text-white"
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Create Project
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                  <p className="text-gray-400 mb-6">Create your first project to get started</p>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <Plus size={16} className="mr-2" />
                    New Project
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="collaborations" className="mt-6">
              <h2 className="text-2xl font-bold mb-6">My Collaborations</h2>
              <div className="text-center py-12 bg-gray-900 rounded-lg">
                <h3 className="text-xl font-medium mb-2">No collaborations yet</h3>
                <p className="text-gray-400">You'll see projects shared with you here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
