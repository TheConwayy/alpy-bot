import { SupabaseClient, createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string; // Add this to your .env
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface UniveralSetting {
  setting: string;
  value: string;
}

type UniveralSettingReturn =
  | {
      success: true;
      setting: UniveralSetting | UniveralSetting[];
      error?: never;
    }
  | {
      success: false;
      error: string;
      setting?: never;
    };

/**
 * Retrieves a setting from the universal settings table.
 * @param setting A string containing the name of the setting to retrieve.
 * @returns A promise that resolves to a UniveralSettingReturn object, which contains a boolean indicating success,
 * the setting that was retrieved if successful, or an optional string containing an error message if not.
 */
export async function getUniveralSetting(
  setting: string
): Promise<UniveralSettingReturn> {
  const { data, error } = await supabase
    .from('universal_settings')
    .select('*')
    .eq('setting', setting)
    .single();
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  return {
    success: true,
    setting: data,
  };
}

export async function getAlluniversalSettings(): Promise<UniveralSettingReturn> {
  const { data, error } = await supabase.from('universal_settings').select('*');
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (data.length === 0) {
    return {
      success: false,
      error: 'No settings found',
    };
  }

  return {
    success: true,
    setting: data as UniveralSetting[],
  };
}

export async function addUniveralSetting(
  setting: string,
  value: string
): Promise<UniveralSettingReturn> {
  const { data } = await supabase
    .from('universal_settings')
    .select('*')
    .eq('setting', setting)
    .single();
  if (data) {
    return {
      success: false,
      error: 'Setting already exists',
    };
  } else {
    const { data, error } = await supabase
      .from('universal_settings')
      .insert({ setting, value })
      .single();
    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      setting: data,
    };
  }
}

/**
 * Edits a setting in the universal settings table.
 * @param setting A string containing the name of the setting to edit.
 * @param value A string containing the new value for the setting.
 * @returns A promise that resolves to a UniveralSettingReturn object, which contains a boolean indicating success,
 * the setting that was attempted to be edited (regardless of success), an optional string containing the new value
 * if successful, and an optional string containing an error message if not.
 */
export async function editUniversalSetting(
  setting: string,
  value: string
): Promise<UniveralSettingReturn> {
  const { data, error } = await supabase
    .from('universal_settings')
    .update({ value })
    .eq('setting', setting)
    .single();
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  } else {
    return {
      success: true,
      setting: data,
    };
  }
}

/**
 * Deletes a setting from the universal settings table.
 * @param setting A string containing the name of the setting to delete.
 * @returns A promise that resolves to a UniveralSettingReturn object, which contains a boolean indicating success,
 * the setting that was attempted to be deleted (regardless of success), and an optional string containing an error
 * message if not.
 */
export async function deleteUniversalSetting(
  setting: string
): Promise<UniveralSettingReturn> {
  const { data, error } = await supabase
    .from('universal_settings')
    .delete()
    .eq('setting', setting)
    .single();
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  } else {
    return {
      success: true,
      setting: data,
    };
  }
}
