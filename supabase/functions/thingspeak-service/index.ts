import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * ThingSpeak Service - Placeholder Functions
 * 
 * TODO: Implement actual ThingSpeak API integration
 * 
 * This service provides placeholder functions for fetching sensor data from ThingSpeak.
 * The actual implementation should be added by the user with their ThingSpeak credentials.
 */

/**
 * Fetch the latest sensor values from ThingSpeak
 * 
 * @param location - Location object containing thingspeak_channel_id and thingspeak_read_key
 * @returns Object containing sensor values or null
 */
async function fetchLatestSensorValues(location: any) {
  // TODO: Implement ThingSpeak data fetch here
  // Example implementation:
  // const url = `https://api.thingspeak.com/channels/${location.thingspeak_channel_id}/feeds/last.json?api_key=${location.thingspeak_read_key}`;
  // const response = await fetch(url);
  // const data = await response.json();
  // return {
  //   flame: data.field1,
  //   gas: parseFloat(data.field2),
  //   temperature: parseFloat(data.field3),
  //   humidity: parseFloat(data.field4),
  //   pir: data.field5,
  // };
  
  console.log('[ThingSpeak Service] fetchLatestSensorValues called for location:', location.name);
  console.log('[ThingSpeak Service] TODO: Implement ThingSpeak API integration');
  
  return null;
}

/**
 * Fetch historical sensor data from ThingSpeak
 * 
 * @param location - Location object containing thingspeak_channel_id and thingspeak_read_key
 * @param results - Number of results to fetch (default: 100)
 * @returns Array of historical sensor readings or empty array
 */
async function fetchSensorHistory(location: any, results: number = 100) {
  // TODO: Implement ThingSpeak history fetch here
  // Example implementation:
  // const url = `https://api.thingspeak.com/channels/${location.thingspeak_channel_id}/feeds.json?api_key=${location.thingspeak_read_key}&results=${results}`;
  // const response = await fetch(url);
  // const data = await response.json();
  // return data.feeds.map((feed: any) => ({
  //   timestamp: feed.created_at,
  //   flame: feed.field1,
  //   gas: parseFloat(feed.field2),
  //   temperature: parseFloat(feed.field3),
  //   humidity: parseFloat(feed.field4),
  //   pir: feed.field5,
  // }));
  
  console.log('[ThingSpeak Service] fetchSensorHistory called for location:', location.name);
  console.log('[ThingSpeak Service] TODO: Implement ThingSpeak API integration');
  
  return [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, location, results } = await req.json();

    console.log('[ThingSpeak Service] Request received:', { action, locationName: location?.name });

    let data;
    
    if (action === 'latest') {
      data = await fetchLatestSensorValues(location);
    } else if (action === 'history') {
      data = await fetchSensorHistory(location, results);
    } else {
      throw new Error('Invalid action. Use "latest" or "history"');
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[ThingSpeak Service] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
