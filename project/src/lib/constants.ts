/**
 * Application constants
 */

export const APP_NAME = 'The Maker';
export const APP_DESCRIPTION = 'A powerful starter template for modern web applications';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  TODOS: '/todos',
  CLIENTS: '/clients',
  CONTACT: '/contact',
  ADMIN: '/admin',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  CONVERTED: 'converted',
} as const;

export const API_ERROR_MESSAGES = {
  DEFAULT: 'An error occurred. Please try again.',
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_IN_USE: 'This email is already registered',
    WEAK_PASSWORD: 'Password must be at least 6 characters long',
  },
  VALIDATION: {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
  },
} as const;

export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Welcome back!',
    REGISTER: 'Account created successfully!',
    LEAD_SUBMITTED: 'Thank you for your interest! We\'ll be in touch soon.',
    CLIENT_ADDED: 'Client added successfully!',
    TODO_ADDED: 'Todo added successfully!',
    TODO_UPDATED: 'Todo updated successfully!',
    TODO_DELETED: 'Todo deleted successfully!',
  },
  ERROR: {
    LOGIN: 'Failed to sign in. Please check your credentials.',
    REGISTER: 'Failed to create account. Please try again.',
    LEAD_SUBMIT: 'Failed to submit form. Please try again.',
    CLIENT_ADD: 'Failed to add client. Please try again.',
    TODO_ADD: 'Failed to add todo. Please try again.',
    TODO_UPDATE: 'Failed to update todo. Please try again.',
    TODO_DELETE: 'Failed to delete todo. Please try again.',
  },
} as const;