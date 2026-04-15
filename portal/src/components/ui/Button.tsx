import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "navy";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary: "bg-va-navy text-white font-semibold hover:bg-va-navy-light active:opacity-90",
  secondary: "bg-va-surface border border-va-border text-va-text hover:bg-va-surface-2",
  danger: "bg-va-red text-white hover:opacity-90",
  ghost: "bg-transparent text-va-text-muted hover:text-va-text hover:bg-va-surface-2",
  navy: "bg-va-navy text-white font-semibold hover:bg-va-navy-light",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
};

export default function Button({ variant = "primary", size = "md", loading = false, disabled = false, className, children, ...props }: ButtonProps) {
  return (
    <button {...props} disabled={disabled || loading} className={cn(
      "inline-flex items-center justify-center font-body font-medium rounded-card transition-all duration-300",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      variantStyles[variant], sizeStyles[size], className,
    )}>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
