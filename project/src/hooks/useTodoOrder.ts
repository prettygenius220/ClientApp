/**
 * useTodoOrder Hook
 * 
 * A custom hook that manages the persistent ordering of todos within folders.
 * Handles loading, saving, and updating todo order preferences in the database,
 * with debounced updates to prevent excessive database operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function useTodoOrder() {
  const { user } = useAuth();
  const [todoOrder, setTodoOrder] = useState<Record<string | 'root', string[]>>({});

  // Load saved preferences on mount
  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      // First try to get existing preferences
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('todo_user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Failed to load preferences:', fetchError);
        return;
      }

      // If preferences exist, use them
      if (existingPrefs?.preferences?.todoOrder) {
        setTodoOrder(existingPrefs.preferences.todoOrder);
        return;
      }

      // If no preferences exist, create initial preferences
      const { error: insertError } = await supabase
        .from('todo_user_preferences')
        .insert({
          user_id: user.id,
          preferences: { todoOrder: {} }
        });

      if (insertError) {
        console.error('Failed to create initial preferences:', insertError);
      }
    };

    loadPreferences();
  }, [user]);

  /**
   * Debounced function to save todo order preferences
   * Prevents excessive database updates during rapid changes
   */
  const saveTodoOrder = useCallback(
    debounce(async (newOrder: Record<string | 'root', string[]>) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('todo_user_preferences')
          .upsert({
            user_id: user.id,
            preferences: { todoOrder: newOrder }
          });

        if (error) throw error;
      } catch (error) {
        console.error('Failed to save todo order:', error);
      }
    }, 1000),
    [user]
  );

  // Save preferences when order changes
  useEffect(() => {
    if (Object.keys(todoOrder).length > 0) {
      saveTodoOrder(todoOrder);
    }
  }, [todoOrder, saveTodoOrder]);

  return {
    todoOrder,
    setTodoOrder,
  };
}