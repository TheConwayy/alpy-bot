import { SupabaseClient, createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface Counter {
  id: number;
  counter_name: string;
  counter_description?: string;
  count_value: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CounterReturn {
  success: boolean;
  counter?: Counter;
  error?: string;
}

interface GetCountersReturn {
  success: boolean;
  counter?: Counter[];
  error?: string;
}

/**
 * Increments the value of a counter in the database.
 * @param counterName The name of the counter to increment.
 * @returns A promise that resolves to an object containing a boolean indicating success,
 * an optional string containing an error message if not, and an optional Counter object
 * containing the updated counter if successful.
 * @throws If the counter does not exist.
 */
export async function incrementCounter(
  counterName: string
): Promise<CounterReturn> {
  const { data: counter, error } = await supabase
    .from('counters')
    .select('*')
    .eq('counter_name', counterName)
    .single();
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  if (!counter) {
    return {
      success: false,
      error: 'Counter not found',
    };
  }
  const { data: updatedCounter, error: updateError } = await supabase
    .from('counters')
    .update({ count_value: counter.count_value + 1 })
    .eq('counter_name', counterName)
    .single();
  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }
  return {
    success: true,
    counter: updatedCounter,
  };
}

/**
 * Retrieves a single counter from the database.
 * @param counterName The name of the counter to retrieve.
 * @throws If the counter does not exist.
 * @returns The retrieved counter.
 */
export async function getCounter(counterName: string): Promise<CounterReturn> {
  const { data: counter, error } = await supabase
    .from('counters')
    .select('*')
    .eq('counter_name', counterName)
    .single();
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  if (!counter) {
    return {
      success: false,
      error: 'Counter not found',
    };
  }
  return {
    success: true,
    counter,
  };
}

/**
 * Retrieves all counters from the database.
 * @returns An object containing a boolean indicating success and an optional array of counters.
 * If the operation was not successful, the object will contain an error message instead.
 */
export async function getAllCounters(): Promise<GetCountersReturn> {
  const { data: counters, error } = await supabase.from('counters').select('*');
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  return {
    success: true,
    counter: counters,
  };
}

/**
 * Creates a counter in the database.
 * @param createdById The ID of the user that created the counter.
 * @param counterName The name of the counter to create.
 * @param counterDescription The description of the counter to create. Optional.
 * @returns A promise that resolves to a CounterReturn object, which contains a boolean indicating success,
 * a string containing the created counter if successful, and an optional string containing an error
 * message if not.
 */
export async function createCounter(
  createdById: string,
  counterName: string,
  counterDescription?: string | null
): Promise<CounterReturn> {
  const { data: counter, error } = await supabase
    .from('counters')
    .insert({
      counter_name: counterName,
      counter_description: counterDescription,
      count_value: 0,
      created_by: createdById,
    })
    .single();
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  return {
    success: true,
    counter,
  };
}

/**
 * Deletes a counter from the database.
 * @param counterName The name of the counter to delete.
 * @returns A promise that resolves to a CounterReturn object, which contains a boolean indicating success,
 * and an optional string containing an error message if not.
 */
export async function deleteCounter(
  counterName: string
): Promise<CounterReturn> {
  const { error } = await supabase
    .from('counters')
    .delete()
    .eq('counter_name', counterName);
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  return {
    success: true,
  };
}

/**
 * Resets a counter to 0 in the database.
 * @param counterName The name of the counter to reset.
 * @returns A promise that resolves to a CounterReturn object, which contains a boolean indicating success and
 * an optional string containing an error message if not.
 */
export async function resetCounter(
  counterName: string
): Promise<CounterReturn> {
  const { error } = await supabase
    .from('counters')
    .update({ count_value: 0 })
    .eq('counter_name', counterName);
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  return {
    success: true,
  };
}
