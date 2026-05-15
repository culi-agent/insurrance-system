import React from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

/**
 * SEO Component - Updates document title and meta tags
 * In production, use react-helmet-async for full meta management
 */
const SEOHead: React.FC<SEOHeadProps> = ({ title, description, keywords }) => {
  React.useEffect(() => {
    const fullTitle = `${title} | Bảo Hiểm Trực Tuyến`;
    document.title = fullTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    } else if (description) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && keywords) {
      metaKeywords.setAttribute('content', keywords);
    } else if (keywords) {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords;
      document.head.appendChild(meta);
    }
  }, [title, description, keywords]);

  return null;
};

export default SEOHead;
