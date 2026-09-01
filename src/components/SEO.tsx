import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
}

const DOMAIN = 'https://www.inmobiliariadelatlanticolasterrenas.com';

export default function SEO({
  title,
  description,
  canonicalPath = '',
  ogImage = '/hero_villa.jpg',
}: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | Inmobiliaria del Atlántico`;
    document.title = fullTitle;

    const setMetaTag = (name: string, content: string, isProperty: boolean = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setMetaTag('description', description);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', `${DOMAIN}${canonicalPath}`, true);
    setMetaTag('og:image', `${DOMAIN}${ogImage}`, true);
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', `${DOMAIN}${ogImage}`);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `${DOMAIN}${canonicalPath}`;
  }, [title, description, canonicalPath, ogImage]);

  return null;
}
