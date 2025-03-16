export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/page/inventory',
          '/page/reports',
          '/page/cart',
          '/page/sales',
        ],
        disallow: [
          '/authentication/*',
          '/page/dashboard/*',
          '/page/settings/*',
          '/api/*',
          '/*?*', // Disallow URLs with query parameters
          '/*.json$', // Disallow JSON files
          '/private/',
        ],
        crawlDelay: 2
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/']  
      },
      {
        userAgent: 'CCBot',
        disallow: ['/']  
      }
    ],
    sitemap: 'https://bilkro.swiftsync.com/sitemap.xml',
    host: 'https://bilkro.swiftsync.com'
  }
}