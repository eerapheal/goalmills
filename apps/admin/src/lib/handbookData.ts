export interface HandbookSection {
  id: string;
  partNumber: number | string;
  title: string;
  category:
    | 'Curriculum'
    | 'Journalism'
    | 'SEO'
    | 'Social'
    | 'Design'
    | 'Video'
    | 'Operations'
    | 'Monetization';
  summary: string;
  keyPoints: string[];
  template?: {
    name: string;
    content: string;
  };
  checklist?: string[];
  contentMarkdown: string;
}

export const GOALMILLS_HANDBOOK_SECTIONS: HandbookSection[] = [
  {
    id: 'curriculum-30day',
    partNumber: 'Curriculum',
    title: '30-Day Sports Media Employee Training Curriculum',
    category: 'Curriculum',
    summary:
      'Standardized 30-day onboarding program with daily 5:00 PM stand-ups, phased progression from observation to independent newsroom operation, and 100-point evaluation criteria.',
    keyPoints: [
      'Model: Learn → Create → Publish → Submit → Review → Improve',
      'Daily 5:00 PM – 5:30 PM WAT Google Meet stand-up is mandatory',
      'Daily minimum: Lesson, Research, Content, Publication, Report, Standup',
      '100-point score matrix covering Research (15), Accuracy (15), Writing (15), SEO (10), Social (10), Graphics (10), Video (10), Discipline (5), Analytics (5), Teamwork (5)',
      'Certification Tiers: 90–100 (Advanced), 80–89 (Professional), 70–79 (Junior), <70 (Retraining)',
    ],
    template: {
      name: 'Daily Staff Report Template',
      content: `==================================================
GOALMILLS DAILY STAFF REPORT
==================================================
STAFF NAME: 
DATE: 
TRAINING DAY (#1–30): 
TODAY'S LESSON STUDIED: 
__________________________________________________
WHAT I LEARNED:
1. 
2. 
3. 

CONTENT PRODUCED:
- ARTICLE TITLE: 
  URL: 
- SEO FOCUS KEYWORD: 
- GRAPHIC ASSET URL: 
- SOCIAL POST URL (X/FB/IG/TikTok): 

SOURCES USED & VERIFIED:
1. 
2. 

WHAT WENT WELL:
BIGGEST CHALLENGE ENCOUNTERED:
CORRECTIONS COMPLETED FROM PREVIOUS FEEDBACK:
WHAT I WILL IMPROVE TOMORROW:
==================================================`,
    },
    checklist: [
      'Daily lesson studied before 10:00 AM',
      'At least one piece of original verified content produced',
      'Links published to website and social channels',
      'Daily report filed before 4:45 PM WAT',
      'Attended 5:00 PM WAT daily stand-up',
    ],
    contentMarkdown: `### GoalMills Sports Media Academy
The 30-day program transitions new hires from learners into independent sports journalists and digital creators.

#### Week-by-Week Roadmap:
- **Week 1 (Days 1–7): Sports Journalism Foundation** (100% Supervision, Inverted pyramid, Fact-checking, Headlines, SEO).
- **Week 2 (Days 8–14): Content Strategy & Social Media** (High supervision, Platform mechanics, Community management, Multi-channel syndication).
- **Week 3 (Days 15–21): Canva Visuals + Video Production** (Moderate supervision, Brand kits, Matchday templates, Vertical short-form scripts, YouTube).
- **Week 4 (Days 22–30): Professional Newsroom & Independence** (Light supervision, Live matchday operations, Crisis management, Independent newsroom operations, Final certification exam).`,
  },
  {
    id: 'part-1-business-fundamentals',
    partNumber: 1,
    title: 'Understanding the Sports Media Business in Full Detail',
    category: 'Operations',
    summary:
      'A sports website is not just a blog; it is a media business, traffic flywheel, and content distribution ecosystem.',
    keyPoints: [
      'Transform sports events into multi-format content packages (1 match → 15–30 pieces)',
      'The real long-term asset is not individual articles, but audience, authority, and brand loyalty',
      'Building 4 Core Assets: Content Library, Audience, Brand, and Distribution Channels',
      'Standard Content Mix: 35% Breaking, 25% SEO/Evergreen, 20% Match Coverage, 10% Analysis, 10% Features',
    ],
    contentMarkdown: `### The Sports Media Flywheel
Transform raw sporting events and verified leads into an ongoing loop of Discovery → Attention → Engagement → Retention → Revenue. Every piece of published journalism acts as an entry point into the GoalMills ecosystem.`,
  },
  {
    id: 'part-2-niche-audience',
    partNumber: 2,
    title: 'Choosing & Defining Your Sports Niche',
    category: 'Operations',
    summary:
      'Avoid the mistake of being too broad. Focus on a football-first model with distinctive African and Nigerian coverage.',
    keyPoints: [
      'Football-first strategy: 70% Football (EPL, Champions League, AFCON, Nigerian stars abroad) + 30% Other sports (NBA, Cricket, Tennis)',
      'Niche selection formula: Knowledge + Audience Demand + Competition Opportunity + Monetization Potential',
      'Clear audience personas: The Daily Fan, The Analyst, The Local Supporter, The Social Consumer',
    ],
    contentMarkdown: `### Content Pillars & Geographic Strategy
Own the African perspective on global football and the definitive coverage of Nigerian athletes in Europe. This provides a clear competitive edge against generic global publishers.`,
  },
  {
    id: 'part-3-website-architecture',
    partNumber: 3,
    title: 'Content Categories & Website Content Architecture',
    category: 'Journalism',
    summary:
      'Design an entity-first website architecture with permanent hubs for competitions, clubs, players, and matches.',
    keyPoints: [
      'Entity Hierarchy: Sport → Competition → Club / Team → Player / Match → Article',
      'Category vs Tag: Categories are broad content hubs; tags represent specific entities and relational connections',
      'Stable URL structure with crawlable HTML links and BreadcrumbList markup',
      'Connect sports data API directly into match centers and player profiles',
    ],
    contentMarkdown: `### The Entity-First Platform
Every article should connect back to its central entities (Player, Team, Competition, Match). This improves user discovery, reduces bounce rate, and establishes topical authority for Google search crawlers.`,
  },
  {
    id: 'part-4-news-discovery',
    partNumber: 4,
    title: 'Sports News Discovery, Research & Verification System',
    category: 'Journalism',
    summary:
      'Build a rigorous newsroom sourcing hierarchy and verification process to prevent false claims and rumours.',
    keyPoints: [
      '5-Tier Sourcing Pyramid: Tier 1 (Official) → Tier 2 (Top Journalists) → Tier 3 (Specialist Media) → Tier 4 (Social) → Tier 5 (Fan Accounts)',
      'The Two-Source Rule: Critical breaking claims require primary verification or 2 independent trusted reports',
      'Never confuse AI generation with factual evidence—AI assists with drafting, humans verify facts',
      'Track breaking status: Unverified 🔴, Developing 🟠, Reported 🟡, Confirmed 🟢',
    ],
    checklist: [
      'Primary source checked (club/league official channel)',
      'Second independent source confirmed',
      'Quotes verified against original press conference audio/video',
      'Correct spellings of player names, clubs, and figures',
    ],
    contentMarkdown: `### Newsroom Quality Principle
"Speed gets attention. Accuracy builds the brand. Originality builds authority. Consistency builds traffic. Never sacrifice all four just to be first."`,
  },
  {
    id: 'part-5-article-writing',
    partNumber: 5,
    title: 'How to Write Professional Sports Articles From Scratch',
    category: 'Journalism',
    summary:
      'Comprehensive sports journalism writing guide: inverted pyramid, 3-sentence intros, quote sandwiches, and data integration.',
    keyPoints: [
      'Inverted pyramid: Most important news in lead paragraph, followed by details, evidence, context, and analysis',
      '3-Sentence Intro Formula: What happened? + What was key factor? + Why does it matter?',
      'One-idea-per-paragraph rule (2–4 sentences per paragraph for mobile readability)',
      'The "Quote Sandwich": Context → Direct Quote → Tactical/Practical Explanation',
      'The "So What?" Test: Turn every raw statistic into meaningful analytical insight',
    ],
    template: {
      name: 'Standard Match Report Structure',
      content: `[HEADLINE: Team A Score–Score Team B: Key Player/Event Inspires Decisive Victory]

[INTRODUCTION: 3-sentence lead covering result, match-defining player, and table consequences]

[FIRST HALF: Initial tactical approach, early pressure, and opening goal]

[TACTICAL SHIFT: How manager/players adjusted at halftime or key substitution]

[SECOND HALF & DECISIVE MOMENTS: Winning goals, key saves, defensive discipline]

[NUMBERS THAT MATTER: Statistical proof (possession, shots on target, xG, tackles)]

[WHAT IT MEANS: League table standing and tournament implications]

[WHAT'S NEXT: Upcoming fixture details and next challenge]`,
    },
    contentMarkdown: `### The Professional Writing Machine
Avoid writing thin fluff like "Football is a beautiful game..." Get straight to the decisive action, tactical reasoning, and consequence of the sporting event.`,
  },
  {
    id: 'part-6-social-distribution',
    partNumber: 6,
    title: 'Sports Social Media Posting & Distribution Management',
    category: 'Social',
    summary:
      'Multi-platform social distribution strategies tailored for X, Facebook, Instagram, TikTok, YouTube, and WhatsApp.',
    keyPoints: [
      'Never copy-paste identical captions across platforms; adapt to user behaviors',
      'X (Twitter): Fast wire alerts, live commentary, match stats, and debate threads',
      'Facebook: Fan discussions, contextual breakdowns, and community groups',
      'Instagram: Clean score graphics, 6-slide carousels, and high-impact visual stories',
      'TikTok & Reels: 30-second videos with instant hooks, kinetic captions, and storytelling',
      'WhatsApp Channel: Curated breaking alerts, lineups, and morning brief summaries',
    ],
    contentMarkdown: `### 80/20 Social Rule
Deliver 80% direct value natively within the social post and 20% traffic calls-to-action. This builds community trust and higher algorithmic distribution.`,
  },
  {
    id: 'part-7-canva-graphics',
    partNumber: 7,
    title: 'Canva Sports Graphic Design From Zero',
    category: 'Design',
    summary:
      'Build a professional sports media visual identity using consistent GoalMills brand palettes, typography hierarchy, and reusable templates.',
    keyPoints: [
      'Brand Palette: Deep Navy (#0B1220), White (#FFFFFF), GoalMills Green (#10B981), Alert Red (#EF4444), Gold (#F59E0B)',
      'Typography: Clean sans-serif pairings (Montserrat ExtraBold for headlines, Inter for body/stats)',
      'The 3-Second Test: Viewer must understand Who, What, and Why within 3 seconds',
      'Master Templates: Breaking News, Matchday, Starting XI, Full-Time Score, Player of Match, Stats Card, Transfer Watch, Carousels',
    ],
    checklist: [
      'Logo placed in consistent position (top-left or bottom-right)',
      'Safe margins maintained away from screen edges',
      'High-contrast text over dark gradient overlay',
      'Legitimate, rights-cleared imagery used',
      'Accurate scores, names, and team badges verified',
    ],
    contentMarkdown: `### Visual System Architecture
Establish a Canva Brand Kit so every graphic feels instantly recognizable as GoalMills before the user even reads the account handle.`,
  },
  {
    id: 'part-8-sports-seo',
    partNumber: 8,
    title: 'Sports SEO Foundations & Google Search Ecosystem',
    category: 'SEO',
    summary:
      'Capture high-volume sports search demand through search intent analysis, structured data, Google Trends, and Search Console.',
    keyPoints: [
      'Identify the 4 Search Intents: Informational, Navigational, Transactional, and Fresh-News Demand',
      'Head vs Medium vs Long-Tail keywords for sustainable search ranking growth',
      'Schema.org implementation for NewsArticle, SportsEvent, and BreadcrumbList',
      'Google Search Console performance analysis: Optimizing high-impression / low-CTR opportunities',
      'Avoiding duplicate thin articles: Update existing developing articles with timestamps rather than flooding separate URLs',
    ],
    contentMarkdown: `### Compounding Search Traffic
While social media provides immediate burst traffic, authoritative SEO creates a compounding engine that delivers thousands of daily readers continuously.`,
  },
  {
    id: 'part-13-monetization',
    partNumber: 13,
    title: 'Sports Website Monetization & Business Architecture',
    category: 'Monetization',
    summary:
      'Transform sports audience traffic into diversified, resilient business revenue streams.',
    keyPoints: [
      'Multiple Revenue Pillars: Programmatic Ads (Ad Manager), Direct Sponsorships, Affiliate Commerce, Pro Memberships, B2B Data APIs',
      'Direct Brand Packages: Matchday Center partners, Transfer Hub sponsors, Newsletter briefs',
      'Building a professional Media Kit with verifiable audience demographics and engagement stats',
      'Never compromise editorial integrity or disguise paid advertisements as independent news',
    ],
    contentMarkdown: `### The 3-Stage Monetization Plan
- **Stage 1 (0–10k Users):** Focus on content quality, SEO indexing, and audience acquisition.
- **Stage 2 (10k–100k Users):** Programmatic ads, newsletters, affiliate links, and initial brand sponsorships.
- **Stage 3 (100k+ Users):** Enterprise direct brand partnerships, GoalMills Pro membership, and B2B sports widgets.`,
  },
  {
    id: 'part-20-video-creation',
    partNumber: 20,
    title: 'Sports Video Content Creation (Shorts, Reels, YouTube)',
    category: 'Video',
    summary:
      'Produce faceless and presenter-led sports videos without copyright infringement using structured scripts, data boards, and voiceovers.',
    keyPoints: [
      'Strict Copyright Compliance: Never pirate or re-upload broadcast TV match clips',
      '30-Second Script Formula: 0–3s Hook → 3–10s What Happened → 10–20s Tactical/Data Reason → 20–27s Why It Matters → 27–30s CTA',
      'Long-Form YouTube: 5–10 minute tactical analysis with structured chapters and high-CTR thumbnails',
      'Visual dynamism: Keep visual changes every 3–5 seconds (stills, passing maps, animated charts, captions)',
    ],
    template: {
      name: '30-Second Short Script Template',
      content: `[0–3s HOOK]: "Arsenal just exposed Chelsea's biggest tactical flaw."

[3–10s WHAT HAPPENED]: "Mikel Arteta's side came from behind to win 3-1 at the Emirates, but the turning point happened right after halftime."

[10–20s TACTICAL REASON]: "Arsenal pressed higher and won possession 11 times in Chelsea's defensive third, isolating their full-backs."

[20–27s WHY IT MATTERS]: "The victory keeps Arsenal firmly at the top of the Premier League title race while leaving Chelsea searching for answers."

[27–30s CTA]: "Follow GoalMills for daily football tactical analysis."`,
    },
    contentMarkdown: `### The Faceless Video Production Pipeline
Combine voiceover recording, clean kinetic captions, licensed photos, tactical animation boards, and relevant stats to produce viral sports videos efficiently.`,
  },
  {
    id: 'part-21-newsroom-ops',
    partNumber: 21,
    title: 'Building a Scalable Sports Newsroom & Operations',
    category: 'Operations',
    summary:
      'Organize editorial workflows, story queues, role-based responsibilities, error tracking, and editorial style guides.',
    keyPoints: [
      'Newsroom Pipeline: Discover → Verify → Assign → Research → Write → Edit → SEO → Publish → Graphics → Social → Analyze',
      'Maintain an Editorial Mistake Database to turn errors into training lessons',
      'Public Editorial Policy & Corrections Page to build long-term journalistic trust',
      'Role-based workflow: Writers draft, Editors review/approve, Social managers distribute',
    ],
    contentMarkdown: `### The Golden Rule of GoalMills
"Speed gets you noticed. Accuracy keeps you trusted. Originality makes you valuable. Consistency makes you grow. Never sacrifice accuracy for speed."`,
  },
];
