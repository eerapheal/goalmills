import { CurriculumDayItem, TrainingModuleItem } from '@goalmills/types';

/**
 * GOALMILLS 30-DAY SPORTS MEDIA EMPLOYEE TRAINING CURRICULUM
 * Program: GoalMills Sports Media Academy
 * Duration: 30 working days
 * Daily stand-up: 5:00 PM–5:30 PM WAT (Google Meet)
 * Training model: Learn → Create → Publish → Submit → Review → Improve
 */

export const NEWSROOM_DAILY_TIMETABLE = [
  { time: '08:00 – 08:30', activity: 'Newsroom briefing / breaking story research' },
  { time: '08:30 – 10:00', activity: 'Assigned curriculum lesson & focused study' },
  { time: '10:00 – 12:00', activity: 'Content production (article drafting & fact-checking)' },
  { time: '12:00 – 13:00', activity: 'First publishing window (website cms & initial reviews)' },
  { time: '13:00 – 14:00', activity: 'Break & lunch' },
  { time: '14:00 – 16:00', activity: 'Second production & social distribution (graphics/video/reels)' },
  { time: '16:00 – 16:45', activity: 'Quality control, link testing & analytics check' },
  { time: '16:45 – 17:00', activity: 'Daily report submission & link logging' },
  { time: '17:00 – 17:30', activity: 'Google Meet Newsroom Stand-Up (5:00 PM – 5:30 PM WAT)' },
  { time: '17:30 onward', activity: 'Corrections & next-day assignment preparation' },
];

export const NEWSROOM_STANDUP_PROTOCOL = {
  time: '5:00 PM – 5:30 PM WAT',
  platform: 'Google Meet',
  meetUrl: 'https://meet.google.com/goalmills-newsroom',
  schedule: [
    { segment: '5:00 – 5:05', title: 'Attendance check & agenda briefing' },
    {
      segment: '5:05 – 5:15',
      title: 'Staff reports (What did I study? What did I create? What did I publish? What was my biggest challenge?)',
    },
    {
      segment: '5:15 – 5:25',
      title: 'Admin/Editor feedback (Best article, headline, graphic, post, video, biggest mistake & improvement)',
    },
    { segment: '5:25 – 5:30', title: 'Tomorrow’s assignments & matchday editorial priorities' },
  ],
  fourQuestions: [
    'What did I study today?',
    'What did I create today?',
    'What did I publish today?',
    'What was my biggest challenge today?',
  ],
};

export const DAILY_SCORECARD_RUBRICS = [
  { key: 'research', name: 'Sports Research & Verification', maxScore: 15, description: 'Primary and secondary source verification' },
  { key: 'accuracy', name: 'Factual Accuracy & Integrity', maxScore: 15, description: 'Zero factual errors, correct dates, names & stats' },
  { key: 'writing', name: 'Article Writing Quality', maxScore: 15, description: 'Structure, inverted pyramid, tone, and grammar' },
  { key: 'seo', name: 'Search Engine Optimization (SEO)', maxScore: 10, description: 'Keywords, metadata, H1/H2 structure, and internal links' },
  { key: 'socialMedia', name: 'Social Media Packaging', maxScore: 10, description: 'Platform tailoring (X, FB, IG, TikTok, YouTube)' },
  { key: 'graphicDesign', name: 'Canva Graphic & Visuals', maxScore: 10, description: 'GoalMills brand palette, clean typography & layout' },
  { key: 'creativity', name: 'Editorial Creativity & Hooks', maxScore: 10, description: 'Engaging headlines, angles, and audience hooks' },
  { key: 'publishingDiscipline', name: 'Publishing Discipline & Speed', maxScore: 5, description: 'Meeting publishing windows and submission deadlines' },
  { key: 'analyticsLearning', name: 'Analytics & Learning Awareness', maxScore: 5, description: 'Tracking performance and reflection quality' },
  { key: 'teamworkReporting', name: 'Teamwork & Standup Reporting', maxScore: 5, description: 'Clear daily reporting and stand-up participation' },
];

export const PERFORMANCE_RATINGS = [
  { min: 90, max: 100, label: 'Excellent', color: 'emerald', badge: '🏆 Outstanding' },
  { min: 80, max: 89, label: 'Very Good', color: 'blue', badge: '🌟 Very Good' },
  { min: 70, max: 79, label: 'Good', color: 'amber', badge: '👍 Good' },
  { min: 60, max: 69, label: 'Improvement Required', color: 'orange', badge: '⚠️ Needs Improvement' },
  { min: 0, max: 59, label: 'Remedial Training', color: 'red', badge: '❌ Remedial Training' },
];

export const CERTIFICATION_TIERS = [
  { min: 90, max: 100, title: 'GoalMills Certified Sports Media Professional — Advanced', summary: 'Can operate completely independently in the newsroom.' },
  { min: 80, max: 89, title: 'GoalMills Certified Sports Media Professional', summary: 'Can operate with limited editorial supervision.' },
  { min: 70, max: 79, title: 'GoalMills Certified Junior Sports Media Professional', summary: 'Can perform routine assignments with standard review.' },
  { min: 60, max: 69, title: 'Training Extension Required', summary: 'Requires an extra 1-2 weeks of focused training.' },
  { min: 0, max: 59, title: 'Not Ready for Independent Publishing', summary: 'Requires comprehensive retraining.' },
];

export const EDITORIAL_POLICIES = {
  approvalPolicy: [
    'Routine content: Employee may publish after 30-day certification.',
    'Editor approval strictly required for: Breaking news, transfer rumours, injury claims, death-related stories, legal allegations, controversial claims, financial claims, sensitive player stories, and copyright-sensitive media.',
  ],
  copyrightRule: [
    'Never assume: "It\'s on Google, therefore we can use it."',
    'Never assume: "I downloaded it from another sports page, therefore it\'s free."',
    'Never assume: "I added our logo, therefore it\'s ours."',
    'Do not download and re-upload broadcast footage without rights; use approved embeds or licensed material.',
  ],
  sourcePolicy: [
    'Every serious article must maintain a verifiable source trail (Primary Source & Secondary Source).',
    'Tier-1: Club statements, official league press releases, verified press conferences.',
    'Tier-2: Tier-1 sports journalists (Fabrizio Romano, David Ornstein, BBC, Reuters).',
  ],
  correctionPolicy: [
    'Step 1: Notify editor immediately upon finding an error.',
    'Step 2: Correct the article and social post immediately.',
    'Step 3: If material, add a clear editorial correction note.',
    'Step 4: Record the mistake in the Editorial Mistake Database.',
    'Step 5: Explain how the error occurred to prevent recurrence.',
  ],
  mistakeDatabaseCategories: [
    'Incorrect score',
    'Wrong player',
    'Wrong team',
    'Wrong date',
    'False transfer',
    'Unverified claim',
    'Fake quote',
    'Wrong statistic',
    'Grammar error',
    'Poor headline',
    'SEO error',
    'Copyright error',
    'Bad graphic',
    'Incorrect caption',
    'Broken link',
    'Duplicate story',
  ],
};

export const GOALMILLS_30_DAY_CURRICULUM: CurriculumDayItem[] = [
  // =========================================================================
  // WEEK 1 — SPORTS JOURNALISM FOUNDATION (Days 1–7)
  // =========================================================================
  {
    day: 1,
    week: 1,
    title: 'Introduction to GoalMills & Sports Article Writing Fundamentals',
    moduleKey: 'sports_writing',
    moduleTitle: 'Part 1: Sports Article Writing Fundamentals',
    objectives: [
      'Understand what modern sports journalism is',
      'Learn GoalMills mission, voice, and target audience',
      'Distinguish between news, opinion, and analysis',
      'Master the basic editorial workflow (Learn → Create → Publish → Submit → Review → Improve)',
    ],
    study: [
      'Read Part 1 Introduction: Sports Article Writing Fundamentals',
      'Analyze 3 top GoalMills articles for inverted pyramid structure',
    ],
    assignment: [
      'Brainstorm 10 sports story ideas (3 breaking news, 3 match stories, 2 evergreen, 2 tactical analysis)',
      'Select 1 real story and obtain editorial sign-off',
    ],
    production: [
      'Write 1 × 500–700 word sports news article with strong lead paragraph',
    ],
    social: [
      'Create 1 × X (Twitter) post with engaging hook',
      'Create 1 × Facebook post with conversation question',
    ],
    publish: [
      'Publish article to GoalMills website CMS',
      'Publish social posts to corresponding channels',
    ],
    submissionChecklist: [
      'Submit article URL before 4:45 PM WAT',
      'Submit X and Facebook URLs',
      'Provide 2 reliable sources for the story',
      'Log learnings and challenges in the daily submission form',
    ],
    adminReviewCriteria: [
      'Accuracy of facts and player names',
      'Inverted pyramid structure',
      'Grammar and spelling',
      'Catchy, non-clickbait headline',
    ],
    resources: ['GoalMills Editorial Style Guide v1.0', 'Inverted Pyramid Template'],
  },
  {
    day: 2,
    week: 1,
    title: 'Sports Research, Verification & Fact-Checking',
    moduleKey: 'sports_research_factcheck',
    moduleTitle: 'Part 2: Sports Research & Fact Checking',
    objectives: [
      'Finding real-time stories using official wires',
      'Distinguishing primary vs secondary sources',
      'Club announcements vs rumour aggregators',
      'Rigorous cross-checking with at least 2 reliable sources',
    ],
    study: [
      'Study Part 2: Source hierarchy & verification protocols',
      'Review official sports databases and club press portals',
    ],
    assignment: [
      'Find 1 trending sports story in European or African football',
      'Verify every claim using at least two independent Tier-1 sources',
      'Create a source record: Claim, Source, Date, Verification link',
    ],
    production: [
      'Produce 1 × 700-word verified sports article with explicit attributions',
    ],
    social: [
      'Create 1 × X post linking the verified story',
      'Create 1 × Facebook post with source credit',
    ],
    publish: [
      'Publish to website with proper source citations',
      'Distribute to social accounts',
    ],
    submissionChecklist: [
      'Article URL',
      'Social post links',
      'Source 1 and Source 2 documentation',
    ],
    adminReviewCriteria: [
      'Zero factual errors',
      'Quality and authority of primary sources',
      'Clean quote attribution',
    ],
    resources: ['GoalMills Source Verification Matrix', 'Official League Wires'],
  },
  {
    day: 3,
    week: 1,
    title: 'Sports Article Structure & Narrative Mechanics',
    moduleKey: 'sports_writing',
    moduleTitle: 'Part 1: Sports Article Writing Mechanics',
    objectives: [
      'Master headlines, lead, introduction, body, quotes, context, and conclusion',
      'Craft impactful leads that hook sports readers in the first 2 sentences',
      'Integrate tactical context without bogging down the pacing',
    ],
    study: [
      'Study 5 lead paragraph styles: Question, Stat, Dramatic Scene, Quotation, Direct News',
    ],
    assignment: [
      'Write an 800-word sports news article',
      'Draft 5 alternative headlines',
      'Draft 3 social headlines and 1 article executive summary',
    ],
    production: [
      '800-word sports news feature with 3 distinct subheadings',
    ],
    social: [
      'Publish best alternative headline on X and evaluate CTR',
    ],
    publish: [
      'Publish best article version on GoalMills',
    ],
    submissionChecklist: [
      'Published article link',
      'List of 5 alternative headlines',
      'Social links',
    ],
    adminReviewCriteria: [
      'Flow between paragraphs',
      'Pacing and clarity',
      'Quality of alternative headlines',
    ],
    resources: ['Article Structure Master Guide'],
  },
  {
    day: 4,
    week: 1,
    title: 'Sports Headlines, Hooks & Content Packaging',
    moduleKey: 'sports_writing',
    moduleTitle: 'Part 13: Headlines, Hooks & Content Packaging',
    objectives: [
      'Master News headlines, SEO headlines, Curiosity hooks, and Analysis headlines',
      'Avoid deceitful clickbait while maximizing organic CTR',
      'Format headlines for mobile notifications and search snippets',
    ],
    study: [
      'Study Part 13: The Anatomy of a High-CTR Sports Headline',
    ],
    assignment: [
      'Write 20 headlines for 5 different sports stories (4 headlines per story)',
      'Select the single strongest headline based on urgency, clarity, and keyword placement',
    ],
    production: [
      'Write 1 sports article utilizing your strongest tested headline',
    ],
    social: [
      'Post 2 headline variations on X to test reader engagement',
    ],
    publish: [
      'Publish article to GoalMills',
    ],
    submissionChecklist: [
      'Article URL',
      'Full list of 20 headline exercises',
      'Social links',
    ],
    adminReviewCriteria: [
      'Headline strength and honesty',
      'No misleading clickbait',
      'Keyword inclusion in first 6 words',
    ],
    resources: ['Headline Formulas Cheatsheet'],
  },
  {
    day: 5,
    week: 1,
    title: 'Journalistic Standards, Legal Responsibility & Defamation',
    moduleKey: 'journalism_editorial_standards',
    moduleTitle: 'Part 8: Sports Journalism & Editorial Standards',
    objectives: [
      'Understand accuracy, attribution, rumours, opinion, and corrections',
      'Defamation awareness: avoiding libelous claims about players, coaches, or referees',
      'Editorial responsibility when reporting sensitive matters',
    ],
    study: [
      'Read Part 8: Editorial Ethics & Defamation Awareness',
      'Study GoalMills Correction Policy and Mistake Database SOP',
    ],
    assignment: [
      'Produce 1 factual news report and 1 opinion/analysis column',
      'Explicitly label opinions and clearly separate claims from verified records',
    ],
    production: [
      '1 × News article (500 words)',
      '1 × Opinion/Analysis article (500 words)',
    ],
    social: [
      'Social debate post on Facebook & X linking the opinion piece',
    ],
    publish: [
      'Publish both pieces with appropriate tags (News vs Opinion)',
    ],
    submissionChecklist: [
      'Both article URLs',
      'Social links',
      'Explanation of how opinion was distinguished from fact',
    ],
    adminReviewCriteria: [
      'Ethical compliance',
      'Clear opinion labeling',
      'Attribution rigor',
    ],
    resources: ['Sports Journalism Legal & Ethics Handbook'],
  },
  {
    day: 6,
    week: 1,
    title: 'Sports Search Engine Optimization (SEO)',
    moduleKey: 'seo_optimization',
    moduleTitle: 'Part 4: Sports SEO',
    objectives: [
      'Search intent and keyword research for sports fans',
      'SEO title, meta description, clean URL slug, H1/H2 hierarchy',
      'Internal linking and image alt text for Google Discover',
    ],
    study: [
      'Read Part 4: Sports SEO Blueprint',
      'Review Google Search Central SEO Starter Guide',
    ],
    assignment: [
      'Select a high-intent upcoming sports match or trending transfer storyline',
      'Conduct keyword research (Primary keyword, 3 secondary keywords)',
      'Optimize image alt tags, slug, meta description, and 3 internal links',
    ],
    production: [
      '1 × SEO-optimized match preview or transfer story (700 words)',
    ],
    social: [
      'Share SEO article on X and Facebook',
    ],
    publish: [
      'Publish to CMS with complete SEO metadata fields filled',
    ],
    submissionChecklist: [
      'Article URL',
      'Meta title, Meta description, and Keyword target submitted in report',
    ],
    adminReviewCriteria: [
      'Meta title (under 60 chars)',
      'Meta description (under 160 chars)',
      'H2/H3 heading hierarchy',
      'Internal links to GoalMills team pages',
    ],
    resources: ['GoalMills Sports SEO Playbook', 'Google Search Central Docs'],
  },
  {
    day: 7,
    week: 1,
    title: 'Week 1 Examination & Production Sprint',
    moduleKey: 'sports_writing',
    moduleTitle: 'Week 1 Exam: Sports Journalism Foundation',
    objectives: [
      'Demonstrate mastery of Week 1 writing, fact-checking, and SEO under deadline',
      'Produce a comprehensive 800–1,000 word sports report with full assets',
    ],
    study: [
      'Review feedback from Days 1–6 stand-ups and daily reports',
    ],
    assignment: [
      'Select an urgent current sports story independently',
      'Full production: Article (800–1,000 words), SEO metadata, 2 X posts, 1 FB post, 1 basic graphic',
    ],
    production: [
      '1 × 800–1,000 word comprehensive sports report',
      '1 × Match/Story visual graphic',
    ],
    social: [
      '2 × X posts',
      '1 × Facebook post',
    ],
    publish: [
      'Publish article and all social assets before 4:00 PM WAT',
    ],
    submissionChecklist: [
      'Article URL',
      'Social URLs',
      'Graphic URL',
      'Sources used',
      'Full daily report',
    ],
    adminReviewCriteria: [
      'Graded out of 100 on official scorecard',
      'Writing quality (15), Accuracy (15), Research (15), SEO (10), Social (10), Design (10), Creativity (10), Discipline (5), Analytics (5), Teamwork (5)',
      'Staff scoring below 70 will repeat weak modules in Week 2',
    ],
    resources: ['Week 1 Exam Assessment Rubric'],
  },

  // =========================================================================
  // WEEK 2 — CONTENT STRATEGY & SOCIAL MEDIA (Days 8–14)
  // =========================================================================
  {
    day: 8,
    week: 2,
    title: 'Editorial Workflow & Newsroom Pipeline',
    moduleKey: 'content_planning_breaking',
    moduleTitle: 'Part 5: Publishing & Editorial Workflow',
    objectives: [
      'Master the 10-step newsroom pipeline: Assignment → Research → Writing → Editing → Fact-checking → SEO → Design → Publishing → Distribution → Analytics',
      'Understand roles of beat reporters, copy editors, and managing editors',
    ],
    study: [
      'Study Part 5: Editorial Workflow SOP',
    ],
    assignment: [
      'Process 1 sports story through every single stage of the 10-step workflow',
      'Submit documented evidence of each stage',
    ],
    production: [
      '1 × News feature (600 words)',
    ],
    social: [
      'Coordinated multi-channel announcement',
    ],
    publish: [
      'CMS publication after editorial gate sign-off',
    ],
    submissionChecklist: [
      'Article URL',
      'Workflow checkpoint logs',
    ],
    adminReviewCriteria: [
      'Strict adherence to editorial checkpoints',
      'Proofreading quality',
    ],
    resources: ['Editorial Workflow Checksheet'],
  },
  {
    day: 9,
    week: 2,
    title: 'Sports Content Strategy & Editorial Calendar',
    moduleKey: 'content_planning_breaking',
    moduleTitle: 'Part 7: Sports Content Strategy',
    objectives: [
      'Distinguish content types: Breaking news, Evergreen, Trending, Search, Social, Engagement',
      'Build a cohesive 7-day sports editorial calendar around fixture schedules',
    ],
    study: [
      'Read Part 7: Sports Content Strategy & The Content Pyramid',
    ],
    assignment: [
      'Build a 7-day GoalMills content calendar (minimum: 7 article ideas, 7 social ideas, 3 graphics, 2 video concepts)',
      'Produce and publish today’s assigned calendar story',
    ],
    production: [
      '1 × Content calendar document',
      '1 × Published sports story from the calendar',
    ],
    social: [
      '1 × Social teaser for upcoming weekly calendar theme',
    ],
    publish: [
      'Publish calendar story to GoalMills',
    ],
    submissionChecklist: [
      'Calendar link or text',
      'Published article link',
      'Social links',
    ],
    adminReviewCriteria: [
      'Feasibility of calendar',
      'Balance of evergreen and breaking sports',
    ],
    resources: ['7-Day Sports Calendar Template'],
  },
  {
    day: 10,
    week: 2,
    title: 'Traffic Generation, Distribution & Audience Growth',
    moduleKey: 'audience_growth_analytics',
    moduleTitle: 'Part 6: Traffic & Audience Growth',
    objectives: [
      'Understand traffic channels: Search (Organic/Discover), Social, Direct, Referral, Newsletters',
      'Internal linking webs to maximize reader session duration and pageviews per visit',
    ],
    study: [
      'Read Part 6: Sports Audience Growth & Distribution Loops',
    ],
    assignment: [
      'Write 1 sports article and execute a coordinated distribution plan across X, Facebook, and Instagram',
      'Track referral clicks and engagement metrics',
    ],
    production: [
      '1 × Sports article with 4 contextual internal links to GoalMills archives',
    ],
    social: [
      'Tailored posts on X, Facebook, and Instagram',
    ],
    publish: [
      'Publish article and social links',
    ],
    submissionChecklist: [
      'Article URL',
      'All 3 social links',
      'Initial impressions and reach count',
    ],
    adminReviewCriteria: [
      'Distribution coordination',
      'Relevance of internal links',
    ],
    resources: ['Distribution Checklist'],
  },
  {
    day: 11,
    week: 2,
    title: 'Sports Social Media Masterclass & Platform Strategy',
    moduleKey: 'social_community_management',
    moduleTitle: 'Part 14: Sports Social Media Masterclass',
    objectives: [
      'Platform differences: X (breaking news/stats), Instagram (visuals/reels), Facebook (discussions/articles), TikTok (short hooks), YouTube (analysis)',
      'Crafting platform-native hooks and media sizing',
    ],
    study: [
      'Read Part 14: Cross-Platform Sports Social Strategy',
    ],
    assignment: [
      'Create 1 comprehensive content package from a single sports storyline: 1 article, 2 X posts, 1 Facebook discussion post, 1 Instagram carousel or static image, 1 short video',
    ],
    production: [
      '1 × Sports article',
      '1 × Short vertical video (30-45s)',
    ],
    social: [
      '2 × X posts',
      '1 × Facebook post',
      '1 × Instagram post',
      '1 × TikTok / Reel upload',
    ],
    publish: [
      'Publish across all corresponding GoalMills accounts',
    ],
    submissionChecklist: [
      'Submit all 5 platform links in daily report',
    ],
    adminReviewCriteria: [
      'Platform tone appropriateness',
      'Visual quality and correct aspect ratios',
    ],
    resources: ['Social Platform Cheat Sheet'],
  },
  {
    day: 12,
    week: 2,
    title: 'Social Media Management & Community Moderation',
    moduleKey: 'social_community_management',
    moduleTitle: 'Part 15: Social Media Management & Community Care',
    objectives: [
      'Managing comments, replies, mentions, and fan DMs with professional brand voice',
      'Handling toxic comments, spam, and misinformation safely without brand damage',
      'Turning passive readers into loyal daily community members',
    ],
    study: [
      'Read Part 15: Social Community Guidelines & Brand Voice SOP',
    ],
    assignment: [
      'Actively manage assigned GoalMills social account for 2 hours',
      'Reply to at least 10 fan comments, ask 3 follow-up debate questions, and moderate spam',
      'Produce 1 social discussion package',
    ],
    production: [
      '1 × Interactive poll or debate thread',
    ],
    social: [
      'Community engagement log (10 replies logged)',
    ],
    publish: [
      'Publish debate thread on X and Facebook',
    ],
    submissionChecklist: [
      'Link to debate post',
      'Screenshots or summary of community interactions',
    ],
    adminReviewCriteria: [
      'Tone of voice: respectful, knowledgeable, objective',
      'De-escalation of arguments',
    ],
    resources: ['Community Moderation Playbook'],
  },
  {
    day: 13,
    week: 2,
    title: 'Social Content Planning & Weekly Theme Architecture',
    moduleKey: 'content_planning_breaking',
    moduleTitle: 'Part 11: Content Planning & Editorial Calendar',
    objectives: [
      'Structured weekly themes: Monday (Roundup), Tuesday (Tactics/Stats), Wednesday (Debate), Thursday (Throwback/Evergreen), Friday (Preview), Saturday/Sunday (Matchday Live)',
    ],
    study: [
      'Study sports publishing rhythm and matchday surge dynamics',
    ],
    assignment: [
      'Design a full week social plan with specific copy, visual briefs, and scheduled posting windows',
      'Produce and publish today’s theme content',
    ],
    production: [
      '1 × Sports article matching today’s theme',
    ],
    social: [
      '2 × Social posts following the theme guidelines',
    ],
    publish: [
      'Publish content',
    ],
    submissionChecklist: [
      'Article URL',
      'Social URLs',
      'Weekly theme calendar overview',
    ],
    adminReviewCriteria: [
      'Theme consistency',
      'Audience resonance',
    ],
    resources: ['Social Calendar Template'],
  },
  {
    day: 14,
    week: 2,
    title: 'Week 2 Examination: Social Media & Strategy Sprint',
    moduleKey: 'social_community_management',
    moduleTitle: 'Week 2 Exam: Content Strategy & Distribution',
    objectives: [
      'Produce a full multi-channel release independently under strict time constraints',
      'Demonstrate strategic planning and cross-platform formatting',
    ],
    study: [
      'Review Week 2 feedback and social performance analytics',
    ],
    assignment: [
      'Produce: 1 article, 2 X posts, 1 Facebook post, 1 Instagram post, 1 Instagram Story, 1 Reel/TikTok, 1 Canva graphic',
    ],
    production: [
      '1 × 700-word article',
      '1 × Short-form video (30-60s)',
      '1 × Canva graphic',
    ],
    social: [
      'Published to X, Facebook, Instagram, TikTok',
    ],
    publish: [
      'Complete all publishing before 4:30 PM WAT',
    ],
    submissionChecklist: [
      'Submit all 6 required URLs in daily report',
    ],
    adminReviewCriteria: [
      'Official 10-category 100-point rubric',
      'Hook strength, branding consistency, engagement potential, and platform suitability',
    ],
    resources: ['Week 2 Exam Assessment Matrix'],
  },

  // =========================================================================
  // WEEK 3 — CANVA + VIDEO (Days 15–20)
  // =========================================================================
  {
    day: 15,
    week: 3,
    title: 'Canva Fundamentals & GoalMills Visual Identity',
    moduleKey: 'canva_graphic_design',
    moduleTitle: 'Part 16: Sports Graphic Design with Canva',
    objectives: [
      'Canva canvas dimensions, grid alignment, typography hierarchy, and contrast',
      'GoalMills brand colors: Navy #001f3f, Gold #ffd700, Slate #0f172a, White #ffffff',
      'Cutout player pngs, drop shadows, and high-impact sports backdrops',
    ],
    study: [
      'Read Part 16: Sports Graphic Design with Canva',
      'Explore Canva Design Platform and master GoalMills brand kit',
    ],
    assignment: [
      'Create 1 Breaking News Graphic and 1 Transfer Announcement Card using official brand kit',
    ],
    production: [
      '2 × Canva sports graphics (1080×1080 and 1080×1350 formats)',
      '1 × Accompanying breaking news story (400 words)',
    ],
    social: [
      'Post breaking news graphic on X and Instagram with verified caption',
    ],
    publish: [
      'Embed graphic as featured image on GoalMills CMS',
    ],
    submissionChecklist: [
      'Graphic URLs (Canva view link + published post link)',
      'Article URL',
    ],
    adminReviewCriteria: [
      'Adherence to brand kit colors and fonts',
      'Crispness of player cutout',
      'Typography readability on mobile screens',
    ],
    resources: ['GoalMills Canva Master Brand Kit'],
  },
  {
    day: 16,
    week: 3,
    title: 'Sports Graphic System (6 Master Templates)',
    moduleKey: 'canva_graphic_design',
    moduleTitle: 'Part 16: Master Sports Template System',
    objectives: [
      'Build 6 reusable sports templates: 1. Matchday Preview, 2. Full-time Scoreline, 3. Goal Alert, 4. Transfer News, 5. Player Stats, 6. Quote Card',
    ],
    study: [
      'Analyze visual graphics from Sky Sports, Fabrizio Romano, and Bleacher Report',
    ],
    assignment: [
      'Create the 6 master templates in Canva',
      'Publish at least 2 templates populated with real match/player data today',
    ],
    production: [
      '6 × Master graphic templates in Canva team workspace',
      '2 × Published sports graphics',
    ],
    social: [
      'Post 2 graphics with engaging captions on Instagram and X',
    ],
    publish: [
      'Attach templates to GoalMills asset library',
    ],
    submissionChecklist: [
      'Canva template folder link',
      '2 published social links',
    ],
    adminReviewCriteria: [
      'Consistency across all 6 templates',
      'Proper spacing and watermark placement',
    ],
    resources: ['Canva Sports Template Guide'],
  },
  {
    day: 17,
    week: 3,
    title: 'Sports Infographics & Tactical Visuals',
    moduleKey: 'canva_graphic_design',
    moduleTitle: 'Part 16: Statistical Infographics & Player Comparisons',
    objectives: [
      'Design player statistics comparison graphic (e.g. Haaland vs Mbappe)',
      'Design team head-to-head statistical graphic',
      'Visualizing data: goals, assists, xG, pass completion, clean sheets',
    ],
    study: [
      'Study Opta, FBref, and SofaScore visual presentation of sports data',
    ],
    assignment: [
      'Create 1 player comparison graphic and 1 team tactical head-to-head infographic',
      'Accompany with a 600-word tactical breakdown article',
    ],
    production: [
      '2 × High-density infographics',
      '1 × Tactical analysis article',
    ],
    social: [
      'Post infographic carousel on Instagram and debate thread on X',
    ],
    publish: [
      'Publish article featuring both infographics',
    ],
    submissionChecklist: [
      'Article URL',
      'Infographic links',
      'Data sources used (Opta/FBref)',
    ],
    adminReviewCriteria: [
      'Statistical accuracy',
      'Visual clarity and legibility of small numbers',
    ],
    resources: ['Sports Data Visualization Guide'],
  },
  {
    day: 18,
    week: 3,
    title: 'Short-Form Video Production (Reels, TikTok & Shorts)',
    moduleKey: 'short_form_video',
    moduleTitle: 'Part 17: Sports Video Content Creation',
    objectives: [
      'Video anatomy: 3-second hook, fast-paced script, energetic voiceover, relevant b-roll, bold animated captions, copyright-compliant background audio, clear call-to-action (CTA)',
      'Master video editing tools such as CapCut or Premiere Rush',
    ],
    study: [
      'Read Part 17: Viral Sports Video Production',
      'Study CapCut editing workflows and auto-captions',
    ],
    assignment: [
      'Script, voice, edit, and export a 30–60 second vertical sports video on a trending football story',
    ],
    production: [
      '1 × 30–60s vertical video (9:16 format, 1080×1920)',
    ],
    social: [
      'Publish to TikTok, Instagram Reels, and YouTube Shorts',
    ],
    publish: [
      'Embed video inside corresponding GoalMills website article',
    ],
    submissionChecklist: [
      'TikTok URL',
      'Instagram Reel URL',
      'YouTube Shorts URL',
      'Video script copy in daily report',
    ],
    adminReviewCriteria: [
      'Hook retention in first 3 seconds',
      'Audio mixing (voiceover clear over music)',
      'Caption accuracy and pacing',
    ],
    resources: ['CapCut Masterclass', 'Shorts Scripting Formula'],
  },
  {
    day: 19,
    week: 3,
    title: 'YouTube Publishing, Packaging & Video Analytics',
    moduleKey: 'short_form_video',
    moduleTitle: 'Part 18: YouTube Growth & Video SEO',
    objectives: [
      'YouTube title formulas, high-CTR thumbnails, descriptive chapters, tags, and description SEO',
      'Understanding YouTube analytics: CTR, average view duration (AVD), retention curves',
    ],
    study: [
      'Study YouTube Creators Guide and YouTube Analytics Help documentation',
    ],
    assignment: [
      'Create a 3–5 minute sports analysis or match preview video',
      'Design a custom YouTube thumbnail with high contrast and emotional cutout',
    ],
    production: [
      '1 × 3–5 min landscape video (16:9)',
      '1 × Custom YouTube thumbnail (1280×720)',
    ],
    social: [
      'Promote YouTube link with teaser clips on X and Instagram Stories',
    ],
    publish: [
      'Publish to GoalMills YouTube channel with chapters and description',
    ],
    submissionChecklist: [
      'YouTube video URL',
      'Thumbnail image file/link',
      'Promotion links',
    ],
    adminReviewCriteria: [
      'Thumbnail CTR potential',
      'Narrative structure and retention',
      'Video description SEO and timestamps',
    ],
    resources: ['YouTube Creators Documentation', 'Thumbnail Design Rules'],
  },
  {
    day: 20,
    week: 3,
    title: 'Content Repurposing: One Story → Multiple Assets',
    moduleKey: 'repurposing_newsroom_ops',
    moduleTitle: 'Part 20: Sports Video Production & Multi-Asset Syndication',
    objectives: [
      'The core GoalMills skill: turning 1 single sports story into 1 long-form article, 1 YouTube video, 3 Shorts, 2 Reels/TikToks, 3 X posts, 1 Facebook post, 1 Instagram post, and 1 Canva graphic',
    ],
    study: [
      'Study the GoalMills Content Multiplier Engine',
    ],
    assignment: [
      'Take 1 major sports story and execute the complete multi-format syndication pipeline',
    ],
    production: [
      '1 × In-depth website article',
      '1 × Canva graphic',
      '2 × Short vertical clips',
    ],
    social: [
      '3 × X posts',
      '1 × Facebook post',
      '1 × Instagram post',
      'TikTok and Reels uploads',
    ],
    publish: [
      'Publish all assets across web and social channels',
    ],
    submissionChecklist: [
      'Submit all 8+ asset links in the daily report',
    ],
    adminReviewCriteria: [
      'Message synergy across platforms',
      'Format-native adaptations',
      'Speed of execution',
    ],
    resources: ['Content Repurposing Blueprint'],
  },

  // =========================================================================
  // WEEK 4 — PROFESSIONAL NEWSROOM OPERATIONS (Days 21–30)
  // =========================================================================
  {
    day: 21,
    week: 4,
    title: 'Breaking News Simulation & Rapid Response',
    moduleKey: 'content_planning_breaking',
    moduleTitle: 'Part 12: Breaking News & Matchday Coverage',
    objectives: [
      'Simulated breaking news exercise: staff receives an unannounced scenario (e.g. manager sacked, star transfer agreement)',
      'Rapid verification, initial 5-minute bulletin, followed by comprehensive story update',
      'Speed evaluated strictly after accuracy',
    ],
    study: [
      'Review Part 12: Breaking News Fast-Response Protocol',
    ],
    assignment: [
      'Complete the breaking news simulation within the 45-minute deadline',
      'Publish breaking alert → Full article → Social flash → Quote graphic',
    ],
    production: [
      '1 × Rapid breaking article (400 words) updated with quotes to 700 words',
      '1 × Breaking news graphic',
    ],
    social: [
      'X breaking alert and Instagram story update',
    ],
    publish: [
      'Publish immediately to GoalMills breaking news feed',
    ],
    submissionChecklist: [
      'Article URL (with timestamp log)',
      'Social links',
      'Graphic URL',
    ],
    adminReviewCriteria: [
      'Speed of first publish',
      'Factual accuracy and source attribution',
      'Clarity under pressure',
    ],
    resources: ['Breaking News Fast-Response SOP'],
  },
  {
    day: 22,
    week: 4,
    title: 'Live Matchday Operations & Minute-by-Minute Coverage',
    moduleKey: 'matchday_coverage',
    moduleTitle: 'Part 12: Live Matchday Operations',
    objectives: [
      'Before match: Preview, key player spotlights, confirmed starting lineup graphic',
      'During match: Half-time tactical update, major event social posts',
      'After match: Instant match report, player ratings, manager quotes, statistical recap',
    ],
    study: [
      'Study Live Matchday Coverage Playbook and Player Ratings Scale',
    ],
    assignment: [
      'Cover 1 live football match from kickoff to post-match analysis',
    ],
    production: [
      '1 × Pre-match preview article',
      '1 × Full-time match report with player ratings (within 20 mins of final whistle)',
    ],
    social: [
      'Starting XI post, Halftime score post, Full-time result graphic',
    ],
    publish: [
      'Publish preview and post-match report on GoalMills',
    ],
    submissionChecklist: [
      'Match report URL',
      'Player ratings link',
      'Social matchday links',
    ],
    adminReviewCriteria: [
      'Turnaround speed after final whistle',
      'Fairness and accuracy of player ratings',
    ],
    resources: ['Live Matchday Coverage Playbook'],
  },
  {
    day: 23,
    week: 4,
    title: 'Audience Development, Retention & Newsletters',
    moduleKey: 'audience_growth_analytics',
    moduleTitle: 'Part 9: Audience Development',
    objectives: [
      'Audience personas: Casual fans, tactical purists, fantasy sports players, transfer tracking fans',
      'Building returning visitors via newsletters, push alerts, and community bookmarks',
    ],
    study: [
      'Read Part 9: Audience Development & Newsletter Strategy',
    ],
    assignment: [
      'Create a detailed GoalMills audience profile document',
      'Draft 1 complete sports newsletter edition with 3 curated stories and 1 editorial note',
    ],
    production: [
      '1 × Audience persona profile',
      '1 × Curated sports newsletter digest',
    ],
    social: [
      'Newsletter signup promo post on X and Facebook',
    ],
    publish: [
      'Send/Publish newsletter draft in GoalMills newsletter module',
    ],
    submissionChecklist: [
      'Newsletter draft ID / link',
      'Audience profile notes',
    ],
    adminReviewCriteria: [
      'Editorial tone and curation quality',
      'Clarity of value proposition for subscribers',
    ],
    resources: ['Newsletter Curation Playbook'],
  },
  {
    day: 24,
    week: 4,
    title: 'Sports Analytics & Performance Measurement',
    moduleKey: 'audience_growth_analytics',
    moduleTitle: 'Part 19: Sports Analytics & Performance Measurement',
    objectives: [
      'Analyze Google Analytics, website metrics (views, bounce rate, reading time), and social engagement metrics (CTR, impressions, shares)',
      'Conduct a performance audit of employee’s own work during Days 1–23',
    ],
    study: [
      'Read Part 19: Sports Analytics & Performance Measurement',
    ],
    assignment: [
      'Identify employee’s best and worst: article, headline, social post, graphic, and video',
      'Write a 500-word data-backed analysis explaining why each performed as it did',
    ],
    production: [
      '1 × Personal Content Performance Audit Report',
    ],
    social: [
      'Apply lessons learned to today’s daily article and social posts',
    ],
    publish: [
      'Publish 1 new sports article incorporating analytics learnings',
    ],
    submissionChecklist: [
      'Audit report text in daily submission',
      'Today’s published article URL',
    ],
    adminReviewCriteria: [
      'Self-awareness and objectivity',
      'Understanding of data metrics vs vanity metrics',
    ],
    resources: ['GoalMills Analytics Dashboard Guide'],
  },
  {
    day: 25,
    week: 4,
    title: 'Content Optimization, Iteration & A/B Headline Testing',
    moduleKey: 'seo_optimization',
    moduleTitle: 'Part 4 & Part 19: Content Optimization',
    objectives: [
      'Take 1 underperforming piece of content from the archives and optimize: Headline, Thumbnail, Hook, Caption, SEO tags, Internal links, CTA',
      'Document: Before, After, Why I changed it, Expected outcome',
    ],
    study: [
      'Study headline iteration and click-through optimization cases',
    ],
    assignment: [
      'Select 1 underperforming GoalMills article and execute a complete editorial overhaul',
    ],
    production: [
      '1 × Fully overhauled and re-published article',
      '1 × New improved graphic thumbnail',
    ],
    social: [
      'Re-distribute optimized piece with fresh hook',
    ],
    publish: [
      'Update article in CMS with version history note',
    ],
    submissionChecklist: [
      'Updated article URL',
      'Before vs After comparison notes in report',
    ],
    adminReviewCriteria: [
      'Noticeable improvement in clarity and hook',
      'SEO title and meta improvements',
    ],
    resources: ['Optimization Checklist'],
  },
  {
    day: 26,
    week: 4,
    title: 'Newsroom Management & Editorial Operations',
    moduleKey: 'repurposing_newsroom_ops',
    moduleTitle: 'Part 21: GoalMills Newsroom Operations',
    objectives: [
      'Running a newsroom independently: assignment desk, deadline management, editorial calendar management, publishing queue, peer approval, corrections, and social syndication',
    ],
    study: [
      'Read Part 21: GoalMills Newsroom Operations',
    ],
    assignment: [
      'Act as newsroom desk lead for the morning session',
      'Coordinate news monitoring, pitch 3 priority stories, and assign editorial tags',
      'Produce 1 featured story',
    ],
    production: [
      '1 × 800-word featured sports story',
    ],
    social: [
      'Oversee scheduled social posts for the afternoon window',
    ],
    publish: [
      'Publish story to GoalMills',
    ],
    submissionChecklist: [
      'Article URL',
      'Newsroom coordination report',
    ],
    adminReviewCriteria: [
      'Leadership and time management',
      'News judgment and editorial selection',
    ],
    resources: ['Newsroom Operations SOP'],
  },
  {
    day: 27,
    week: 4,
    title: 'Independent Production Sprint (Zero Assistance)',
    moduleKey: 'sports_writing',
    moduleTitle: 'Independent Production Day',
    objectives: [
      'Admin provides only: "Find and cover an important sports story today."',
      'Employee must independently: Find → Research → Verify → Write → SEO → Design → Publish → Distribute → Report with zero hand-holding',
    ],
    study: [
      'Self-directed research and wire verification',
    ],
    assignment: [
      'Deliver a complete, publication-ready sports content package independently before 4:00 PM WAT',
    ],
    production: [
      '1 × 800-word in-depth sports article',
      '1 × Canva visual graphic',
      '1 × Short vertical video',
    ],
    social: [
      'X posts, Facebook post, Instagram carousel',
    ],
    publish: [
      'Direct publish to GoalMills and social channels',
    ],
    submissionChecklist: [
      'Submit all links and self-evaluation score in daily report',
    ],
    adminReviewCriteria: [
      'Autonomy and problem-solving capability',
      'Editorial maturity and error-free copy',
    ],
    resources: ['Independent Production Guide'],
  },
  {
    day: 28,
    week: 4,
    title: 'Full 360° Multi-Format Content Campaign',
    moduleKey: 'repurposing_newsroom_ops',
    moduleTitle: 'Full Content Campaign',
    objectives: [
      'Execute a complete campaign around 1 major story: 1 long-form article, 1 short update, 1 infographic, 1 social quote card, 1 YouTube video, 2 Shorts, 2 Reels/TikToks, 3 X posts, 1 Facebook post, 1 Instagram post',
    ],
    study: [
      'Review campaign packaging and cross-platform storytelling',
    ],
    assignment: [
      'Produce all 14 campaign deliverables across the day',
    ],
    production: [
      '2 × Articles (long-form & rapid update)',
      '2 × Graphics (infographic & quote card)',
      '3 × Video assets (YouTube & vertical shorts)',
    ],
    social: [
      'Multi-channel distribution across all handles',
    ],
    publish: [
      'Full campaign rollout',
    ],
    submissionChecklist: [
      'Submit comprehensive campaign link portfolio',
    ],
    adminReviewCriteria: [
      'Cohesion of the campaign',
      'High volume without sacrificing quality',
    ],
    resources: ['360 Campaign Matrix'],
  },
  {
    day: 29,
    week: 4,
    title: 'Final Newsroom Simulation: Breaking Transfer / Match Crisis',
    moduleKey: 'content_planning_breaking',
    moduleTitle: 'Final Newsroom Crisis Simulation',
    objectives: [
      'Simulate a high-stakes breaking sports story (e.g. blockbuster transfer, managerial departure, major tournament disqualification)',
      'Produce under strict deadline: Breaking article, Headline variations, SEO metadata, Graphic, X post, FB post, Instagram post, Short video, and Thumbnail',
    ],
    study: [
      'Crisis management and breaking news speed protocols',
    ],
    assignment: [
      'Receive scenario at 10:00 AM WAT and deliver full package before 1:00 PM WAT',
    ],
    production: [
      'Complete multimedia package delivered under time pressure',
    ],
    social: [
      'Real-time live blogging and social updates',
    ],
    publish: [
      'Published to test/live environment',
    ],
    submissionChecklist: [
      'Time-stamped URLs of all deliverables',
    ],
    adminReviewCriteria: [
      'Judged on Accuracy, Speed, Editorial Judgment, Writing, SEO, Design, Social, and Video',
    ],
    resources: ['Crisis Simulation Framework'],
  },
  {
    day: 30,
    week: 4,
    title: 'Final Exam, Portfolio Presentation & Academy Certification',
    moduleKey: 'repurposing_newsroom_ops',
    moduleTitle: 'GoalMills Sports Media Academy Certification',
    objectives: [
      'Present complete 30-day professional portfolio to managing editor',
      'Portfolio requirements: Best news article, Best analysis, Best SEO article, Best headline, Best graphic, Best social campaign, Best short video, Best YouTube video, Analytics report, Personal improvement report',
      'Final comprehensive assessment and award of official certification tier',
    ],
    study: [
      'Compile 30-day portfolio and self-evaluation presentation',
    ],
    assignment: [
      'Present portfolio in the final 5:00 PM stand-up meeting',
      'Receive final assessment score out of 100 across 10 core competencies',
    ],
    production: [
      'Final 30-Day Master Portfolio Document & Presentation',
    ],
    social: [
      'Graduation reflection post on professional profiles (LinkedIn/X)',
    ],
    publish: [
      'Portfolio archived in GoalMills Best Work Library',
    ],
    submissionChecklist: [
      'Master portfolio link with all 10 curated pieces',
      'Personal improvement reflection report',
    ],
    adminReviewCriteria: [
      'Graded on official 10-skill scorecard weighting:',
      'Journalism (15%), Writing (15%), Research (15%), SEO (10%), Social Media (10%), Graphic Design (10%), Video (10%), Publishing Discipline (5%), Analytics (5%), Teamwork & Standups (5%) = Total 100%',
      'Award of Certification Tier: Advanced (90-100), Professional (80-89), Junior (70-79), Extension (60-69), Remedial (<60)',
    ],
    resources: ['GoalMills Certification Rubric', 'Master Portfolio Template'],
  },
];

// Existing backward-compatible modules for legacy components
export const GOALMILLS_TRAINING_MODULES: TrainingModuleItem[] = [
  {
    id: 'sports_writing',
    title: 'Sports Article Writing & Match Storytelling',
    category: 'Writing & Journalism',
    description: 'Learn GoalMills house style for writing high-impact match previews, reports, player spotlights, and sports features.',
    weightPercent: 15,
    checklist: [
      'Master the inverted pyramid structure for breaking sports news',
      'Write compelling, factual sports headlines and lead paragraphs',
      'Draft a comprehensive 600-word football match preview with team news',
      'Draft a rapid post-match analysis report within 20 minutes of final whistle',
      'Produce an evergreen player profile story highlighting stats and career trajectory',
    ],
    resources: ['GoalMills Editorial Style Guide v1.0', 'Match Report Templates'],
  },
  {
    id: 'sports_research_factcheck',
    title: 'Sports Research, Verification & Fact-Checking',
    category: 'Writing & Journalism',
    description: 'Develop rigorous verification standards for transfer rumours, injury updates, manager quotes, and statistical records.',
    weightPercent: 15,
    checklist: [
      'Learn Tier-1, Tier-2, and Tier-3 source hierarchy in sports journalism',
      'Verify player injuries and team news using official press conferences',
      'Distinguish legitimate transfer exclusives from social media clickbait',
      'Fact-check historical sports statistics, head-to-head records, and referee allocations',
      'Maintain an internal sources and reference verification log for all claims',
    ],
    resources: ['GoalMills Source Verification Checklist', 'Official Sports Data Providers'],
  },
  {
    id: 'journalism_editorial_standards',
    title: 'Journalism & Editorial Standards',
    category: 'Writing & Journalism',
    description: 'Master grammar, legal compliance, defamation avoidance, objective reporting, and editor proofreading workflows.',
    weightPercent: 15,
    checklist: [
      'Understand copyright laws and safe media embedding procedures',
      'Avoid sensitive allegations, unsubstantiated claims, and libelous language',
      'Implement active voice and eliminate editorial fluff from sports copy',
      'Master the 12-point pre-publishing proofreading checklist',
      'Conduct peer reviews and handle editorial feedback constructively',
    ],
    resources: ['Sports Journalism Legal & Ethics Handbook', 'Pre-Publishing Quality Control Guide'],
  },
  {
    id: 'seo_optimization',
    title: 'Sports Search Engine Optimization (SEO)',
    category: 'Writing & Journalism',
    description: 'Optimize sports articles for Google Search, News, and Discover with keywords, metadata, and structured headings.',
    weightPercent: 10,
    checklist: [
      'Conduct keyword research for trending fixtures and transfer storylines',
      'Format articles with H1, H2, H3 hierarchy, meta descriptions, and clean URLs',
      'Optimize image alt tags, captions, and file names for search indexing',
      'Implement internal linking to GoalMills team pages and league tables',
      'Apply Google News and Google Discover best practices for sports publishers',
    ],
    resources: ['GoalMills Sports SEO Playbook', 'Google Discover Blueprint'],
  },
  {
    id: 'content_planning_breaking',
    title: 'Content Planning & Breaking News Operations',
    category: 'Writing & Journalism',
    description: 'Manage daily sports calendar workflows and coordinate rapid coverage for urgent breaking developments.',
    weightPercent: 10,
    checklist: [
      'Build a weekly sports editorial calendar based on upcoming match schedules',
      'Set up news aggregators and official club wires for instant alerts',
      'Execute a 5-minute breaking news bulletin publication workflow',
      'Update rolling live blogs during transfer deadline day and major tournaments',
      'Coordinate with social media desk for synchronized breaking alerts',
    ],
    resources: ['Weekly Sports Calendar Template', 'Breaking News Fast-Response Protocol'],
  },
  {
    id: 'matchday_coverage',
    title: 'Live Matchday Coverage & Live Text Commentary',
    category: 'Writing & Journalism',
    description: 'Deliver real-time minute-by-minute text commentary, halftime updates, live scores, and immediate reaction pieces.',
    weightPercent: 10,
    checklist: [
      'Set up live text commentary 30 minutes before kickoff with confirmed XIs',
      'Craft engaging minute-by-minute updates during high-intensity play',
      'Deliver rapid halftime analysis and statistical infographics',
      'Publish instant full-time match reports and player ratings within 15 minutes',
      'Curate fan reactions and viral match clips within legal guidelines',
    ],
    resources: ['Live Matchday Coverage Playbook', 'Player Ratings Scale & Criteria'],
  },
  {
    id: 'social_community_management',
    title: 'Social Media & Community Engagement',
    category: 'Growth & Operations',
    description: 'Grow and engage GoalMills audience across X, Facebook, Instagram, TikTok, and YouTube with interactive content.',
    weightPercent: 10,
    checklist: [
      'Write platform-tailored social headlines and hooks that drive conversation',
      'Monitor and respond professionally to user comments, mentions, and DMs daily',
      'Create interactive match polls, quizzes, and debate threads',
      'Maintain GoalMills brand voice while avoiding online arguments',
      'Build and distribute daily highlights to channels',
    ],
    resources: ['GoalMills Social Media Guidelines', 'Community Moderation Protocol'],
  },
  {
    id: 'canva_graphic_design',
    title: 'Canva Sports Graphic Design & Visual Branding',
    category: 'Design & Video',
    description: 'Design high-converting sports graphics following GoalMills brand colors (Navy #001f3f, Gold #ffd700), typography, and templates.',
    weightPercent: 10,
    checklist: [
      'Master GoalMills brand palette, fonts, badges, and watermark placement in Canva',
      'Create breaking news social quote cards and transfer announcement cards',
      'Design matchday fixture preview cards and full-time scoreline graphics',
      'Produce player statistics comparison infographics and tournament brackets',
      'Design eye-catching, high-CTR YouTube thumbnails with crisp cutouts',
    ],
    resources: ['GoalMills Canva Brand Kit & Master Templates', 'Sports Graphic Best Practices'],
  },
  {
    id: 'short_form_video',
    title: 'Short-Form Video Production (Reels, TikTok, Shorts)',
    category: 'Design & Video',
    description: 'Script, voice, edit, caption, and publish viral vertical sports videos for Instagram Reels, TikTok, and YouTube Shorts.',
    weightPercent: 10,
    checklist: [
      'Write 30-to-60 second high-hook vertical video scripts for trending sports stories',
      'Record clear voiceovers with energetic pacing and proper pronunciation',
      'Edit short-form videos with dynamic pacing, sound effects, and animated captions',
      'Select royalty-free audio tracks compliant with copyright rules',
      'Repurpose long-form website articles into 3 distinct vertical video formats',
    ],
    resources: ['Short-Form Video Scripting Frameworks', 'Vertical Video Editing Masterclass'],
  },
  {
    id: 'audience_growth_analytics',
    title: 'Audience Growth, Traffic Analysis & Performance Insights',
    category: 'Growth & Operations',
    description: 'Track pageviews, session duration, click-through rates, social impressions, follower growth, and video retention.',
    weightPercent: 5,
    checklist: [
      'Understand key web metrics: Pageviews, Unique Visitors, Bounce Rate, Time on Page',
      'Analyze social engagement rates and identify top-performing content formats',
      'Evaluate video analytics: Hook retention, average view duration, share rate',
      'Produce a weekly content performance report with actionable recommendations',
      'Iterate on underperforming topics using data-driven headline and thumbnail tweaks',
    ],
    resources: ['GoalMills Analytics Dashboard Guide', 'Weekly Growth Report Framework'],
  },
  {
    id: 'repurposing_newsroom_ops',
    title: 'Content Repurposing & Newsroom Operations',
    category: 'Growth & Operations',
    description: 'Master the Learn → Create → Publish → Submit → Review → Improve workflow, daily 5:00 PM stand-ups, and multi-channel content syndication.',
    weightPercent: 5,
    checklist: [
      'Execute the multi-format syndication pipeline (Article → Graphic → Reel → Tweet)',
      'Prepare and submit the daily end-of-day content report with verified links',
      'Participate actively in the daily 5:00 PM WAT newsroom stand-up meeting',
      'Incorporate editorial review notes and corrections into next-day assignments',
      'Complete the 30-day comprehensive sports media transition assessment',
    ],
    resources: ['Newsroom Daily Workflow SOP', 'Daily Reporting & Standup Checklist'],
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
