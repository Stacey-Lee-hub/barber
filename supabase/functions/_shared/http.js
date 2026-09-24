export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function errorResponse(status, code, message, extra = {}) {
  return json(status, { error: { code, message, ...extra } })
}

/** Handles CORS preflight and method checks, then parses the JSON body. */
export async function readJsonRequest(req) {
  if (req.method === 'OPTIONS') return { response: new Response('ok', { headers: corsHeaders }) }
  if (req.method !== 'POST') {
    return { response: errorResponse(405, 'method_not_allowed', 'Use POST for this endpoint.') }
  }
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object')
    return { body }
  } catch {
    return { response: errorResponse(400, 'invalid_json', 'The request body must be a JSON object.') }
  }
}

export const SERVER_ERROR_MESSAGE =
  'Something went wrong on our side. Please try again, or call the shop to book.'
