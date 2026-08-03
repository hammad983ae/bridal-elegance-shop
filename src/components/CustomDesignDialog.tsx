import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STUDIO_EMAIL = "faaizaamjadstudio.official@gmail.com";
const MAX_IMAGES = 6;

const fieldClass =
  "rounded-none border-0 border-b border-input bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-primary";

const consultSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  vision: z.string().trim().min(10, "Tell us a little more about the piece you have in mind"),
  bust: z.string().trim().optional(),
  waist: z.string().trim().optional(),
  hips: z.string().trim().optional(),
  height: z.string().trim().optional(),
});

type ConsultValues = z.infer<typeof consultSchema>;

type ImageAttachment = { file: File; previewUrl: string };

export function CustomDesignDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ConsultValues>({
    resolver: zodResolver(consultSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      vision: "",
      bust: "",
      waist: "",
      hips: "",
      height: "",
    },
  });

  const resetAll = () => {
    form.reset();
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetAll();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`You can attach up to ${MAX_IMAGES} photos`);
      return;
    }
    const next = Array.from(files)
      .slice(0, room)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...next]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (values: ConsultValues) => {
    setIsSubmitting(true);
    try {
      const measurements = [
        values.bust ? `Bust: ${values.bust}` : null,
        values.waist ? `Waist: ${values.waist}` : null,
        values.hips ? `Hips: ${values.hips}` : null,
        values.height ? `Height: ${values.height}` : null,
      ].filter((l) => l !== null);

      const lines = [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        values.phone ? `Phone: ${values.phone}` : null,
        "",
        "Vision:",
        values.vision,
      ];
      if (measurements.length > 0) {
        lines.push("", "Measurements:", ...measurements);
      }
      if (images.length > 0) {
        lines.push(
          "",
          "Reference photos: please attach the following before sending —",
          images.map((img) => img.file.name).join(", "),
        );
      }
      const subject = `Custom design consultation — ${values.name}`;
      const mailto = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        lines.filter((l) => l !== null).join("\n"),
      )}`;
      window.location.href = mailto;
      toast.success("Your email app should now be open", {
        description:
          images.length > 0
            ? "Attach your reference photos and hit send to reach our design team."
            : "Hit send to reach our design team — we'll follow up within 2 business days.",
      });
      handleOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <p className="eyebrow text-primary">Bespoke by design</p>
          <DialogTitle className="font-serif text-2xl font-medium">
            Book a design consultation
          </DialogTitle>
          <DialogDescription>
            Tell us about the piece you're dreaming of — silhouette, fabric, embroidery, occasion
            date — and share your measurements and a few reference photos if you have them.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="eyebrow text-muted-foreground">Full name</FormLabel>
                  <FormControl>
                    <Input className={fieldClass} placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="eyebrow text-muted-foreground">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className={fieldClass}
                        placeholder="you@email.com"
                        {...field}
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
                    <FormLabel className="eyebrow text-muted-foreground">
                      Phone (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        className={fieldClass}
                        placeholder="03XX XXXXXXX"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="eyebrow text-muted-foreground">Your vision</FormLabel>
                  <FormControl>
                    <Textarea
                      className={`${fieldClass} min-h-24 resize-none`}
                      placeholder="Silhouette, fabric, embroidery motif, occasion date..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <p className="eyebrow mb-3 text-muted-foreground">Measurements (optional)</p>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                <FormField
                  control={form.control}
                  name="bust"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="eyebrow text-muted-foreground">Bust</FormLabel>
                      <FormControl>
                        <Input className={fieldClass} placeholder="e.g. 36in" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="eyebrow text-muted-foreground">Waist</FormLabel>
                      <FormControl>
                        <Input className={fieldClass} placeholder="e.g. 30in" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="eyebrow text-muted-foreground">Hips</FormLabel>
                      <FormControl>
                        <Input className={fieldClass} placeholder="e.g. 38in" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="eyebrow text-muted-foreground">Height</FormLabel>
                      <FormControl>
                        <Input className={fieldClass} placeholder={`e.g. 5'6"`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <p className="eyebrow mb-2 text-muted-foreground">Reference photos (optional)</p>
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div
                    key={img.previewUrl}
                    className="group relative h-16 w-16 overflow-hidden border border-border"
                  >
                    <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label="Remove photo"
                      className="absolute inset-0 flex items-center justify-center bg-primary/70 text-primary-foreground opacity-0 transition group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary">
                    <ImagePlus className="h-4 w-4" strokeWidth={1.4} />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </label>
                )}
              </div>
            </div>

            <DialogFooter>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 bg-primary text-[12px] uppercase tracking-[0.28em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-8"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send request"}
              </button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
