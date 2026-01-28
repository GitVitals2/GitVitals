import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Choose admin client when available (server-side), otherwise fall back to user session client
const profileClient = supabaseServiceKey ? supabaseAdmin : supabase;

// Build profile payload that matches public.users (or your extended profile table)
const buildProfilePayload = (userId, userData) => ({
  id: userId,
  email: userData.email,
  name: userData.name ?? '',
  role: userData.role,
  canvasId: userData.canvasId ?? null,
  ...(userData.profile ?? {}), // extra columns you added to public.users
});

/**
 * Sign up a new user with email and password
 * Creates auth.user and inserts into users table
 * @param {Object} userData
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} userData.name
 * @param {string} userData.role - ADMIN, INSTRUCTOR, STUDENT
 * @param {string} [userData.canvasId]
 * @param {Object} [userData.profile] - Additional columns for public.users (e.g., cohort, phone)
 * @returns {Promise<Object>}
 */
export async function signUpUser(userData) {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // 2. Upsert into users (profile) table with the same UUID as auth.users
    const { data: profileRows, error: dbError } = await profileClient
      .from('users')
      .upsert([buildProfilePayload(userId, userData)], { onConflict: 'id' })
      .select();

    if (dbError) throw dbError;

    return {
      success: true,
      user: authData.user,
      profile: profileRows?.[0] ?? null,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
export async function signInUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign out current user
 * @returns {Promise<Object>}
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current authenticated user
 * @returns {Promise<Object>}
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user profile from users table
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<Object>}
 */
export async function getUserByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Create user (server-side only)
 * Requires SUPABASE_SERVICE_ROLE_KEY
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export async function adminCreateUser(userData) {
  try {
    // 1. Create auth user via admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // 2. Upsert into users table with any extra profile fields
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('users')
      .upsert([buildProfilePayload(userId, userData)], { onConflict: 'id' })
      .select();

    if (dbError) throw dbError;

    return {
      success: true,
      user: authData.user,
      profile: dbData?.[0] ?? null,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}