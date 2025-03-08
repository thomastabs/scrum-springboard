
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export async function signIn(loginCredential: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .rpc('verify_password', {
        login_credential: loginCredential,
        input_password: password
      });

    if (error) {
      console.error('Error during login:', error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error('Invalid credentials');
    }

    // Convert the returned data to our User type
    const user: User = {
      id: data[0].id,
      email: data[0].email,
      name: data[0].username || data[0].email.split('@')[0],
    };

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function signUp(email: string, username: string, password: string): Promise<User | null> {
  try {
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      throw new Error(checkError.message);
    }

    if (existingUsers && existingUsers.length > 0) {
      if (existingUsers[0].email === email) {
        throw new Error('Email already in use');
      }
      if (existingUsers[0].username === username) {
        throw new Error('Username already taken');
      }
    }

    // Insert new user with hashed password
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password: await supabase.rpc('hash_password', { password })
      })
      .select('id, email, username')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      throw new Error(insertError.message);
    }

    // Convert to our User type
    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.username,
    };

    return user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}
