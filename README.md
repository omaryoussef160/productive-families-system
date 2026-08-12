# 🧺 لمسة أسرة (Lamsa Osra)
> منصة إلكترونية متكاملة لدعم وتمكين الأسر المنتجة، تتيح استعراض المنتجات، التواصل المباشر عبر واتساب، وإدارة المتاجر عبر لوحة تحكم آمنة.

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3FCF8E?logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_15-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 جدول المحتويات
- [عن المشروع](#-عن-المشروع)
- [المميزات الرئيسية](#-المميزات-الرئيسية)
- [الهندسة المعمارية والأمان](#-الهندسة-المعمارية-والأمان)
- [المتطلبات الأساسية](#-المتطلبات-الأساسية)
- [التشغيل المحلي](#-التشغيل-المحلي)
- [إعداد قواعد البيانات Supabase](#-إعداد-قواعد-البيانات-supabase)
- [نشر Edge Functions](#-نشر-edge-functions)
- [هيكل المشروع](#-هيكل-المشروع)

---

## 🌟 عن المشروع

**لمسة أسرة** هو تطبيق جافاسكريبت حديث مُصمم خصيصاً لدعم المشاريع المنزلية والأسر المنتجة. يوفر المشروع واجهة واضحة وسريعة للمتسوقين لاستعراض المنتجات والتواصل المباشر مع البائعين عبر واتساب، بالإضافة إلى لوحة تحكم متكاملة للأسر ولإدارة المنصة.

---

## ✨ المميزات الرئيسية

### 🛍️ للمتسوقين والزوار:
- **تصفح سريع وديناميكي**: تصنيف المنتجات وتصفيتها حسب الفئة أو حسب الأسرة المنتجة.
- **طلب مباشر عبر واتساب**: إنشاء رابط واتساب مجهز بتفاصيل المنتج والأسرة فوراً بنقرة زر.
- **واجهة متجاوبة بالكامل (Responsive UI)**: تصميم أنيق متوافق مع كافة الهواتف والأجهزة اللوحية والشاشات المكتبيّة.

### 👩‍🍳 للأسر المنتجة:
- **تسجيل نشاط سهل**: إنشاء حساب برقم الهاتف وكلمة المرور مع إمكانية تحديد نوع النشاط والمدينة والنبذة.
- **لوحة تحكم خاصة**: إضافة وتعديل وحذف المنتجات، ورفع الصور مباشرة إلى Cloud Storage.
- **إدارة الملف الشخصي**: تعديل بيانات المتجر وتغيير كلمة المرور بأمان.
- **نظام المراجعة و التفعيل**: وضع الحساب في حالة `pending` لحين مراجعة وتفعيل الأدمن لحماية الجودة.

### 👑 لإدارة المنصة (Admin Dashboard):
- **إدارة الأسر**: مراجعة طلبات الانضمام، قبول أو رفض الأسر، وحذف الحسابات نهائياً.
- **إدارة المنتجات**: مراجعة المنتجات المضافة وقبولها أو رفضها قبل ظهورها للعامة.
- **نشر آمن**: حماية كاملة ضد التلاعب أو رفع الصلاحيات.

---

## 🛡️ الهندسة المعمارية والأمان (Security Architecture)

يعتمد المشروع على مبدأ **Defense-in-Depth** لحماية البيانات والصلاحيات:

1. **Row Level Security (RLS)**: تفعيل RLS على جميع جداول PostgreSQL للمنع البات لأي وصول غير مصرح به.
2. **PL/pgSQL Security Triggers**:
   - `check_profile_update_security`: يمنع أصحاب الحسابات من تعديل رتبة الأدمن `is_admin` أو حالة الحساب `status` عبر Browser Console أو API المباشر.
   - `check_product_update_security`: يمنع الأعضاء من قبول منتجاتهم ذاتياً دون موافقة الأدمن.
   - `check_product_insert_security`: يجبر جميع المنتجات الجديدة على أخذ حالة `pending` تلقائياً.
3. **Serverless Edge Functions**:
   - `delete-family`: تستخدم `SERVICE_ROLE_KEY` المشفر لضمان مسح حساب `auth.users` وصور المتجر من Storage لمنع وجود أية بيانات يتيمة (Orphan Data).

---

## 📋 المتطلبات الأساسية

- **Node.js**: الإصدار 18.0 أو أحدث.
- **npm** أو **yarn**.
- حساب مجاني على [Supabase](https://supabase.com/).

---

## 🚀 التشغيل المحلي

1. **استنسخ المستودع (Clone Repository)**:
   ```bash
   git clone https://github.com/omaryoussef160/productive-families-system.git
   cd productive-families-system
   ```

2. **تثبيت الحزم (Dependencies)**:
   ```bash
   npm install
   ```

3. **إعداد متغيرات البيئة**:
   قم بإنشاء ملف `.env.local` في الجذر وأضف المفاتيح الخاصة بك من Supabase:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

4. **تشغيل سيرفر التطوير**:
   ```bash
   npm run dev
   ```
   افتح المتصفح على `http://localhost:5173`.

---

## 🗄️ إعداد قواعد البيانات Supabase

1. قم بإنشاء مشروع جديد في [Supabase Dashboard](https://supabase.com/dashboard).
2. انزل إلى **SQL Editor** وشغّل الملف المجمع:
   - [`supabase/schema.sql`](./supabase/schema.sql)
3. لتطبيق الحماية والأمان على المشاريع القائمة، شغّل ملف المهاجرة:
   - [`supabase/migrations/20260811_security_hardening.sql`](./supabase/migrations/20260811_security_hardening.sql)

### 👑 تحويل حسابك إلى الأدمن الرئيسي:
بعد إنشاء حسابك من واجهة الموقع، نفّذ الأمر التالي في SQL Editor:
```sql
update public.profiles 
set is_admin = true, status = 'approved' 
where id = (select id from auth.users where email = 'YOUR_EMAIL@osra.local');
```

---

## ⚡ نشر Edge Functions

لتمكين الحذف الكامل للأسر والصور عند الاستدعاء من لوحة الأدمن:

1. ربط Supabase CLI بالمشروع:
   ```bash
   npx supabase login
   npx supabase link --project-ref your-project-ref
   ```

2. نشر الدالة:
   ```bash
   npx supabase functions deploy delete-family
   ```

> ⚠️ **ملاحظة أمان**: لا تضع أبداً `SUPABASE_SERVICE_ROLE_KEY` داخل ملفات React أو الفرونت إند. يتم حفظ هذا المفتاح بأمان داخل بيئة الـ Edge Functions فقط.

---

## 📁 هيكل المشروع

```text
├── src/
│   ├── components/       # مكونات الواجهة (Header, Hero, Dashboard, etc.)
│   │   └── dashboard/    # لوحة تحكم الأدمن والأسر المنتجة
│   ├── data/             # التصنيفات والبيانات الثابتة
│   ├── lib/              # المساعدات والـ Utilities (واتساب، الخ)
│   ├── App.jsx           # المكون الرئيسي والـ Routing
│   ├── supabase.js       # إعداد وإطلاق Supabase Client
│   └── styles.css        # التنسيقات ونظام التصميم
├── supabase/
│   ├── functions/        # Deno Edge Functions (delete-family)
│   ├── migrations/       # ترحيلات وقواعد SQL الأمان
│   └── schema.sql        # المخطط الكامل لقاعدة البيانات
├── README.md
└── package.json
```

---

## 📝 الترخيص (License)

هذا المشروع مرخص بموجب رخصة **MIT**. يمكنك استخدامه وتعديله وتطويره بحرية.
