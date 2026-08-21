import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  href = "/",
  label = "Về trang chủ",
  className,
}: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "rounded-2xl font-bold border-2 shadow-sm hover:scale-105 active:scale-95 transition-all text-base min-h-12 px-4 inline-flex items-center gap-2",
        className
      )}
    >
      <ArrowLeft className="w-5 h-5 text-emerald-700 dark:text-emerald-400 stroke-[3]" />
      <span>{label}</span>
    </Link>
  );
}
