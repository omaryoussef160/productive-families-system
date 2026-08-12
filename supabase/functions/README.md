# Edge Functions

`delete-family` يحذف الأسرة حذفًا كاملًا: حساب الهاتف في `auth.users`، الـ profile، المنتجات، وصور المنتجات من الـ Storage. يتم استدعاؤه تلقائيًا عند حذف الأسرة من لوحة الأدمن (`AdminFamilies.jsx`).

بعد ربط CLI بـ Supabase:

```bash
supabase functions deploy delete-family
```

لا تضف `SUPABASE_SERVICE_ROLE_KEY` إلى React أو ملفات Vite. يكون هذا المفتاح موجودًا ومحفوظًا بأمان داخل بيئة Edge Function فقط.
