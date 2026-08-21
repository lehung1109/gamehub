import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
      <div className="text-8xl animate-bounce">🔍</div>
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400">
          404 - Không tìm thấy trang
        </h1>
        <p className="text-lg text-muted-foreground">
          Oops! Trang này không tồn tại hoặc đã bị di chuyển.
        </p>
      </div>
      <Link
        href="/"
        className={cn(
          buttonVariants({ size: "lg" }),
          "rounded-full px-8 py-6 text-lg font-bold shadow-md hover:scale-105 transition-transform"
        )}
      >
        🏠 Về trang chủ (Home)
      </Link>
    </div>
  );
}
