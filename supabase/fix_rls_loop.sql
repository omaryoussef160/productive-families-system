-- حل مشكلة الـ Infinite Recursion (الدوران اللانهائي) في الـ RLS

-- 1. أولاً، نقوم بحذف السياسات القديمة التي تسبب تداخل (Loop)
DROP POLICY IF EXISTS "Customers can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Families can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Users and Families can view relevant orders" ON public.orders;

-- 2. تأمين جدول الطلبات (orders) ليظهر للعميل المالك له، أو للأسرة التي لها منتجات فيه
CREATE POLICY "Users and Families can view relevant orders" ON public.orders FOR SELECT USING (
   auth.uid() = customer_id OR 
   EXISTS (
       SELECT 1 FROM public.order_items 
       WHERE order_items.order_id = orders.id 
       AND order_items.family_id = auth.uid()
   )
);

-- 3. كسر الدوران اللانهائي بجعل قراءة عناصر الطلب (order_items) متاحة، لأنها لا تحتوي على بيانات حساسة 
-- (لا يمكن قراءة بيانات المشتري إلا من جدول orders المؤمن بالخطوة السابقة)
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);
