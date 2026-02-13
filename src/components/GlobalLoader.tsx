import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export function GlobalLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  if (!isFetching && !isMutating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <div className="h-1 w-full bg-primary/20 overflow-hidden">
        <div
          className="h-full w-1/3 rounded-full bg-primary"
          style={{
            animation: "progressSlide 1.2s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
