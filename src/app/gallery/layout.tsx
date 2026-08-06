import type { Metadata } from 'next';

// The gallery page is a client component and cannot export metadata itself,
// so the title and description live here instead of inheriting the homepage's.
export const metadata: Metadata = {
  title: 'Community & Impact Gallery',
  description:
    'Keynote speaking, fundraising, and STEM mentorship supporting clean water and education in Samburu, Kenya, including the Splash Bash and Run for Water events.',
  alternates: { canonical: '/gallery' },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
