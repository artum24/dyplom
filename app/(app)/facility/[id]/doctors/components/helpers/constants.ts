// @ts-ignore
export const NAME_RX = /^[A-Za-zА-Яа-яЇїІіЄєҐґ'’\-.\s]{2,60}$/u;
// @ts-ignore
export const SPECIALTY_RX = /^[A-Za-zА-Яа-яЇїІіЄєҐґ0-9'’\-.\s]{2,60}$/u;
export const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normalizePhone = (raw: string) => raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
export const isValidUaPhone = (raw: string) => /^\+380\d{9}$/.test(normalizePhone(raw));
