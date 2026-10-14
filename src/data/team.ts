// Founders shown in the "Who we are" section.
// PLACEHOLDERS: replace name, bio and photo. Put photos in public/team/
// (square, at least 400×400 px) and set e.g. photo: '/team/firstname.jpg'.

import type { Lang } from '../i18n';

export type Founder = {
  name: string;
  photo: string | null;
  role: Record<Lang, string>;
  bio: Record<Lang, string>;
};

export const team: Founder[] = [
  {
    name: '[Name Surname]',
    photo: null,
    role: { bg: 'Съосновател, изпълнителен и технически директор', en: 'Co-founder, CEO and CTO' },
    bio: {
      bg: '[Кратко представяне: опит в софтуера и изкуствения интелект.]',
      en: '[Short bio: background in software and AI.]',
    },
  },
  {
    name: '[Name Surname]',
    photo: null,
    role: { bg: 'Съосновател, медицински директор, личен лекар', en: 'Co-founder, Chief Medical Officer, GP' },
    bio: {
      bg: '[Кратко представяне: години практика като личен лекар.]',
      en: '[Short bio: years of practice as a GP.]',
    },
  },
  {
    name: '[Name Surname]',
    photo: null,
    role: { bg: 'Съосновател, магистър-фармацевт', en: 'Co-founder, Master of Pharmacy' },
    bio: {
      bg: '[Кратко представяне: управител на аптека.]',
      en: '[Short bio: runs a community pharmacy.]',
    },
  },
];
