import React, { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl bg-[#111827]/90 border border-[#1E293B] shadow-xl backdrop-blur-md transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pb-3", className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-bold tracking-tight text-[#F9FAFB]", className)} {...props}>
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-[#94A3B8] mt-1", className)} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-3", className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

