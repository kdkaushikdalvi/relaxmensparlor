import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  Star,
  MessageSquare,
  X,
} from "lucide-react";
import {
  useMessageTemplates,
  MessageTemplate,
} from "@/contexts/MessageTemplateContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/* ============================= */
/* Variable Examples */
/* ============================= */

const VARIABLE_EXAMPLES: Record<string, string> = {
  customerName: "Rahul",
  businessName: "Relax Men's Parlor",
  services: "Haircut & Beard",
  offer: "20% OFF",
};

export function MessageTemplateManager() {
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  } = useMessageTemplates();
  const { toast } = useToast();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setName("");
    setMessage("");
    setEditDialogOpen(true);
  };

  const handleOpenEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setMessage(template.message);
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter both name and message",
        variant: "destructive",
      });
      return;
    }

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, { name, message });
      toast({ title: "Template updated" });
    } else {
      addTemplate(name, message);
      toast({ title: "Template created" });
    }

    setEditDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    toast({ title: "Template deleted" });
  };

  const handleSetDefault = (id: string) => {
    setDefaultTemplate(id);
    toast({ title: "Default template updated" });
  };

  /* ============================= */
  /* Variable Helpers */
  /* ============================= */

  const insertVariable = (key: string) => {
    setMessage((m) => (m ? `${m} {${key}}` : `{${key}}`));
  };

  const removeVariable = (variable: string) => {
    setMessage((m) => m.replace(variable, "").replace(/\s+/g, " ").trim());
  };

  const renderPreview = () => {
    let preview = message || "";
    Object.entries(VARIABLE_EXAMPLES).forEach(([k, v]) => {
      preview = preview.split(`{${k}}`).join(v);
    });
    return preview;
  };

  const usedVariables = Array.from(new Set(message.match(/{\w+}/g) || []));

  return (
    <div className="space-y-4">
      {/* ================= Header ================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Message Templates</h3>
        </div>
        <Button size="sm" onClick={handleOpenCreate} className="gap-1">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* ================= Variables ================= */}
      <div className="p-3 rounded-xl bg-muted/40 border space-y-2">
        <p className="text-xs font-medium">Click to insert variables:</p>

        <div className="flex flex-wrap gap-2">
          {Object.keys(VARIABLE_EXAMPLES).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => insertVariable(key)}
              className="px-2 py-1 rounded-md bg-background border text-xs hover:bg-primary/10 transition"
            >
              {`{${key}}`}
            </button>
          ))}
        </div>

        {/* Preview */}
        {message && (
          <div className="mt-2 text-xs p-2 rounded-md bg-background border">
            <p className="text-muted-foreground mb-1">Preview (example):</p>
            <p className="text-foreground whitespace-pre-wrap">
              {renderPreview()}
            </p>
          </div>
        )}
      </div>

      {/* ================= Template List ================= */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-3 pr-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors",
                template.isDefault && "border-primary/50 bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{template.name}</h4>
                    {template.isDefault && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {template.message}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {!template.isDefault && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSetDefault(template.id)}
                      className="h-8 w-8"
                      title="Set as default"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenEdit(template)}
                    className="h-8 w-8"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{template.name}"?
                          This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(template.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* ================= Edit/Create Dialog ================= */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              Create a reusable message template for WhatsApp reminders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Template Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Birthday Offer"
                className="h-11"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi {customerName}, welcome to {businessName}. Enjoy {offer}!"
                rows={6}
                className="resize-none"
              />

              {/* Used variables */}
              {usedVariables.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {usedVariables.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => removeVariable(v)}
                      className="text-xs px-2 py-1 rounded-md bg-primary/10 border hover:bg-destructive/10 flex items-center gap-1"
                      title="Click to remove"
                    >
                      {v}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-1">
              <Check className="w-4 h-4" />
              {editingTemplate ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
