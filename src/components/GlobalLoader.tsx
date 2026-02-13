import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export function GlobalLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  if (!isFetching && !isMutating) return null;

  return (
    <>
      {/* Top progress bar – always visible during any request */}
      <div className="fixed top-0 left-0 right-0 z-[9999]">
        <div className="h-1 w-full bg-primary/20 overflow-hidden">
          <div
            className="h-full w-1/3 rounded-full bg-primary"
            style={{ animation: "progressSlide 1.2s ease-in-out infinite" }}
          />
        </div>
      </div>

      {/* Full-screen overlay – only for mutations (save/delete) */}
      {isMutating > 0 && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/90 shadow-xl border border-border/40">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Saving…</p>
          </div>
        </div>
      )}
    </>
  );
}
