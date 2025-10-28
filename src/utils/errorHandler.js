/**
 * Error Handler Utility
 * Provides user-friendly error messages and recovery suggestions
 */

const ERROR_MESSAGES = {
  // API Errors
  API_KEY_MISSING: {
    title: 'API Key Required',
    message: 'Please configure your Gemini API key in Settings before generating an app.',
    suggestion: 'Click the Settings button (⚙️) and enter your API key.',
    severity: 'warning',
  },
  API_KEY_INVALID: {
    title: 'Invalid API Key',
    message: 'The API key you provided is invalid or expired.',
    suggestion: 'Please check your API key and try again. You can get a new key from Google AI Studio.',
    severity: 'error',
  },
  API_RATE_LIMIT: {
    title: 'Rate Limit Exceeded',
    message: 'You\'ve made too many requests. Please wait a moment before trying again.',
    suggestion: 'Wait a few seconds and try again. Consider spacing out your requests.',
    severity: 'warning',
  },
  API_QUOTA_EXCEEDED: {
    title: 'Quota Exceeded',
    message: 'Your API quota has been exceeded.',
    suggestion: 'Check your Google Cloud Console to see your usage and limits.',
    severity: 'error',
  },
  API_CONNECTION_ERROR: {
    title: 'Connection Error',
    message: 'Failed to connect to the API. Please check your internet connection.',
    suggestion: 'Check your internet connection and try again.',
    severity: 'error',
  },

  // Input Errors
  EMPTY_DESCRIPTION: {
    title: 'Empty Description',
    message: 'Please describe what application you want to create.',
    suggestion: 'Try something like "Create a todo list app" or "Build a calculator".',
    severity: 'warning',
  },
  DESCRIPTION_TOO_SHORT: {
    title: 'Description Too Short',
    message: 'Your description is too short. Please provide more details.',
    suggestion: 'Add more details about what you want to create.',
    severity: 'warning',
  },
  DESCRIPTION_TOO_LONG: {
    title: 'Description Too Long',
    message: 'Your description is too long. Please keep it under 2000 characters.',
    suggestion: 'Simplify your description and focus on the main features.',
    severity: 'warning',
  },

  // Code Generation Errors
  INVALID_CODE_GENERATED: {
    title: 'Invalid Code Generated',
    message: 'The generated code is not valid HTML.',
    suggestion: 'Try a different description or try again.',
    severity: 'error',
  },
  CODE_GENERATION_FAILED: {
    title: 'Code Generation Failed',
    message: 'Failed to generate code. Please try again.',
    suggestion: 'Try a simpler description or check your API key.',
    severity: 'error',
  },

  // Export Errors
  EXPORT_FAILED: {
    title: 'Export Failed',
    message: 'Failed to export code.',
    suggestion: 'Try a different export format or try again.',
    severity: 'error',
  },
  COPY_FAILED: {
    title: 'Copy Failed',
    message: 'Failed to copy code to clipboard.',
    suggestion: 'Try using the download option instead.',
    severity: 'warning',
  },

  // Storage Errors
  STORAGE_QUOTA_EXCEEDED: {
    title: 'Storage Full',
    message: 'Browser storage is full. Please clear some data.',
    suggestion: 'Clear your browser cache or delete old projects.',
    severity: 'error',
  },

  // Unknown Error
  UNKNOWN_ERROR: {
    title: 'Unknown Error',
    message: 'An unexpected error occurred.',
    suggestion: 'Try refreshing the page or try again later.',
    severity: 'error',
  },
};

/**
 * Parse error and return user-friendly message
 */
export const parseError = (error) => {
  if (!error) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Check error message for known patterns
  const errorMessage = error.message || error.toString();

  if (errorMessage.includes('API key')) {
    if (errorMessage.includes('required')) {
      return ERROR_MESSAGES.API_KEY_MISSING;
    }
    return ERROR_MESSAGES.API_KEY_INVALID;
  }

  if (
    errorMessage.includes('429') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('RESOURCE_EXHAUSTED') ||
    errorMessage.includes('too many requests')
  ) {
    return ERROR_MESSAGES.API_RATE_LIMIT;
  }

  if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
    return ERROR_MESSAGES.API_QUOTA_EXCEEDED;
  }

  if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('UNAUTHENTICATED')) {
    return ERROR_MESSAGES.API_KEY_INVALID;
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return ERROR_MESSAGES.API_CONNECTION_ERROR;
  }

  if (errorMessage.includes('HTML')) {
    return ERROR_MESSAGES.INVALID_CODE_GENERATED;
  }

  if (errorMessage.includes('empty') || errorMessage.includes('required')) {
    return ERROR_MESSAGES.EMPTY_DESCRIPTION;
  }

  if (errorMessage.includes('too short')) {
    return ERROR_MESSAGES.DESCRIPTION_TOO_SHORT;
  }

  if (errorMessage.includes('too long')) {
    return ERROR_MESSAGES.DESCRIPTION_TOO_LONG;
  }

  if (errorMessage.includes('export')) {
    return ERROR_MESSAGES.EXPORT_FAILED;
  }

  if (errorMessage.includes('copy')) {
    return ERROR_MESSAGES.COPY_FAILED;
  }

  if (errorMessage.includes('storage')) {
    return ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED;
  }

  // Return custom error message if available
  if (ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // Return generic error with original message
  return {
    title: 'Error',
    message: errorMessage,
    suggestion: 'Please try again or contact support.',
    severity: 'error',
  };
};

/**
 * Validate user input
 */
export const validateInput = (description) => {
  if (!description || !description.trim()) {
    throw new Error('Description is required');
  }

  const trimmed = description.trim();

  if (trimmed.length < 5) {
    throw new Error('Description is too short. Please provide at least 5 characters.');
  }

  if (trimmed.length > 2000) {
    throw new Error('Description is too long. Please keep it under 2000 characters.');
  }

  return trimmed;
};

/**
 * Validate API key
 */
export const validateApiKey = (apiKey) => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is required');
  }

  if (apiKey.trim().length < 10) {
    throw new Error('API key appears to be invalid');
  }

  return apiKey.trim();
};

/**
 * Format error for display
 */
export const formatErrorForDisplay = (error) => {
  const parsed = parseError(error);
  return `${parsed.title}: ${parsed.message}`;
};

/**
 * Get error recovery actions
 */
export const getRecoveryActions = (error) => {
  const parsed = parseError(error);

  const actions = [];

  if (parsed.severity === 'warning') {
    actions.push({
      label: 'Try Again',
      action: 'retry',
    });
  }

  if (parsed.message.includes('API key')) {
    actions.push({
      label: 'Open Settings',
      action: 'openSettings',
    });
  }

  if (parsed.message.includes('connection')) {
    actions.push({
      label: 'Check Connection',
      action: 'checkConnection',
    });
  }

  actions.push({
    label: 'Dismiss',
    action: 'dismiss',
  });

  return actions;
};

/**
 * Log error for debugging
 */
export const logError = (error, context = '') => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error.message || error.toString(),
    stack: error.stack,
  };

  console.error('[RAJ AI APP BUILDER ERROR]', errorInfo);

  // Could send to error tracking service here
  // e.g., Sentry, LogRocket, etc.
};

