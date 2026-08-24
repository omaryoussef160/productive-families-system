import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '../components/ProductCard';
import { useCartStore } from '../store/cartStore';

// Mock the Zustand store so we can spy on addItem
vi.mock('../store/cartStore', () => ({
  useCartStore: vi.fn(),
}));

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    name: 'منتج تجريبي',
    price: 150,
    category: 'مشغولات يدوية',
    profiles: {
      family_name: 'أسرة مبدعة'
    }
  };

  it('يجب أن يعرض بيانات المنتج بشكل صحيح', () => {
    // إعداد الـ Mock لعدم كسر الهوك
    useCartStore.mockReturnValue(vi.fn());

    render(<ProductCard product={mockProduct} />);

    // التحقق من ظهور اسم المنتج واسم الأسرة والسعر
    expect(screen.getByText('منتج تجريبي')).toBeInTheDocument();
    expect(screen.getByText('أسرة مبدعة')).toBeInTheDocument();
    expect(screen.getByText('150 ج.م')).toBeInTheDocument();
  });

  it('يجب أن يستدعي دالة إضافة للسلة عند الضغط على الزر', async () => {
    const mockAddItem = vi.fn();
    useCartStore.mockReturnValue(mockAddItem);
    
    render(<ProductCard product={mockProduct} />);
    
    // البحث عن زر الإضافة
    const addButton = screen.getByRole('button', { name: /أضف إلى السلة/i });
    
    // محاكاة ضغطة المستخدم
    await userEvent.click(addButton);
    
    // التأكد أن الدالة تم استدعاؤها مع المنتج
    expect(mockAddItem).toHaveBeenCalled();
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct);
  });
});
