"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCheckIcon,
  CreditCard,
  Loader2Icon,
  Package,
  Wallet2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { api } from "@/trpc/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormLabel,
  FormItem,
  FormField,
  FormControl,
  FormMessage,
} from "./ui/form";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import ReturnButton from "@/components/ReturnButton";

const schema = z.object({
  address: z.coerce.string().min(6),
  phone: z.coerce.string().min(6),
  paymentMethod: z.enum(["credit-card", "cash"]),
});

// Componente de checkout que maneja la finalización de compras con formulario de datos del cliente, métodos de pago y simulación de campos de tarjeta de crédito
export function Checkout() {
  const { items: cartItems, getTotalPrice, clearCart } = useCart();
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [expiryDate, setExpiryDate] = useState("");

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      address: "",
      phone: "",
    },
    resolver: zodResolver(schema),
  });

  const paymentMethod = form.watch("paymentMethod");

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, "");

    // Format with slash
    if (digitsOnly.length === 0) {
      setExpiryDate("");
    } else if (digitsOnly.length <= 2) {
      setExpiryDate(digitsOnly);
    } else {
      setExpiryDate(digitsOnly.slice(0, 2) + "/" + digitsOnly.slice(2, 4));
    }
  };

  const handleExpiryDateKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Handle backspace to remove the slash and previous character together
    if (e.key === "Backspace") {
      const currentValue = expiryDate;
      const cursorPosition = (e.target as HTMLInputElement).selectionStart ?? 0;

      // If we're deleting the character right after the slash
      if (cursorPosition === 4 && currentValue.length === 5) {
        e.preventDefault();
        setExpiryDate(currentValue.slice(0, 2));
      }
      // If we're deleting the slash itself
      else if (cursorPosition === 3 && currentValue[2] === "/") {
        e.preventDefault();
        setExpiryDate(currentValue.slice(0, 1));
      }
    }
  };

  useEffect(() => {
    const calculatedSubtotal = getTotalPrice();
    const calculatedTotal = calculatedSubtotal + calculatedSubtotal * 0.1; // Adding 10% tax
    setSubtotal(calculatedSubtotal);
    setTotal(calculatedTotal);
  }, [cartItems, getTotalPrice]);
  const router = useRouter();

  const { mutate, isPending, isSuccess } = api.order.createNew.useMutation({
    onSuccess: () => {
      clearCart(); // Limpiar el carrito después de crear la orden exitosamente
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto grid flex-1 grid-cols-1 gap-8 px-6 py-12 md:grid-cols-3">
        <div className="col-span-2">
          <div className="mb-6 flex items-center gap-4">
            <ReturnButton onClick={() => router.push("/")} />
            <h1 className="text-3xl font-bold">Finalizar Compra</h1>
          </div>
          <Card className="p-0">
            <CardContent className="p-8">
              {isSuccess ? (
                <div className="flex flex-col items-center gap-4">
                  <h2 className="mb-6 text-2xl font-bold">
                    ¡Pedido realizado!
                  </h2>
                  <p>Puedes continuar navegando o esperar tu pedido.</p>
                  <div className="flex justify-between gap-4 p-4">
                    <Button onClick={() => router.back()} variant={"secondary"}>
                      Volver
                    </Button>
                    <Button onClick={() => router.push("/")}>
                      Continuar navegando
                    </Button>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((values) =>
                      mutate({
                        ...values,
                        menuItemIds: cartItems.map((ci) => ci.id),
                      }),
                    )}
                    className="grid grid-cols-2 gap-6"
                  >
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="Calle Principal 123, Ciudad"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1234567890" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Método de Pago</FormLabel>
                          <FormControl>
                            <RadioGroup
                              {...field}
                              onValueChange={(value: "credit-card" | "cash") =>
                                form.setValue("paymentMethod", value)
                              }
                              id="paymentMethod"
                            >
                              <div className="flex items-center gap-4">
                                <RadioGroupItem
                                  id="credit-card"
                                  value="credit-card"
                                />
                                <FormLabel htmlFor="credit-card">
                                  <CreditCard className="mr-2 h-6 w-6" />
                                  Tarjeta de Crédito
                                </FormLabel>
                              </div>
                              <div className="flex items-center gap-4">
                                <RadioGroupItem id="cash" value="cash" />
                                <FormLabel htmlFor="cash">
                                  <Wallet2 className="mr-2 h-6 w-6" />
                                  Efectivo
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-2">
                      <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                      >
                        {isPending ? (
                          <Loader2Icon className="animate-spin" />
                        ) : (
                          "Realizar Pedido"
                        )}
                      </Button>
                    </div>
                    {paymentMethod === "credit-card" && (
                      <div className="col-span-2 mt-4 rounded-lg border bg-gray-50 p-4">
                        <h3 className="mb-4 text-lg font-semibold">
                          Información de Tarjeta de Crédito
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <FormLabel>Número de Tarjeta</FormLabel>
                            <Input placeholder="1234 5678 9012 3456" />
                          </div>
                          <div>
                            <FormLabel>Fecha de Vencimiento</FormLabel>
                            <Input
                              placeholder="MM/AA"
                              value={expiryDate}
                              onChange={handleExpiryDateChange}
                              onKeyDown={handleExpiryDateKeyDown}
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <FormLabel>CVC</FormLabel>
                            <Input placeholder="123" maxLength={3} />
                          </div>
                          <div className="col-span-2">
                            <FormLabel>Nombre del Titular</FormLabel>
                            <Input placeholder="Juan Pérez" />
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
        <Card className="p-0">
          <CardContent className="p-8">
            <h2 className="mb-6 flex items-center text-2xl font-bold">
              Resumen del Pedido
              {isSuccess && <CheckCheckIcon color="lime" className="m-2" />}
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-500" />
                    <span>{item.title}</span>
                    <span className="ml-auto">
                      {item.prefix}
                      {item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
