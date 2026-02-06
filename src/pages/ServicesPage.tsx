import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Download, Upload, RotateCcw } from "lucide-react";
import { useServices } from "@/contexts/ServicesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ServicesPage = () => {
  const navigate = useNavigate();
  const { services, addService, updateService, deleteService, resetToDefaults } = useServices();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editServiceName, setEditServiceName] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddService = () => {
    if (newServiceName.trim()) {
      if (services.includes(newServiceName.trim())) {
        toast({ title: "Service already exists", variant: "destructive" });
        return;
      }
      addService(newServiceName.trim());
      setNewServiceName("");
      setShowAddDialog(false);
      toast({ title: "Service added" });
    }
  };

  const handleEditService = () => {
    if (editingService && editServiceName.trim()) {
      if (services.includes(editServiceName.trim()) && editServiceName.trim() !== editingService) {
        toast({ title: "Service already exists", variant: "destructive" });
        return;
      }
      updateService(editingService, editServiceName.trim());
      setEditingService(null);
      setEditServiceName("");
      toast({ title: "Service updated" });
    }
  };

  const handleDeleteService = (service: string) => {
    deleteService(service);
    toast({ title: "Service deleted" });
  };

  const startEditService = (service: string) => {
    setEditingService(service);
    setEditServiceName(service);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(services, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "services-export.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Services exported successfully" });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedServices = JSON.parse(content);
        
        if (!Array.isArray(importedServices)) {
          throw new Error("Invalid format");
        }

        // Validate all items are strings
        const validServices = importedServices.filter(
          (s): s is string => typeof s === "string" && s.trim().length > 0
        );

        // Add each service that doesn't already exist
        let addedCount = 0;
        validServices.forEach((service) => {
          const trimmed = service.trim();
          if (!services.includes(trimmed)) {
            addService(trimmed);
            addedCount++;
          }
        });

        toast({ 
          title: `Imported ${addedCount} new services`,
          description: addedCount === 0 ? "All services already exist" : undefined
        });
      } catch (error) {
        toast({ 
          title: "Import failed", 
          description: "Invalid JSON file format",
          variant: "destructive" 
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    resetToDefaults();
    toast({ title: "Services reset to defaults" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
            <h1 className="text-lg font-app text-white">Services Management</h1>
          </div>
          <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()} 
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-orange-600 border-orange-300">
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Services?</AlertDialogTitle>
              <AlertDialogDescription>
                This will replace all current services with the default list. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Yes, Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Services List */}
      <div className="p-4 space-y-2">
        {services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-app">No services added yet</p>
            <Button onClick={() => setShowAddDialog(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Add First Service
            </Button>
          </div>
        ) : (
          services.map((service, index) => (
            <div
              key={service}
              className="bg-card rounded-xl border p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-app text-primary">
                  {index + 1}
                </span>
                <span className="font-app">{service}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditService(service)}
                  className="h-9 w-9"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Service?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{service}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteService(service)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Service Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>Enter the name of the service to add.</DialogDescription>
          </DialogHeader>
          <Input
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            placeholder="Service name"
            className="h-12"
            onKeyDown={(e) => e.key === "Enter" && handleAddService()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddService}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update the service name.</DialogDescription>
          </DialogHeader>
          <Input
            value={editServiceName}
            onChange={(e) => setEditServiceName(e.target.value)}
            placeholder="Service name"
            className="h-12"
            onKeyDown={(e) => e.key === "Enter" && handleEditService()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingService(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditService}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;
