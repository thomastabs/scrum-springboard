
import { supabase } from './client';
import { withRetry } from './utils';

// Helper function to fetch columns for a sprint
export const fetchSprintColumns = async (sprintId: string, userId: string) => {
  try {
    return await withRetry(async () => {
      const { data, error } = await supabase
        .from('board_columns')
        .select('*')
        .eq('sprint_id', sprintId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      return data || [];
    });
  } catch (error) {
    console.error('Error fetching sprint columns:', error);
    return [];
  }
};

// Helper function to create a default column
export const createDefaultColumn = async (sprintId: string, userId: string, title: string, orderIndex: number) => {
  try {
    const { data, error } = await supabase
      .from('board_columns')
      .insert({
        sprint_id: sprintId,
        user_id: userId,
        title: title,
        order_index: orderIndex
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating default column:', error);
    return null;
  }
};

// Helper function to delete a column
export const deleteColumn = async (columnId: string) => {
  try {
    const { error } = await supabase
      .from('board_columns')
      .delete()
      .eq('id', columnId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting column:', error);
    return false;
  }
};
