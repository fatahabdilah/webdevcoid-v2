import { LineIcon } from "./LineIcon";

export function SlideButton({ direction, onClick, className = "" }: { direction: "left" | "right"; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Sebelumnya" : "Berikutnya"}
      className={`flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-grey-00 text-white shadow-[inset_0_0_8px_0_rgba(255,255,255,0.8)] transition-shadow duration-[400ms] ease-[cubic-bezier(0.44,0,0.56,1)] hover:shadow-[inset_0_0_16px_0_#fff] ${className}`}
    >
      <LineIcon name={direction === "left" ? "arrow-left" : "arrow-right"} size={14} />
    </button>
  );
}
