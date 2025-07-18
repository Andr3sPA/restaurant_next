import { z } from "zod";
import {
  createTRPCRouter,
  adminProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { v2 as cloudinary } from "cloudinary";
import { TRPCError } from "@trpc/server";
const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const menuRouter = createTRPCRouter({
  registerMenuItem: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, { message: "Name is required" }),
        description: z.string().optional(),
        currency: z.string().min(1, { message: "Currency is required" }),
        price: z
          .number()
          .min(0.01, { message: "Price must be greater than 0" }),
        image: z.string().min(1, { message: "Image is required" }), // Base64 string
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate that the base64 string is actually an image
        const base64Data = input.image;

        // Extract the MIME type from the base64 string
        const mimeTypeRegex = /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/;
        const mimeTypeMatch = mimeTypeRegex.exec(base64Data);
        if (!mimeTypeMatch) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid image format",
          });
        }

        const mimeType = mimeTypeMatch[1]!;
        if (!ACCEPTED_IMAGE_MIME_TYPES.includes(mimeType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only .jpg, .jpeg, .png and .webp formats are supported.",
          });
        }

        // Check file size (rough estimation from base64)
        const base64WithoutHeader = base64Data.split(",")[1];
        if (!base64WithoutHeader) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid image data",
          });
        }

        const fileSizeInBytes = (base64WithoutHeader.length * 3) / 4;
        if (fileSizeInBytes > MAX_FILE_SIZE) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `File is too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          });
        }

        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(input.image, {
          folder: "menu-items",
          resource_type: "image",
        });

        // Create menu item in database
        return await ctx.db.menuItem.create({
          data: {
            name: input.name,
            description: input.description,
            currency: input.currency,
            price: input.price,
            image: uploadResult.secure_url, // Store Cloudinary URL
          },
        });
      } catch (error) {
        console.error("Error creating menu item:", error);

        // If it's already a TRPCError, re-throw it
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create menu item",
        });
      }
    }),
  toggleAvailability: adminProcedure
    .input(z.object({ id: z.string(), available: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.menuItem.update({
        where: { id: input.id },
        data: { available: input.available },
      });
    }),
  updateMenuItem: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, { message: "El nombre es requerido" }),
        description: z.string().optional(),
        currency: z.string().min(1, { message: "La moneda es requerida" }),
        price: z
          .number()
          .min(0.01, { message: "El precio debe ser mayor a 0" }),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, image, ...updateData } = input;

      let imageUrl = undefined;

      if (image?.startsWith("data:")) {
        // Si se proporciona una nueva imagen, subirla a Cloudinary
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: "menu-items",
          resource_type: "image",
        });
        imageUrl = uploadResult.secure_url;
      }

      return await ctx.db.menuItem.update({
        where: { id },
        data: {
          ...updateData,
          ...(imageUrl && { image: imageUrl }),
        },
      });
    }),
  deleteMenuItem: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      const menuItem = await ctx.db.menuItem.findUnique({ where: { id } });

      if (menuItem?.image) {
        try {
          const urlParts = menuItem.image.split("/upload/");
          if (urlParts.length === 2) {
            const publicIdWithFolderAndVersion = urlParts[1];
            if (publicIdWithFolderAndVersion) {
              const publicIdWithFolder = publicIdWithFolderAndVersion
                .split("/")
                .slice(1)
                .join("/")
                .split(".")[0];

              if (publicIdWithFolder) {
                await cloudinary.uploader.destroy(
                  `menu-items/${publicIdWithFolder}`,
                );
              }
            }
          }
        } catch (error) {
          console.error("Failed to delete image from Cloudinary:", error);
        }
      }

      return await ctx.db.menuItem.delete({
        where: { id },
      });
    }),
  getMenuItems: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.menuItem.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  getPublicMenuItems: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.menuItem.findMany({
      orderBy: [{ available: "desc" }, { name: "asc" }],
    });
  }),
  getMenuItemDetails: publicProcedure
    .input(z.coerce.string())
    .query(async ({ ctx, input: id }) => {
      return await ctx.db.menuItem.findUnique({
        where: {
          id,
        },
      });
    }),
});
