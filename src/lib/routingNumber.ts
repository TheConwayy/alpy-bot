import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { GoogleAuth } from "google-auth-library"

// Constants
const baseUrl = 'https://fed-445739603043.us-east1.run.app'

// Type definitions
interface ACHParticipant {
    routingNumber: string;
    customerName: string;
    achLocation: {
        city: string;
        state: string;
        postalCode: string;
    };
}

interface FedACHResponse {
    achParticipants: ACHParticipant[];
}

interface RoutingNumberResult {
    valid: boolean;
    name?: string;
    city?: string;
    state?: string;
    zip?: string;
    error?: string;
}

interface CachedRoutingNumber {
    routing_number: string;
    institution_name: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    is_valid: boolean;
    last_checked: string;
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
// Fixed typo in variable name (supbase → supabase)

// Cache (30 days in ms)
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000

// Get ID token for Google Cloud
async function getIdToken(): Promise<string> {
    const auth = new GoogleAuth({});
    const client = await auth.getIdTokenClient(baseUrl)
    const headers = await client.getRequestHeaders();
    return headers.Authorization.split(' ')[1];
}

// Check for routing number
export async function checkRoutingNumber(routingNumber: string): Promise<RoutingNumberResult> {
    // Validate format
    if (!/^\d{9}$/.test(routingNumber)) {
        return { valid: false, error: 'Invalid format' }
    }

    // Check cache
    const { data: cachedData } = await supabase
        .from('routing_numbers')
        .select('*')
        .eq('routing_number', routingNumber)
        .single();
    
    const typedCachedData = cachedData as CachedRoutingNumber | null;

    if (typedCachedData && (new Date().getTime() - new Date(typedCachedData.last_checked).getTime() < CACHE_DURATION)) {
        return {
            valid: typedCachedData.is_valid,
            name: typedCachedData.institution_name || undefined,
            city: typedCachedData.city || undefined,
            state: typedCachedData.state || undefined,
            zip: typedCachedData.zip_code || undefined
        }
    }

    try {
        // Fetch from API - FIXED THE PARAMETER NAME
        const token = await getIdToken()
        const response = await fetch(`${baseUrl}/fed/ach/search?routingNumber=${routingNumber}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )

        // Add error handling for non-200 responses
        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`);
            return { valid: false, error: `API error: ${response.status}` };
        }

        const responseData = await response.json()
        console.log("API Response:", JSON.stringify(responseData, null, 2)); // Debug log
        
        const data = responseData as FedACHResponse
        const isValid = data && data.achParticipants && data.achParticipants.length > 0

        const result: RoutingNumberResult = {
            valid: isValid
        }

        if (isValid) {
            const participant = data.achParticipants[0];
            result.name = participant.customerName
            result.city = participant.achLocation.city
            result.state = participant.achLocation.state
            result.zip = participant.achLocation.postalCode
        }

        // Update cache
        // Update cache with error handling
try {
  const { error: upsertError } = await supabase
    .from('routing_numbers')
    .upsert({
      routing_number: routingNumber,
      institution_name: result.name || null,
      city: result.city || null,
      state: result.state || null,
      zip_code: result.zip || null,
      is_valid: isValid,
      last_checked: new Date().toISOString()
    });
    
  if (upsertError) {
    console.error("Supabase upsert error:", upsertError);
  } else {
    console.log("Data successfully cached in Supabase");
  }
} catch (dbError) {
  console.error("Database operation failed:", dbError);
}
        
        return result

    } catch (err) {
        console.error("API Error:", err)
        return { valid: false, error: 'Service not available' }
    }
}