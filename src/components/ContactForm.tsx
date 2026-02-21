/**
 * ContactForm React Component (Astro)
 * ====================================
 * Contact form with validation, loading states, and Formspree integration.
 *
 * Features:
 * - Name, email, message fields (required)
 * - Optional service interest dropdown
 * - Client-side validation with real-time feedback
 * - Loading state during submission
 * - Success/error feedback messages
 * - Honeypot spam protection (_gotcha field)
 * - UTM field population from URL parameters
 * - Light theme styling with emerald accents
 * - Fully accessible with ARIA attributes
 *
 * Usage in .astro files:
 *   import ContactForm from '@/components/ContactForm';
 *   <ContactForm client:load />
 *   <ContactForm client:load formAction="https://formspree.io/f/OTHER_ID" redirectUrl="/success-newsletter/" />
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Service options for dropdown
// CUSTOMIZE: Update these to match your service offerings
const SERVICE_OPTIONS = [
  { value: "", label: "Select a service (optional)" },
  { value: "web-design", label: "Web Design" },
  { value: "consulting", label: "Consulting" },
  { value: "ongoing-support", label: "Ongoing Support" },
  { value: "other", label: "Something Else" },
] as const;

// Validation rules
const VALIDATION = {
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  message: {
    minLength: 10,
    maxLength: 2000,
  },
};

interface FormData {
  name: string;
  email: string;
  service: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface TouchedFields {
  name: boolean;
  email: boolean;
  message: boolean;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

interface ContactFormProps {
  /** Formspree form endpoint URL */
  formAction?: string;
  /** Redirect URL after successful submission (defaults to "/success/") */
  redirectUrl?: string;
  /** Additional CSS classes */
  className?: string;
}

export default function ContactForm({
  // CUSTOMIZE: Replace YOUR_FORM_ID with your Formspree form ID
  formAction = "https://formspree.io/f/YOUR_FORM_ID",
  redirectUrl = "/success/",
  className,
}: ContactFormProps) {
  // Stable ID prefix for element IDs and ARIA attributes
  const formId = "contact";

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    service: "",
    message: "",
  });

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    email: false,
    message: false,
  });

  // Submission state
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // UTM fields (populated from URL on mount)
  const [utmFields, setUtmFields] = useState({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // ARIA live announcement state
  const [errorAnnouncement, setErrorAnnouncement] = useState<string>("");

  // Character counter announcement state
  const [charCountAnnouncement, setCharCountAnnouncement] = useState<string>("");
  const lastAnnouncedThreshold = useRef<string | null>(null);

  // Populate UTM fields from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setUtmFields({
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        utm_term: params.get("utm_term") || "",
        utm_content: params.get("utm_content") || "",
      });
    }
  }, []);

  // Character counter state calculations
  const charCount = formData.message.length;
  const maxChars = VALIDATION.message.maxLength;
  const charPercent = (charCount / maxChars) * 100;
  const isWarning = charPercent >= 90 && charPercent < 100;
  const isError = charPercent >= 100;

  // Announce character count thresholds to screen readers
  useEffect(() => {
    let threshold: string | null = null;

    if (charPercent >= 100) {
      threshold = "exceeded";
    } else if (charPercent >= 95) {
      threshold = "95";
    } else if (charPercent >= 90) {
      threshold = "90";
    }

    // Only announce if we've crossed a new threshold
    if (threshold && threshold !== lastAnnouncedThreshold.current) {
      if (threshold === "exceeded") {
        setCharCountAnnouncement(
          `Character limit exceeded. You have used ${charCount} of ${maxChars} characters. Please shorten your message.`
        );
      } else {
        setCharCountAnnouncement(
          `Approaching character limit. ${charCount} of ${maxChars} characters used.`
        );
      }
      lastAnnouncedThreshold.current = threshold;
    }

    // Clear threshold tracking when user reduces character count below 90%
    if (charPercent < 90) {
      lastAnnouncedThreshold.current = null;
    }
  }, [charCount, charPercent, maxChars]);

  // Validate a single field
  const validateField = useCallback(
    (field: keyof FormErrors, value: string): string | undefined => {
      switch (field) {
        case "name":
          if (!value.trim()) return "Name is required";
          if (value.length < VALIDATION.name.minLength)
            return `Name must be at least ${VALIDATION.name.minLength} characters`;
          if (value.length > VALIDATION.name.maxLength)
            return `Name must be less than ${VALIDATION.name.maxLength} characters`;
          if (!VALIDATION.name.pattern.test(value))
            return "Please enter a valid name";
          return undefined;

        case "email":
          if (!value.trim()) return "Email is required";
          if (!VALIDATION.email.pattern.test(value))
            return "Please enter a valid email address";
          return undefined;

        case "message":
          if (!value.trim()) return "Message is required";
          if (value.length < VALIDATION.message.minLength)
            return `Message must be at least ${VALIDATION.message.minLength} characters`;
          if (value.length > VALIDATION.message.maxLength)
            return `Message must be less than ${VALIDATION.message.maxLength} characters`;
          return undefined;

        default:
          return undefined;
      }
    },
    []
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      message: validateField("message", formData.message),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  }, [formData, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error on change if field was touched
      if (touched[name as keyof TouchedFields]) {
        const error = validateField(name as keyof FormErrors, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  // Handle field blur (mark as touched and validate)
  const handleBlur = useCallback(
    (
      e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name as keyof FormErrors, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Mark all fields as touched
      setTouched({ name: true, email: true, message: true });

      // Validate form
      if (!validateForm()) {
        // Count and announce errors
        const newErrors: FormErrors = {
          name: validateField("name", formData.name),
          email: validateField("email", formData.email),
          message: validateField("message", formData.message),
        };
        const errorCount = Object.values(newErrors).filter(Boolean).length;
        const announcement = errorCount === 1
          ? "There is 1 error in the form. Please correct it before submitting."
          : `There are ${errorCount} errors in the form. Please correct them before submitting.`;
        setErrorAnnouncement(announcement);

        // Focus error summary for keyboard users
        setTimeout(() => {
          errorSummaryRef.current?.focus();
        }, 100);
        return;
      }

      // Clear any previous error announcement
      setErrorAnnouncement("");

      setStatus("submitting");
      setErrorMessage("");

      try {
        // Build JSON payload for Formspree
        const payload: Record<string, string> = {
          name: formData.name,
          email: formData.email,
          service: formData.service,
          message: formData.message,
        };

        // Add UTM fields
        Object.entries(utmFields).forEach(([key, value]) => {
          if (value) payload[key] = value;
        });

        // Submit to Formspree
        const response = await fetch(formAction, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setStatus("success");
          toast.success("Got it!", {
            description: "We'll be in touch within a day or two.",
          });
          // Redirect after short delay to show success message
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1500);
        } else {
          throw new Error("Form submission failed");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          "Something went wrong. Please try again or email us directly."
        );
        toast.error("Failed to send message", {
          description: "Please try again or email us directly.",
        });
        console.error("Form submission error:", error);
      }
    },
    [formData, formAction, redirectUrl, utmFields, validateForm]
  );

  // Check if field should show error
  const showError = (field: keyof FormErrors): boolean => {
    return touched[field] && !!errors[field];
  };

  // Get aria-invalid state
  const ariaInvalid = (field: keyof FormErrors): boolean | undefined => {
    return touched[field] ? !!errors[field] : undefined;
  };

  return (
    <form
      ref={formRef}
      method="POST"
      action={formAction}
      onSubmit={handleSubmit}
      className={cn(
        "relative rounded-2xl p-6 md:p-8",
        "bg-white dark:bg-gray-900",
        "border border-gray-200 dark:border-gray-800",
        "shadow-sm",
        className
      )}
      aria-label="Contact form"
    >
      {/* Formspree honeypot field for spam prevention */}
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      {/* Screen reader announcements - always present but content changes */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {errorAnnouncement}
      </div>

      {/* Character counter screen reader announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {charCountAnnouncement}
      </div>

      {/* Error summary - shown when form has validation errors after submit attempt */}
      {Object.values(errors).some(Boolean) && touched.name && touched.email && touched.message && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby={`${formId}-error-summary-heading`}
          className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-4 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <h2
            id={`${formId}-error-summary-heading`}
            className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2"
          >
            Please correct the following errors:
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-600 dark:text-red-400">
            {errors.name && (
              <li>
                <a href={`#${formId}-name`} className="underline hover:text-red-800 dark:hover:text-red-300 focus:text-red-800 dark:focus:text-red-300">
                  Name: {errors.name}
                </a>
              </li>
            )}
            {errors.email && (
              <li>
                <a href={`#${formId}-email`} className="underline hover:text-red-800 dark:hover:text-red-300 focus:text-red-800 dark:focus:text-red-300">
                  Email: {errors.email}
                </a>
              </li>
            )}
            {errors.message && (
              <li>
                <a href={`#${formId}-message`} className="underline hover:text-red-800 dark:hover:text-red-300 focus:text-red-800 dark:focus:text-red-300">
                  Message: {errors.message}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Form fields grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Name Field */}
        <div className="space-y-2">
          <label
            htmlFor={`${formId}-name`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Name
            <span className="ml-1 text-emerald-600 dark:text-emerald-400" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </label>
          <Input
            ref={nameInputRef}
            type="text"
            name="name"
            id={`${formId}-name`}
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            aria-required="true"
            minLength={VALIDATION.name.minLength}
            maxLength={VALIDATION.name.maxLength}
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={ariaInvalid("name")}
            aria-describedby={
              showError("name")
                ? `${formId}-name-hint ${formId}-name-error`
                : `${formId}-name-hint`
            }
            className={cn(
              "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500",
              "focus:border-emerald-500 focus:ring-emerald-500",
              showError("name") && "border-red-500 focus:border-red-500"
            )}
            disabled={status === "submitting"}
          />
          <p
            id={`${formId}-name-hint`}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            First name is fine — we keep things friendly.
          </p>
          {showError("name") && (
            <p
              id={`${formId}-name-error`}
              className="text-sm text-red-600 dark:text-red-400"
              role="alert"
              aria-live="assertive"
            >
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor={`${formId}-email`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
            <span className="ml-1 text-emerald-600 dark:text-emerald-400" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </label>
          <Input
            type="email"
            name="email"
            id={`${formId}-email`}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            aria-required="true"
            autoComplete="email"
            placeholder="you@example.org"
            aria-invalid={ariaInvalid("email")}
            aria-describedby={
              showError("email")
                ? `${formId}-email-hint ${formId}-email-error`
                : `${formId}-email-hint`
            }
            className={cn(
              "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500",
              "focus:border-emerald-500 focus:ring-emerald-500",
              showError("email") && "border-red-500 focus:border-red-500"
            )}
            disabled={status === "submitting"}
          />
          <p
            id={`${formId}-email-hint`}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            We'll respond within 24 hours — no spam, ever.
          </p>
          {showError("email") && (
            <p
              id={`${formId}-email-error`}
              className="text-sm text-red-600 dark:text-red-400"
              role="alert"
              aria-live="assertive"
            >
              {errors.email}
            </p>
          )}
        </div>

        {/* Service Interest Dropdown (Optional) - Full Width */}
        <div className="space-y-2 md:col-span-2">
          <label
            id={`${formId}-service-label`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            How can we help?
            <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs">(optional)</span>
          </label>
          <Select
            name="service"
            value={formData.service}
            onValueChange={(value) => {
              setFormData((prev) => ({ ...prev, service: value }));
            }}
            disabled={status === "submitting"}
          >
            <SelectTrigger
              id={`${formId}-service`}
              aria-labelledby={`${formId}-service-label`}
              aria-describedby={`${formId}-service-hint`}
            >
              <SelectValue placeholder="Select a service (optional)" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_OPTIONS.filter((opt) => opt.value !== "").map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p
            id={`${formId}-service-hint`}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            Pick one if you know, or leave it blank—we'll figure it out.
          </p>
        </div>

        {/* Message Field - Full Width */}
        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor={`${formId}-message`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Message
            <span className="ml-1 text-emerald-600 dark:text-emerald-400" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </label>
          <textarea
            name="message"
            id={`${formId}-message`}
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            aria-required="true"
            minLength={VALIDATION.message.minLength}
            maxLength={VALIDATION.message.maxLength}
            rows={4}
            placeholder="Briefly describe your situation."
            aria-invalid={ariaInvalid("message")}
            aria-describedby={
              showError("message")
                ? `${formId}-message-hint ${formId}-message-error`
                : `${formId}-message-hint`
            }
            className={cn(
              "flex w-full rounded-md border px-3 py-2 text-base shadow-sm transition-colors",
              "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500",
              "focus:outline-none focus:ring-1 focus:border-emerald-500 focus:ring-emerald-500",
              "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "min-h-[120px] resize-y",
              showError("message") && "border-red-500 focus:border-red-500"
            )}
            disabled={status === "submitting"}
          />
          <div className="flex justify-between items-start gap-2">
            <p
              id={`${formId}-message-hint`}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              No need to have it all figured out. Just tell us what's broken.
            </p>
            <span
              className={cn(
                "text-xs whitespace-nowrap transition-colors",
                isError && "text-red-600 dark:text-red-400 font-medium",
                isWarning && "text-amber-600 dark:text-amber-400",
                !isError && !isWarning && "text-gray-500 dark:text-gray-500"
              )}
              aria-label={`${charCount} of ${maxChars} characters used${isError ? ", limit exceeded" : isWarning ? ", approaching limit" : ""}`}
            >
              {charCount} / {maxChars} characters
            </span>
          </div>
          {showError("message") && (
            <p
              id={`${formId}-message-error`}
              className="text-sm text-red-600 dark:text-red-400"
              role="alert"
              aria-live="assertive"
            >
              {errors.message}
            </p>
          )}
        </div>
      </div>

      {/* Success Message */}
      {status === "success" && (
        <div
          className="mt-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-emerald-700 dark:text-emerald-400 font-medium">
            ✓ Got it! We'll be in touch soon. Redirecting...
          </p>
        </div>
      )}

      {/* Error Message */}
      {status === "error" && (
        <div
          className="mt-6 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-4 text-center"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-red-700 dark:text-red-400 font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-8 flex flex-col items-center">
        <Button
          type="submit"
          disabled={status === "submitting"}
          className={cn(
            "px-8 py-3 text-base font-semibold min-h-11",
            "bg-emerald-700 hover:bg-emerald-800",
            "text-white shadow-sm",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {status === "submitting" ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" variant="white" label="Sending message" />
              Sending...
            </span>
          ) : (
            "Send Message"
          )}
        </Button>
        <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          We respond within 24 hours — no templates, just a real conversation.
        </p>
      </div>
    </form>
  );
}
