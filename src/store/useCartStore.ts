import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image?: any;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (isOpen?: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === newItem.id);

        if (existingItem) {
          // If stock is 0, it means it's a backorder ("Por Encargo") so infinite allowed.
          // Otherwise, strictly prevent adding to cart beyond available physical stock.
          if (existingItem.quantity < newItem.stock || newItem.stock === 0) {
            set({
              items: items.map((i) => 
                i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isCartOpen: true
            });
          } else {
            // Cannot add more to cart, we pop open the cart anyway to show them.
            set({ isCartOpen: true });
          }
        } else {
          set({ items: [...items, { ...newItem, quantity: 1 }], isCartOpen: true });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i))
        });
      },

      clearCart: () => set({ items: [] }),
      
      toggleCart: (isOpen) => set({ 
        isCartOpen: isOpen !== undefined ? isOpen : !get().isCartOpen 
      }),
    }),
    {
      name: 'tina-cart-storage', // Persist cart gracefully across browser reloads
    }
  )
);
