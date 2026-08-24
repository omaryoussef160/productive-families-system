-- 1. إضافة عمود role إلى جدول profiles (مهم جداً للـ RBAC)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'family' CHECK (role IN ('admin', 'family', 'customer'));

-- 2. تحديث صلاحيات قراءة الـ Profiles لتسمح للجميع (لتظهر أسماء الأسر للعملاء)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- 3. تحديث سياسات عناصر الطلبات (order_items) لتسمح للمشتري (العميل) برؤية منتجات طلبه
DROP POLICY IF EXISTS "Customers can view their order items" ON public.order_items;
CREATE POLICY "Customers can view their order items" ON public.order_items FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
);
