import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = 24, showText = true, className }: LogoProps) => {
  if (!showText) {
    return (
      <>
        <Image
          src="/logo.svg"
          alt="PersuAI logo"
          width={size}
          height={size}
          className={cn("block dark:hidden", className)}
        />
        <Image
          src="/logo-dark.svg"
          alt="PersuAI logo"
          width={size}
          height={size}
          className={cn("hidden dark:block", className)}
        />
      </>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.svg"
        alt="PersuAI logo"
        width={size}
        height={size}
        className="block dark:hidden"
      />
      <Image
        src="/logo-dark.svg"
        alt="PersuAI logo"
        width={size}
        height={size}
        className="hidden dark:block"
      />
      <span
        className="font-bold tracking-wider"
        style={{ fontSize: `${size * 0.67}px` }}
      >
        <span className="text-foreground">PERSU</span>
        <span className="text-muted-foreground">AI</span>
      </span>
    </div>
  );
};

export default Logo;
