import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const normalizeEgyptPhone = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('20')) return `+${digits}`
  if (digits.startsWith('0')) return `+20${digits.slice(1)}`
  return `+${digits}`
}

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
    const { applicationId } = await request.json()
    const serviceClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: application, error: applicationError } = await serviceClient.from('applications').select('*').eq('id', applicationId).eq('status', 'pending').single()
    if (applicationError || !application) throw new Error('الطلب غير موجود أو تمت مراجعته بالفعل')
    const { data: account, error: accountError } = await serviceClient.auth.admin.createUser({ phone: normalizeEgyptPhone(application.whatsapp), phone_confirm: true })
    if (accountError || !account.user) throw new Error(accountError?.message || 'تعذر إنشاء حساب الأسرة')
    const { error: profileError } = await serviceClient.from('profiles').upsert({ id: account.user.id, family_name: application.family_name, city: application.city, whatsapp: normalizeEgyptPhone(application.whatsapp), bio: application.bio, status: 'approved' })
    if (profileError) throw new Error(profileError.message)
    await serviceClient.from('applications').update({ status: 'approved' }).eq('id', application.id)
    return Response.json({ success: true }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' }, { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
