import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLinkSchema, Link as LinkType } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const linkFormSchema = insertLinkSchema.extend({
  icon: z.string().default("fas fa-link"),
});

type LinkFormData = z.infer<typeof linkFormSchema>;

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link?: LinkType | null;
}

const iconOptions = [
  { value: "fas fa-link", label: "Link", icon: "🔗" },
  { value: "fas fa-globe", label: "Website", icon: "🌐" },
  { value: "fab fa-github", label: "GitHub", icon: "🐙" },
  { value: "fab fa-twitter", label: "Twitter", icon: "🐦" },
  { value: "fab fa-linkedin", label: "LinkedIn", icon: "💼" },
  { value: "fab fa-instagram", label: "Instagram", icon: "📷" },
  { value: "fab fa-youtube", label: "YouTube", icon: "📺" },
  { value: "fas fa-envelope", label: "Email", icon: "✉️" },
  { value: "fas fa-phone", label: "Phone", icon: "📞" },
];

export default function AddLinkModal({ isOpen, onClose, link }: AddLinkModalProps) {
  const { toast } = useToast();
  const isEditing = !!link;

  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      title: "",
      url: "",
      icon: "fas fa-link",
    },
  });

  useEffect(() => {
    if (link) {
      form.reset({
        title: link.title,
        url: link.url,
        icon: link.icon || "fas fa-link",
      });
    } else {
      form.reset({
        title: "",
        url: "",
        icon: "fas fa-link",
      });
    }
  }, [link, form]);

  const createLinkMutation = useMutation({
    mutationFn: async (data: LinkFormData) => {
      const res = await apiRequest("POST", "/api/dashboard/links", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/links"] });
      toast({
        title: "Link created",
        description: "Your new link has been added successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async (data: LinkFormData) => {
      const res = await apiRequest("PATCH", `/api/dashboard/links/${link!.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/links"] });
      toast({
        title: "Link updated",
        description: "Your link has been updated successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: LinkFormData) => {
    // Ensure URL has protocol
    let url = data.url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    const linkData = { ...data, url };

    if (isEditing) {
      updateLinkMutation.mutate(linkData);
    } else {
      createLinkMutation.mutate(linkData);
    }
  };

  const isPending = createLinkMutation.isPending || updateLinkMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-add-link">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Link" : "Add New Link"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="link-title">Title</Label>
            <Input
              id="link-title"
              data-testid="input-link-title"
              placeholder="My Website"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              data-testid="input-link-url"
              placeholder="https://example.com"
              {...form.register("url")}
            />
            {form.formState.errors.url && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.url.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="link-icon">Icon</Label>
            <Select
              value={form.watch("icon")}
              onValueChange={(value) => form.setValue("icon", value)}
            >
              <SelectTrigger data-testid="select-link-icon">
                <SelectValue placeholder="Choose an icon" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isPending}
              data-testid="button-cancel-link"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending}
              data-testid="button-save-link"
            >
              {isPending 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update Link" : "Create Link")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
