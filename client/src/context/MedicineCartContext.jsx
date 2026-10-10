

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const MedicineCartContext = createContext();

export const MedicineCartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const storageKey = user?.id ? `medicineCart_${user.id}` : "medicineCart_guest";
    const [cartItems, setCartItems] = useState([]);
    const [cartLoaded, setCartLoaded] = useState(false);

    useEffect(() => {
        if(!isAuthenticated || !user?.id) {
            setCartItems([]);
            setCartLoaded(false);
            return;
        }

        setCartLoaded(false);

        const loadCart = async() => {
            const savedCart = localStorage.getItem(storageKey);
            let savedItems = [];

            try {
                savedItems = savedCart ? JSON.parse(savedCart) : [];
            }
            catch {
                localStorage.removeItem(storageKey);
            }

            if(!Array.isArray(savedItems)) {
                savedItems = [];
            }

            if(savedItems.length === 0) {
                setCartItems([]);
                setCartLoaded(true);
                return;
            }

            try {
                const response = await api.get("/medicines/public");
                const medicines = response.data.medicines || [];
                const currentMedicines = new Map(medicines.map((medicine) => [medicine._id, medicine]));

                const syncedItems = savedItems
                    .map((item) => {
                        const currentMedicine = currentMedicines.get(item._id);

                        if(!currentMedicine || currentMedicine.quantity <= 0 || new Date(currentMedicine.expiryDate) <= new Date()) {
                            return null;
                        }

                        return {
                            ...item,
                            ...currentMedicine,
                            cartQuantity: Math.min(item.cartQuantity, currentMedicine.quantity)
                        };
                    })
                    .filter(Boolean);

                setCartItems(syncedItems);
                setCartLoaded(true);
            }
            catch {
                setCartItems(savedItems);
                setCartLoaded(true);
            }
        };

        loadCart();
    }, [isAuthenticated, user?.id, storageKey]);

    useEffect(() => {
        if(!isAuthenticated || !user?.id || !cartLoaded) {
            return;
        }

        localStorage.setItem(storageKey, JSON.stringify(cartItems));
    }, [cartItems, isAuthenticated, user?.id, storageKey, cartLoaded]);

    const addToCart = (medicine, amount = 1) => {
        if(medicine.quantity <= 0 || new Date(medicine.expiryDate) <= new Date()) {
            return;
        }

        const requestedAmount = Math.max(1, Number(amount) || 1);

        setCartItems((previousItems) => {
            const existingItem = previousItems.find((item) => item._id === medicine._id);

            if(existingItem) {
                return previousItems.map((item) =>
                    item._id === medicine._id
                        ? {
                              ...item,
                              ...medicine,
                              cartQuantity: Math.min(item.cartQuantity + requestedAmount, medicine.quantity)
                          }
                        : item
                );
            }

            return [
                ...previousItems,
                {
                    ...medicine,
                    cartQuantity: Math.min(requestedAmount, medicine.quantity)
                }
            ];
        });
    };

    const increaseQuantity = (medicineId) => {
        setCartItems((previousItems) =>
            previousItems.map((item) =>
                item._id === medicineId
                    ? {
                          ...item,
                          cartQuantity: Math.min(item.cartQuantity + 1, item.quantity)
                      }
                    : item
            )
        );
    };

    const decreaseQuantity = (medicineId) => {
        setCartItems((previousItems) =>
            previousItems
                .map((item) =>
                    item._id === medicineId
                        ? {
                              ...item,
                              cartQuantity: item.cartQuantity - 1
                          }
                        : item
                )
                .filter((item) => item.cartQuantity > 0)
        );
    };

    const removeFromCart = (medicineId) => {
        setCartItems((previousItems) => previousItems.filter((item) => item._id !== medicineId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartQuantity = (medicineId) => {
        const cartItem = cartItems.find((item) => item._id === medicineId);

        return cartItem ? cartItem.cartQuantity : 0;
    };

    const cartCount = cartItems.reduce((total, item) => total + item.cartQuantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + item.sellingPrice * item.cartQuantity, 0);
    const prescriptionRequired = cartItems.some((item) => item.requiresPrescription);

    return (
        <MedicineCartContext.Provider
            value={{
                cartItems,
                cartCount,
                cartTotal,
                prescriptionRequired,
                getCartQuantity,
                addToCart,
                increaseQuantity,
                decreaseQuantity,
                removeFromCart,
                clearCart
            }}
        >
            {children}
        </MedicineCartContext.Provider>
    );
};

export const useMedicineCart = () => {
    return useContext(MedicineCartContext);
};
