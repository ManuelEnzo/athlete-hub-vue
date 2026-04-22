import type { NavMenu, NavMenuItems } from '~/types/nav'

export const navMenu: NavMenu[] = [
  {
    heading: 'AI',
    items: [
      {
        title: 'AI Assistant',
        icon: 'i-lucide-bot',
        link: '/ai-chat',
      },
    ],
  },
  {
    heading: 'General',
    items: [
      {
        title: 'Home',
        icon: 'i-lucide-home',
        link: '/',
      },
      {
        title: 'Agenda',
        icon: 'i-lucide-calendar-range',
        link: '/agenda',
      },
      {
        title: 'Athletes',
        icon: 'i-lucide-users',
        children: [
          {
            title: 'Management',
            icon: 'i-lucide-user-plus',
            link: '/athletemanagement',
          },
          {
            title: 'Measurements',
            icon: 'i-lucide-ruler',
            link: '/athletemeasurements',
          },
          {
            title: 'Details',
            icon: 'i-lucide-biceps-flexed',
            link: '/athletedetails',
          },
        ],
      },
    ],
  },
  {
    heading: 'RPE',
    items: [
      {
        title: 'RPE Monitoring',
        icon: 'i-lucide-mail-search',
        link: '/email',
      },
      {
        title: 'RPE Submissions',
        icon: 'i-lucide-bar-chart-2',
        link: '/rpedetails',
      },
    ],
  },
  {
    heading: 'Monitoring',
    items: [
      {
        title: 'Injuries Log',
        icon: 'i-lucide-heart-pulse',
        link: '/injuriesmanager',
      },
      {
        title: 'Sleep History',
        icon: 'i-lucide-moon',
        link: '/sleephistory',
      },
      {
        title: 'Tests',
        icon: 'i-lucide-clipboard-list',
        children: [
          {
            title: 'Test Settings',
            icon: 'i-lucide-settings-2',
            link: '/testmanagement',
          },
          {
            title: 'Test Comparison',
            icon: 'i-lucide-bar-chart-2',
            link: '/test-comparison',
          },
        ],
      },
    ],
  },
]

export const navMenuBottom: NavMenuItems = [
  {
    title: 'Formule',
    icon: 'i-lucide-book-open',
    link: '/monitoraggio-calcoli',
  },
  {
    title: 'Feedback',
    icon: 'i-lucide-send',
    link: 'mailto:athletehub.sport@gmail.com',
  },
]
