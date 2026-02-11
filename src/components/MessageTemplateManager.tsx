import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Check, Star, X, ArrowLeft, Eye, Sparkles } from "lucide-react";
import {
  useMessageTemplates,
  MessageTemplate,
} from "@/contexts/MessageTemplateContext";
import { useProfile } from "@/contexts/ProfileContext";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/* ============================= */
/* Template Variables */
/* ============================= */

interface TemplateVariable {
  key: string;
  label: string;
  example: string;
}

const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: "CustomerName", label: "Customer Name", example: "Rahul" },
  { key: "ShopName", label: "Shop Name", example: "Relax Men's Parlor" },
  { key: "OwnerName", label: "Owner Name", example: "John" },
  { key: "LastVisit", label: "Last Visit", example: "15 Jan 2025" },
];

type ViewMode = "list" | "edit" | "create";

interface SuggestedTemplate {
  name: string;
  message: string;
}

const SUGGESTED_TEMPLATES: SuggestedTemplate[] = [
  {
    name: "🪔 Diwali Greeting",
    message: `🪔 Happy Diwali, {CustomerName}!\n\nWishing you a sparkling Diwali full of joy & prosperity! ✨\n\nLook your best this festive season — visit {ShopName} for a fresh new look!\n\nWarm regards,\n{OwnerName} 🙏`,
  },
  {
    name: "🎉 New Year Greeting",
    message: `🎉 Happy New Year, {CustomerName}!\n\nStart the new year looking sharp & confident! 💈\n\nVisit {ShopName} for a stylish makeover.\n\nBest wishes,\n{OwnerName} 🥳`,
  },
  {
    name: "🕉️ Ganesh Chaturthi",
    message: `🕉️ गणपती बाप्पा मोरया, {CustomerName}!\n\nगणेशोत्सवाच्या हार्दिक शुभेच्छा! 🌺\n\nसणासाठी fresh look हवा असेल तर {ShopName} ला भेट द्या!\n\n{OwnerName} 🙏`,
  },
  {
    name: "🌙 Eid Greeting",
    message: `🌙 Eid Mubarak, {CustomerName}!\n\nWishing you joy, peace & happiness on this blessed day! ✨\n\nCelebrate in style — visit {ShopName} for a festive grooming session.\n\nWarm regards,\n{OwnerName} 🙏`,
  },
  {
    name: "🎊 Holi Greeting",
    message: `🎊 Happy Holi, {CustomerName}!\n\nMay your life be filled with vibrant colors! 🌈\n\nAfter the celebrations, visit {ShopName} for a refreshing cleanup & new look!\n\nBest wishes,\n{OwnerName} 🙏`,
  },
  {
    name: "🏏 Independence Day",
    message: `🇮🇳 Happy Independence Day, {CustomerName}!\n\nJai Hind! 🫡 Celebrate freedom with a fresh style.\n\nVisit {ShopName} today for a special festive look!\n\nRegards,\n{OwnerName} 🙏`,
  },
  {
    name: "🌟 Navratri Greeting",
    message: `🌟 Happy Navratri, {CustomerName}!\n\nनवरात्रीच्या हार्दिक शुभेच्छा! 🙏\n\nDandiya nights are here — get a dashing look at {ShopName}!\n\nBest wishes,\n{OwnerName} ✨`,
  },
  {
    name: "🎄 Christmas Greeting",
    message: `🎄 Merry Christmas, {CustomerName}!\n\nWishing you a joyful holiday season! 🎅\n\nLook festive-ready with a fresh grooming session at {ShopName}.\n\nHappy holidays,\n{OwnerName} 🎁`,
  },
  {
    name: "🙏 Makar Sankranti",
    message: `🙏 Happy Makar Sankranti, {CustomerName}!\n\nतिळगुळ घ्या, गोड गोड बोला! 🌾\n\nसणासाठी smart look हवा असेल तर {ShopName} ला या!\n\n{OwnerName} 🪁`,
  },
  {
    name: "💈 Regular Reminder",
    message: `नमस्कार {CustomerName},\n\nतुमची last visit {LastVisit} ला होती.\n\nआता fresh look साठी {ShopName} ला भेट द्या! 💈\n\nCall or reply to book.\n\n{OwnerName} 🙏`,
  },
];

export function MessageTemplateManager() {
  const navigate = useNavigate();
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  } = useMessageTemplates();
  const { profile } = useProfile();
  const { toast } = useToast();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");

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

  const insertVariable = (variable: TemplateVariable) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = message;
      const insertion = `{${variable.key}}`;
      const newText = text.substring(0, start) + insertion + text.substring(end);
      setMessage(newText);
      // Reset cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertion.length, start + insertion.length);
      }, 0);
    } else {
      setMessage((m) => (m ? `${m} {${variable.key}}` : `{${variable.key}}`));
    }
  };

  const removeVariable = (variable: string) => {
    setMessage((m) => m.replace(variable, "").replace(/\s+/g, " ").trim());
  };

  const renderPreview = (text: string) => {
    let preview = text || "";
    TEMPLATE_VARIABLES.forEach((v) => {
      let value = v.example;
      // Use actual profile data if available
      if (v.key === "ShopName" && profile.businessName) {
        value = profile.businessName;
      } else if (v.key === "OwnerName" && profile.ownerName) {
        value = profile.ownerName;
      }
      preview = preview.split(`{${v.key}}`).join(value);
    });
    return preview;
  };

  const handlePreview = (templateMessage: string) => {
    setPreviewMessage(templateMessage);
    setPreviewOpen(true);
  };

  const usedVariables = Array.from(new Set(message.match(/{\w+}/g) || []));

  // Shared Preview Dialog component
  const PreviewDialog = () => (
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message Preview</DialogTitle>
        </DialogHeader>
        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm whitespace-pre-wrap">{renderPreview(previewMessage)}</p>
        </div>
        <div className="text-xs text-muted-foreground">
          <p className="font-app mb-1">Variables used:</p>
          <div className="flex flex-wrap gap-1">
            {TEMPLATE_VARIABLES.map((v) => (
              <span key={v.key} className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {`{${v.key}}`} → {v.key === "ShopName" && profile.businessName ? profile.businessName : v.key === "OwnerName" && profile.ownerName ? profile.ownerName : v.example}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Edit/Create View
  if (viewMode === "edit" || viewMode === "create") {
    return (
      <>
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

            <div className="bg-card rounded-xl border p-4 space-y-4">
              <label className="text-sm font-app">Message</label>
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi {CustomerName}, we'd love to see you again!"
                rows={6}
                className="resize-none"
              />

              {/* Insert Variables */}
              <div className="space-y-2">
                <p className="text-sm font-app text-muted-foreground">Click to insert variable:</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_VARIABLES.map((variable) => (
                    <button
                      key={variable.key}
                      type="button"
                      onClick={() => insertVariable(variable)}
                      className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3" />
                      {`{${variable.key}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Used variables with remove option */}
              {usedVariables.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-app text-muted-foreground">Used variables (click to remove):</p>
                  <div className="flex flex-wrap gap-2">
                    {usedVariables.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => removeVariable(v)}
                        className="text-xs px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex items-center gap-1.5"
                        title="Click to remove"
                      >
                        {v}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview button */}
              {message && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(message)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview Message
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 h-12 gap-2">
                <Check className="w-4 h-4" />
                {viewMode === "edit" ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
        
        <PreviewDialog />
      </>
    );
  }

  // List View
  return (
    <>
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
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handlePreview(template.message)}
                      className="px-0 h-auto text-xs text-primary mt-1 gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </Button>
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

        {/* Suggested Festival Templates */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-app font-semibold">Suggested Templates</h3>
          </div>
          <p className="text-xs text-muted-foreground">Tap to add festival greetings & reminders</p>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_TEMPLATES.filter(
              (s) => !templates.some((t) => t.name === s.name)
            ).map((suggestion) => (
              <button
                key={suggestion.name}
                onClick={() => {
                  addTemplate(suggestion.name, suggestion.message);
                  toast({ title: `"${suggestion.name}" added!` });
                }}
                className="text-left p-3 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-sm"
              >
                <span className="font-app line-clamp-1">{suggestion.name}</span>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{suggestion.message}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <PreviewDialog />
    </>
  );
}
