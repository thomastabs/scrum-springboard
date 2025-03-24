
import { supabase } from './client';
import { Collaborator } from '@/types';

// Helper function to find a user by email or username
export const findUserByEmailOrUsername = async (emailOrUsername: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .single();
      
    if (error) {
      console.error('Error finding user:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};

// Helper function to add a collaborator to a project
export const addCollaborator = async (projectId: string, userId: string, role: 'product_owner' | 'team_member' | 'scrum_master') => {
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .insert({
        project_id: projectId,
        user_id: userId,
        role: role
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding collaborator:', error);
    throw error;
  }
};

// Helper function to fetch collaborators for a project
export const fetchProjectCollaborators = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .select(`
        id,
        role,
        created_at,
        user_id,
        users:user_id (id, username, email)
      `)
      .eq('project_id', projectId);
      
    if (error) throw error;
    
    // Transform the data to match our Collaborator type
    const collaborators: Collaborator[] = (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      username: item.users ? (item.users as any).username || '' : '',
      email: item.users ? (item.users as any).email || '' : '',
      role: item.role,
      createdAt: item.created_at
    }));
    
    return collaborators;
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return [];
  }
};

// Helper function to remove a collaborator from a project
export const removeCollaborator = async (collaboratorId: string) => {
  try {
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('id', collaboratorId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return false;
  }
};

// Helper function to update a collaborator's role
export const updateCollaboratorRole = async (collaboratorId: string, role: 'product_owner' | 'team_member' | 'scrum_master') => {
  try {
    const { error } = await supabase
      .from('collaborators')
      .update({ role })
      .eq('id', collaboratorId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating collaborator role:', error);
    return false;
  }
};

// Helper function to fetch projects where user is a collaborator
export const fetchCollaborativeProjects = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .select(`
        role,
        projects:project_id (
          id, 
          title, 
          description, 
          end_goal, 
          created_at, 
          updated_at,
          owner:owner_id (username, email)
        )
      `)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Transform the data to include role information
    return (data || []).map(item => {
      const project = item.projects as any;
      return {
        id: project.id,
        title: project.title,
        description: project.description || '',
        endGoal: project.end_goal,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        ownerId: project.owner_id,
        ownerName: project.owner ? project.owner.username || '' : '',
        isCollaboration: true,
        role: item.role
      };
    });
  } catch (error) {
    console.error('Error fetching collaborative projects:', error);
    return [];
  }
};

// New helper to check if a user is a collaborator on a project
export const checkProjectCollaborator = async (projectId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows found error code
        return null;
      }
      throw error;
    }
    
    return data?.role || null;
  } catch (error) {
    console.error('Error checking collaborator status:', error);
    return null;
  }
};

// New helper to fetch sprints for a project as a collaborator
export const fetchCollaborativeProjectSprints = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching collaborative project sprints:', error);
    return [];
  }
};
