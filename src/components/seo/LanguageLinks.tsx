import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

interface LanguageLinksProps {
  ltPath?: string;
  enPath?: string;
}

export const LanguageLinks = ({ ltPath, enPath }: LanguageLinksProps) => {
  const location = useLocation();
  
  // Generate default paths based on current location if not provided
  const currentPath = location.pathname;
  
  // Map Lithuanian to English paths
  const pathMap: { [key: string]: string } = {
    '/': '/',
    '/automobiliai': '/cars',
    '/apie-mus': '/about',
    '/kontaktai': '/contact',
    '/naujienos': '/blog',
    '/duk': '/faq',
    '/privatumo-politika': '/privacy-policy',
    '/nuomos-sutartis': '/rental-agreement',
  };
  
  const reversePathMap = Object.fromEntries(
    Object.entries(pathMap).map(([lt, en]) => [en, lt])
  );
  
  // Handle car detail pages (now with slugs, not numeric IDs)
  const carDetailMatch = currentPath.match(/\/(automobiliai|cars)\/([a-z0-9-]+)/);
  const blogPostMatch = currentPath.match(/\/(naujienos|blog)\/(.+)/);
  
  let ltUrl = ltPath;
  let enUrl = enPath;
  
  if (!ltUrl && !enUrl) {
    if (carDetailMatch) {
      const slug = carDetailMatch[2];
      // Slugs already contain language-specific versions
      // For now, keep same slug structure for both languages
      ltUrl = `/automobiliai/${slug}`;
      enUrl = `/cars/${slug}`;
    } else if (blogPostMatch) {
      const slug = blogPostMatch[2];
      ltUrl = `/naujienos/${slug}`;
      enUrl = `/blog/${slug}`;
    } else {
      ltUrl = reversePathMap[currentPath] || currentPath;
      enUrl = pathMap[currentPath] || currentPath;
    }
  }

  const baseUrl = 'https://carbonus.lt';

  return (
    <Helmet>
      <link rel="alternate" hrefLang="lt" href={`${baseUrl}${ltUrl}`} />
      <link rel="alternate" hrefLang="en" href={`${baseUrl}${enUrl}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${ltUrl}`} />
    </Helmet>
  );
};
