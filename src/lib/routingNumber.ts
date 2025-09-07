import { supabase } from './supabaseClient'; // ✅ reuse shared client
import { GoogleAuth } from 'google-auth-library';

// Constants
const baseUrl = 'https://fed-445739603043.us-east1.run.app';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// Type definitions
export interface ACHParticipant {
  routingNumber: string;
  customerName: string;
  achLocation: {
    city: string;
    state: string;
    postalCode: string;
  };
}

export interface FedACHResponse {
  achParticipants: ACHParticipant[];
}

export interface RoutingNumberResult {
  valid: boolean;
  name?: string;
  city?: string;
  state?: string;
  zip?: string;
  error?: string;
}

export interface CachedRoutingNumber {
  routing_number: string;
  institution_name: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  is_valid: boolean;
  last_checked: string;
}

// 🔹 Helper: map cached DB row to result
function mapCachedToResult(cached: CachedRoutingNumber): RoutingNumberResult {
  return {
    valid: cached.is_valid,
    name: cached.institution_name || undefined,
    city: cached.city || undefined,
    state: cached.state || undefined,
    zip: cached.zip_code || undefined,
  };
}

// 🔹 Get ID token for Google Cloud
async function getIdToken(): Promise<string> {
  const auth = new GoogleAuth({});
  const client = await auth.getIdTokenClient(baseUrl);
  const headers = await client.getRequestHeaders();
  return headers.Authorization.split(' ')[1];
}

// 🔹 Main function
export async function checkRoutingNumber(
  routingNumber: string
): Promise<RoutingNumberResult> {
  // ✅ Validate format
  if (!/^\d{9}$/.test(routingNumber)) {
    return { valid: false, error: 'Invalid format' };
  }

  // ✅ Check cache
  const { data: cachedData, error: cacheError } = await supabase
    .from('routing_numbers')
    .select('*')
    .eq('routing_number', routingNumber)
    .single();

  if (cacheError && cacheError.code !== 'PGRST116') {
    // PGRST116 = no rows found
    return { valid: false, error: cacheError.message };
  }

  if (cachedData) {
    const cached = cachedData as CachedRoutingNumber;
    const isFresh =
      Date.now() - new Date(cached.last_checked).getTime() < CACHE_DURATION;

    if (isFresh) {
      return mapCachedToResult(cached);
    }
  }

  // ✅ Fetch from FedACH API
  try {
    const token = await getIdToken();
    const response = await fetch(
      `${baseUrl}/fed/ach/search?routingNumber=${routingNumber}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      return {
        valid: false,
        error: `API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = (await response.json()) as FedACHResponse;
    const isValid = data.achParticipants?.length > 0;

    const result: RoutingNumberResult = { valid: isValid };

    if (isValid) {
      const participant = data.achParticipants[0];
      result.name = participant.customerName;
      result.city = participant.achLocation.city;
      result.state = participant.achLocation.state;
      result.zip = participant.achLocation.postalCode;
    }

    // ✅ Update cache
    const { error: upsertError } = await supabase
      .from('routing_numbers')
      .upsert({
        routing_number: routingNumber,
        institution_name: result.name || null,
        city: result.city || null,
        state: result.state || null,
        zip_code: result.zip || null,
        is_valid: isValid,
        last_checked: new Date().toISOString(),
      });

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError);
    }

    return result;
  } catch (err) {
    console.error('API Error:', err);
    return { valid: false, error: 'Service not available' };
  }
}
