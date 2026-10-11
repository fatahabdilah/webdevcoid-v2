import { LineIcon } from "./LineIcon";

type SlideButtonProps = {
  direction: "left" | "right";
  onClick: () => void;
  /** 40px instead of 48px, for buttons laid over a card (phones and tablets). */
  small?: boolean;
  className?: string;
};

export function SlideButton({ direction, onClick, small, className = "" }: SlideButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Sebelumnya" : "Berikutnya"}
      className={`flex ${small ? "size-10" : "size-12"} shrink-0 cursor-pointer items-center justify-center rounded-full bg-grey-00 text-white shadow-[inset_0_0_8px_0_rgba(255,255,255,0.8)] transition-shadow duration-[400ms] ease-framer hover:shadow-[inset_0_0_16px_0_#fff] ${className}`}
    >
      <LineIcon name={direction === "left" ? "arrow-left" : "arrow-right"} size={small ? 12 : 14} />
    </button>
  );
}
