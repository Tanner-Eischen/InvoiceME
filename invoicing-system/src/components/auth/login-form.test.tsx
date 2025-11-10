import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from './login-form';
import { useAuthViewModel } from '@/viewmodels/AuthViewModel';

// Mock the AuthViewModel
vi.mock('@/viewmodels/AuthViewModel', () => ({
  useAuthViewModel: vi.fn(),
}));

// Mock the Sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    // Set up the mock implementation for useAuthViewModel
    (useAuthViewModel as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });
  });

  it('renders the login form correctly', () => {
    render(<LoginForm />);

    // Check if the form title and fields are rendered
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('handles form submission correctly with valid data', async () => {
    mockLogin.mockResolvedValue(true);

    render(<LoginForm />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    // Wait for the async login function to be called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows validation errors for invalid data', async () => {
    render(<LoginForm />);

    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
    });

    // Make sure the login function was not called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('disables the form while loading', () => {
    // Mock loading state
    (useAuthViewModel as any).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
    });

    render(<LoginForm />);

    // Check that inputs and button are disabled
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled();
  });
});
