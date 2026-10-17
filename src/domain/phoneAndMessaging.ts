/**
 * Normalizes a Pakistani phone number to standard international format without plus sign: 923XXXXXXXXX.
 * Examples:
 * "03001234567" -> "923001234567"
 * "+92 300 1234567" -> "923001234567"
 * "923001234567" -> "923001234567"
 */
export function normalizePakistanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) {
    return '92' + digits.substring(1);
  }
  if (digits.startsWith('92') && digits.length === 12) {
    return digits;
  }
  if (digits.length === 10 && digits.startsWith('3')) {
    return '92' + digits;
  }
  return digits;
}

/**
 * Fills message template placeholders such as {customer}, {total}, {balance}, etc.
 */
export function fillMessageTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  for (const [key, val] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    result = result.split(placeholder).join(String(val));
  }
  return result;
}

/**
 * Generates a WhatsApp click-to-chat URL (https://wa.me/92XXXXXXXXXX?text=...) with pre-written message.
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizePakistanPhone(phone);
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encodedMsg}`;
}
