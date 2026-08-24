import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [], // { product, quantity }
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  
  addToCart: (product) => set((state) => {
    const existing = state.items.find((item) => item.product.id === product.id);
    if (existing) {
      return {
        items: state.items.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    return { items: [...state.items, { product, quantity: 1 }] };
  }),

  removeFromCart: (productId) => set((state) => ({
    items: state.items.filter((item) => item.product.id !== productId)
  })),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) return state; // Handle remove via removeFromCart instead
    return {
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    };
  }),

  clearCart: () => set({ items: [] }),

  getCartTotal: () => {
    const items = get().items;
    return items.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  },
  
  getCartCount: () => {
    const items = get().items;
    return items.reduce((count, item) => count + item.quantity, 0);
  }
}));
