import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge Component
 * =====================================
 * Standardized badge styling for all badge/tag usages across the site.
 *
 * Variants:
 * - default: Primary purple badge (shadcn default)
 * - secondary: Muted/neutral badge
 * - outline: Bordered, transparent background
 * - destructive: Error/danger states
 * - success: Success/positive states (green)
 * - warning: Warning states (amber)
 * - info: Informational states (blue)
 *
 * Color variants for thematic badges:
 * - primary: Cyan accent (brand primary)
 * - purple: Purple/violet accent (accent tertiary)
 * - cyan: Cyan accent (same as primary)
 * - pink: Pink/magenta accent
 *
 * Size variants:
 * - sm: Small badges for compact areas
 * - default: Standard size
 * - lg: Larger badges for emphasis
 *
 * Shape variants:
 * - rounded: Default rounded corners (rounded-md)
 * - pill: Full rounded/pill shape
 */

const badgeVariants = cva(
  "inline-flex items-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg",
  {
    variants: {
      variant: {
        // Base variants (shadcn defaults + additions)
        default:
          "border-transparent bg-accent-tertiary text-white shadow-sm hover:bg-accent-tertiary/80",
        secondary:
          "border-transparent bg-glass-bg text-fg-light hover:bg-glass-bg/80",
        outline:
          "border border-glass-border bg-transparent text-fg hover:bg-glass-bg",
        destructive:
          "border-transparent bg-danger/20 text-danger-text shadow-sm",
        success:
          "border-transparent bg-success/20 text-success shadow-sm",
        warning:
          "border-transparent bg-warning/20 text-warning shadow-sm",
        info:
          "border-transparent bg-info/20 text-info shadow-sm",

        // Color variants for thematic badges
        primary:
          "border border-accent-primary/30 bg-accent-primary/20 text-accent-primary",
        purple:
          "border border-accent-tertiary/30 bg-accent-tertiary/20 text-accent-tertiary",
        cyan:
          "border border-accent-secondary/30 bg-accent-secondary/20 text-accent-secondary",
        pink:
          "border border-[rgb(236,72,153)]/30 bg-[rgb(236,72,153)]/20 text-[rgb(236,72,153)]",

        // Category/Tag variants for content
        category:
          "bg-accent-primary/20 text-accent-primary-light font-mono font-bold tracking-wide uppercase",
        tag:
          "border border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary",

        // Hero/CTA badge variant (yellow/warning style)
        hero:
          "border border-warning/30 bg-warning/15 text-warning font-medium",

        // CTA variants
        "cta-default":
          "border border-accent-tertiary/30 bg-accent-tertiary/15 text-[#c4b5fd] font-semibold uppercase tracking-wide",
        "cta-urgent":
          "border border-warning/30 bg-warning/15 text-[#fcd34d] font-semibold uppercase tracking-wide animate-pulse",
        "cta-success":
          "border border-success/30 bg-success/15 text-success font-semibold uppercase tracking-wide",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-sm",
      },
      shape: {
        rounded: "rounded-md",
        pill: "rounded-full",
        square: "rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "rounded",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, shape, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, shape }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
