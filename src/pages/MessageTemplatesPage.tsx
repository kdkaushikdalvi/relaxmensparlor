import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageTemplateManager } from "@/components/MessageTemplateManager";
import { useEffect } from "react";

const MessageTemplatesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[hsl(var(--header-bg))] border-b">
        <div className="flex items-center justify-left px-6 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
             className="h-12 w-12 rounded-full bg-primary/20 hover:bg-primary/20"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Button>
          <h1 className="text-lg font-app text-white ml-6">Message Templates</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <MessageTemplateManager />
      </div>
    </div>
  );
};

export default MessageTemplatesPage;
