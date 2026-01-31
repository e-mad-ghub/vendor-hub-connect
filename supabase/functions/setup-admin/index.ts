import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, setupKey } = await req.json()

    // Simple setup key verification (in production, use a more secure method)
    const expectedKey = Deno.env.get('ADMIN_SETUP_KEY')
    if (!expectedKey) {
      return new Response(
        JSON.stringify({ error: 'مفتاح الإعداد غير متوفر على الخادم' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (setupKey !== expectedKey) {
      return new Response(
        JSON.stringify({ error: 'مفتاح الإعداد غير صحيح' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const initialEmail = Deno.env.get('ADMIN_INITIAL_EMAIL')?.trim()
    const initialPassword = Deno.env.get('ADMIN_INITIAL_PASSWORD')
    const useEnvCredentials = Boolean(initialEmail && initialPassword)
    const resolvedEmail = useEnvCredentials ? initialEmail : email?.trim()
    const resolvedPassword = useEnvCredentials ? initialPassword : password

    if (!resolvedEmail || !resolvedPassword) {
      return new Response(
        JSON.stringify({ error: 'الإيميل وكلمة السر مطلوبين' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (resolvedPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'كلمة السر لازم تكون 6 حروف على الأقل' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if any admin already exists
    const { data: existingAdmins, error: checkError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (checkError) {
      console.error('Error checking existing admins:', checkError)
      return new Response(
        JSON.stringify({ error: 'خطأ في التحقق من الأدمن الموجود' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({ error: 'يوجد أدمن بالفعل. استخدم صفحة الدخول العادية.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: resolvedEmail,
      password: resolvedPassword,
      email_confirm: true,
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: 'admin',
      })

    if (roleError) {
      console.error('Error adding admin role:', roleError)
      // Clean up - delete the user we just created
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      return new Response(
        JSON.stringify({ error: 'فشل إضافة صلاحية الأدمن' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إنشاء حساب الأدمن بنجاح',
        email: userData.user.email,
        credentialsSource: useEnvCredentials ? 'env' : 'request',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Setup admin error:', error)
    return new Response(
      JSON.stringify({ error: 'حدث خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
