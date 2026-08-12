import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Allow-Credentials': 'true',
})

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin')
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) })
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) throw new Error('غير مصرح')
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) throw new Error('غير مصرح')
    const { data: admin } = await userClient.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!admin?.is_admin) throw new Error('هذه العملية للأدمن فقط')
      // read raw body for better logging and robust parsing
      const rawBody = await request.text();
      let payload: any = {};
      try {
        payload = rawBody ? JSON.parse(rawBody) : {};
      } catch (parseErr) {
        console.error('delete-family: invalid JSON body', { rawBody, parseErr: String(parseErr) });
        throw new Error('جسم الطلب ليس JSON صالح');
      }

      console.info('delete-family: received payload', { payload });

      const familyId = payload.familyId;
      if (!familyId) {
        console.error('delete-family: missing familyId in payload', { payload });
        throw new Error('معرّف الأسرة مطلوب');
      }

      // read secret name used by Studio (must match the Secret key name without SUPABASE_ prefix)
      const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!serviceRoleKey) {
        console.error('delete-family: missing service role key in environment', { SERVICE_ROLE_KEY: Deno.env.get('SERVICE_ROLE_KEY'), SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') });
        throw new Error('SERVICE_ROLE_KEY غير متوفر');
      }

      const serviceClient = createClient(Deno.env.get('SUPABASE_URL')!, serviceRoleKey);
    // Remove uploaded product images first; database rows are removed by the auth-user cascade below.
    const { data: files } = await serviceClient.storage.from('product-images').list(familyId, { limit: 1000 })
    if (files?.length) await serviceClient.storage.from('product-images').remove(files.map(file => `${familyId}/${file.name}`))
    const { error } = await serviceClient.auth.admin.deleteUser(familyId)
    if (error) throw new Error(error.message)
    return Response.json({ success: true }, { headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' }, { status: 400, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
  }
})
