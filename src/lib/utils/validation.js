export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NUMERIC_ONLY_REGEX = /^\d+$/;

const DEFAULT_LABEL = "This field";

const getFieldText = ({ name = "", label = "", type = "" }) =>
  `${name} ${label} ${type}`.toLowerCase();

const isEmailField = ({ name = "", label = "", type = "" }) => {
  const fieldText = getFieldText({ name, label, type });
  return type === "email" || fieldText.includes("email");
};

const isNumericField = ({ name = "", label = "" }) => {
  const fieldText = getFieldText({ name, label });
  if (/(link|group|map)/.test(fieldText)) return false;

  return [
    "whatsapp",
    "alternate number",
    "alternate mobile",
    "mobile",
    "phone",
    "contact",
  ].some((keyword) => fieldText.includes(keyword));
};

export const sanitizeNumericValue = (value = "") =>
  String(value ?? "").replace(/\D+/g, "");

export const sanitizeNumericInput = (event) => {
  const sanitizedValue = sanitizeNumericValue(event?.target?.value);
  if (event?.target && event.target.value !== sanitizedValue) {
    event.target.value = sanitizedValue;
  }
};

export const isValidEmail = (value = "") =>
  !String(value ?? "").trim() || EMAIL_REGEX.test(String(value).trim());

export const isNumericOnly = (value = "") =>
  !String(value ?? "").trim() || NUMERIC_ONLY_REGEX.test(String(value).trim());

export const getCommonFieldValidation = ({
  name = "",
  label = DEFAULT_LABEL,
  type = "text",
  required = false,
  rules = {},
} = {}) => {
  const nextRules = {
    ...(required ? { required: `${label || DEFAULT_LABEL} is required` } : {}),
  };
  const inputProps = {};

  if (isEmailField({ name, label, type })) {
    nextRules.pattern = {
      value: EMAIL_REGEX,
      message: `Enter a valid ${label || "email address"}`,
    };
    inputProps.type = "email";
    inputProps.inputMode = "email";
  }

  if (isNumericField({ name, label })) {
    nextRules.pattern = {
      value: NUMERIC_ONLY_REGEX,
      message: `${label || DEFAULT_LABEL} must contain digits only`,
    };
    inputProps.inputMode = "numeric";
    inputProps.pattern = "[0-9]*";
    inputProps.onInput = sanitizeNumericInput;
  }

  return {
    rules: {
      ...nextRules,
      ...rules,
    },
    inputProps,
  };
};
