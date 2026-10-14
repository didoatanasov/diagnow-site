// All English copy for the site. src/i18n/bg.ts must have the same shape.
// Copy rules (see AGENTS.md): never say AI replaces the doctor, no outcome
// promises, be honest that we are pre-launch.

export const en = {
  lang: 'en',
  meta: {
    title: 'diagnow.ai — Care between visits',
    description:
      'Remote follow-up for high blood pressure and type 2 diabetes: home readings, your GP and your pharmacist, with AI preparing the information.',
  },
  skip: 'Skip to content',
  nav: {
    how: 'How it works',
    who: 'Who it is for',
    team: 'Team',
    contact: 'Contact',
    switchLabel: 'Български',
    switchShort: 'БГ',
  },
  hero: {
    title: 'Care between visits.',
    lead:
      'diagnow.ai helps people with high blood pressure and type 2 diabetes stay on track between doctor visits. Your home readings reach your GP and your pharmacist, who adjust your treatment in time. AI prepares the information; your doctor makes the decisions.',
    ctaPrimary: 'Join the waitlist',
    ctaSecondary: 'Become a partner',
    stage: 'We are preparing our first pilot with a GP practice and a pharmacy in Bulgaria.',
    chartLabel:
      'Illustration: blood pressure readings over several weeks, starting above the target range and settling into it.',
    chartBand: 'target range',
  },
  problem: {
    heading: 'Between visits, nobody sees your readings',
    text: [
      'People with a chronic condition see their doctor a few times a year. In between, blood pressure and blood sugar drift, doses get skipped and side effects go unreported. Small problems have months to grow.',
      'Most of the information needed to act earlier already exists: it sits in home blood pressure monitors and glucometers, unseen.',
    ],
    stat: '29.7%',
    statText: 'of people aged 15 and over in Bulgaria report having high blood pressure.',
    statSource: 'National Statistical Institute, European Health Interview Survey 2019',
  },
  how: {
    heading: 'How it works',
    steps: [
      {
        title: 'You measure at home',
        text: 'With your blood pressure monitor or glucometer. Readings arrive through your phone, or you can enter them by hand.',
      },
      {
        title: 'AI prepares a summary',
        text: 'It shows trends and readings outside your target range, and suggests options based on medical guidelines.',
      },
      {
        title: 'Your GP decides',
        text: 'Your doctor reviews the summary, changes your treatment if needed and issues the e-prescription.',
      },
      {
        title: 'Your pharmacist follows up',
        text: 'Checks your medicines, answers questions about side effects, and can deliver to your door where the law allows.',
      },
    ],
  },
  who: {
    heading: 'Who it is for',
    groups: [
      {
        id: 'patients',
        title: 'Patients and families',
        text: 'Fewer trips to the clinic, a care team that knows how you are doing, and reminders that help you keep going. Many families set it up together for their parents.',
        points: [
          'Works with blood pressure monitors and glucometers you may already have',
          'Your GP and pharmacist see only what you allow',
          'You can also enter readings by hand',
        ],
        cta: 'Join the waitlist',
        role: 'patient',
      },
      {
        id: 'insurers',
        title: 'Insurers and employers',
        text: 'A chronic-care programme for your members or staff, with blood pressure and blood sugar control measured on real data, not questionnaires.',
        points: [
          'Built for people with hypertension and type 2 diabetes',
          'Clear reporting on enrolment and control',
          'We are looking for our first programme partners',
        ],
        cta: 'Talk to us',
        role: 'insurer-employer',
      },
      {
        id: 'partners',
        title: 'GPs and pharmacies',
        text: 'Follow your chronic patients between visits without extra paperwork. The copilot prepares summaries and suggestions; you stay in control of every decision.',
        points: [
          'Summaries instead of raw numbers',
          'A shared view for the doctor and the pharmacist',
          'A small number of practices and pharmacies can join the pilot',
        ],
        cta: 'Become a pilot partner',
        role: 'gp',
      },
    ],
  },
  safety: {
    heading: 'Safe by design',
    points: [
      {
        title: 'The doctor always decides',
        text: 'AI never prescribes or changes treatment on its own. Every suggestion shows its source and is reviewed by your GP.',
      },
      {
        title: 'Not an emergency service',
        text: 'We review readings on a schedule, not around the clock. If a reading is dangerous, the app tells you to call 112.',
      },
      {
        title: 'Your data, your choice',
        text: 'Health data is stored in the EU and shared only with the people you choose, for the data you choose.',
      },
      {
        title: 'Built for EU rules',
        text: 'We are building diagnow.ai to meet the EU requirements for medical devices, artificial intelligence and data protection.',
      },
    ],
  },
  team: {
    heading: 'Who we are',
    intro: 'A GP, a pharmacist and an engineer who saw the same problem from three sides.',
  },
  investors: {
    heading: 'For investors',
    text: 'We are raising a pre-seed round to run our first pilot. If you invest in health tech in Central and Eastern Europe, we would be glad to talk.',
    cta: 'Contact the founders',
  },
  contact: {
    heading: 'Get in touch',
    intro: 'Tell us a little about yourself and we will reply by email.',
    warning: 'Please do not send medical details or urgent questions here. In an emergency, call 112.',
    name: 'Name',
    email: 'Email',
    role: 'I am',
    rolePlaceholder: 'Choose one',
    roles: {
      patient: 'a patient or family member',
      'insurer-employer': 'an insurer or employer',
      gp: 'a GP or other doctor',
      pharmacy: 'a pharmacist or pharmacy',
      investor: 'an investor',
      other: 'something else',
    },
    organisation: 'Organisation (optional)',
    message: 'Message (optional)',
    consent: 'I agree that diagnow.ai stores my details to answer my message, as described in the',
    consentLink: 'privacy policy',
    newsletter: 'Send me occasional updates about diagnow.ai. You will receive an email to confirm.',
    submit: 'Send message',
    sending: 'Sending…',
    success: 'Thank you. We have your message and will reply by email.',
    successNewsletter: 'Please check your inbox to confirm the updates.',
    errors: {
      validation: 'Please check the highlighted fields.',
      captcha: 'The security check did not pass. Please try again.',
      server: 'Your message was not sent. Please try again in a few minutes or write to hello@diagnow.ai.',
    },
  },
  footer: {
    company: '[Company name] OOD, [address], Bulgaria, UIC [number]',
    privacy: 'Privacy policy',
    email: 'hello@diagnow.ai',
  },
  notFound: {
    title: 'Page not found',
    text: 'This page does not exist. It may have moved.',
    back: 'Back to the home page',
  },
};

export type Copy = typeof en;
