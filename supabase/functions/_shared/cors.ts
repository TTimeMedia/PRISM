/**
 * Standard Supabase Edge Function CORS headers — needed for the OPTIONS
 * preflight a browser client (apps/web, or a Supabase Studio test call)
 * sends before the real request. The mobile app itself doesn't need
 * these (React Native's fetch isn't subject to CORS), but every Edge
 * Function in this project sends them anyway rather than special-casing
 * the caller.
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
