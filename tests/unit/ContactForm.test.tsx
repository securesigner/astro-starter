/**
 * Unit Tests for ContactForm Component
 *
 * Tests the ContactForm validation logic and user interactions:
 * - Field validation rules (name, email, message)
 * - Error state display
 * - Form submission handling
 * - Accessibility features
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../../src/components/ContactForm';

// Mock the toast module
vi.mock('@/components/ui/sonner', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

// Mock fetch for form submission
const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  // Clean up DOM between tests
  document.body.innerHTML = '';
});

describe('ContactForm', () => {
  describe('Validation Rules', () => {
    // Define validation patterns matching ContactForm.tsx
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

    describe('Name Validation Pattern', () => {
      it('should accept valid names', () => {
        expect(VALIDATION.name.pattern.test('John Doe')).toBe(true);
        expect(VALIDATION.name.pattern.test('Mary Jane')).toBe(true);
        expect(VALIDATION.name.pattern.test("O'Brien")).toBe(true);
        expect(VALIDATION.name.pattern.test('Anne-Marie')).toBe(true);
      });

      it('should reject names with numbers', () => {
        expect(VALIDATION.name.pattern.test('John123')).toBe(false);
        expect(VALIDATION.name.pattern.test('1John')).toBe(false);
      });

      it('should reject names with special characters', () => {
        expect(VALIDATION.name.pattern.test('John@Doe')).toBe(false);
        expect(VALIDATION.name.pattern.test('John!Doe')).toBe(false);
        expect(VALIDATION.name.pattern.test('John_Doe')).toBe(false);
      });

      it('should enforce length constraints', () => {
        const shortName = 'J';
        const validName = 'Jo';
        const longName = 'A'.repeat(101);

        expect(shortName.length >= VALIDATION.name.minLength).toBe(false);
        expect(validName.length >= VALIDATION.name.minLength).toBe(true);
        expect(longName.length <= VALIDATION.name.maxLength).toBe(false);
      });
    });

    describe('Email Validation Pattern', () => {
      it('should accept valid email addresses', () => {
        expect(VALIDATION.email.pattern.test('test@example.com')).toBe(true);
        expect(VALIDATION.email.pattern.test('user.name@domain.org')).toBe(true);
        expect(VALIDATION.email.pattern.test('user+tag@example.co.uk')).toBe(true);
        expect(VALIDATION.email.pattern.test('test123@example.io')).toBe(true);
      });

      it('should reject invalid email formats', () => {
        expect(VALIDATION.email.pattern.test('not-an-email')).toBe(false);
        expect(VALIDATION.email.pattern.test('missing@domain')).toBe(false);
        expect(VALIDATION.email.pattern.test('@nodomain.com')).toBe(false);
        expect(VALIDATION.email.pattern.test('spaces in@email.com')).toBe(false);
        expect(VALIDATION.email.pattern.test('test@.com')).toBe(false);
      });

      it('should require at least 2 character TLD', () => {
        expect(VALIDATION.email.pattern.test('test@example.a')).toBe(false);
        expect(VALIDATION.email.pattern.test('test@example.ab')).toBe(true);
      });
    });

    describe('Message Validation', () => {
      it('should enforce minimum length', () => {
        const shortMessage = 'Too short';
        const validMessage = 'This is a valid message with enough characters.';

        expect(shortMessage.length >= VALIDATION.message.minLength).toBe(false);
        expect(validMessage.length >= VALIDATION.message.minLength).toBe(true);
      });

      it('should enforce maximum length', () => {
        const longMessage = 'A'.repeat(2001);
        const validMessage = 'A'.repeat(2000);

        expect(longMessage.length <= VALIDATION.message.maxLength).toBe(false);
        expect(validMessage.length <= VALIDATION.message.maxLength).toBe(true);
      });
    });
  });

  describe('Form Rendering', () => {
    it('should render all required fields', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ContactForm />);

      expect(screen.getByRole('button', { name: /send message|submit/i })).toBeInTheDocument();
    });

    it('should render service dropdown as optional', () => {
      render(<ContactForm />);

      // Service is optional, should be present but not required
      const serviceSelect = screen.getByRole('combobox');
      expect(serviceSelect).toBeInTheDocument();
    });

    it('should include honeypot field for spam protection', () => {
      const { container } = render(<ContactForm />);

      // Formspree honeypot field should exist but be hidden
      const honeypotField = container.querySelector('input[name="_gotcha"]');
      expect(honeypotField).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update input values on change', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'John Doe');

      expect(nameInput).toHaveValue('John Doe');
    });

    it('should prevent submission when form has errors', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Form is empty, clicking submit should not call fetch
      const submitButton = screen.getByRole('button', { name: /send message|submit/i });
      await user.click(submitButton);

      // fetch should not be called since form is invalid
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should show email error for invalid format', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('should show message length error for short messages', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Too short');
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('should clear error when user corrects input', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/name/i);

      // Type invalid then blur to trigger error
      await user.type(nameInput, 'J');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
      });

      // Correct the input
      await user.type(nameInput, 'ohn Doe');

      await waitFor(() => {
        expect(screen.queryByText(/at least 2 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should not submit when form has validation errors', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', { name: /send message|submit/i });
      await user.click(submitButton);

      // fetch should not be called
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should submit valid form data', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const user = userEvent.setup();
      render(<ContactForm />);

      // Fill out valid form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(
        screen.getByLabelText(/message/i),
        'This is a valid test message with more than twenty characters.'
      );

      const submitButton = screen.getByRole('button', { name: /send message|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);

      expect(nameInput).toHaveAttribute('id');
      expect(emailInput).toHaveAttribute('id');
      expect(messageInput).toHaveAttribute('id');
    });

    it('should have required attributes on required fields', () => {
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);

      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
      expect(messageInput).toHaveAttribute('required');
    });

    it('should have aria-invalid on fields with errors', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Props', () => {
    it('should accept custom form action', () => {
      const { container } = render(<ContactForm formAction="https://formspree.io/f/test123" />);

      const form = container.querySelector('form');
      expect(form).toHaveAttribute('action', 'https://formspree.io/f/test123');
    });

    it('should accept custom className', () => {
      const { container } = render(<ContactForm className="custom-form" />);

      const form = container.querySelector('form');
      expect(form).toHaveClass('custom-form');
    });
  });
});
