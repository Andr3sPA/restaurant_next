import { z } from "zod";
import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { OrderStatus } from "@prisma/client";

export const orderRouter = createTRPCRouter({
  createNew: protectedProcedure
    .input(
      z.object({
        menuItemIds: z.array(z.string()),
        address: z.string(),
        phone: z.string(),
        paymentMethod: z.enum(["credit-card", "cash"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const menuItems = await ctx.db.menuItem.findMany({
        where: { id: { in: input.menuItemIds } },
      });

      const total = menuItems.reduce((sum, item) => sum + item.price, 0);

      const order = await ctx.db.order.create({
        data: {
          userId: ctx.session.user.id,
          address: input.address,
          phone: input.phone,
          total: total * 1.1,
          orderItems: {
            create: input.menuItemIds.map((id) => ({
              menuItemId: id,
              quantity: 1,
              subtotal: menuItems.find((item) => item.id === id)?.price ?? 0,
            })),
          },
          payment: {
            create: {
              method: input.paymentMethod,
              status: "PENDING",
              amount: total * 1.1,
            },
          },
        },
      });

      return order;
    }),

  getOrders: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getOrderDetails: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: orderId }) => {
      return await ctx.db.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          payment: true,
        },
      });
    }),

  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.nativeEnum(OrderStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.order.update({
        where: { id: input.orderId },
        data: { status: input.status },
      });
    }),
});
