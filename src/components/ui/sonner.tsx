/**
 * Sonner Toast Component
 * =============================================
 * Toast notification wrapper using Sonner library with cyber theme styling.
 *
 * Features:
 * - Glass morphism styling with backdrop blur
 * - Cyber-themed colors matching design system
 * - Success, error, warning, and info variants
 * - Dark theme optimized (always dark in this project)
 * - Accessible with proper ARIA attributes (via Sonner)
 *
 * Usage in Astro Layout:
 *   import { Toaster } from '@/components/ui/sonner';
 *   <Toaster client:load />
 *
 * Usage in React components:
 *   import { toast } from 'sonner';
 *   toast.success('Message sent!');
 *   toast.error('Something went wrong');
 *   toast('Default notification');
 */

import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toaster — Global toast container
 *
 * Place once in your Layout component. All toasts will render here.
 * Position defaults to bottom-right for non-intrusive notifications.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          // Base toast styling - glass morphism with cyber accents
          toast:
            "group toast " +
            "!bg-glass-bg !backdrop-blur-md " +
            "!border !border-glass-border " +
            "!text-fg !shadow-lg !shadow-black/20 " +
            "!rounded-lg",

          // Title styling
          title: "!text-fg-bold !font-medium",

          // Description styling
          description: "!text-fg-muted",

          // Action button - primary accent
          actionButton:
            "!bg-accent-primary !text-bg !font-medium " +
            "!rounded-md !px-3 !py-1.5 " +
            "hover:!bg-accent-primary-alt " +
            "focus-visible:!ring-2 focus-visible:!ring-accent-primary focus-visible:!ring-offset-2 focus-visible:!ring-offset-bg",

          // Cancel button - muted style
          cancelButton:
            "!bg-glass-bg !text-fg-muted !border !border-glass-border " +
            "!rounded-md !px-3 !py-1.5 " +
            "hover:!text-fg hover:!border-fg-muted/50 " +
            "focus-visible:!ring-2 focus-visible:!ring-fg-muted focus-visible:!ring-offset-2 focus-visible:!ring-offset-bg",

          // Close button
          closeButton:
            "!bg-transparent !text-fg-muted " +
            "hover:!text-fg hover:!bg-glass-border/50 " +
            "!rounded-md !transition-colors",

          // Success variant - green accent
          success:
            "!border-success/50 " +
            "!shadow-success/10",

          // Error variant - red accent
          error:
            "!border-danger/50 " +
            "!shadow-danger/10",

          // Warning variant - yellow accent
          warning:
            "!border-warning/50 " +
            "!shadow-warning/10",

          // Info variant - blue accent
          info:
            "!border-info/50 " +
            "!shadow-info/10",

          // Loading state
          loading: "!border-accent-primary/30",
        },
      }}
      // Visual styling
      gap={12}
      closeButton
      richColors={false}
      // Timing
      duration={4000}
      {...props}
    />
  );
};

export { Toaster, toast };
