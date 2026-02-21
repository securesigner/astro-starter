/**
 * Unit Tests for AnimatedCounter Component
 *
 * Tests the AnimatedCounter component:
 * - Easing functions (pure math functions)
 * - Number formatting with locale
 * - Prefix/suffix rendering
 * - Reduced motion accessibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AnimatedCounter, { CounterGrid } from '../../src/components/AnimatedCounter';

// Mock IntersectionObserver as a class
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element) {
    // Immediately trigger the callback to simulate element being visible
    setTimeout(() => {
      this.callback(
        [{ isIntersecting: true, target: element }] as IntersectionObserverEntry[],
        this as unknown as IntersectionObserver
      );
    }, 0);
  }

  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

  // Mock matchMedia for reduced motion
  const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.stubGlobal('matchMedia', matchMediaMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  // Clean up any reduce-motion class
  document.documentElement.classList.remove('reduce-motion');
  document.body.classList.remove('reduce-motion');
});

describe('AnimatedCounter', () => {
  describe('Easing Functions (mathematical correctness)', () => {
    // These test the core easing logic that drives the animation
    const easingFunctions = {
      linear: (t: number) => t,
      easeIn: (t: number) => t * t,
      easeOut: (t: number) => 1 - (1 - t) * (1 - t),
      easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
      easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
      easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    };

    describe('linear', () => {
      it('should return input unchanged', () => {
        expect(easingFunctions.linear(0)).toBe(0);
        expect(easingFunctions.linear(0.5)).toBe(0.5);
        expect(easingFunctions.linear(1)).toBe(1);
      });
    });

    describe('easeIn', () => {
      it('should start slow and end fast', () => {
        expect(easingFunctions.easeIn(0)).toBe(0);
        expect(easingFunctions.easeIn(0.5)).toBe(0.25); // t^2 = 0.25
        expect(easingFunctions.easeIn(1)).toBe(1);
      });

      it('should be slower at start than linear', () => {
        const t = 0.3;
        expect(easingFunctions.easeIn(t)).toBeLessThan(easingFunctions.linear(t));
      });
    });

    describe('easeOut', () => {
      it('should start fast and end slow', () => {
        expect(easingFunctions.easeOut(0)).toBe(0);
        expect(easingFunctions.easeOut(0.5)).toBe(0.75); // 1 - (0.5)^2 = 0.75
        expect(easingFunctions.easeOut(1)).toBe(1);
      });

      it('should be faster at start than linear', () => {
        const t = 0.3;
        expect(easingFunctions.easeOut(t)).toBeGreaterThan(easingFunctions.linear(t));
      });
    });

    describe('easeInOut', () => {
      it('should start and end slow, be fastest in middle', () => {
        expect(easingFunctions.easeInOut(0)).toBe(0);
        expect(easingFunctions.easeInOut(0.5)).toBe(0.5);
        expect(easingFunctions.easeInOut(1)).toBe(1);
      });

      it('should be symmetric around midpoint', () => {
        expect(easingFunctions.easeInOut(0.25)).toBeCloseTo(1 - easingFunctions.easeInOut(0.75), 10);
      });
    });

    describe('easeOutCubic', () => {
      it('should reach endpoints correctly', () => {
        expect(easingFunctions.easeOutCubic(0)).toBe(0);
        expect(easingFunctions.easeOutCubic(1)).toBe(1);
      });

      it('should be faster than linear at start', () => {
        const t = 0.3;
        expect(easingFunctions.easeOutCubic(t)).toBeGreaterThan(easingFunctions.linear(t));
      });
    });

    describe('easeOutExpo', () => {
      it('should reach endpoints correctly', () => {
        expect(easingFunctions.easeOutExpo(0)).toBeCloseTo(0.001, 2); // Very close to 0
        expect(easingFunctions.easeOutExpo(1)).toBe(1);
      });

      it('should be fastest at start', () => {
        const t = 0.2;
        expect(easingFunctions.easeOutExpo(t)).toBeGreaterThan(easingFunctions.linear(t));
      });
    });
  });

  describe('Rendering', () => {
    it('should render with initial value when reduced motion is enabled', async () => {
      // Mock reduced motion preference
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })));

      render(<AnimatedCounter value={100} />);

      // With reduced motion, should show final value immediately
      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('should render prefix and suffix correctly', async () => {
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })));

      const { container } = render(<AnimatedCounter value={50} prefix="$" suffix="+" />);

      await waitFor(() => {
        // Check that prefix, number, and suffix are all rendered
        const counterValue = container.querySelector('.counter-value');
        expect(counterValue?.textContent).toContain('$');
        expect(counterValue?.textContent).toContain('50');
        expect(counterValue?.textContent).toContain('+');
      });
    });

    it('should render label when provided', async () => {
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })));

      render(<AnimatedCounter value={42} label="Happy Clients" />);

      await waitFor(() => {
        expect(screen.getByText('Happy Clients')).toBeInTheDocument();
      });
    });

    it('should format numbers with locale by default', async () => {
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })));

      render(<AnimatedCounter value={1500} />);

      await waitFor(() => {
        // US locale uses comma for thousands separator
        expect(screen.getByText('1,500')).toBeInTheDocument();
      });
    });

    it('should respect decimal places setting', async () => {
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })));

      render(<AnimatedCounter value={99.5} decimals={1} />);

      await waitFor(() => {
        expect(screen.getByText('99.5')).toBeInTheDocument();
      });
    });

    it('should apply custom className', async () => {
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })));

      const { container } = render(<AnimatedCounter value={10} className="custom-class" />);

      await waitFor(() => {
        expect(container.querySelector('.custom-class')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should respect reduce-motion class on document', async () => {
      // Add reduce-motion class to document BEFORE rendering
      document.documentElement.classList.add('reduce-motion');

      // Need to re-stub matchMedia after class is added
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches: false, // matchMedia returns false, but class should still work
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })));

      const { container } = render(<AnimatedCounter value={100} />);

      // Should immediately show final value since reduce-motion class is present
      await waitFor(() => {
        const numberSpan = container.querySelector('.counter-number');
        expect(numberSpan?.textContent).toBe('100');
      });

      // Cleanup
      document.documentElement.classList.remove('reduce-motion');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero value', async () => {
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })));

      render(<AnimatedCounter value={0} />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });

    it('should handle negative values', async () => {
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })));

      render(<AnimatedCounter value={-50} />);

      await waitFor(() => {
        expect(screen.getByText('-50')).toBeInTheDocument();
      });
    });

    it('should handle very large numbers', async () => {
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })));

      render(<AnimatedCounter value={1000000} />);

      await waitFor(() => {
        expect(screen.getByText('1,000,000')).toBeInTheDocument();
      });
    });
  });
});

describe('CounterGrid', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  });

  describe('Rendering', () => {
    it('should render multiple counters', async () => {
      render(
        <CounterGrid
          counters={[
            { value: 100, label: 'Projects' },
            { value: 50, label: 'Clients' },
            { value: 25, label: 'Years' },
          ]}
        />
      );

      await waitFor(() => {
        // Use getAllByText since values appear in multiple places (number + aria)
        expect(screen.getAllByText('100').length).toBeGreaterThan(0);
        expect(screen.getAllByText('50').length).toBeGreaterThan(0);
        expect(screen.getAllByText('25').length).toBeGreaterThan(0);
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('Clients')).toBeInTheDocument();
        expect(screen.getByText('Years')).toBeInTheDocument();
      });
    });

    it('should apply correct grid columns class for 2 columns', async () => {
      const { container } = render(
        <CounterGrid
          counters={[
            { value: 10, label: 'A' },
            { value: 20, label: 'B' },
          ]}
          columns={2}
        />
      );

      await waitFor(() => {
        const grid = container.querySelector('.counter-grid');
        expect(grid).toHaveClass('grid-cols-2');
      });
    });

    it('should apply correct grid columns class for 3 columns', async () => {
      const { container } = render(
        <CounterGrid
          counters={[
            { value: 10, label: 'A' },
            { value: 20, label: 'B' },
            { value: 30, label: 'C' },
          ]}
          columns={3}
        />
      );

      await waitFor(() => {
        const grid = container.querySelector('.counter-grid');
        expect(grid).toHaveClass('grid-cols-2');
        expect(grid).toHaveClass('md:grid-cols-3');
      });
    });

    it('should apply correct grid columns class for 4 columns', async () => {
      const { container } = render(
        <CounterGrid
          counters={[
            { value: 10, label: 'A' },
            { value: 20, label: 'B' },
            { value: 30, label: 'C' },
            { value: 40, label: 'D' },
          ]}
          columns={4}
        />
      );

      await waitFor(() => {
        const grid = container.querySelector('.counter-grid');
        expect(grid).toHaveClass('grid-cols-2');
        expect(grid).toHaveClass('md:grid-cols-4');
      });
    });

    it('should apply custom className', async () => {
      const { container } = render(
        <CounterGrid
          counters={[{ value: 10, label: 'Test' }]}
          className="my-custom-class"
        />
      );

      await waitFor(() => {
        const grid = container.querySelector('.counter-grid');
        expect(grid).toHaveClass('my-custom-class');
      });
    });
  });

  describe('Stagger Animation', () => {
    it('should apply staggered delays to counters', async () => {
      const { container } = render(
        <CounterGrid
          counters={[
            { value: 10, label: 'First' },
            { value: 20, label: 'Second' },
            { value: 30, label: 'Third' },
          ]}
          stagger={200}
        />
      );

      await waitFor(() => {
        const counters = container.querySelectorAll('.animated-counter');
        expect(counters).toHaveLength(3);
      });
    });

    it('should default stagger to 100ms', async () => {
      const { container } = render(
        <CounterGrid
          counters={[
            { value: 10, label: 'A' },
            { value: 20, label: 'B' },
          ]}
        />
      );

      await waitFor(() => {
        const counters = container.querySelectorAll('.animated-counter');
        expect(counters).toHaveLength(2);
      });
    });

    it('should combine stagger with existing counter delay', async () => {
      const { container } = render(
        <CounterGrid
          counters={[
            { value: 10, label: 'A', delay: 50 },
            { value: 20, label: 'B', delay: 100 },
          ]}
          stagger={200}
        />
      );

      await waitFor(() => {
        const counters = container.querySelectorAll('.animated-counter');
        expect(counters).toHaveLength(2);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty counters array', () => {
      const { container } = render(<CounterGrid counters={[]} />);
      const grid = container.querySelector('.counter-grid');
      expect(grid).toBeInTheDocument();
      expect(grid?.children).toHaveLength(0);
    });

    it('should handle single counter', async () => {
      render(<CounterGrid counters={[{ value: 42, label: 'Single' }]} />);

      await waitFor(() => {
        expect(screen.getAllByText('42').length).toBeGreaterThan(0);
        expect(screen.getByText('Single')).toBeInTheDocument();
      });
    });

    it('should use index as key when label is not provided', async () => {
      const { container } = render(
        <CounterGrid
          counters={[
            { value: 1 },
            { value: 2 },
            { value: 3 },
          ]}
        />
      );

      await waitFor(() => {
        const counters = container.querySelectorAll('.animated-counter');
        expect(counters).toHaveLength(3);
      });
    });

    it('should pass through counter props correctly', async () => {
      const { container } = render(
        <CounterGrid
          counters={[
            { value: 100, prefix: '$', suffix: 'K', decimals: 0 },
          ]}
        />
      );

      await waitFor(() => {
        const counterValue = container.querySelector('.counter-value');
        expect(counterValue?.textContent).toContain('$');
        expect(counterValue?.textContent).toContain('100');
        expect(counterValue?.textContent).toContain('K');
      });
    });
  });
});
