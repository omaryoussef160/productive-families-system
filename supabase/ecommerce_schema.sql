-- ==========================================
-- 1. Orders and Order Items Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- يمكن أن يكون المشتري زائر أو مسجل
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    family_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- لمعرفة أي أسرة يتبع لها المنتج
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL
);

-- ==========================================
-- 2. Row Level Security (RLS) Policies
-- ==========================================

-- تفعيل الحماية على الجداول
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- -------------------------
-- سياسات المنتجات (Products)
-- -------------------------
-- 1. الجميع يمكنه رؤية المنتجات المقبولة
CREATE POLICY "Anyone can view approved products" 
ON public.products FOR SELECT 
USING (status = 'approved');

-- 2. الأسر المنتجة يمكنها إضافة وتعديل وحذف منتجاتها فقط
CREATE POLICY "Families can manage their own products" 
ON public.products FOR ALL 
USING (auth.uid() = owner_id);

-- -------------------------
-- سياسات الطلبات (Orders)
-- -------------------------
-- 1. أي شخص (حتى الزوار) يمكنه إنشاء طلب
CREATE POLICY "Anyone can insert orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- 2. صاحب الطلب أو الأسرة صاحبة المنتجات يمكنهم رؤية الطلب
CREATE POLICY "Users and Families can view relevant orders" 
ON public.orders FOR SELECT 
USING (
   auth.uid() = customer_id 
   OR 
   id IN (SELECT order_id FROM public.order_items WHERE family_id = auth.uid())
);

-- -------------------------
-- سياسات عناصر الطلبات (Order Items)
-- -------------------------
CREATE POLICY "Anyone can insert order items" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Families can view their order items" 
ON public.order_items FOR SELECT 
USING (family_id = auth.uid());
