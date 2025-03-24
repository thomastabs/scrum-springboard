
// Add a retry wrapper for Supabase requests
export const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoffFactor = 2
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // Only retry on network errors
      if (!(error instanceof Error) || !(error.message?.includes('Failed to fetch') || error.message?.includes('Network error'))) {
        throw error;
      }
      
      // Wait with exponential backoff before retrying
      const waitTime = delay * Math.pow(backoffFactor, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};
