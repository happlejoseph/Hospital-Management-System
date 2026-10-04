

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const MedicineCartContext = createContext();

export const MedicineCartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    const storageKey = user?._id
        ? `medicineCart_${user._id}`
        : "medicineCart_guest";

    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        if (!isAuthenticated || !user?._id) {
            setCartItems([]);
            return;
        }

        const savedCart = localStorage.getItem(storageKey);
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
    }, [isAuthenticated, user?._id, storageKey]);

    useEffect(() => {
        if (!isAuthenticated || !user?._id) {
            return;
        }

        localStorage.setItem(storageKey, JSON.stringify(cartItems));
    }, [cartItems, isAuthenticated, user?._id, storageKey]);

    const addToCart = (medicine) => {
        setCartItems((previousItems) => {
            const existingItem = previousItems.find(
                (item) => item._id === medicine._id
            );

            if (existingItem) {
                return previousItems.map((item) =>
                    item._id === medicine._id
                        ? {
                              ...item,
                              cartQuantity: Math.min(
                                  item.cartQuantity + 1,
                                  medicine.quantity
                              )
                          }
                        : item
                );
            }

            return [
                ...previousItems,
                {
                    ...medicine,
                    cartQuantity: 1
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
                          cartQuantity: Math.min(
                              item.cartQuantity + 1,
                              item.quantity
                          )
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
        setCartItems((previousItems) =>
            previousItems.filter((item) => item._id !== medicineId)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce(
        (total, item) => total + item.cartQuantity,
        0
    );

    const cartTotal = cartItems.reduce(
        (total, item) => total + item.sellingPrice * item.cartQuantity,
        0
    );

    return (
        <MedicineCartContext.Provider
            value={{
                cartItems,
                cartCount,
                cartTotal,
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