/**
 * Supabase Client
 * Handles database operations for users, chat history, and saved insights
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ChatMessage {
  id?: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  context_data?: Record<string, unknown> | null;
  created_at?: string;
}

interface SavedInsight {
  id?: string;
  user_id: string;
  title: string;
  content: string;
  token_symbol?: string | null;
  wallet_address?: string | null;
  created_at?: string;
}

interface Watchlist {
  id?: string;
  user_id: string;
  token_symbol: string;
  token_address: string;
  added_at?: string;
}

export const supabaseDB = {
  /**
   * Save chat message to database
   */
  async saveChatMessage(message: ChatMessage): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  },

  /**
   * Get chat history for a session
   */
  async getChatHistory(
    sessionId: string,
    userId: string
  ): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  /**
   * Get all chat sessions for a user
   */
  async getChatSessions(userId: string): Promise<Array<{ id: string; title: string; updated_at: string }>> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, title, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
  },

  /**
   * Create a new chat session
   */
  async createChatSession(
    userId: string,
    title: string
  ): Promise<{ id: string } | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: userId,
            title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },

  /**
   * Save an insight to database
   */
  async saveInsight(insight: SavedInsight): Promise<SavedInsight | null> {
    try {
      const { data, error } = await supabase
        .from('saved_insights')
        .insert([insight])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving insight:', error);
      throw error;
    }
  },

  /**
   * Get saved insights for a user
   */
  async getSavedInsights(userId: string): Promise<SavedInsight[]> {
    try {
      const { data, error } = await supabase
        .from('saved_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching saved insights:', error);
      throw error;
    }
  },

  /**
   * Add token to watchlist
   */
  async addToWatchlist(watchlist: Watchlist): Promise<Watchlist | null> {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .insert([watchlist])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  },

  /**
   * Get user's watchlist
   */
  async getWatchlist(userId: string): Promise<Watchlist[]> {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  },

  /**
   * Remove from watchlist
   */
  async removeFromWatchlist(
    userId: string,
    tokenSymbol: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('token_symbol', tokenSymbol);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  },

  /**
   * Get or create user profile
   */
  async getUserProfile(userId: string): Promise<Record<string, unknown> | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create one
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        return newUser;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
};
