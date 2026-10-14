import { bg } from './bg';
import { en, type Copy } from './en';

export type Lang = 'bg' | 'en';

export const copy: Record<Lang, Copy> = { bg, en };

/** Path of the same page in the given language ("/" is Bulgarian, "/en/" English). */
export function localePath(lang: Lang, page: '' | 'privacy' = ''): string {
  const prefix = lang === 'en' ? '/en/' : '/';
  return page ? `${prefix}${page}/` : prefix;
}
