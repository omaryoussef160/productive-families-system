# لمسة أسرة

تطبيق React للأسر المنتجة، مع تسجيل حسابات، لوحة لإضافة المنتجات، صور المنتجات، وطلب واتساب مباشر للبائع.

## التشغيل محليًا

1. ثبّت الحزم: `npm install`
2. انسخ `.env.example` إلى `.env.local` وأضف مفاتيح Supabase.
3. شغّل: `npm run dev`

## تجهيز Supabase

1. أنشئ مشروعًا جديدًا في [Supabase](https://supabase.com/dashboard).
2. في **SQL Editor**، شغّل كامل محتوى `supabase/schema.sql`.
3. من **Connect**، انسخ Project URL وPublishable key إلى `.env.local`.
4. من **Authentication > Providers > Email** فعّل Email. للتجربة السريعة يمكنك تعطيل **Confirm email**، وللنشر اتركه مفعّلًا.
5. أنشئ حسابك من الموقع، ثم نفّذ آخر أمر SQL الموجود في الملف بعد استبدال بريدك، لتحويله إلى أدمن.

### إذا ظهر خطأ عند إضافة منتج

شغّل `supabase/migrations/20260811_profile_safety.sql` مرة واحدة في SQL Editor. يعالج المستخدمين الحاليين الذين لا يملكون صفًا في `profiles` ويمنع تكرار المشكلة للحسابات الجديدة.

> لا تضع أبدًا `service_role key` في ملف `.env.local` أو في React؛ استخدم فقط Publishable/anon key.
