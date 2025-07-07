"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
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

const schema = z.object({
  address: z.coerce.string().min(6),
  phone: z.coerce.string().min(6),
  paymentMethod: z.enum(["credit-card", "cash"]),
});

export function Checkout() {
  const { items: cartItems, getTotalPrice, clearCart } = useCart();
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      address: "",
      phone: "",
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const calculatedSubtotal = getTotalPrice();
    const calculatedTotal = calculatedSubtotal + (calculatedSubtotal * 0.1); // Adding 10% tax
    setSubtotal(calculatedSubtotal);
    setTotal(calculatedTotal);
  }, [cartItems, getTotalPrice]);
  const router = useRouter();

  const { mutate, isPending, isSuccess } = api.order.createNew.useMutation({
    onSuccess: () => {
      clearCart(); // Limpiar el carrito después de crear la orden exitosamente
    }
  });

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto grid flex-1 grid-cols-1 gap-8 px-6 py-12 md:grid-cols-3">
        <div className="col-span-2">
          <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
          <Card className="p-0">
            <CardContent className="p-8">
              {isSuccess ? (
                <div className="flex flex-col items-center gap-4">
                  <h2 className="mb-6 text-2xl font-bold">Order placed!</h2>
                  <p>You can continue browsing or wait for your order.</p>
                  <div className="flex justify-between gap-4 p-4">
                    <Button onClick={() => router.back()} variant={"secondary"}>
                      Go back
                    </Button>
                    <Button onClick={() => router.push("/")}>
                      Continue browsing
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
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="123 Main St, Anytown USA"
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
                          <FormLabel>Phone</FormLabel>
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
                          <FormLabel>Payment Method</FormLabel>
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
                                  Credit Card
                                </FormLabel>
                              </div>
                              <div className="flex items-center gap-4">
                                <RadioGroupItem id="cash" value="cash" />
                                <FormLabel htmlFor="cash">
                                  <Wallet2 className="mr-2 h-6 w-6" />
                                  Cash
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
                          "Place Order"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
        <Card className="p-0">
          <CardContent className="p-8">
            <h2 className="mb-6 flex items-center text-2xl font-bold">
              Order Summary
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
                    <span className="ml-auto">{item.prefix}{item.price.toFixed(2)}</span>
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
