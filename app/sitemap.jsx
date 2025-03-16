const DOMAIN = "https://bilkro.swiftsync.com";
const DEFAULT_PRIORITY = 0.8;
const HIGH_PRIORITY = 1.0;

const createSitemapEntry = (
  path,
  changeFreq = "monthly",
  priority = DEFAULT_PRIORITY
) => ({
  url: `${DOMAIN}${encodeURI(path)}`.replace(/&/g, "&amp;"),
  lastModified: new Date(),
  changeFrequency: changeFreq,
  priority,
});

const authRoutes = [
  "/authentication/login",
  "/authentication/verification",
  "/authentication/signup",
  "/authentication/reset",
  "/authentication/resetCode",
].map((path) => createSitemapEntry(path, "yearly", 0.8));

const mainRoutes = [
  createSitemapEntry("/", "always", HIGH_PRIORITY),
  createSitemapEntry("/page/dashboard", "always", 0.9),
  createSitemapEntry("/page/dashboard/?card=link", "always", 0.9),
];

const pageRoutes = [
  createSitemapEntry("/page/inventory", "always", 0.9),
  createSitemapEntry("/page/inventory?id", "always", 0.9),
  createSitemapEntry("/page/reports", "always", 0.9),
  createSitemapEntry("/page/cart", "always", 0.9),
  createSitemapEntry("/page/sales", "always", 0.9),
];

const staticRoutes = [createSitemapEntry("/page/settings", "weekly", 0.9)];

const getDynamicRoutes = async () => {
  return [];
};

export default async function sitemap() {
  const dynamicRoutes = await getDynamicRoutes();

  return [
    ...authRoutes,
    ...mainRoutes,
    ...pageRoutes,
    ...staticRoutes,
    ...dynamicRoutes,
  ];
}
