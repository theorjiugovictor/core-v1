import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export function Logo({ className, showText = true, size = 32 }: LogoProps) {
  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <Image
        src="/logo.svg"
        alt="CORE Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="font-bold text-xl tracking-tight text-foreground">CORE</span>
      )}
    </div>
  );
}
