/**
 * Animated Counter React Component
 * ================================================================
 * Animated number counter that counts up from 0 to a target value.
 *
 * Features:
 * - Count up animation from 0 to target value
 * - Configurable duration and easing
 * - Optional prefix/suffix (e.g., "$", "%", "+")
 * - Triggers on viewport entry (Intersection Observer)
 * - Respects prefers-reduced-motion (shows final value immediately)
 * - Only animates once per component lifecycle
 * - Supports decimal numbers with configurable precision
 * - Locale-aware number formatting
 *
 * Usage in .astro files:
 *   import AnimatedCounter from '@/components/AnimatedCounter';
 *   <AnimatedCounter client:visible value={1500} />
 *
 * With options:
 *   <AnimatedCounter
 *     client:visible
 *     value={99.5}
 *     prefix="$"
 *     suffix="M"
 *     duration={2000}
 *     decimals={1}
 *     easing="easeOut"
 *   />
 *
 * For stats/metrics:
 *   <AnimatedCounter client:visible value={50} suffix="+" label="Happy Clients" />
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// Easing functions for natural animation feel
const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
} as const;

type EasingType = keyof typeof easingFunctions;

interface AnimatedCounterProps {
  /** Target value to count to */
  value: number;
  /** Starting value (default: 0) */
  startValue?: number;
  /** Animation duration in milliseconds (default: 2000) */
  duration?: number;
  /** Easing function name (default: 'easeOutCubic') */
  easing?: EasingType;
  /** Text to display before the number */
  prefix?: string;
  /** Text to display after the number */
  suffix?: string;
  /** Number of decimal places (default: 0) */
  decimals?: number;
  /** Use locale formatting for thousands separator (default: true) */
  useLocale?: boolean;
  /** Locale for number formatting (default: 'en-US') */
  locale?: string;
  /** Optional label displayed below the counter */
  label?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the number */
  numberClassName?: string;
  /** Additional CSS classes for the label */
  labelClassName?: string;
  /** Threshold for intersection observer (0-1, default: 0.3) */
  threshold?: number;
  /** Delay before starting animation in ms (default: 0) */
  delay?: number;
}

/**
 * AnimatedCounter — Counts up from startValue to value when visible
 */
export default function AnimatedCounter({
  value,
  startValue = 0,
  duration = 2000,
  easing = "easeOutCubic",
  prefix = "",
  suffix = "",
  decimals = 0,
  useLocale = true,
  locale = "en-US",
  label,
  className = "",
  numberClassName = "",
  labelClassName = "",
  threshold = 0.3,
  delay = 0,
}: AnimatedCounterProps) {
  // Current displayed value
  const [displayValue, setDisplayValue] = useState(startValue);
  // Track if animation has run
  const [hasAnimated, setHasAnimated] = useState(false);
  // Track if component is visible
  const [isVisible, setIsVisible] = useState(false);
  // Track reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  // Ref for the container element
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref for animation frame ID (used for cleanup)
  const animationRef = useRef<number | null>(null);
  // Ref for start time
  const startTimeRef = useRef<number | null>(null);
  // Ref to track if component is mounted (prevents state updates after unmount)
  const mountedRef = useRef(true);

  // Check for reduced motion preference
  useEffect(() => {
    // Check media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Also check for .reduce-motion class on html/body
    const hasReduceMotionClass =
      document.documentElement.classList.contains("reduce-motion") ||
      document.body.classList.contains("reduce-motion");

    if (hasReduceMotionClass) {
      setPrefersReducedMotion(true);
    }

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // If reduced motion is preferred, show final value immediately
  useEffect(() => {
    if (prefersReducedMotion && !hasAnimated) {
      setDisplayValue(value);
      setHasAnimated(true);
    }
  }, [prefersReducedMotion, value, hasAnimated]);

  // Set up Intersection Observer
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, hasAnimated]);

  // Animation function
  const animate = useCallback(() => {
    // Guard: Don't continue animation if component unmounted
    if (!mountedRef.current) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Apply easing
    const easingFn = easingFunctions[easing] || easingFunctions.easeOutCubic;
    const easedProgress = easingFn(progress);

    // Calculate current value
    const currentValue = startValue + (value - startValue) * easedProgress;

    // Only update state if component is still mounted
    if (mountedRef.current) {
      setDisplayValue(currentValue);
    }

    if (progress < 1 && mountedRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (mountedRef.current) {
      // Ensure we end exactly at the target value
      setDisplayValue(value);
      setHasAnimated(true);
    }
  }, [duration, easing, startValue, value]);

  // Start animation when visible
  useEffect(() => {
    if (isVisible && !hasAnimated && !prefersReducedMotion) {
      // Apply delay if specified
      const timeoutId = setTimeout(() => {
        startTimeRef.current = null;
        animationRef.current = requestAnimationFrame(animate);
      }, delay);

      return () => {
        clearTimeout(timeoutId);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isVisible, hasAnimated, prefersReducedMotion, animate, delay]);

  // Cleanup animation on unmount
  useEffect(() => {
    // Mark component as mounted
    mountedRef.current = true;

    return () => {
      // Mark component as unmounted to prevent state updates
      mountedRef.current = false;
      // Cancel any pending animation frame
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  // Format the number for display
  const formattedValue = useMemo(() => {
    const roundedValue = Number(displayValue.toFixed(decimals));

    if (useLocale) {
      return roundedValue.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }

    return roundedValue.toFixed(decimals);
  }, [displayValue, decimals, useLocale, locale]);

  return (
    <div
      ref={containerRef}
      className={`animated-counter text-center ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`counter-value text-4xl font-bold text-fg tabular-nums ${numberClassName}`}
      >
        {prefix && (
          <span className="counter-prefix text-accent-primary">{prefix}</span>
        )}
        <span className="counter-number">{formattedValue}</span>
        {suffix && (
          <span className="counter-suffix text-accent-primary">{suffix}</span>
        )}
      </div>
      {label && (
        <div
          className={`counter-label mt-2 text-sm font-medium text-fg-light ${labelClassName}`}
        >
          {label}
        </div>
      )}
    </div>
  );
}

/**
 * Utility component for displaying multiple counters in a row
 */
interface CounterGridProps {
  counters: Omit<AnimatedCounterProps, "className">[];
  columns?: 2 | 3 | 4;
  className?: string;
  stagger?: number; // Delay between each counter animation in ms
}

export function CounterGrid({
  counters,
  columns = 3,
  className = "",
  stagger = 100,
}: CounterGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={`counter-grid grid gap-8 ${gridCols[columns]} ${className}`}>
      {counters.map((counter, index) => (
        <AnimatedCounter
          key={counter.label || index}
          {...counter}
          delay={(stagger * index) + (counter.delay || 0)}
        />
      ))}
    </div>
  );
}
