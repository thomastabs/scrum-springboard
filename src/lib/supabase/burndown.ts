
import { supabase } from './client';
import { BurndownData as BurndownDataType } from '@/types';

// Helper function to fetch burndown data for a project
export const fetchBurndownData = async (projectId: string, userId: string): Promise<BurndownDataType[]> => {
  try {
    const { data, error } = await supabase
      .from('burndown_data')
      .select('date, ideal_points, actual_points')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('date', { ascending: true });
      
    if (error) throw error;
    
    // Map the database format to our app format
    return (data || []).map(item => ({
      date: item.date,
      ideal: item.ideal_points,
      actual: item.actual_points,
      formattedDate: item.date // This will be formatted in the component
    }));
  } catch (error) {
    console.error('Error fetching burndown data:', error);
    return [];
  }
};

// Improved helper to upsert burndown data with better handling
export const upsertBurndownData = async (
  projectId: string, 
  userId: string,
  burndownData: BurndownDataType[]
): Promise<boolean> => {
  try {
    // Process all data in a single operation using upsert
    const dbData = burndownData.map(item => ({
      project_id: projectId,
      user_id: userId,
      date: item.date,
      ideal_points: item.ideal || 0,
      actual_points: item.actual !== null && item.actual !== undefined ? item.actual : 0
    }));
    
    const { error } = await supabase
      .from('burndown_data')
      .upsert(dbData, { 
        onConflict: 'project_id,user_id,date',
        ignoreDuplicates: false // We want to update if there's a conflict
      });
      
    if (error) {
      console.error('Error in burndown data upsert:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error upserting burndown data:', error);
    return false;
  }
};
