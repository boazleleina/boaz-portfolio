/**
 * Single source of truth for identity, positioning, and contact details.
 *
 * Everything user-facing (title tag, meta description, hero, about, contact,
 * resume page, JSON-LD) reads from here, so the site states one consistent
 * position instead of four different ones. If a claim changes, change it here.
 */

export const SITE_URL = 'https://boazleleina.com';

export const NAME = 'Boaz Leleina';

/**
 * The one title. Mirror this verbatim in LinkedIn headline and resume header.
 * Leads with "Backend Engineer": at 0-3 years, "platform" in the title narrows
 * the funnel to a small number of senior-weighted reqs, while backend is the
 * category most open roles are actually filed under.
 */
export const TITLE = 'Backend Engineer';

/** Qualifier appended in title tags and the resume header. */
export const FOCUS = 'Python · AWS · LLM systems';

/** Used as the <title> on the homepage and in JSON-LD. */
export const TITLE_TAG = `${NAME} — ${TITLE} (Python, AWS, LLM systems)`;

/**
 * Meta description. Deliberately avoids "distributed systems" and "machine
 * learning": the shipped evidence is single-node services, cloud automation,
 * and LLM application plumbing. Claims here must be funded by a project.
 */
export const META_DESCRIPTION =
  'Backend engineer building Python and FastAPI services, AWS cost automation, and LLM systems that act safely. MS Computer Science, August 2026. Available now, based in the United States and open to relocation.';

/** One-line capability pitch. Opens the About section. */
export const CAPABILITY =
  'I build backend systems that automate irreversible operations safely: cloud cost remediation, agentic pipelines, and local-first observability tooling.';

/**
 * Hero bio. Says the same thing as CAPABILITY in different words: the two sit
 * a screen apart, and repeating a sentence verbatim reads like a template.
 */
export const HERO_BIO =
  'Python, FastAPI, and AWS services for the operations you cannot undo, with a human in the loop wherever deletion is on the line.';

/** The human line. Kept short and separate so it never competes with the pitch. */
export const HUMAN_LINE = 'Grew up in Samburu, Kenya. Builds in the United States.';

export const EMAIL = 'boaz@boazleleina.com';

export const LOCATION = {
  country: 'US',
  label: 'the United States',
  note: 'Open to relocation, hybrid, or remote, anywhere in the US.',
};

export const AVAILABILITY = {
  /** Short form for the hero widget and navbar. */
  short: 'Available now',
  /** Full form with the graduation date, so nobody assumes a 2027 start. */
  full: 'Available now — MS Computer Science, August 2026',
  graduation: 'August 2026',
  workAuth: 'US work authorized',
};

/**
 * Primary lane. This is what most open roles are titled, so it leads.
 */
export const PRIMARY_ROLES = 'backend and API engineering roles';

/**
 * Specialisms the shipped work evidences. Presented as additional fit rather
 * than as the filter — leading with these narrowed the funnel to a handful of
 * senior-weighted reqs.
 */
// Written to read correctly mid-sentence, so no call site lowercases them and
// mangles "FinOps" into "finops" or "AI" into "ai".
export const TARGET_TEAMS = [
  'platform and infrastructure',
  'developer tools',
  'cloud cost and FinOps',
  'AI infrastructure',
];

/** Social links. `url: null` hides the icon rather than shipping a dead link. */
export const SOCIALS: { name: string; url: string | null; label: string }[] = [
  { name: 'GitHub', url: 'https://github.com/boazleleina', label: 'GitHub profile' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/boaz-leleina/', label: 'LinkedIn profile' },
  { name: 'X', url: 'https://x.com/boaz_leleina', label: 'X profile' },
  { name: 'Instagram', url: 'https://www.instagram.com/siliconmoran', label: 'Instagram profile' },
];

/** Feeds JSON-LD `knowsAbout`. Keep to things a project or job demonstrates. */
export const KNOWS_ABOUT = [
  'Backend engineering',
  'Python',
  'FastAPI',
  'Django',
  'PostgreSQL',
  'AWS',
  'Cloud cost optimization',
  'FinOps',
  'Hexagonal architecture',
  'LLM application engineering',
  'Observability',
  'REST API design',
];
