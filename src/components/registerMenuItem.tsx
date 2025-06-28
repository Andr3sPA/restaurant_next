"use client"
import {
  useState
} from "react"
import {
  toast
} from "sonner"
import {
  useForm
} from "react-hook-form"
import {
  zodResolver
} from "@hookform/resolvers/zod"
import {
  z
} from "zod"
import {
  cn
} from "@/lib/utils"
import {
  Button
} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Input
} from "@/components/ui/input"
import {
  Textarea
} from "@/components/ui/textarea"
import {
  type Currency,
  CurrencySelect
} from "@/components/ui/currency-select"
import {
  CloudUpload,
  Paperclip
} from "lucide-react"
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem
} from "@/components/ui/file-upload"
import { api } from "@/trpc/react"

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
      "Only .jpg, .jpeg, .png and .webp formats are supported."
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
    number: "170"
  });
  const [files, setFiles] = useState<File[] | null>(null);

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"]
    }
  };

  const form = useForm < z.infer < typeof formSchema >> ({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      currency: "COP",
      price: 0,
      image: undefined,
    }
  })
  const { mutate, isPending } = api.menu.registerMenuItem.useMutation({
      onSuccess: () => {
        toast.success("Menu item registered successfully!");
        form.reset();
        setFiles(null);
      },
      onError: (error) => {
        toast.error(`Registration failed: ${error.message}`);
        console.error("menu item registration failed:", error);
      },
    });
  function onSubmit(values: z.infer < typeof formSchema > ) {
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
          price: values.price
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
        
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
                {...field} />
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
              <FormDescription>Optional description of the menu item.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex w-full gap-4 flex-col">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Menu Item Image</FormLabel>
                <FormControl>
                  <FileUploader
                    value={files}
                    onValueChange={(newFiles) => {
                      setFiles(newFiles);
                      // Also update the form field for validation
                      field.onChange(newFiles);
                    }}
                    dropzoneOptions={dropZoneConfig}
                    className="relative bg-background rounded-lg p-2"
                  >
                    <FileInput
                      id="fileInput"
                      className="outline-dashed outline-1 outline-slate-500"
                    >
                      <div className="flex items-center justify-center flex-col p-8 w-full">
                        <CloudUpload className='text-gray-500 w-10 h-10' />
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>
                          &nbsp; or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, JPEG or WEBP (max 5MB)
                        </p>
                      </div>
                    </FileInput>
                    <FileUploaderContent>
                      {files &&
                        files.length > 0 &&
                        files.map((file, i) => (
                          <FileUploaderItem key={i} index={i}>
                            <Paperclip className="h-4 w-4 stroke-current" />
                            <span>{file.name}</span>
                          </FileUploaderItem>
                        ))}
                    </FileUploaderContent>
                  </FileUploader>
                </FormControl>
                <FormDescription>Upload an image for your menu item (required).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <FormLabel
            className={cn(
              (form.formState.errors.currency ??
                form.formState.errors.price) &&
                "text-destructive"
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
                      onChange={(e) =>
                        field.onChange(Number(e.target.value))
                      }
                      className="pr-10"
                    />
                  </FormControl>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                    {selectedCurrency?.symbol}
                  </span>
                </div>
              )}
            />
          </div>
          <FormDescription>
            Select currency and enter the price for this menu item
          </FormDescription>
          {(form.formState.errors.currency ??
            form.formState.errors.price) && (
            <div className="text-[0.8rem] font-medium text-destructive">
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
  )
}