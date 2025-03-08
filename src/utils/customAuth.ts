
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
    // Check for existing email
    const { data: existingEmail, error: emailError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (emailError) {
      console.error('Error checking existing email:', emailError);
      throw new Error(emailError.message);
    }

    if (existingEmail) {
      throw new Error('Email already in use');
    }

    // Check for existing username
    const { data: existingUsername, error: usernameError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (usernameError) {
      console.error('Error checking existing username:', usernameError);
      throw new Error(usernameError.message);
    }

    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // First, get the hashed password using the hash_password RPC function
    const { data: hashedPassword, error: hashError } = await supabase.rpc('hash_password', { password });
    
    if (hashError) {
      console.error('Error hashing password:', hashError);
      throw new Error(hashError.message);
    }

    // Insert new user with hashed password
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password: hashedPassword
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
