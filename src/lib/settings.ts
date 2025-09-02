import { SupabaseClient, createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string; // Add this to your .env
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface Setting {
  setting: string;
  value: string;
}

interface SettingsReturn {
  success: boolean;
  settings: Setting[];
  error?: string;
}

interface CreateSettingReturn {
  success: boolean;
  setting: string;
  value?: string;
  error?: string;
}

interface DeleteSettingReturn {
  success: boolean;
  setting: string;
  error?: string;
}

/**
 * Creates a setting in the settings table.
 * @param setting The name of the setting.
 * @param value The value of the setting.
 * @returns A promise that resolves to a SettingReturn object, which contains a boolean indicating success,
 * a string containing the setting name, an optional string containing the value if successful,
 * and an optional string containing an error message if not.
 */
export async function createSetting(
  setting: string,
  value: string
): Promise<CreateSettingReturn> {
  const { data: existingSetting } = await supabase
    .from('settings')
    .select('*')
    .eq('setting', setting)
    .single();
  if (existingSetting) {
    return {
      success: false,
      setting,
      error: 'Setting already exists',
    };
  } else {
    const { data: _newSetting, error } = await supabase
      .from('settings')
      .insert({ setting, value });
    if (error) {
      return {
        success: false,
        setting,
        error: error.message,
      };
    }

    return {
      success: true,
      setting,
      value,
    };
  }
}

/**
 * Retrieves settings from the settings table.
 * @param setting An optional string containing the name of a specific setting to retrieve.
 * If not provided, all settings are retrieved.
 * @returns A promise that resolves to a SettingsReturn object, which contains a boolean indicating success,
 * an array of Setting objects, and an optional string containing an error message if not.
 */
export async function viewSettings(): Promise<SettingsReturn> {
  const { data: settings, error } = await supabase.from('settings').select('*');
  if (error) {
    return {
      success: false,
      settings: [],
      error: error.message,
    };
  }

  if (settings.length === 0) {
    return {
      success: false,
      settings: [],
      error: 'No settings found',
    };
  }

  return {
    success: true,
    settings,
  };
}

/**
 * Deletes a setting from the settings table.
 * @param setting A string containing the name of a setting to delete.
 * @returns A promise that resolves to a DeleteSettingReturn object, which contains a boolean indicating success,
 * the setting that was attempted to be deleted (regardless of success), and an optional string containing an error
 * message if not.
 */
export async function deleteSetting(
  setting: string
): Promise<DeleteSettingReturn> {
  const { error } = await supabase
    .from('settings')
    .delete()
    .eq('setting', setting);
  if (error) {
    return {
      success: false,
      setting,
      error: error.message,
    };
  } else {
    return {
      success: true,
      setting,
    };
  }
}

/**
 * Edits a setting in the settings table.
 * @param setting The name of the setting to edit.
 * @param value The new value for the setting.
 * @returns A promise that resolves to a CreateSettingReturn object, which contains a boolean indicating success,
 * the setting that was attempted to be edited (regardless of success), an optional string containing the new value
 * if successful, and an optional string containing an error message if not.
 */
export async function editSetting(
  setting: string,
  value: string
): Promise<CreateSettingReturn> {
  const { error } = await supabase
    .from('settings')
    .update({ value })
    .eq('setting', setting);
  if (error) {
    return {
      success: false,
      setting,
      error: error.message,
    };
  } else {
    return {
      success: true,
      setting,
      value,
    };
  }
}

/**
 * Retrieves a specific setting from the settings table.
 * @param setting A string containing the name of the setting to retrieve.
 * @returns A promise that resolves to a Setting object if the setting exists, or null if not.
 */
export async function getSetting(setting: string): Promise<Setting | null> {
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .eq('setting', setting)
    .single();
  if (error) {
    return null;
  }
  return settings;
}
