import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Check, X } from "lucide-react";
import { Service, SERVICE_ICONS } from "@/contexts/ServicesContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Service>) => void;
  onDelete: (id: string) => void;
}

export function ServiceCard({
  service,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: ServiceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(service.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = SERVICE_ICONS[service.icon] || SERVICE_ICONS.Star;

  const handleSave = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== service.name) {
      onUpdate(service.id, { name: trimmed });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(service.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  const handleToggleStatus = (checked: boolean) => {
    onUpdate(service.id, {
      status: checked ? "active" : "inactive",
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card rounded-xl border p-3 sm:p-4 flex items-center gap-2 sm:gap-3 transition-all duration-200 w-full overflow-hidden",
        "hover:border-primary/30 hover:shadow-sm",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5",
        isDragging && "opacity-50 shadow-lg scale-[1.02]"
      )}
      onClick={() => !isEditing && onSelect(service.id)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="touch-none p-2 -m-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* Icon */}
      <div
        className={cn(
          "w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0",
          service.status === "active"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 text-base font-semibold"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleSave}
            >
              <Check className="w-4 h-4 text-primary" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleCancel}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <h3
            className={cn(
              "group flex items-center gap-3 font-app font-semibold text-base truncate cursor-pointer transition-colors",
              service.status === "inactive"
                ? "text-muted-foreground"
                : "text-foreground"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {service.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold border border-muted-foreground/20 text-muted-foreground rounded-full opacity-100  text-primary transition-all duration-300"
            >
              Edit
            </button>
          </h3>
        )}
      </div>

      {/* Status Toggle */}
      {!isEditing && (
        <div
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={service.status === "active"}
            onCheckedChange={handleToggleStatus}
          />
          <span className="text-xs text-muted-foreground capitalize">
            {service.status}
          </span>
        </div>
      )}

      {/* Delete Button */}
      {!isEditing && (
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(service.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
