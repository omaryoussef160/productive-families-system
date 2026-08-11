import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) throw new Error('غير مصرح')
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) throw new Error('غير مصرح')
    const { data: admin } = await userClient.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!admin?.is_admin) throw new Error('هذه العملية للأدمن فقط')
    const { familyId } = await request.json()
    if (!familyId) throw new Error('معرّف الأسرة مطلوب')
    const serviceClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    // Remove uploaded product images first; database rows are removed by the auth-user cascade below.
    const { data: files } = await serviceClient.storage.from('product-images').list(familyId, { limit: 1000 })
    if (files?.length) await serviceClient.storage.from('product-images').remove(files.map(file => `${familyId}/${file.name}`))
    const { error } = await serviceClient.auth.admin.deleteUser(familyId)
    if (error) throw new Error(error.message)
    return Response.json({ success: true }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' }, { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
