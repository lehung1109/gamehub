import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col max-w-5xl lg:max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1800px] w-full mx-auto p-4 sm:p-6 md:p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
