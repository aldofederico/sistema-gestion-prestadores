export const digitsOnly = (value: string): string => value.replace(/\D/g, "");

export const toCanonicalCuit = (value: string): string =>
  digitsOnly(value).slice(0, 11);

export const formatPartialCuit = (value: string): string => {
  const digits = toCanonicalCuit(value);

  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;

  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

export const formatCuit = (value: string): string => formatPartialCuit(value);
