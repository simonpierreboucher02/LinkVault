import { Link as LinkType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical, Globe, Github, Twitter, Linkedin, Mail } from "lucide-react";

interface LinkCardProps {
  link: LinkType;
  onEdit: () => void;
  onDelete: () => void;
}

const getIconComponent = (icon: string) => {
  switch (icon) {
    case "fab fa-github":
      return Github;
    case "fab fa-twitter":
      return Twitter;
    case "fab fa-linkedin":
      return Linkedin;
    case "fas fa-envelope":
      return Mail;
    default:
      return Globe;
  }
};

export default function LinkCard({ link, onEdit, onDelete }: LinkCardProps) {
  const IconComponent = getIconComponent(link.icon || "fas fa-link");

  return (
    <div 
      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
      data-testid={`link-card-${link.id}`}
    >
      <div className="flex items-center space-x-3">
        <IconComponent className="text-primary h-5 w-5" />
        <div>
          <h3 className="font-medium text-card-foreground" data-testid={`link-title-${link.id}`}>
            {link.title}
          </h3>
          <p className="text-sm text-muted-foreground" data-testid={`link-url-${link.id}`}>
            {link.url}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          data-testid={`button-edit-${link.id}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
          data-testid={`button-delete-${link.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-grab active:cursor-grabbing"
          data-testid={`button-drag-${link.id}`}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
