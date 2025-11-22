
export const isRequired = (v?: string) => v != null && v.trim().length > 0;
export const isEmailValid = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isPhoneValid = (phone: string) =>
  /^(\+?\d{1,3})?[-\s.]?\d{7,15}$/.test(phone);