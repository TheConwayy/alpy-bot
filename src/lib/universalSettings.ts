import { supabase } from './supabaseClient';

export interface UniversalSetting {
  setting: string;
  value: string;
}

export type UniversalSettingReturn<T = UniversalSetting | UniversalSetting[]> =
  | { success: true; setting: T }
  | { success: false; error: string };

// 🔹 Helper to wrap Supabase calls
function handleQuery<T>(result: {
  data: T | null;
  error: any;
}): UniversalSettingReturn<T> {
  const { data, error } = result;
  if (error || !data) {
    return { success: false, error: error?.message ?? 'No data found' };
  }
  return { success: true, setting: data };
}

// 🔹 Get one setting
export async function getUniversalSetting(
  setting: string
): Promise<UniversalSettingReturn<UniversalSetting>> {
  const result = await supabase
    .from('universal_settings')
    .select('*')
    .eq('setting', setting)
    .single();

  return handleQuery<UniversalSetting>(result);
}

// 🔹 Get all settings
export async function getAllUniversalSettings(): Promise<
  UniversalSettingReturn<UniversalSetting[]>
> {
  const result = await supabase.from('universal_settings').select('*');
  return handleQuery<UniversalSetting[]>(result);
}

// 🔹 Add a setting
export async function addUniversalSetting(
  setting: string,
  value: string
): Promise<UniversalSettingReturn<UniversalSetting>> {
  // Check if exists
  const exists = await getUniversalSetting(setting);
  if (exists.success) {
    return { success: false, error: 'Setting already exists' };
  }

  const result = await supabase
    .from('universal_settings')
    .insert({ setting, value })
    .select()
    .single();

  return handleQuery<UniversalSetting>(result);
}

// 🔹 Edit a setting
export async function editUniversalSetting(
  setting: string,
  value: string
): Promise<UniversalSettingReturn<UniversalSetting>> {
  const exists = await getUniversalSetting(setting);
  if (!exists.success) {
    return { success: false, error: 'Setting does not exist' };
  }

  const result = await supabase
    .from('universal_settings')
    .update({ value })
    .eq('setting', setting)
    .select()
    .single();

  return handleQuery<UniversalSetting>(result);
}

// 🔹 Delete a setting
export async function deleteUniversalSetting(
  setting: string
): Promise<UniversalSettingReturn<UniversalSetting>> {
  const result = await supabase
    .from('universal_settings')
    .delete()
    .eq('setting', setting)
    .select()
    .single();
  return handleQuery<UniversalSetting>(result);
}
