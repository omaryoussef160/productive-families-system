-- تفعيل تحديث الطلبات للأسر المنتجة (السماح للأسرة بتغيير حالة الطلب)
CREATE POLICY "Families can update their orders" ON public.orders FOR UPDATE USING (
   id IN (SELECT order_id FROM public.order_items WHERE family_id = auth.uid())
);
