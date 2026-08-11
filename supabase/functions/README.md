# Edge Functions

`approve-application` ينشئ حساب هاتف للأسرة بعد قبول الطلب فقط، ثم ينشئ متجرها بحالة approved.

`delete-family` يحذف الأسرة حذفًا كاملًا: حساب الهاتف في `auth.users`، الـprofile، المنتجات، وصور المنتجات. استخدمه فقط عند حذف الأسرة من لوحة الأدمن؛ لا تحذف صف `profiles` مباشرة.

بعد ربط Supabase:

```bash
supabase functions deploy approve-application
supabase functions deploy delete-family
```

لا تضف `SUPABASE_SERVICE_ROLE_KEY` إلى React أو ملفات Vite. يكون هذا المفتاح موجودًا داخل Edge Function فقط.
