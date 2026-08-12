# لمسة أسرة

تطبيق React للأسر المنتجة، مع تسجيل حسابات، لوحة لإضافة المنتجات، صور المنتجات، وطلب واتساب مباشر للبائع.

## التشغيل محليًا

1. ثبّت الحزم: `npm install`
2. انسخ `.env.example` إلى `.env.local` وأضف مفاتيح Supabase.
3. شغّل: `npm run dev`

## تجهيز Supabase

1. أنشئ مشروعًا جديدًا في [Supabase](https://supabase.com/dashboard).
2. في **SQL Editor**، شغّل كامل محتوى `supabase/schema.sql`.
3. لتطبيق الحماية الأمنية ومنع ثغرات تعديل الصلاحيات والموافقة الذاتية للمنتجات، شغّل ملف المهاجرة `supabase/migrations/20260811_security_hardening.sql`.
4. من **Connect**، انسخ Project URL وPublishable key إلى `.env.local`.
5. من **Authentication > Providers > Email** فعّل Email. للتجربة السريعة يمكنك تعطيل **Confirm email**، وللنشر اتركه مفعّلًا.
6. أنشئ حسابك من الموقع؛ التسجيل ينشئ ملف `profiles` بحالة `pending` ويحتاج موافقة أدمن قبل أن يظهر النشاط للعامة.
7. ثم نفّذ آخر أمر SQL الموجود في الملف بعد استبدال بريدك، لتحويلك إلى أدمن.

### نشر Edge Functions

لحذف الأسرة نهائيًا من حساب auth.users وسلة الصور في Storage عند الحذف من لوحة الأدمن:
```bash
supabase functions deploy delete-family
```

> لا تضع أبدًا `service_role key` في ملف `.env.local` أو في React؛ استخدم فقط Publishable/anon key.
