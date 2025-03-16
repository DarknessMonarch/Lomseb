export default function manifest() {
  return {
    name: 'Lomseb',
    short_name: 'Lomseb',
    description: 'invenotry management system',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#1366D9',
    categories: ['business', 'productivity, inventory, management, sales'],
    iarc_rating_id: '',    
    icons: [
      {
        src:  '/assets/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src:  '/assets/logo.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src:  '/assets/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src:  '/assets/logo.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon'
      }
    ],

    // Splash screen settings
    // splash_pages: null,

  
    prefer_related_applications: false,

    lang: 'en',
    dir: 'ltr',


    related_applications: [],
    shortcuts: [
      {
        name: 'Inventory',
        short_name: 'Inventory',
        description: 'Inventory management system',
        url: '/page/inventory',
        icons: [
          {
            src: '/assets/logo.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Reports',
        short_name: 'Reports',
        description: 'Reports management system',
        url: '/page/reports',
        icons: [
          {
            src: '/assets/logo.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Cart',
        short_name: 'Cart',
        description: 'Cart management system',
        url: '/page/cart',
        icons: [
          {
            src: '/assets/logo.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Sales',
        short_name: 'Sales',
        description: 'Sales management system',
        url: '/page/sales',
        icons: [
          {
            src: '/assets/logo.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    ],

    screenshots: [
      {
        src: '/screenshots/banner.png',
        sizes: '1280x720',
        type: 'image/png',
        platform: 'wide',
        label: 'Home Screen'
      }
    ]
  }
}