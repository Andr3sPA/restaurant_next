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
  name: z.string().min(1, { message: "El nombre es requerido" }),
  description: z.string().optional(),
  image: z
    .array(z.instanceof(File))
    .min(1, "La imagen es requerida.")
    .refine((files) => {
      return files[0] && files[0].size <= MAX_FILE_SIZE;
    }, `El tamaño máximo de la imagen es 5MB.`)
    .refine(
      (files) => files[0] && ACCEPTED_IMAGE_MIME_TYPES.includes(files[0].type),
      "Solo se admiten los formatos .jpg, .jpeg, .png y .webp.",
    ),
  currency: z.string().min(1, { message: "La moneda es requerida" }),
  price: z.union([
    z.number().min(0.01, { message: "El precio debe ser mayor que 0" }),
    z.string().min(1, { message: "El precio es requerido" }),
  ]),
});

// Componente para registrar un nuevo elemento en el menú
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
        // Process each file individually
        const uploadPromises = files.map(async (file) => {
          try {
            // Simulate file upload with progress
            const totalChunks = 10;
            let uploadedChunks = 0;

            // Simulate chunk upload with delays
            for (let i = 0; i < totalChunks; i++) {
              // Simulate network delay (100-300ms per chunk)
              await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 200 + 100),
              );

              // Update progress for this specific file
              uploadedChunks++;
              const progress = (uploadedChunks / totalChunks) * 100;
              onProgress(file, progress);
            }

            // Simulate server processing delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            onSuccess(file);
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed"),
            );
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      } catch (error) {
        // This handles any error that might occur outside the individual upload processes
        console.error("Unexpected error during upload:", error);
      }
    },
    [],
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" ha sido rechazado`,
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      currency: "COP",
      price: "",
      image: undefined,
    },
  });
  const { mutate, isPending } = api.menu.registerMenuItem.useMutation({
    onSuccess: () => {
      toast.success("Elemento del menú registrado con éxito!");
      form.reset();
      setFiles([]);
    },
    onError: (error) => {
      toast.error(`Registro fallido: ${error.message}`);
      console.error("falló el registro del elemento del menú:", error);
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Get the file from the files state (FileUploader component)
      const file = files?.[0];
      if (!file) {
        toast.error("Por favor seleccione una imagen");
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
          price: Number(values.price),
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error al enviar el formulario", error);
      toast.error(
        "No se pudo enviar el formulario. Por favor, inténtelo de nuevo.",
      );
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
              <FormLabel>Nombre del Elemento del Menú</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingrese el nombre del elemento del menú"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                El nombre de su elemento del menú.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa su elemento del menú..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Descripción opcional del elemento del menú.
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
                <FormLabel>Imagen del Elemento del Menú</FormLabel>
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
                          Arrastra y suelta la imagen aquí
                        </p>
                        <p className="text-muted-foreground text-xs">
                          O haz clic para buscar (PNG, JPG, JPEG o WEBP, máx.
                          5MB)
                        </p>
                      </div>
                      <FileUploadTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-fit"
                        >
                          Buscar imágenes
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
                  Sube una imagen para tu elemento del menú (requerido).
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
            Precio
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
                    placeholder="Moneda"
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
                      onChange={(e) => field.onChange(e.target.value)}
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
            Seleccione la moneda e ingrese el precio para este elemento del menú
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
          {isPending ? "Registrando..." : "Registrar Elemento del Menú"}
        </Button>
      </form>
    </Form>
  );
}
