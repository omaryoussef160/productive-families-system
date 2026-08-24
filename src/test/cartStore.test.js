import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../store/cartStore';

describe('سلة المشتريات (Cart Store)', () => {
  // إعادة ضبط السلة قبل كل اختبار
  beforeEach(() => {
    useCartStore.setState({ items: [], isCartOpen: false });
  });

  it('يجب أن يبدأ بسلة فارغة', () => {
    const { items, isCartOpen } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(isCartOpen).toBe(false);
  });

  it('يجب أن يضيف منتجاً جديداً للسلة', () => {
    const store = useCartStore.getState();
    
    // منتج وهمي
    const mockProduct = {
      id: '123',
      name: 'فستان مطرز',
      price: 250
    };

    store.addToCart(mockProduct);
    
    const { items } = useCartStore.getState();
    expect(items.length).toBe(1);
    expect(items[0].product.id).toBe('123');
    expect(items[0].quantity).toBe(1);
  });

  it('يجب أن يقوم بزيادة الكمية إذا كان المنتج موجوداً مسبقاً', () => {
    const store = useCartStore.getState();
    const mockProduct = { id: '456', name: 'شنطة يد', price: 100 };

    store.addToCart(mockProduct); // 1
    store.addToCart(mockProduct); // 2
    
    const { items } = useCartStore.getState();
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(2);
  });

  it('يجب أن يقوم بحساب الإجمالي الصحيح (getCartTotal)', () => {
    const store = useCartStore.getState();
    
    store.addToCart({ id: '1', price: 100 }); // 100
    store.addToCart({ id: '1', price: 100 }); // 200
    store.addToCart({ id: '2', price: 50 });  // 50
    // Total should be 250
    
    const total = useCartStore.getState().getCartTotal();
    expect(total).toBe(250);
  });
});
