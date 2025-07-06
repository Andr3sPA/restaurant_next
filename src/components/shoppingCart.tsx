"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";

export interface CartItem {
  id: string;
  description?: string;
  imageUrl: string;
  prefix?: string;
  price?: number;
  title?: string;
}

export default function ShoppingCart() {
  const [open, setOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadCartItems = () => {
      const existingItems = localStorage.getItem("cartItems");
      if (existingItems) {
        try {
          const parsedItems = JSON.parse(existingItems) as unknown;
          if (Array.isArray(parsedItems)) {
            setCartItems(parsedItems as CartItem[]);
          }
        } catch (error) {
          console.error("Error parsing cart items from localStorage:", error);
        }
      }
    };

    // Cargar items al montar el componente
    loadCartItems();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadCartItems();
    };

    window.addEventListener("storage", handleStorageChange);

    // También escuchar un evento customizado para cambios en la misma pestaña
    window.addEventListener("cartUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  const removeItem = (index: number) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));

    // Disparar evento personalizado para actualizar otros componentes
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const getTotalPrice = () => {
    return cartItems
      .reduce((total, item) => total + (item.price ?? 0), 0)
      .toFixed(2);
  };
  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 rounded-md bg-gray-950/5 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-950/10"
      >
        <ShoppingCartIcon className="h-5 w-5" />
        <span>Cart</span>
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {cartItems.length}
          </span>
        )}
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-lg font-medium text-gray-900">
                        Shopping cart
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flow-root">
                        {cartItems.length === 0 ? (
                          <div className="py-12 text-center">
                            <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              Your cart is empty
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Start adding some items to your cart!
                            </p>
                          </div>
                        ) : (
                          <ul
                            role="list"
                            className="-my-6 divide-y divide-gray-200"
                          >
                            {cartItems.map((item, index) => (
                              <li key={index} className="flex py-6">
                                <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <Image
                                    alt={item.title ?? "Product image"}
                                    src={item.imageUrl}
                                    width={96}
                                    height={96}
                                    className="size-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src =
                                        "https://via.placeholder.com/96x96?text=No+Image";
                                    }}
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>
                                        <span>
                                          {item.title ?? "Untitled Item"}
                                        </span>
                                      </h3>
                                      <p className="ml-4">
                                        {item.prefix ?? "$"}
                                        {item.price?.toFixed(2) ?? "0.00"}
                                      </p>
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                      {item.description ??
                                        "No description available"}
                                    </p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-gray-500">Qty 1</p>

                                    <div className="flex">
                                      <button
                                        type="button"
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                        onClick={() => removeItem(index)}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>${getTotalPrice()}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Shipping and taxes calculated at checkout.
                    </p>
                    <div className="mt-6">
                      <button
                        disabled={cartItems.length === 0}
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        onClick={() => {
                          router.push("/checkout");
                          setOpen(false);
                        }}
                      >
                        Checkout ({cartItems.length} items)
                      </button>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                      <p>
                        or{" "}
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Continue Shopping
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
