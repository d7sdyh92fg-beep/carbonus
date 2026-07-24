import { Helmet } from 'react-helmet';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export const FAQSchema = ({ faqs }: FAQSchemaProps) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

interface ArticleSchemaProps {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image: string;
  url: string;
}

export const ArticleSchema = ({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url
}: ArticleSchemaProps) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": image.startsWith('http') ? image : `https://carbonus.lt${image}`,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Carbonus",
      "logo": {
        "@type": "ImageObject",
        "url": "https://carbonus.lt/__l5e/assets-v1/ca2ce61e-2fe8-4b83-805a-6d90ebedc076/carbonus_logo_green_white_transparent.png"
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  brand: string;
  price: string;
  currency?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
}

export const ProductSchema = ({
  name,
  description,
  image,
  brand,
  price,
  currency = "EUR",
  availability = "https://schema.org/InStock",
  rating,
  reviewCount,
  category
}: ProductSchemaProps) => {
  // Extract numeric price - handle formats like "nuo 30 EUR", "30-40 EUR", "30 EUR"
  const extractPrice = (priceStr: string): string => {
    const match = priceStr.match(/\d+/);
    return match ? match[0] : '30'; // Default to 30 if no number found
  };

  const schemaData: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": image.startsWith('http') ? image : `https://carbonus.lt${image}`,
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "offers": {
      "@type": "Offer",
      "url": typeof window !== 'undefined' ? window.location.href : 'https://carbonus.lt',
      "priceCurrency": currency,
      "price": extractPrice(price),
      "availability": availability,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "seller": {
        "@type": "Organization",
        "name": "Carbonus"
      }
    }
  };

  if (category) {
    schemaData.category = category;
  }

  if (rating && reviewCount) {
    schemaData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": rating.toString(),
      "reviewCount": reviewCount.toString()
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `https://carbonus.lt${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo: string;
  description: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  sameAs?: string[];
}

export const OrganizationSchema = ({
  name,
  url,
  logo,
  description,
  telephone,
  email,
  address,
  sameAs
}: OrganizationSchemaProps) => {
  const schemaData: any = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description
  };

  if (telephone) schemaData.telephone = telephone;
  if (email) schemaData.email = email;
  if (address) schemaData.address = { "@type": "PostalAddress", ...address };
  if (sameAs && sameAs.length > 0) schemaData.sameAs = sameAs;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};
