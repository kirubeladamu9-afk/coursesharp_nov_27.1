import type { Mentor } from '@/interfaces/mentor'

export const data: Array<Mentor> = [
  {
    id: 1,
    photo: '/images/mentors/birhanu-motuma.webp',
    name: 'Birhanu Motuma',
    category: 'Marketing',
    description:
      'Builds brand awareness and campaigns that connect CourseSharp with learners and grow our community',
    company: {
      name: '5 yrs',
      logo: '/images/companies/grab.png',
    },
  },
  {
    id: 2,
    photo: '/images/mentors/bitanitya-tesfahun.webp',
    name: 'Bitanitya Tesfahun',
    category: 'Marketing',
    description:
      'Plans content and outreach strategies that help students discover CourseSharp and stay engaged',
    company: {
      name: '2 yrs',
      logo: '/images/companies/google.png',
    },
  },
  {
    id: 3,
    photo: '/images/mentors/elias-nesreddin.webp',
    name: 'Elias Nesreddin',
    category: 'Frontend Developer',
    description:
      'Designs and builds responsive, accessible interfaces that make learning smooth on every device',
    company: {
      name: '4 yrs',
      logo: '/images/companies/airbnb.png',
    },
  },
  {
    id: 4,
    photo: '/images/mentors/kirubel-abebe.webp',
    name: 'Kirubel Abebe',
    category: 'Backend Developer',
    description:
      'Builds reliable server-side services and APIs that power courses, progress tracking, and classes',
    company: {
      name: '6 yrs',
      logo: '/images/companies/microsoft.png',
    },
  },
]
