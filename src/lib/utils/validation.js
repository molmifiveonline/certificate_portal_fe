export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NUMERIC_ONLY_REGEX = /^\d+$/;
export const PHONE_REGEX = /^\+?\d+$/;
export const WHATSAPP_GROUP_REGEX =
  /^(https?:\/\/)?(chat\.whatsapp\.com\/[a-zA-Z0-9]{22,})$/;

export const WHATSAPP_GROUP_REQUIRED_MESSAGE =
  "Please Enter WhatsApp Group Link";
export const WHATSAPP_GROUP_INVALID_MESSAGE =
  "Please Enter a Valid WhatsApp Group Link";


const DEFAULT_LABEL = "This field";

const getFieldText = ({ name = "", label = "", type = "" }) =>
  `${name} ${label} ${type}`.toLowerCase();

const isEmailField = ({ name = "", label = "", type = "" }) => {
  const fieldText = getFieldText({ name, label, type });
  return type === "email" || fieldText.includes("email");
};

const isPhoneField = ({ name = "", label = "" }) => {
  const fieldText = getFieldText({ name, label });
  return [
    "whatsapp",
    "alternate number",
    "alternate mobile",
    "mobile",
    "phone",
    "contact",
  ].some((keyword) => fieldText.includes(keyword));
};

const isWhatsAppGroupField = ({ name = "", label = "" }) => {
  const fieldText = getFieldText({ name, label });
  return fieldText.includes("whatsapp") && fieldText.includes("group");
};

const isNumericField = ({ name = "", label = "" }) => {
  const fieldText = getFieldText({ name, label });
  if (/(link|group|map)/.test(fieldText)) return false;

  return isPhoneField({ name, label });
};


export const sanitizeNumericValue = (value = "") =>
  String(value ?? "").replace(/\D+/g, "");

export const sanitizeNumericInput = (event) => {
  const sanitizedValue = sanitizeNumericValue(event?.target?.value);
  if (event?.target && event.target.value !== sanitizedValue) {
    event.target.value = sanitizedValue;
  }
};

export const sanitizePhoneValue = (value = "") => {
  const str = String(value ?? "");
  const hasPlus = str.startsWith("+");
  const digitsOnly = str.replace(/\D/g, "");
  return (hasPlus ? "+" : "") + digitsOnly;
};

export const sanitizePhoneInput = (event) => {
  const sanitizedValue = sanitizePhoneValue(event?.target?.value);
  if (event?.target && event.target.value !== sanitizedValue) {
    event.target.value = sanitizedValue;
  }
};


export const isValidEmail = (value = "") =>
  !String(value ?? "").trim() || EMAIL_REGEX.test(String(value).trim());

export const isNumericOnly = (value = "") =>
  !String(value ?? "").trim() || NUMERIC_ONLY_REGEX.test(String(value).trim());

export const isValidWhatsAppGroupLink = (value = "") =>
  !String(value ?? "").trim() ||
  WHATSAPP_GROUP_REGEX.test(String(value).trim());

const isDobField = ({ name = "", label = "" }) => {
  const fieldText = getFieldText({ name, label });
  return name === "dob" || fieldText.includes("date of birth");
};

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
    inputProps.type = "text";
    inputProps.inputMode = "email";
  }

  if (isWhatsAppGroupField({ name, label })) {
    if (required) {
      nextRules.required = WHATSAPP_GROUP_REQUIRED_MESSAGE;
    }
    nextRules.pattern = {
      value: WHATSAPP_GROUP_REGEX,
      message: WHATSAPP_GROUP_INVALID_MESSAGE,
    };
    inputProps.inputMode = "url";
  } else if (isPhoneField({ name, label })) {
    nextRules.pattern = {
      value: PHONE_REGEX,
      message: `${label || DEFAULT_LABEL} must contain digits and may start with +`,
    };
    nextRules.minLength = {
      value: 6,
      message: `${label || DEFAULT_LABEL} must be at least 6 characters`,
    };
    nextRules.maxLength = {
      value: 13,
      message: `${label || DEFAULT_LABEL} must not exceed 13 characters`,
    };
    inputProps.inputMode = "tel";
    inputProps.onInput = sanitizePhoneInput;
  } else if (isNumericField({ name, label })) {
    nextRules.pattern = {
      value: NUMERIC_ONLY_REGEX,
      message: `${label || DEFAULT_LABEL} must contain digits only`,
    };
    inputProps.inputMode = "numeric";
    inputProps.pattern = "[0-9]*";
    inputProps.onInput = sanitizeNumericInput;
  }


  if (isDobField({ name, label })) {
    const minAge = 18;
    nextRules.validate = (value) => {
      if (!value) return true;
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= minAge || `You must be at least ${minAge} years old`;
    };
  }

  return {
    rules: {
      ...nextRules,
      ...rules,
    },
    inputProps,
  };
};
