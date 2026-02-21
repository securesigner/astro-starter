import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Spinner Component
 *
 * An animated loading spinner with cyber theme styling.
 * Uses accent-cyan color by default for consistency with the design system.
 *
 * Sizes:
 * - xs: 12px (inline text)
 * - sm: 16px (buttons)
 * - default: 24px (general use)
 * - lg: 32px (section loading)
 * - xl: 48px (page loading)
 *
 * @example
 * // Basic usage
 * <Spinner />
 *
 * // In a button
 * <Button disabled>
 *   <Spinner size="sm" />
 *   Loading...
 * </Button>
 *
 * // Full page loading
 * <div className="flex items-center justify-center min-h-screen">
 *   <Spinner size="xl" />
 * </div>
 */

const spinnerVariants = cva(
  "animate-spin text-accent-primary",
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-accent-primary",
        muted: "text-fg-muted",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  /** Screen reader label */
  label?: string
}

/**
 * Spinner loading indicator
 */
const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, variant, label = "Loading", ...props }, ref) => {
    return (
      <svg
        ref={ref}
        className={cn(spinnerVariants({ size, variant, className }))}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label={label}
        role="status"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )
  }
)
Spinner.displayName = "Spinner"

/**
 * LoadingDots - Three animated dots for inline loading indication
 */
const LoadingDots = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    label?: string
  }
>(({ className, label = "Loading", ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("inline-flex items-center gap-1", className)}
      role="status"
      aria-label={label}
      {...props}
    >
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
      <span className="sr-only">{label}</span>
    </span>
  )
})
LoadingDots.displayName = "LoadingDots"

/**
 * SpinnerOverlay - Full container spinner with optional backdrop
 */
const SpinnerOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spinnerSize?: VariantProps<typeof spinnerVariants>["size"]
    message?: string
  }
>(({ className, spinnerSize = "lg", message, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center",
        "bg-bg/80 backdrop-blur-sm",
        "z-50",
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      <Spinner size={spinnerSize} />
      {message && (
        <p className="mt-4 text-sm text-fg-muted animate-pulse">{message}</p>
      )}
    </div>
  )
})
SpinnerOverlay.displayName = "SpinnerOverlay"

export { Spinner, LoadingDots, SpinnerOverlay, spinnerVariants }
