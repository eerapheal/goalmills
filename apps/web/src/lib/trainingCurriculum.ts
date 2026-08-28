import { TrainingModuleItem } from '@goalmills/types';

export const GOALMILLS_TRAINING_MODULES: TrainingModuleItem[] = [
  {
    id: 'sports_writing',
    title: 'Sports Article Writing & Match Storytelling',
    category: 'Writing & Journalism',
    description:
      'Learn the GoalMills house style for writing high-impact match previews, match reports, tactical breakdowns, player spotlights, and evergreen sports features.',
    weightPercent: 15,
    checklist: [
      'Master the inverted pyramid structure for breaking sports news',
      'Write compelling, factual sports headlines and lead paragraphs',
      'Draft a comprehensive 600-word football match preview with team news',
      'Draft a rapid post-match analysis report within 20 minutes of final whistle',
      'Produce an evergreen player profile story highlighting stats and career trajectory',
    ],
    resources: [
      'GoalMills Editorial Style Guide v1.0',
      'Match Report Templates (Football, Cricket, NBA, Tennis)',
    ],
  },
  {
    id: 'sports_research_factcheck',
    title: 'Sports Research, Verification & Fact-Checking',
    category: 'Writing & Journalism',
    description:
      'Develop rigorous verification standards for transfer rumours, injury updates, manager quotes, club statements, and statistical records.',
    weightPercent: 15,
    checklist: [
      'Learn Tier-1, Tier-2, and Tier-3 source hierarchy in football journalism',
      'Verify player injuries and team news using official press conferences and club releases',
      'Distinguish legitimate transfer exclusives from social media clickbait rumours',
      'Fact-check historical sports statistics, head-to-head records, and referee allocations',
      'Maintain an internal sources and reference verification log for all published claims',
    ],
    resources: [
      'GoalMills Source Verification Checklist',
      'Official Sports Data Providers & Trust Matrix',
    ],
  },
  {
    id: 'journalism_editorial_standards',
    title: 'Journalism & Editorial Standards',
    category: 'Writing & Journalism',
    description:
      'Master grammar, punctuation, legal compliance, defamation avoidance, objective reporting, and editor proofreading workflows.',
    weightPercent: 15,
    checklist: [
      'Understand copyright laws and safe media embedding procedures',
      'Avoid sensitive allegations, unsubstantiated claims, and libelous language',
      'Implement active voice and eliminate editorial fluff from sports copy',
      'Master the 12-point pre-publishing proofreading checklist',
      'Conduct peer reviews and handle editorial feedback constructively',
    ],
    resources: [
      'Sports Journalism Legal & Ethics Handbook',
      'Pre-Publishing Quality Control Guide',
    ],
  },
  {
    id: 'seo_optimization',
    title: 'Sports Search Engine Optimization (SEO)',
    category: 'Writing & Journalism',
    description:
      'Optimize sports articles for Google Search, Google News, and Discover with high-intent keywords, metadata, structured headings, and internal linking.',
    weightPercent: 10,
    checklist: [
      'Conduct keyword research for trending fixtures and transfer storylines',
      'Format articles with H1, H2, H3 hierarchy, meta descriptions, and clean URLs',
      'Optimize image alt tags, captions, and file names for search indexing',
      'Implement internal linking to GoalMills team pages, league tables, and related articles',
      'Apply Google News and Google Discover best practices for sports publishers',
    ],
    resources: [
      'GoalMills Sports SEO Playbook',
      'Google Discover Optimization Blueprint',
    ],
  },
  {
    id: 'content_planning_breaking',
    title: 'Content Planning & Breaking News Operations',
    category: 'Writing & Journalism',
    description:
      'Manage daily sports calendar workflows, monitor real-time sports wires, and coordinate rapid coverage for urgent breaking developments.',
    weightPercent: 10,
    checklist: [
      'Build a weekly sports editorial calendar based on upcoming match schedules',
      'Set up Google Alerts, Twitter lists, and news aggregators for instant wire alerts',
      'Execute a 5-minute breaking news bulletin publication workflow',
      'Update rolling live blogs during transfer deadline day and major tournaments',
      'Coordinate with the social media desk for synchronized breaking alerts',
    ],
    resources: [
      'Weekly Sports Calendar Template',
      'Breaking News Fast-Response Protocol',
    ],
  },
  {
    id: 'matchday_coverage',
    title: 'Live Matchday Coverage & Live Text Commentary',
    category: 'Writing & Journalism',
    description:
      'Deliver real-time minute-by-minute text commentary, halftime updates, live score tracking, and immediate reaction pieces.',
    weightPercent: 10,
    checklist: [
      'Set up live text commentary 30 minutes before kickoff with confirmed starting XIs',
      'Craft engaging minute-by-minute updates during high-intensity passages of play',
      'Deliver rapid halftime analysis and statistical infographics',
      'Publish instant full-time match reports and player ratings within 15 minutes',
      'Curate fan reactions and viral match clips within legal guidelines',
    ],
    resources: [
      'Live Matchday Coverage Playbook',
      'Player Ratings Scale & Criteria',
    ],
  },
  {
    id: 'social_community_management',
    title: 'Social Media & Community Engagement',
    category: 'Growth & Operations',
    description:
      'Grow and engage the GoalMills audience across X, Facebook, Instagram, TikTok, WhatsApp, and YouTube with interactive polls, discussions, and responsive community care.',
    weightPercent: 10,
    checklist: [
      'Write platform-tailored social headlines and hooks that drive conversation',
      'Monitor and respond professionally to user comments, mentions, and DMs daily',
      'Create interactive match polls, quizzes, and debate threads',
      'Maintain GoalMills brand voice while avoiding online arguments or offensive behavior',
      'Build and distribute daily highlights to GoalMills WhatsApp and Telegram channels',
    ],
    resources: [
      'GoalMills Social Media Guidelines & Brand Voice',
      'Community Moderation & Crisis Response Protocol',
    ],
  },
  {
    id: 'canva_graphic_design',
    title: 'Canva Sports Graphic Design & Visual Branding',
    category: 'Design & Video',
    description:
      'Design high-converting sports graphics following GoalMills brand colors (Navy #001f3f, Gold #ffd700, Slate), typography, and templates.',
    weightPercent: 10,
    checklist: [
      'Master GoalMills brand palette, fonts, badges, and watermark placement in Canva',
      'Create breaking news social quote cards and transfer announcement cards',
      'Design matchday fixture preview cards and full-time scoreline graphics',
      'Produce player statistics comparison infographics and tournament brackets',
      'Design eye-catching, high-CTR YouTube thumbnails with crisp subject cutouts',
    ],
    resources: [
      'GoalMills Canva Brand Kit & Master Templates',
      'Sports Graphic Design Best Practices',
    ],
  },
  {
    id: 'short_form_video',
    title: 'Short-Form Video Production (Reels, TikTok, Shorts)',
    category: 'Design & Video',
    description:
      'Script, voice, edit, caption, and publish viral vertical sports videos for Instagram Reels, TikTok, and YouTube Shorts.',
    weightPercent: 10,
    checklist: [
      'Write 30-to-60 second high-hook vertical video scripts for trending sports stories',
      'Record clear voiceovers with energetic pacing and proper pronunciation',
      'Edit short-form videos with dynamic pacing, sound effects, and animated captions',
      'Select royalty-free or platform-licensed audio tracks compliant with copyright rules',
      'Repurpose long-form website articles into 3 distinct vertical video formats',
    ],
    resources: [
      'Short-Form Video Scripting Frameworks',
      'Vertical Video Editing Masterclass',
    ],
  },
  {
    id: 'audience_growth_analytics',
    title: 'Audience Growth, Traffic Analysis & Performance Insights',
    category: 'Growth & Operations',
    description:
      'Track pageviews, session duration, click-through rates, social impressions, follower growth, and video retention to refine content strategy.',
    weightPercent: 5,
    checklist: [
      'Understand key web metrics: Pageviews, Unique Visitors, Bounce Rate, Time on Page',
      'Analyze social engagement rates and identify top-performing content formats',
      'Evaluate video analytics: Hook retention, average view duration, share rate',
      'Produce a weekly content performance report with actionable recommendations',
      'Iterate on underperforming topics using data-driven headline and thumbnail tweaks',
    ],
    resources: [
      'GoalMills Analytics Dashboard Guide',
      'Weekly Growth Report Framework',
    ],
  },
  {
    id: 'repurposing_newsroom_ops',
    title: 'Content Repurposing & Newsroom Operations',
    category: 'Growth & Operations',
    description:
      'Master the Learn → Create → Publish → Submit → Review → Improve workflow, daily 5:00 PM stand-ups, and multi-channel content syndication.',
    weightPercent: 5,
    checklist: [
      'Execute the multi-format syndication pipeline (Article → Graphic → Reel → Tweet)',
      'Prepare and submit the daily end-of-day content report with verified links',
      'Participate actively in the daily 5:00 PM WAT newsroom stand-up meeting',
      'Incorporate editorial review notes and corrections into next-day assignments',
      'Complete the 30-day comprehensive sports media transition assessment',
    ],
    resources: [
      'Newsroom Daily Workflow SOP',
      'Daily Reporting & Standup Checklist',
    ],
  },
];

export const OFFICIAL_SCORECARD_METRICS = [
  { key: 'journalism', name: 'Journalism & News Sense', weight: 15 },
  { key: 'writing', name: 'Writing Quality & Storytelling', weight: 15 },
  { key: 'research', name: 'Research & Fact-Checking Accuracy', weight: 15 },
  { key: 'seo', name: 'SEO & Search Optimization', weight: 10 },
  { key: 'social', name: 'Social Media & Community Engagement', weight: 10 },
  { key: 'graphics', name: 'Canva Graphic Design & Visuals', weight: 10 },
  { key: 'video', name: 'Short-Form Video & Multimedia', weight: 10 },
  { key: 'discipline', name: 'Publishing Discipline & Speed', weight: 5 },
  { key: 'analytics', name: 'Analytics & Performance Awareness', weight: 5 },
  { key: 'teamwork', name: 'Teamwork, Reporting & Standups', weight: 5 },
];
