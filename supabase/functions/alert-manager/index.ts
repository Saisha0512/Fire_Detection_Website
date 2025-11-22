import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Alert Manager Edge Function
 * 
 * This function manages alert creation and evaluation based on sensor thresholds.
 * It calls the ThingSpeak service (placeholder) to fetch sensor data.
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, locationId, alertId, status } = await req.json();

    console.log('[Alert Manager] Request:', { action, locationId, alertId, status });

    if (action === 'evaluate') {
      // Evaluate sensor data and create alerts if thresholds are crossed
      const { data: location, error: locError } = await supabaseClient
        .from('locations')
        .select('*')
        .eq('id', locationId)
        .single();

      if (locError) throw locError;

      console.log('[Alert Manager] Evaluating location:', location.name);

      // Call ThingSpeak service (placeholder)
      // In production, this would fetch real sensor data
      // const sensorData = await fetchFromThingSpeak(location);
      
      // For now, we'll use placeholder logic
      console.log('[Alert Manager] TODO: Implement actual sensor data evaluation');
      console.log('[Alert Manager] ThingSpeak integration required');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Alert evaluation completed (placeholder)',
          note: 'Implement ThingSpeak integration to enable real sensor monitoring'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update') {
      // Update alert status
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) throw new Error('No authorization header');

      const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!user) throw new Error('Unauthorized');

      const { error: updateError } = await supabaseClient
        .from('alerts')
        .update({
          status,
          resolved_at: status !== 'active' ? new Date().toISOString() : null,
          resolved_by: status !== 'active' ? user.id : null,
        })
        .eq('id', alertId);

      if (updateError) throw updateError;

      console.log('[Alert Manager] Alert updated:', { alertId, status });

      return new Response(
        JSON.stringify({ success: true, message: 'Alert updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('[Alert Manager] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
