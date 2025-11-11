// Google Analytics 4 Event Tracking Utilities

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Check if Google Analytics is loaded
const isGALoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Generic event tracking
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (!isGALoaded()) {
    console.log('GA4 Event (not loaded):', eventName, parameters);
    return;
  }
  
  window.gtag?.('event', eventName, parameters);
  console.log('GA4 Event:', eventName, parameters);
};

// Page view tracking
export const trackPageView = (pageTitle: string, pagePath: string) => {
  trackEvent('page_view', {
    page_title: pageTitle,
    page_path: pagePath,
    page_location: window.location.href
  });
};

// E-commerce Events

// View car list
export const trackViewCarList = (cars: any[]) => {
  trackEvent('view_item_list', {
    item_list_id: 'car_fleet',
    item_list_name: 'Available Cars',
    items: cars.map((car, index) => ({
      item_id: car.id,
      item_name: car.name,
      item_category: car.category,
      price: parseFloat(car.price?.replace(/[^0-9]/g, '') || '30'),
      index: index
    }))
  });
};

// View car details
export const trackViewCar = (car: {
  id: string;
  name: string;
  category: string;
  price: string;
  year?: string;
}) => {
  const price = parseFloat(car.price?.replace(/[^0-9]/g, '') || '30');
  
  trackEvent('view_item', {
    currency: 'EUR',
    value: price,
    items: [{
      item_id: car.id,
      item_name: car.name,
      item_category: car.category,
      item_variant: car.year || '',
      price: price
    }]
  });
};

// Begin checkout (when user selects dates)
export const trackBeginCheckout = (booking: {
  carId: string;
  carName: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  totalAmount: number;
}) => {
  trackEvent('begin_checkout', {
    currency: 'EUR',
    value: booking.totalAmount,
    rental_days: booking.rentalDays,
    start_date: booking.startDate,
    end_date: booking.endDate,
    items: [{
      item_id: booking.carId,
      item_name: booking.carName,
      price: booking.totalAmount / booking.rentalDays,
      quantity: booking.rentalDays
    }]
  });
};

// Purchase (booking complete)
export const trackPurchase = (transaction: {
  transactionId: string;
  carId: string;
  carName: string;
  rentalDays: number;
  totalAmount: number;
  paymentMethod?: string;
}) => {
  trackEvent('purchase', {
    transaction_id: transaction.transactionId,
    currency: 'EUR',
    value: transaction.totalAmount,
    payment_method: transaction.paymentMethod || 'card',
    items: [{
      item_id: transaction.carId,
      item_name: transaction.carName,
      price: transaction.totalAmount / transaction.rentalDays,
      quantity: transaction.rentalDays
    }]
  });
};

// Lead Generation Events

// Generate lead (any lead capture)
export const trackGenerateLead = (method: string, value?: number) => {
  trackEvent('generate_lead', {
    currency: 'EUR',
    value: value || 50,
    method: method
  });
};

// Contact events
export const trackContact = (method: 'phone' | 'whatsapp' | 'email', contact: string) => {
  trackEvent('contact', {
    method: method,
    contact_info: contact
  });
  
  // Also track as conversion
  trackEvent(`${method}_click`, {
    contact_info: contact
  });
};

// Phone call
export const trackPhoneCall = (phoneNumber: string) => {
  trackContact('phone', phoneNumber);
  trackGenerateLead('phone', 30);
};

// WhatsApp message
export const trackWhatsAppClick = (phoneNumber: string) => {
  trackContact('whatsapp', phoneNumber);
  trackGenerateLead('whatsapp', 25);
};

// Email click
export const trackEmailClick = (email: string) => {
  trackContact('email', email);
  trackGenerateLead('email', 15);
};

// Contact form submission
export const trackContactForm = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  subject?: string;
}) => {
  trackEvent('contact_form_submit', {
    form_name: 'contact_form',
    user_name: `${formData.firstName} ${formData.lastName}`,
    user_email: formData.email,
    subject: formData.subject || 'General Inquiry'
  });
  trackGenerateLead('contact_form', 20);
};

// User Engagement Events

// Search
export const trackSearch = (searchTerm: string, location: string) => {
  trackEvent('search', {
    search_term: searchTerm,
    search_location: location
  });
};

// Filter cars
export const trackFilterCars = (filterType: string, filterValue: string) => {
  trackEvent('filter_cars', {
    filter_type: filterType,
    filter_value: filterValue
  });
};

// View blog post
export const trackViewBlogPost = (article: {
  id: string;
  title: string;
  category: string;
}) => {
  trackEvent('view_blog_post', {
    article_id: article.id,
    article_title: article.title,
    article_category: article.category
  });
};

// Read article (30+ seconds on page)
export const trackReadArticle = (article: {
  id: string;
  title: string;
  timeSpent: number;
}) => {
  if (article.timeSpent >= 30) {
    trackEvent('read_article', {
      article_id: article.id,
      article_title: article.title,
      time_spent: article.timeSpent,
      engagement_level: article.timeSpent > 120 ? 'high' : 'medium'
    });
  }
};

// Newsletter signup
export const trackNewsletterSignup = (method: string, email: string) => {
  trackEvent('newsletter_signup', {
    method: method,
    user_email: email
  });
};

// File download
export const trackFileDownload = (fileName: string, fileType: string) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType
  });
};

// Outbound link click
export const trackOutboundClick = (url: string, linkText: string) => {
  trackEvent('outbound_click', {
    link_url: url,
    link_text: linkText
  });
};

// Social share
export const trackSocialShare = (platform: string, content: string) => {
  trackEvent('share', {
    method: platform,
    content_type: content
  });
};

// User registration/login
export const trackUserAuth = (action: 'login' | 'signup', method: string) => {
  trackEvent(action, {
    method: method
  });
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string, pagePath: string) => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    page_path: pagePath,
    fatal: false
  });
};

// Scroll depth
export const trackScrollDepth = (percentage: number, pagePath: string) => {
  if (percentage === 25 || percentage === 50 || percentage === 75 || percentage === 100) {
    trackEvent('scroll', {
      percent_scrolled: percentage,
      page_path: pagePath
    });
  }
};

// Time on page
export const trackTimeOnPage = (timeSpent: number, pagePath: string) => {
  trackEvent('user_engagement', {
    engagement_time_msec: timeSpent * 1000,
    page_path: pagePath
  });
};

// Custom dimensions
export const setUserProperties = (properties: {
  userType?: 'new' | 'returning' | 'vip';
  customerSegment?: 'individual' | 'corporate' | 'tourist';
  language?: 'lt' | 'en';
}) => {
  if (!isGALoaded()) return;
  
  window.gtag?.('set', 'user_properties', properties);
};

// Set session properties
export const setSessionProperties = (properties: {
  trafficSourceDetail?: string;
  geographicLocation?: string;
}) => {
  if (!isGALoaded()) return;
  
  window.gtag?.('set', properties);
};

export default {
  trackEvent,
  trackPageView,
  trackViewCarList,
  trackViewCar,
  trackBeginCheckout,
  trackPurchase,
  trackGenerateLead,
  trackContact,
  trackPhoneCall,
  trackWhatsAppClick,
  trackEmailClick,
  trackContactForm,
  trackSearch,
  trackFilterCars,
  trackViewBlogPost,
  trackReadArticle,
  trackNewsletterSignup,
  trackFileDownload,
  trackOutboundClick,
  trackSocialShare,
  trackUserAuth,
  trackError,
  trackScrollDepth,
  trackTimeOnPage,
  setUserProperties,
  setSessionProperties
};
