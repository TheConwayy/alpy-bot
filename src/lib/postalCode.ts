import { supabase } from './supabaseClient';

// Constants
const url = `http://api.geonames.org/postalCodeSearchJSON?maxRows=1&countryCode=US&username=${process.env.GEONAMES_USERNAME}`;
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// Type definitions
export interface PostalCodeEntry {
  adminCode2: string;
  adminCode1: string;
  adminName2: string;
  lng: number;
  countryCode: string;
  postalCode: string;
  adminName1: string;
  'ISO3166-2': string;
  placeName: string;
  lat: number;
}

export interface GeoNamesPostalResponse {
  postalCodes: PostalCodeEntry[];
}

export interface CachedPostalCode {
  postal_code: string;
  city_name: string;
  state_name: string;
  state_abb: string;
  county_name: string;
  is_valid: boolean;
  last_checked: string;
}

export interface PostalCodeResult {
  valid: boolean;
  city?: string;
  state?: string;
  stateAbb?: string;
  county?: string;
  postalCode?: string;
  error?: string;
}

// 🔹 Helper: map cached DB row to result
function mapCachedToResult(cached: CachedPostalCode): PostalCodeResult {
  return {
    valid: cached.is_valid,
    city: cached.city_name || undefined,
    state: cached.state_name || undefined,
    stateAbb: cached.state_abb || undefined,
    county: cached.county_name || undefined,
    postalCode: cached.postal_code || undefined,
  };
}

// 🔹 Main function
export async function getPostalCodeData(
  postalCode: string
): Promise<PostalCodeResult> {
  // ✅ Validate format
  if (!/^\d{5}$/.test(postalCode)) {
    return { valid: false, error: 'Invalid format' };
  }

  // ✅ Check cache
  const { data: cachedData, error: cacheError } = await supabase
    .from('postal_codes')
    .select('*')
    .eq('postal_code', postalCode)
    .single();

  if (cacheError && cacheError.code !== 'PGRST116') {
    // PGRST116 = no rows found
    return { valid: false, error: cacheError.message };
  }

  if (cachedData) {
    const cached = cachedData as CachedPostalCode;
    const isFresh =
      Date.now() - new Date(cached.last_checked).getTime() < CACHE_DURATION;

    if (isFresh) {
      return mapCachedToResult(cached);
    }
  }

  // ✅ Fetch from GeoNames API
  try {
    const res = await fetch(`${url}&postalcode=${postalCode}`);
    if (!res.ok) {
      throw new Error(`GeoNames API error: ${res.statusText}`);
    }

    const data = (await res.json()) as GeoNamesPostalResponse;
    const entry = data.postalCodes[0];

    if (!entry) {
      return { valid: false, error: 'Postal code not found' };
    }

    // ✅ Update cache
    await supabase.from('postal_codes').upsert({
      postal_code: postalCode,
      city_name: entry.placeName,
      state_name: entry.adminName1,
      state_abb: entry.adminCode1,
      county_name: entry.adminName2,
      is_valid: true,
      last_checked: new Date().toISOString(),
    });

    return {
      valid: true,
      city: entry.placeName,
      state: entry.adminName1,
      stateAbb: entry.adminCode1,
      county: entry.adminName2,
      postalCode: entry.postalCode,
    };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}
