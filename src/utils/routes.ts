type Language = 'lt' | 'en';

export const routes = {
  home: { lt: '/', en: '/' },
  cars: { lt: '/automobiliai', en: '/cars' },
  about: { lt: '/apie-mus', en: '/about' },
  contact: { lt: '/kontaktai', en: '/contact' },
  blog: { lt: '/naujienos', en: '/blog' },
  faq: { lt: '/duk', en: '/faq' },
  privacy: { lt: '/privatumo-politika', en: '/privacy-policy' },
  leaseAgreement: { lt: '/nuomos-sutartis', en: '/rental-agreement' },
  admin: { lt: '/admin', en: '/admin' },
  auth: { lt: '/auth', en: '/auth' },
  paymentSuccess: { lt: '/payment-success', en: '/payment-success' },
  paymentCanceled: { lt: '/payment-canceled', en: '/payment-canceled' },
} as const;

export const getRoute = (key: keyof typeof routes, language: Language): string => {
  return routes[key][language];
};

// Get the route key from a path
export const getRouteKey = (path: string): keyof typeof routes | null => {
  for (const [key, value] of Object.entries(routes)) {
    if (value.lt === path || value.en === path) {
      return key as keyof typeof routes;
    }
  }
  return null;
};

// Get the equivalent path in another language
export const getEquivalentPath = (currentPath: string, targetLanguage: Language): string => {
  // Handle dynamic routes like /automobiliai/:id or /cars/:id
  const carDetailMatch = currentPath.match(/^\/(automobiliai|cars)\/(.+)$/);
  if (carDetailMatch) {
    const carId = carDetailMatch[2];
    return targetLanguage === 'en' ? `/cars/${carId}` : `/automobiliai/${carId}`;
  }

  // Handle blog post routes
  const blogPostMatch = currentPath.match(/^\/(naujienos|blog)\/(.+)$/);
  if (blogPostMatch) {
    const slug = blogPostMatch[2];
    return targetLanguage === 'en' ? `/blog/${slug}` : `/naujienos/${slug}`;
  }

  // Handle reservation routes
  const reservationMatch = currentPath.match(/^\/(rezervacija|reservation)\/(.+?)\/(atsakomybe|insurance|paslaugos|services|salygos|terms|uzsakymas|review)$/);
  if (reservationMatch) {
    const carId = reservationMatch[2];
    const step = reservationMatch[3];
    
    const stepMap: Record<string, { lt: string; en: string }> = {
      atsakomybe: { lt: 'atsakomybe', en: 'insurance' },
      insurance: { lt: 'atsakomybe', en: 'insurance' },
      paslaugos: { lt: 'paslaugos', en: 'services' },
      services: { lt: 'paslaugos', en: 'services' },
      salygos: { lt: 'salygos', en: 'terms' },
      terms: { lt: 'salygos', en: 'terms' },
      uzsakymas: { lt: 'uzsakymas', en: 'review' },
      review: { lt: 'uzsakymas', en: 'review' },
    };

    const translatedStep = stepMap[step]?.[targetLanguage] || step;
    const baseRoute = targetLanguage === 'en' ? 'reservation' : 'rezervacija';
    return `/${baseRoute}/${carId}/${translatedStep}`;
  }

  // Handle static routes
  const routeKey = getRouteKey(currentPath);
  if (routeKey) {
    return routes[routeKey][targetLanguage];
  }

  // Default: return the same path
  return currentPath;
};
