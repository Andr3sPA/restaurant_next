import { z } from "zod";
import bcrypt from "bcrypt";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  authenticateUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let userFromDb;
      try {
        userFromDb = await ctx.db.user.findUniqueOrThrow({
          where: { email: input.email },
        });
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        input.password,
        userFromDb.password,
      );
      if (!isPasswordValid) {
        return null; // Incorrect password
      }

      return {
        id: userFromDb.id,
        email: userFromDb.email,
        name: userFromDb.name,
        role: userFromDb.role, // Assuming you have a role field in your user model
      };
    }),
  registerUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z
          .string()
          .min(8, { message: "Password must be at least 8 characters long" })
          .regex(/[A-Z]/, {
            message: "Password must contain at least one uppercase letter",
          })
          .regex(/[a-z]/, {
            message: "Password must contain at least one lowercase letter",
          })
          .regex(/[0-9]/, {
            message: "Password must contain at least one number",
          })
          .regex(/[^A-Za-z0-9]/, {
            message: "Password must contain at least one special character",
          }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: {
          email: input.email,
          password: await bcrypt.hash(input.password, 10),
        },
      });
    }),
});

