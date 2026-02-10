import type { NavMenu, NavMenuItems } from '~/types/nav'

export const navMenu: NavMenu[] = [
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
          }
        ],
      },
      {
        title: 'Monitoring',
        icon: 'i-lucide-activity',
        children: [
          {
            title: 'RPE Submissions',
            icon: 'i-lucide-bar-chart-2',
            link: '/rpedetails',
          },
          {
            title: 'Injuries Log',
            icon: 'i-lucide-heart-pulse',
            link: '/injuriesmanager',
          },
          {
            title: 'Test Settings',
            icon: 'i-lucide-settings-2',
            link: '/testmanagement',
          },
        ]
      }
    ],
  },
]

export const navMenuBottom: NavMenuItems = [
  {
    title: 'Help & Support',
    icon: 'i-lucide-circle-help',
    link: 'https://github.com/dianprata/nuxt-shadcn-dashboard',
  },
  {
    title: 'Feedback',
    icon: 'i-lucide-send',
    link: 'https://github.com/dianprata/nuxt-shadcn-dashboard',
  },
]