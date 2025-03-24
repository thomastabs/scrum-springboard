
import { supabase } from './client';
import { withRetry } from './utils';

// New helper to fetch tasks for a sprint as a collaborator
export const fetchCollaborativeSprintTasks = async (sprintId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('sprint_id', sprintId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching collaborative sprint tasks:', error);
    return [];
  }
};

// New helper to fetch backlog tasks for a project as a collaborator
export const fetchCollaborativeBacklogTasks = async (projectId: string) => {
  try {
    console.log('Fetching collaborative backlog tasks for project:', projectId);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .is('sprint_id', null)
      .eq('status', 'backlog');
      
    if (error) {
      console.error('Error fetching backlog tasks:', error);
      throw error;
    }
    
    console.log('Backlog tasks fetched:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching collaborative backlog tasks:', error);
    return [];
  }
};

// Helper function to update a task with completion date - IMPROVED PERSISTENCE
export const updateTaskWithCompletionDate = async (taskId: string, data: {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  story_points?: number;
  assign_to?: string;
  completion_date?: string | null;
}) => {
  try {
    return await withRetry(async () => {
      console.log("Updating task with completion date - Initial data:", JSON.stringify(data));
      
      // Get the current task data first
      const { data: existingTask, error: fetchError } = await supabase
        .from('tasks')
        .select('status, completion_date')
        .eq('id', taskId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching existing task data:', fetchError);
        throw fetchError;
      }
      
      console.log("Existing task data:", JSON.stringify(existingTask));
      
      let updateData = { ...data };
      
      // Handle completion date logic:
      // 1. If explicitly provided in update (even if null), use the new value
      // 2. If changing to "done" status and no completion date exists, set to today
      // 3. If task already has a completion date, preserve it
      if ('completion_date' in data) {
        // Case 1: Use explicitly provided completion date (even if null)
        console.log(`Setting completion date to provided value: ${data.completion_date}`);
        updateData.completion_date = data.completion_date;
      } else if (data.status === 'done' && (!existingTask.completion_date || existingTask.status !== 'done')) {
        // Case 2: Changing to done status without completion date - set to today
        const todayDate = new Date().toISOString().split('T')[0];
        console.log(`Setting completion date to today: ${todayDate}`);
        updateData.completion_date = todayDate;
      } else if (existingTask.completion_date && !('completion_date' in data)) {
        // Case 3: Preserve existing completion date if it exists and not explicitly trying to change it
        console.log(`Preserving existing completion date: ${existingTask.completion_date}`);
        updateData.completion_date = existingTask.completion_date;
      }
      
      console.log('Final update data:', JSON.stringify(updateData));
      
      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();
        
      if (error) throw error;
      return updatedTask;
    });
  } catch (error) {
    console.error('Error updating task with completion date:', error);
    throw error;
  }
};
