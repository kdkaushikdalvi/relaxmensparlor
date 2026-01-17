import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReminderHistory } from "@/components/ReminderHistory";

const ReminderHistoryPage = () => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[hsl(var(--header-bg))] border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-full bg-primary/20 hover:bg-primary/20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-app text-[hsl(var(--header-foreground))]">
              Reminder History
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="glass rounded-2xl p-4 border border-primary/20 shadow-lg">
          <ReminderHistory />
        </div>
      </div>
    </div>
  );
};

export default ReminderHistoryPage;
