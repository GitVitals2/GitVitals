import { supabase } from "@/lib/supabase";

/**
 * Authenticate a user from an incoming API request using the Authorization header.
 * Expects: Authorization: Bearer <supabase-jwt>
 *
 * @param {Request} request
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function getCurrentUserFromRequest(request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "Missing or invalid Authorization header" };
    }

    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) throw error;
    if (!user) return { success: false, error: "User not found" };

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
