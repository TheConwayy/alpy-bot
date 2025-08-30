import { SupabaseClient, createClient } from "@supabase/supabase-js";

// Constants
const url = `http://api.geonames.org/postalCodeSearchJSON?maxRows=1&countryCode=US&username=${process.env.GEONAMES_USERNAME}`;

// Type definitions
interface PostalCodeEntry {
  adminCode2: string;     
  adminCode1: string;      
  adminName2: string;      
  lng: number;             
  countryCode: string;     
  postalCode: string;      
  adminName1: string;      
  "ISO3166-2": string;     
  placeName: string;       
  lat: number;             
}

interface GeoNamesPostalResponse {
  postalCodes: PostalCodeEntry[];
}

interface CachedPostalCode {
  postal_code: string;
  city_name: string;
  state_name: string;
  state_abb: string;
  county_name: string;
  is_valid: boolean;
  last_checked: string;
}

interface PostalCodeResult {
    valid: boolean;
    city?: string
    state?: string
    stateAbb?: string
    county?: string
    postalCode?: string
    error?: string
}

// Init Supabase
// Initialize Supabase with service role key (has admin privileges)
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string; // Add this to your .env
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

export async function getPostalCodeData(postalCode: string): Promise<PostalCodeResult> {
    // Check formatting
    if (!/^\d{5}$/.test(postalCode)) return { valid: false, error: 'Invalid format' };

    // Check cache
    const { data: cachedData } = await supabase
        .from('postal_codes')
        .select('*')
        .eq('postal_code', postalCode)
        .single();

    const typedCachedData = cachedData as CachedPostalCode | null;

    if (typedCachedData && (new Date().getTime() - new Date(typedCachedData.last_checked).getTime() < CACHE_DURATION)) {
        return {
            valid: typedCachedData.is_valid,
            city: typedCachedData.city_name || undefined,
            state: typedCachedData.state_name || undefined,
            stateAbb: typedCachedData.state_abb || undefined,
            county: typedCachedData.county_name || undefined,
            postalCode: typedCachedData.postal_code || undefined
        }
    }

    try {
        // Fetch from API
        const res = await fetch(`${url}&postalcode=${postalCode}`);
        if (!res.ok) {
            throw new Error(res.statusText);
        }
        const data = (await res.json()) as GeoNamesPostalResponse;
        const entry = data.postalCodes[0];

        // Update cache
        await supabase.from('postal_codes').upsert({
            postal_code: postalCode,
            city_name: entry.placeName,
            state_name: entry.adminName1,
            state_abb: entry.adminCode1,
            county_name: entry.adminName2,
            is_valid: true,
            last_checked: new Date().toISOString()
        });

        return {
            valid: true,
            city: entry.placeName,
            state: entry.adminName1,
            stateAbb: entry.adminCode1,
            county: entry.adminName2,
            postalCode: entry.postalCode
        }
    } catch (error) {
        return { valid: false, error: (error as Error).message };
    }


}