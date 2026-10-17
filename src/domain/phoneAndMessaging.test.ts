import { describe, it, expect } from 'vitest';
import {
  normalizePakistanPhone,
  fillMessageTemplate,
  generateWhatsAppLink,
} from './phoneAndMessaging';

describe('Phone Normalization & WhatsApp Link Generation', () => {
  it('normalizes Pakistani phone numbers to 923XXXXXXXXX format', () => {
    expect(normalizePakistanPhone('03001234567')).toBe('923001234567');
    expect(normalizePakistanPhone('+92 321 7654321')).toBe('923217654321');
    expect(normalizePakistanPhone('923001234567')).toBe('923001234567');
    expect(normalizePakistanPhone('3001234567')).toBe('923001234567');
  });

  it('fills template placeholders', () => {
    const template = 'Assalam-o-Alaikum {customer}, aap ka kul bakaya {balance} PKR hai.';
    const filled = fillMessageTemplate(template, {
      customer: 'Tariq Agri Store',
      balance: '1,900',
    });
    expect(filled).toBe('Assalam-o-Alaikum Tariq Agri Store, aap ka kul bakaya 1,900 PKR hai.');
  });

  it('generates wa.me link with encoded text', () => {
    const link = generateWhatsAppLink('03001234567', 'Assalam-o-Alaikum Tariq!');
    expect(link).toBe('https://wa.me/923001234567?text=Assalam-o-Alaikum%20Tariq!');
  });
});
