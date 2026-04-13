export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  HAS_UPPER_CASE: /[A-Z]/,
  HAS_LOWER_CASE: /[a-z]/,
  HAS_NUMBER: /[0-9]/,
  HAS_SPECIAL_CHARACTER: /[!@#$%^&*+-_(),.:{}<>]/,
  MIN_LENGTH_6: /.{6,}/,
};
