
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wslflobdapmebkjnaqld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbGZsb2JkYXBtZWJram5hcWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NDc2ODQsImV4cCI6MjA1NzAyMzY4NH0.lNk_nX9S7KMjSYnR1JpFns7biqXvq0Ln2Z6pAYGi9aQ';

// Configure client with retry and timeout options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
    },
    fetch: (url, options) => {
      const controller = new AbortController();
      const { signal } = controller;
      
      // Set a timeout to abort long-running requests
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      return fetch(url, { 
        ...options, 
        signal,
        // Ensure we get fresh data
        cache: 'no-cache'
      }).finally(() => clearTimeout(timeoutId));
    }
  }
});

// Helper function to get authenticated client
export const getAuthenticatedClient = () => {
  return supabase;
};
