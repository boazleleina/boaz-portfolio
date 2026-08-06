import type { Metadata } from 'next';
import './globals.css';
import ScrollToTop from '@/components/ScrollToTop';
import {
  AVAILABILITY,
  EMAIL,
  KNOWS_ABOUT,
  LOCATION,
  META_DESCRIPTION,
  NAME,
  SITE_URL,
  SOCIALS,
  TITLE,
  TITLE_TAG,
} from '@/data/profile';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE_TAG,
    // Child pages set only their own title; this appends the position.
    template: `%s — ${NAME}`,
  },
  description: META_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    siteName: NAME,
    title: TITLE_TAG,
    description: META_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: '/boaz-portrait-light.png', width: 1200, height: 630, alt: `${NAME}, ${TITLE}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE_TAG,
    description: META_DESCRIPTION,
  },
};

/**
 * Person schema so a search for "Boaz Leleina" resolves to this site rather
 * than to a scraped job board. Only claims that are true elsewhere on the page.
 */
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: NAME,
  url: SITE_URL,
  email: `mailto:${EMAIL}`,
  jobTitle: TITLE,
  description: META_DESCRIPTION,
  image: `${SITE_URL}/boaz-portrait-light.png`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: LOCATION.country,
  },
  alumniOf: [
    {
      '@type': 'CollegeOrUniversity',
      name: 'William Jessup University',
      description: `Master of Science, Computer Science (${AVAILABILITY.graduation})`,
    },
    {
      '@type': 'CollegeOrUniversity',
      name: 'KCA University',
      description: 'B.S., Software Development',
    },
  ],
  knowsAbout: KNOWS_ABOUT,
  sameAs: SOCIALS.filter((s) => s.url).map((s) => s.url),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
