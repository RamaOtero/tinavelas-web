import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // ID real en base de datos
  cartItemId?: string; // ID artificial para el carrito (id + aroma)
  name: string;
  price: number;
  quantity: number;
  stock: number;
  scent?: string;
  lid?: string;
  hasLabel?: boolean;
  image?: any;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
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
        // ID combinando vela física real + aroma virtual + tapa virtual + etiqueta
        const scentStr = newItem.scent ? `-${newItem.scent}` : '';
        const lidStr = newItem.lid ? `-${newItem.lid}` : '';
        const labelStr = newItem.hasLabel !== undefined ? (newItem.hasLabel ? '-L' : '-NL') : '';
        const cartItemId = `${newItem.id}${scentStr}${lidStr}${labelStr}`;
        const completeItem = { ...newItem, cartItemId };

        const existingItem = items.find((i) => i.cartItemId === cartItemId);

        // Calcular cuántas velas FÍSICAS ya tenemos en todos los aromas combinados
        const totalPhysicalVelas = items
          .filter(i => i.id === newItem.id)
          .reduce((acc, curr) => acc + curr.quantity, 0);

        if (existingItem) {
          if (totalPhysicalVelas < newItem.stock || newItem.stock === 0) {
            set({
              items: items.map((i) => 
                i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isCartOpen: true
            });
          } else {
            set({ isCartOpen: true });
            alert("Has agotado la disponibilidad actual de este recipiente en el catálogo.");
          }
        } else {
          if (totalPhysicalVelas < newItem.stock || newItem.stock === 0) {
             set({ items: [...items, { ...completeItem, quantity: 1 }], isCartOpen: true });
          } else {
             set({ isCartOpen: true });
             alert("Has agotado la disponibilidad actual de este recipiente en el catálogo.");
          }
        }
      },

      removeItem: (cartItemId) => {
        set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity < 1) return;
        
        const { items } = get();
        const targetItem = items.find((i) => i.cartItemId === cartItemId);
        if (!targetItem) return;

        // Validar límite físico global combinando aromas
        const otherScentsQuantity = items
          .filter(i => i.id === targetItem.id && i.cartItemId !== cartItemId)
          .reduce((acc, curr) => acc + curr.quantity, 0);

        if (quantity + otherScentsQuantity <= targetItem.stock || targetItem.stock === 0) {
          set({
            items: items.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i))
          });
        } else {
          alert("Has alcanzado el límite de stock de este envase.");
        }
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
