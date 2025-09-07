import { SupabaseClient, createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string; // Add this to your .env
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface UniveralSetting {
  setting: string;
  value: string;
}

type UniveralSettingReturn =
  | {
      success: true;
      setting: UniveralSetting;
      error?: never;
    }
  | {
      success: false;
      error: string;
      setting?: never;
    };

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
