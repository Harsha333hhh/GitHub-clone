// INPUT VALIDATION UTILITIES
// Centralized validation functions for common scenarios

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Validate username
export const validateUsername = (username) => {
  // 2-50 characters, alphanumeric and underscore/dash only
  const usernameRegex = /^[a-zA-Z0-9_-]{2,50}$/;
  return usernameRegex.test(username);
};

// Validate repository name
export const validateRepoName = (name) => {
  // 3-100 characters, alphanumeric, underscore, dash
  const repoRegex = /^[a-zA-Z0-9_-]{3,100}$/;
  return repoRegex.test(name);
};

// Sanitize input string (remove dangerous characters)
export const sanitizeString = (str) => {
  return str
    .trim()
    .replace(/[<>]/g, '')  // Remove angle brackets
    .replace(/['"]/g, '')  // Remove quotes
    .substring(0, 1000);   // Max 1000 characters
};

// Validate ObjectId
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Validate length
export const validateLength = (str, min, max) => {
  return str.length >= min && str.length <= max;
};

// Validate file size (in MB)
export const validateFileSize = (sizeInBytes, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
};

// Validate content type
export const validateContentType = (contentType, allowedTypes) => {
  return allowedTypes.includes(contentType);
};

// Validate URL
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validate enum value
export const validateEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

// Comprehensive validation result object
export const createValidationError = (field, message) => {
  return {
    field,
    message,
    isValid: false
  };
};

export const createValidationSuccess = () => {
  return {
    isValid: true,
    errors: []
  };
};
