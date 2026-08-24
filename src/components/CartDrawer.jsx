import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../config/supabase';
import '../assets/styles/cart-drawer.css';

export function CartDrawer() {
  const { items, isCartOpen, closeCart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch logged in customer info to pre-fill checkout form
  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_name, whatsapp, role')
          .eq('id', session.user.id)
          .single();
        
        if (profile && profile.role === 'customer') {
          setCustomerName(profile.family_name || '');
          setCustomerPhone(profile.whatsapp || '');
        }
      }
    };
    if (isCartOpen) {
      fetchUser();
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  // Handles closing the drawer and resetting the UI state so it's fresh next time
  const handleFullClose = () => {
    setIsSuccess(false);
    setErrorMessage('');
    setIsCheckingOut(false);
    setCustomerName('');
    setCustomerPhone('');
    closeCart();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName || !customerPhone) {
      setErrorMessage('الرجاء إدخال الاسم ورقم الهاتف بالكامل');
      return;
    }

    // Phone validation (Egyptian numbers: 11 digits starting with 01)
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(customerPhone)) {
      setErrorMessage('الرجاء إدخال رقم هاتف مصري صحيح مكون من 11 رقم (مثال: 01012345678)');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Get current user (if logged in)
      const { data: { session } } = await supabase.auth.getSession();
      const customer_id = session?.user?.id || null;

      // Generate a UUID for the order so we don't need to rely on .select() which fails for guests due to RLS
      const order_id = crypto.randomUUID();

      // 2. Create the order
      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          id: order_id,
          customer_id,
          customer_name: customerName,
          customer_phone: customerPhone,
          total_amount: getCartTotal(),
          status: 'pending'
        }]);

      if (orderError) throw orderError;

      // 3. Create order items
      const orderItems = items.map(item => ({
        order_id: order_id,
        product_id: item.product.id,
        family_id: item.product.owner_id,
        quantity: item.quantity,
        price_at_time: item.product.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 4. Success UI
      clearCart();
      setIsCheckingOut(false);
      setIsSuccess(true);
    } catch (error) {
      console.error('Checkout error:', error);
      setErrorMessage('تفاصيل الخطأ: ' + (error.message || JSON.stringify(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="cart-backdrop" onClick={handleFullClose}></div>
      <div className="cart-drawer">
        
        {isSuccess ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <div style={{ background: '#dcfce7', borderRadius: '50%', padding: '20px', marginBottom: '20px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 style={{ color: '#1c1917', marginBottom: '10px', fontSize: '24px', fontWeight: '800' }}>تم إرسال طلبك بنجاح!</h2>
            <p style={{ color: '#57534e', marginBottom: '30px', lineHeight: '1.6', fontSize: '15px' }}>
              شكراً لثقتك بمنتجاتنا. تم تسجيل طلبك وسنتواصل معك قريباً على الرقم <strong style={{ color: '#0f766e', direction: 'ltr', display: 'inline-block' }}>{customerPhone}</strong> لتأكيد الشحن.
            </p>
            <button onClick={handleFullClose} className="checkout-btn" style={{ width: '100%' }}>
              الاستمرار في التسوق
            </button>
          </div>
        ) : (
          <>
            <div className="cart-header">
              <h2>سلة المشتريات</h2>
              <button className="close-btn" onClick={handleFullClose}>×</button>
            </div>

            <div className="cart-content">
              {items.length === 0 ? (
                <div className="empty-cart">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <p>سلتك فارغة حالياً</p>
                  <button onClick={handleFullClose} className="continue-shopping-btn">تصفح المنتجات</button>
                </div>
              ) : (
                <div className="cart-items">
                  {items.map((item) => (
                    <div key={item.product.id} className="cart-item">
                      <img 
                        src={item.product.image_url || 'https://via.placeholder.com/80'} 
                        alt={item.product.name} 
                        className="cart-item-img"
                      />
                      <div className="cart-item-info">
                        <h4>{item.product.name}</h4>
                        <span className="cart-item-price">{item.product.price} ج.م</span>
                        
                        <div className="cart-item-actions">
                          <div className="quantity-controls">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                          </div>
                          <button 
                            className="remove-btn"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>الإجمالي:</span>
                  <strong>{getCartTotal()} ج.م</strong>
                </div>
                
                {errorMessage && (
                  <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 12px', borderRadius: '8px', fontSize: '13.5px', marginBottom: '15px', border: '1px solid #fecaca' }}>
                    {errorMessage}
                  </div>
                )}

                {isCheckingOut ? (
                  <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="الاسم بالكامل" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '14px' }}
                    />
                    <input 
                      type="tel" 
                      placeholder="رقم الهاتف (للتواصل)" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '14px', direction: 'rtl' }}
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <button type="submit" className="checkout-btn" disabled={isSubmitting} style={{ flex: 1 }}>
                        {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                      </button>
                      <button type="button" onClick={() => { setIsCheckingOut(false); setErrorMessage(''); }} style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', background: '#f5f5f4', cursor: 'pointer', fontWeight: 'bold' }}>
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <button className="checkout-btn" onClick={() => setIsCheckingOut(true)}>
                    إتمام الطلب (الدفع عند الاستلام)
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
