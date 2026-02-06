import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Service, SERVICE_ICONS } from '@/contexts/ServicesContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function ServiceCard({ service, isSelected, onSelect }: ServiceCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card rounded-xl border p-4 flex items-center gap-4 cursor-pointer transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5",
        isDragging && "opacity-50 shadow-lg scale-[1.02]"
      )}
      onClick={() => onSelect(service.id)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="touch-none p-2 -m-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
        service.status === 'active' 
          ? "bg-primary/10 text-primary" 
          : "bg-muted text-muted-foreground"
      )}>
        <IconComponent className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-app font-semibold text-base truncate",
          service.status === 'inactive' && "text-muted-foreground"
        )}>
          {service.name}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {service.description}
        </p>
      </div>

      {/* Status Badge */}
      <Badge 
        variant={service.status === 'active' ? 'soft' : 'secondary'}
        className={cn(
          "shrink-0 capitalize",
          service.status === 'active' 
            ? "bg-primary/10 text-primary border-primary/20" 
            : "bg-muted text-muted-foreground"
        )}
      >
        {service.status}
      </Badge>
    </div>
  );
}
