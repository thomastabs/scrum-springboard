
import { supabase } from './client';

// Helper function to send a project chat message using the database function
export const sendProjectChatMessage = async (projectId: string, userId: string, username: string, message: string) => {
  try {
    console.log('Sending chat message:', { projectId, userId, username, message });
    
    // Use the database function we created
    const { data, error } = await supabase.rpc(
      'insert_chat_message',
      {
        p_project_id: projectId,
        p_user_id: userId,
        p_username: username,
        p_message: message
      }
    );
      
    if (error) {
      console.error('Error in sendProjectChatMessage:', error);
      throw error;
    }
    
    console.log('Chat message sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending project chat message:', error);
    throw error;
  }
};

// Helper function to fetch project chat messages
export const fetchProjectChatMessages = async (projectId: string) => {
  try {
    console.log('Fetching chat messages for project:', projectId);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, message, user_id, username, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
    
    console.log('Chat messages fetched:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching project chat messages:', error);
    return [];
  }
};
