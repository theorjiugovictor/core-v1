import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="CORE Logo"
        width={32}
        height={32}
        className="object-contain" // Ensures aspect ratio is maintained
      />
      <span className="font-headline text-2xl font-bold tracking-tighter text-primary">CORE</span>
    </div>
  );
}
