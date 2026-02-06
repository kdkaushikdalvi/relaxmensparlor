import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, RotateCcw } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useServices, Service } from "@/contexts/ServicesContext";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ServicesPage = () => {
  const navigate = useNavigate();
  const { services, addService, updateService, deleteService, reorderServices, toggleServiceStatus, resetToDefaults } = useServices();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      reorderServices(active.id as string, over.id as string);
      toast({ title: "Services reordered" });
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  const handleToggleStatus = () => {
    if (selectedId) {
      toggleServiceStatus(selectedId);
      toast({ title: "Service status updated" });
    }
  };

  const handleAddService = () => {
    const trimmed = newServiceName.trim();
    if (trimmed) {
      addService(trimmed);
      setNewServiceName("");
      setShowAddDialog(false);
      toast({ title: "Service added" });
    }
  };

  const handleUpdate = (id: string, updates: Partial<Service>) => {
    updateService(id, updates);
    toast({ title: "Service updated" });
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteService(deleteConfirmId);
      if (selectedId === deleteConfirmId) {
        setSelectedId(null);
      }
      setDeleteConfirmId(null);
      toast({ title: "Service deleted" });
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setSelectedId(null);
    toast({ title: "Services reset to defaults" });
  };

  const serviceToDelete = deleteConfirmId ? services.find(s => s.id === deleteConfirmId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[hsl(var(--header-bg))] border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-12 w-12 rounded-full bg-primary/20 hover:bg-primary/20"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Button>
            <h1 className="text-lg font-app text-white">Services</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddDialog(true)} 
              size="sm" 
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-white/80 hover:text-white hover:bg-white/10">
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Services?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all services to their default order and status. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>Yes, Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="px-4 py-3 bg-muted/50 border-b">
        <p className="text-sm text-muted-foreground text-center">
          Tap name to edit • Drag to reorder • Tap card to select
        </p>
      </div>

      {/* Services List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={services.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={selectedId === service.id}
                  onSelect={handleSelect}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>

          {services.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-app">No services added yet</p>
              <Button onClick={() => setShowAddDialog(true)} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Add First Service
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Selection Actions */}
      {selectedId && (
        <div className="sticky bottom-0 p-4 bg-background border-t">
          <Button 
            onClick={handleToggleStatus} 
            className="w-full"
            variant="outline"
          >
            Toggle Active/Inactive
          </Button>
        </div>
      )}

      {/* Add Service Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <Input
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            placeholder="Service name"
            className="h-12"
            onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddService}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{serviceToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServicesPage;
