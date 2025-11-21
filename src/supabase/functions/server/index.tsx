import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Sign up route
app.post('/make-server-959f9150/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Validate password requirements
    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }
    if (!/[A-Z]/.test(password)) {
      return c.json({ error: 'Password must contain at least one uppercase letter' }, 400);
    }
    if (!/[a-z]/.test(password)) {
      return c.json({ error: 'Password must contain at least one lowercase letter' }, 400);
    }
    if (!/[0-9]/.test(password)) {
      return c.json({ error: 'Password must contain at least one number' }, 400);
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return c.json({ error: 'Password must contain at least one special character' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      message: 'User created successfully',
      user: { id: data.user.id, email: data.user.email }
    });
  } catch (error) {
    console.log(`Unexpected error during signup: ${error}`);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Get user categories
app.get('/make-server-959f9150/categories', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const categories = await kv.get(`user:${user.id}:categories`);
    return c.json({ categories: categories || [] });
  } catch (error) {
    console.log(`Error fetching categories: ${error}`);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Save user categories
app.post('/make-server-959f9150/categories', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { categories } = await c.req.json();
    await kv.set(`user:${user.id}:categories`, categories);
    
    return c.json({ message: 'Categories saved successfully' });
  } catch (error) {
    console.log(`Error saving categories: ${error}`);
    return c.json({ error: 'Failed to save categories' }, 500);
  }
});

// Get user expenses
app.get('/make-server-959f9150/expenses', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const expenses = await kv.get(`user:${user.id}:expenses`);
    return c.json({ expenses: expenses || [] });
  } catch (error) {
    console.log(`Error fetching expenses: ${error}`);
    return c.json({ error: 'Failed to fetch expenses' }, 500);
  }
});

// Save user expenses
app.post('/make-server-959f9150/expenses', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { expenses } = await c.req.json();
    await kv.set(`user:${user.id}:expenses`, expenses);
    
    return c.json({ message: 'Expenses saved successfully' });
  } catch (error) {
    console.log(`Error saving expenses: ${error}`);
    return c.json({ error: 'Failed to save expenses' }, 500);
  }
});

Deno.serve(app.fetch);