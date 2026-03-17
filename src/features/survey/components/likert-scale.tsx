import { cn } from "@/lib/utils";

export const LIKERT_LABELS: Record<string, string> = {
  "1": "Strongly Disagree",
  "2": "Disagree",
  "3": "Somewhat Disagree",
  "4": "Neutral",
  "5": "Somewhat Agree",
  "6": "Agree",
  "7": "Strongly Agree",
};

interface LikertScaleProps {
  value: string;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

const LikertScale = ({
  value,
  onChange,
  min = 1,
  max = 7,
  minLabel = "Strongly Disagree",
  maxLabel = "Strongly Agree",
}: LikertScaleProps) => {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="py-2 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 w-16 text-right">
          {minLabel}
        </span>
        <div className="flex flex-1 justify-between lg:px-6">
          {steps.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChange(String(step))}
              className={cn(
                "size-7 sm:size-9 rounded-full border-2 text-xs sm:text-sm font-medium transition-colors",
                value === String(step)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent border-input",
              )}
            >
              {step}
            </button>
          ))}
        </div>
        <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 w-16 text-left">
          {maxLabel}
        </span>
      </div>
    </div>
  );
};

export default LikertScale;
