import { REGEX_PATTERNS } from "./patterns";
import { VALIDATION_MESSAGES } from "../constants/messages";

export const validateEmail = (email: string) => {
  if (!email || email.trim() === "") {
    return VALIDATION_MESSAGES.EMAIL_REQUIRED;
  }
  if (!REGEX_PATTERNS.EMAIL.test(email.trim())) {
    return VALIDATION_MESSAGES.INVALID_EMAIL;
  }
  return null;
};

export const validatePassword = (password: string) => {
  if (!password || password === "") {
    return VALIDATION_MESSAGES.PASSWORD_REQUIRED;
  }
  if (!REGEX_PATTERNS.MIN_LENGTH_8.test(password)) {
    return VALIDATION_MESSAGES.MIN_PASSWORD_LENGTH;
  }
  return null;
};

export const validateRepeatPassword = (
  password: string,
  repeatedPassword: string,
) => {
  if (!repeatedPassword || repeatedPassword === "") {
    return VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
  }
  if (repeatedPassword !== password) {
    return VALIDATION_MESSAGES.PASSWORD_NOT_MATCH;
  }
  return null;
};
