import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const orderRouter = createTRPCRouter({
  createNew: protectedProcedure
    .input(
      z.object({
        address: z.coerce.string().min(6),
        phone: z.coerce.string().min(6),
        paymentMethod: z.enum(["credit-card", "cash"]),
        menuItemIds: z.array(z.coerce.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const menuItems = await ctx.db.menuItem.findMany({
        where: {
          id: { in: input.menuItemIds },
        },
        select: {
          id: true,
          available: true,
          price: true,
        },
      });

      for (const item of menuItems) {
        if (!input.menuItemIds.some((iid) => iid === item.id)) {
          return new TRPCError({
            code: "NOT_FOUND",
            message: `Item with id ${item.id} not found.`,
          });
        }
      }

      for (const item of menuItems) {
        if (!item.available) {
          return new TRPCError({
            code: "CONFLICT",
            message: `Item with id ${item.id} id not available.`,
          });
        }
      }

      let total = 0;
      const orderItems = menuItems.reduce(
        (oItems, i) => {
          total += i.price;
          oItems[i.id] ??= { quantity: 0, subtotal: 0 };
          oItems[i.id]!.quantity += 1;
          oItems[i.id]!.subtotal += i.price;

          return oItems;
        },
        {} as Record<string, { quantity: number; subtotal: number }>,
      );

      return await ctx.db.order.create({
        data: {
          address: input.address,
          phone: input.phone,
          payment: {
            create: {
              amount: total,
              method: input.paymentMethod.toUpperCase(),
              status: "noc",
            },
          },
          total,
          userId: ctx.session.user.id,
          orderItems: {
            createMany: {
              data: Object.entries(orderItems).map(([k, v]) => {
                return { ...v, menuItemId: k };
              }),
            },
          },
        },
      });
    }),
});
