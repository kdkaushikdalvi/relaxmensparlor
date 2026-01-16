import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Check, Star, X, ArrowLeft } from "lucide-react";
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
};

type ViewMode = "list" | "edit" | "create";

export function MessageTemplateManager() {
  const navigate = useNavigate();
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  } = useMessageTemplates();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = () => {
    setEditingTemplate(null);
    setName("");
    setMessage("");
    setViewMode("create");
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setMessage(template.message);
    setViewMode("edit");
  };

  const handleCancel = () => {
    setViewMode("list");
    setEditingTemplate(null);
    setName("");
    setMessage("");
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

    handleCancel();
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

  // Edit/Create View
  if (viewMode === "edit" || viewMode === "create") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-10 w-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-app">
            {viewMode === "edit" ? "Edit Template" : "Create Template"}
          </h2>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-4 space-y-3">
            <label className="text-sm font-app">Template Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Birthday Offer"
              className="h-12"
            />
          </div>

          <div className="bg-card rounded-xl border p-4 space-y-3">
            <label className="text-sm font-app">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi {customerName}, we'd love to see you again!"
              rows={6}
              className="resize-none"
            />

            {/* Used variables */}
            {usedVariables.length > 0 && (
              <div className="flex flex-wrap gap-2">
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

          {/* Variables */}
          <div className="p-4 rounded-xl bg-muted/40 border space-y-3">
            <p className="text-sm font-app">Insert Variables</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(VARIABLE_EXAMPLES).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => insertVariable(key)}
                  className="px-3 py-2 rounded-lg bg-background border text-sm hover:bg-primary/10 transition"
                >
                  {`{${key}}`}
                </button>
              ))}
            </div>

            {/* Preview */}
            {message && (
              <div className="mt-3 p-3 rounded-lg bg-background border">
                <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {renderPreview()}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="flex-1 h-12">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 h-12 gap-2">
              <Check className="w-4 h-4" />
              {viewMode === "edit" ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {templates.length} template{templates.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={handleCreate} className="gap-1">
          <Plus className="w-4 h-4" />
          New
        </Button>
      </div>

      {/* Template List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "p-4 rounded-xl border bg-card hover:bg-card/80 transition-colors",
                template.isDefault && "border-primary/50 bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-app truncate">{template.name}</h4>
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
                      className="h-9 w-9"
                      title="Set as default"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(template)}
                    className="h-9 w-9"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-destructive"
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
    </div>
  );
}
