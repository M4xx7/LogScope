
type SpinnerProps = {
    colorClass?: string;
    layout?: "vertical" | "horizontal";
    className?: string;
};


export function Spinner({
    colorClass = "border-t-white",
    layout = "vertical",
    className = "",
}: SpinnerProps) {
    const isVertical = layout === "vertical";

    return (
        <div
            className={`flex items-center justify-center ${
                isVertical ? "flex-col gap-3" : "flex-row gap-2.5"
            } ${className}`}
            role="status"
            aria-live="polite"
        >
            <div
                className={`w-8 h-8 border-4 border-gray-600/40 ${colorClass} rounded-full animate-spin shrink-0`}
            />
        </div>
    );
}