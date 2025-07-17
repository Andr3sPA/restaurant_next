"use client";
import { useState } from "react";
import * as React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type Currency, CurrencySelect } from "@/components/ui/currency-select";
import { Upload, X } from "lucide-react";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { api } from "@/trpc/react";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  image: z
    .array(z.instanceof(File))
    .min(1, "Image is required.")
    .refine((files) => {
      return files[0] && files[0].size <= MAX_FILE_SIZE;
    }, `Max image size is 5MB.`)
    .refine(
      (files) => files[0] && ACCEPTED_IMAGE_MIME_TYPES.includes(files[0].type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
  currency: z.string().min(1, { message: "Currency is required" }),
  price: z.number().min(0.01, { message: "Price must be greater than 0" }),
});

export default function MyForm() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>({
    code: "COP",
    name: "Colombian Peso",
    symbol: "$",
    decimals: 2,
    number: "170",
  });
  const [files, setFiles] = useState<File[]>([]);

  const onUpload = React.useCallback(
    async (
      files: File[],
      {
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (file: File, progress: number) => void;
        onSuccess: (file: File) => void;
        onError: (file: File, error: Error) => void;
      },
    ) => {
      try {
        const uploadPromises = files.map(async (file) => {
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "Default"); // Your preset name

            const xhr = new XMLHttpRequest();

            // Set up progress tracking
            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                onProgress(file, progress);
              }
            });

            // Set up completion handler
            xhr.onload = () => {
              if (xhr.status === 200) {
                onSuccess(file);
              } else {
                onError(
                  file,
                  new Error(`Upload failed with status: ${xhr.status}`),
                );
              }
            };

            // Set up error handler
            xhr.onerror = () => {
              onError(file, new Error("Upload failed"));
            };

            // Send the request
            xhr.open(
              "POST",
              `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            );
            xhr.send(formData);
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed"),
            );
          }
        });

        await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Unexpected error during upload:", error);
      }
    },
    [],
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      currency: "COP",
      price: 0,
      image: undefined,
    },
  });
  const { mutate, isPending } = api.menu.registerMenuItem.useMutation({
    onSuccess: () => {
      toast.success("Menu item registered successfully!");
      form.reset();
      setFiles([]);
    },
    onError: (error) => {
      toast.error(`Registration failed: ${error.message}`);
      console.error("menu item registration failed:", error);
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Get the file from the files state (FileUploader component)
      const file = files?.[0];
      if (!file) {
        toast.error("Please select an image");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        mutate({
          name: values.name,
          currency: values.currency,
          description: values.description ?? "",
          image: base64,
          price: values.price,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const handleCurrencySelect = (currency: Currency) => {
    console.log("Selected Currency Object:", currency);
    setSelectedCurrency(currency);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-8 py-10"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu Item Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter menu item name"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormDescription>The name of your menu item.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your menu item..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description of the menu item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex w-full flex-col gap-4">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Menu Item Image</FormLabel>
                <FormControl>
                  <FileUpload
                    value={files}
                    onValueChange={(newFiles) => {
                      setFiles(newFiles);
                      // Also update the form field for validation
                      field.onChange(newFiles);
                    }}
                    maxFiles={1}
                    maxSize={MAX_FILE_SIZE}
                    className="w-full"
                    onUpload={onUpload}
                    onFileReject={onFileReject}
                    multiple={false}
                    accept="image/*"
                  >
                    <FileUploadDropzone>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <div className="flex items-center justify-center rounded-full border p-2.5">
                          <Upload className="text-muted-foreground size-6" />
                        </div>
                        <p className="text-sm font-medium">
                          Drag & drop image here
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Or click to browse (PNG, JPG, JPEG or WEBP, max 5MB)
                        </p>
                      </div>
                      <FileUploadTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-fit"
                        >
                          Browse images
                        </Button>
                      </FileUploadTrigger>
                    </FileUploadDropzone>
                    <FileUploadList orientation="horizontal">
                      {files.map((file, index) => (
                        <FileUploadItem
                          key={index}
                          value={file}
                          className="p-0"
                        >
                          <FileUploadItemPreview className="size-20 [&>svg]:size-12">
                            <FileUploadItemProgress
                              variant="circular"
                              size={40}
                            />
                          </FileUploadItemPreview>
                          <FileUploadItemMetadata className="sr-only" />
                          <FileUploadItemDelete asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute -top-1 -right-1 size-5 rounded-full"
                            >
                              <X className="size-3" />
                            </Button>
                          </FileUploadItemDelete>
                        </FileUploadItem>
                      ))}
                    </FileUploadList>
                  </FileUpload>
                </FormControl>
                <FormDescription>
                  Upload an image for your menu item (required).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel
            className={cn(
              (form.formState.errors.currency ?? form.formState.errors.price) &&
                "text-destructive",
            )}
          >
            Price
          </FormLabel>
          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormControl>
                  <CurrencySelect
                    onValueChange={field.onChange}
                    onCurrencySelect={handleCurrencySelect}
                    placeholder="Currency"
                    disabled={false}
                    currencies="all"
                    variant="small"
                    {...field}
                  />
                </FormControl>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <div className="relative w-full">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      disabled={!selectedCurrency}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="pr-10"
                    />
                  </FormControl>
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                    {selectedCurrency?.symbol}
                  </span>
                </div>
              )}
            />
          </div>
          <FormDescription>
            Select currency and enter the price for this menu item
          </FormDescription>
          {(form.formState.errors.currency ?? form.formState.errors.price) && (
            <div className="text-destructive text-[0.8rem] font-medium">
              {form.formState.errors.currency?.message && (
                <p>{form.formState.errors.currency.message}</p>
              )}
              {form.formState.errors.price?.message && (
                <p>{form.formState.errors.price.message}</p>
              )}
            </div>
          )}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Registering..." : "Register Menu Item"}
        </Button>
      </form>
    </Form>
  );
}
