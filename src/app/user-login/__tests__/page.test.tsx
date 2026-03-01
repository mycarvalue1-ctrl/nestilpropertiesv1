
'use client';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserLoginPage from '../page';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import type { Auth } from 'firebase/auth';

// Mock 'next/navigation'
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock 'firebase/auth'
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  signInWithEmailAndPassword: jest.fn(),
}));

// Mock '@/hooks/use-toast'
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock '@/firebase' for the useAuth hook
jest.mock('@/firebase', () => {
    const originalFirebase = jest.requireActual('@/firebase');
    return {
        ...originalFirebase,
        useAuth: jest.fn(),
    };
});


// Cast mocks to Jest mock functions for TypeScript
const mockedUseRouter = useRouter as jest.Mock;
const mockedSignIn = signInWithEmailAndPassword as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;

describe('UserLoginPage Integration Test', () => {
  let mockPush: jest.Mock;
  let mockToast: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockPush = jest.fn();
    mockToast = jest.fn();
    mockedUseRouter.mockReturnValue({ push: mockPush });
    mockedUseToast.mockReturnValue({ toast: mockToast });
    mockedUseAuth.mockReturnValue({} as Auth); // Return a dummy auth object
    mockedSignIn.mockClear();
    mockToast.mockClear();
    mockPush.mockClear();
  });

  it('should render the login form correctly', () => {
    render(<UserLoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should call signInWithEmailAndPassword and redirect on successful login', async () => {
    mockedSignIn.mockResolvedValueOnce({ user: { uid: '123' } });

    render(<UserLoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledTimes(1);
      expect(mockedSignIn).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display an error toast on failed login', async () => {
    const error = new Error('Invalid credentials');
    mockedSignIn.mockRejectedValueOnce(error);

    render(<UserLoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
      });
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
