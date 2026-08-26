import mongoose from 'mongoose';
import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'path';
import News from '../models/News';
import Category from '../models/Category';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env') });

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error('Please define the MONGODB_URL environment variable inside .env');
  process.exit(1);
}

const CATEGORIES = [
  {
    name: 'Breaking News',
    slug: 'breaking-news',
    description: 'Urgent football and sports headlines',
    color: '#EF4444',
    icon: 'flash',
    isFeatured: true,
    order: 1,
  },
  {
    name: 'Premier League',
    slug: 'premier-league',
    description: 'English Premier League match reports & updates',
    color: '#3B82F6',
    icon: 'football',
    isFeatured: true,
    order: 2,
  },
  {
    name: 'Champions League',
    slug: 'champions-league',
    description: 'UEFA Champions League nights and analysis',
    color: '#6366F1',
    icon: 'trophy',
    isFeatured: true,
    order: 3,
  },
  {
    name: 'Transfers & Rumours',
    slug: 'transfers',
    description: 'Transfer window intel, confirmed deals and rumours',
    color: '#10B981',
    icon: 'swap-horizontal',
    isFeatured: true,
    order: 4,
  },
  {
    name: 'Tactical Analysis',
    slug: 'tactical-analysis',
    description: 'Deep dives, formations and match breakdowns',
    color: '#8B5CF6',
    icon: 'analytics',
    isFeatured: true,
    order: 5,
  },
  {
    name: 'AFCON 2025',
    slug: 'afcon-2025',
    description: 'Africa Cup of Nations coverage and stories',
    color: '#F59E0B',
    icon: 'globe',
    isFeatured: true,
    order: 6,
  },
  {
    name: 'La Liga',
    slug: 'la-liga',
    description: 'Spanish football, Real Madrid, Barcelona & more',
    color: '#EC4899',
    icon: 'shield',
    isFeatured: false,
    order: 7,
  },
  {
    name: 'NBA & Basketball',
    slug: 'nba-basketball',
    description: 'NBA highlights, trades and game recaps',
    color: '#F97316',
    icon: 'basketball',
    isFeatured: false,
    order: 8,
  },
  {
    name: 'Cricket & IPL',
    slug: 'cricket-ipl',
    description: 'International cricket and franchise tournaments',
    color: '#14B8A6',
    icon: 'baseball',
    isFeatured: false,
    order: 9,
  },
  {
    name: "Editor's Picks",
    slug: 'editors-picks',
    description: 'Curated top editorial columns and features',
    color: '#EAB308',
    icon: 'star',
    isFeatured: true,
    order: 10,
  },
];

const ARTICLES = [
  {
    title: "Arsenal Dominance: Arteta's Tactical Masterclass Seals North London Victory",
    excerpt: "Arsenal delivered a masterclass in pressing and defensive organisation to overcome rivals Tottenham, cementing their title ambitions with a commanding display.",
    category: "Premier League",
    categorySlug: "premier-league",
    tags: ["Arsenal", "Premier League", "Mikel Arteta", "Bukayo Saka", "Tactics"],
    relatedTeam: "Arsenal",
    views: 3420,
    isBreaking: true,
    isFeatured: true,
    author: "Gabriel Martin",
    readTime: 4,
    source: "GoalMills Football Desk",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200",
    content: `
      <h2>The Blueprint for Domination</h2>
      <p>From the opening whistle, Arsenal executed an aggressive high-press system that completely disconnected Tottenham's midfield conductors. Mikel Arteta set his side up in an asymmetrical 4-3-3 shape that morphed into a compact 3-2-5 in possession.</p>
      
      <blockquote>"Our intensity and discipline across all 90 minutes made the difference. Every player knew their role without hesitation." — Mikel Arteta</blockquote>

      <h2>Midfield Control & Second-Ball Supremacy</h2>
      <p>Declan Rice anchored the midfield with authority, registering 6 interceptions and an 89% pass completion rate under intense duress. Martin Ødegaard orchestrated transitions with surgical precision, unlocking the half-spaces and feeding Saka down the right channel.</p>

      <h2>Key Tactical Takeaways</h2>
      <ul>
        <li><strong>High Block Efficiency:</strong> Forced 14 turnovers in the attacking third.</li>
        <li><strong>Set Piece Mastery:</strong> Converted an inswinging corner through an aerial overload.</li>
        <li><strong>Defensive Solidity:</strong> Limited the opposition to zero shots on target from open play.</li>
      </ul>
      <p>With this statement triumph, Arsenal signal that their tactical maturity is primed for the title run-in.</p>
    `,
  },
  {
    title: "Real Madrid Agree Record Deal for Sensational Wonderkid in Mega Summer Move",
    excerpt: "Los Blancos have finalised terms on an astonishing €95M summer transfer package, securing Europe's most coveted attacking talent ahead of Premier League suitors.",
    category: "Transfers & Rumours",
    categorySlug: "transfers",
    tags: ["Real Madrid", "Transfers", "La Liga", "Champions League", "Breaking"],
    relatedTeam: "Real Madrid",
    views: 5120,
    isBreaking: true,
    isFeatured: true,
    author: "Fabrizio Romano Desk",
    readTime: 3,
    source: "European Transfer Intel",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200",
    content: `
      <h2>Deal Agreed: The Summer's Biggest Blockbuster</h2>
      <p>Real Madrid have reached a total agreement in principle following extensive negotiations in Madrid. The transfer package includes €75m fixed fee plus €20m in performance-related add-ons.</p>
      
      <p>The player completed preliminary medical examinations this week and will sign a five-year contract running until June 2031 with a €1 billion release clause.</p>

      <h2>Why Madrid Pushed so Aggressively</h2>
      <p>Faced with aggressive approaches from two Premier League powerhouses, Florentino Pérez sanctioned the rapid activation of the operation to ensure the player joins Carlo Ancelotti's star-studded forward line ahead of pre-season.</p>
    `,
  },
  {
    title: "Champions League Quarterfinal Draw: Heavyweight Collisions Await in Europe",
    excerpt: "The Champions League last-eight draw has delivered mouthwatering fixtures, pitching reigning champions against formidable challengers in classic European showdowns.",
    category: "Champions League",
    categorySlug: "champions-league",
    tags: ["Champions League", "Real Madrid", "Man City", "Bayern Munich", "UEFA"],
    relatedTeam: "Man City",
    views: 4210,
    isBreaking: false,
    isFeatured: true,
    author: "Sophia Sterling",
    readTime: 5,
    source: "UEFA Intelligence",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=1200",
    content: `
      <h2>Blockbuster Ties on European Nights</h2>
      <p>The road to Wembley has become clearer following the official quarterfinal draw in Nyon. Defending champions Manchester City face a titanic rematch against Spanish giants Real Madrid, while Bayern Munich square off against a resurgent Arsenal.</p>
      
      <h2>Route to the Final</h2>
      <p>The bracket sets up the possibility of an all-English semi-final or an epic continental clash of historic titans. Tactical matchups will hinge on squad depth and discipline in the decisive second legs.</p>
    `,
  },
  {
    title: "Tactical Breakdown: How False Nines and Inverted Full-Backs are Reshaping 2026 Football",
    excerpt: "An in-depth tactical study exploring how modern managers create numerical overloads in the central third by transforming full-backs into playmaking midfielders.",
    category: "Tactical Analysis",
    categorySlug: "tactical-analysis",
    tags: ["Tactics", "Tactical Analysis", "Pep Guardiola", "Arsenal", "Man City"],
    relatedTeam: "Arsenal",
    views: 2890,
    isBreaking: false,
    isFeatured: true,
    author: "Tactical Lab",
    readTime: 6,
    source: "GoalMills Analytics",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=1200",
    content: `
      <h2>The Evolution of Positional Play</h2>
      <p>The traditional chalk-on-the-boots full-back is practically extinct among top-flight European contenders. Today's elite full-backs step directly into the midfield pivot upon possession turnover.</p>

      <h2>Numerical Overloads in Zone 14</h2>
      <p>By moving into central spaces, inverted full-backs create a 3-2 structure that prevents counter-attacks and guarantees passing angles between the lines. This creates space on the wings for explosive wide wingers to isolate defenders in 1v1 duels.</p>
    `,
  },
  {
    title: "AFCON 2025: Nigeria vs Algeria Quarterfinal Showdown Analysis",
    excerpt: "Nigeria’s 2–0 victory over Algeria in the AFCON quarterfinal was a statement win that underlined the Super Eagles’ status as genuine title contenders.",
    category: "AFCON 2025",
    categorySlug: "afcon-2025",
    tags: ["AFCON 2025", "Nigeria", "Algeria", "Victor Osimhen", "Africa Cup of Nations"],
    relatedTeam: "Nigeria",
    views: 4890,
    isBreaking: true,
    isFeatured: false,
    author: "GoalMills Africa Desk",
    readTime: 4,
    source: "AFCON Central",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1200",
    content: `
      <h2>Dominant Display in Marrakech</h2>
      <p>Nigeria produced a commanding 2-0 quarterfinal victory against Algeria in Marrakech. Victor Osimhen opened the scoring with a thunderous header before Akor Adams sealed the semifinal berth with an acrobatic finish.</p>
      
      <p>The Super Eagles now advance to the semi-finals to face tournament hosts Morocco in a historic clash of African heavyweights.</p>
    `,
  },
  {
    title: "NBA Finals Preview: Lakers vs Celtics Rivalry Rekindled in High-Stakes Championship Duel",
    excerpt: "The NBA’s two most decorated franchises clash in a marquee 7-game series featuring superstar clashes, explosive perimeter shooting and defensive grit.",
    category: "NBA & Basketball",
    categorySlug: "nba-basketball",
    tags: ["NBA", "Lakers", "Celtics", "Basketball", "LeBron James"],
    relatedTeam: "Lakers",
    views: 3180,
    isBreaking: false,
    isFeatured: false,
    author: "Hoops Insider",
    readTime: 4,
    source: "CourtSide Report",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200",
    content: `
      <h2>Historic Battle for 18th Banner</h2>
      <p>The historic rivalry resumes with both Los Angeles and Boston locked at 17 championships each. The series promises tactical adjustments on pick-and-roll defense and transition pace.</p>
      
      <h2>Key Matchups to Watch</h2>
      <p>Perimeter shooting efficiency and offensive rebounding will determine which team claims the Larry O'Brien trophy in game seven.</p>
    `,
  },
  {
    title: "IPL 2026 Season Kickoff: Thrilling Super Over Finale Lights Up Opening Night",
    excerpt: "A sensational opening match of IPL 2026 culminated in a nail-biting Super Over finish before 80,000 roaring cricket fans in Ahmedabad.",
    category: "Cricket & IPL",
    categorySlug: "cricket-ipl",
    tags: ["Cricket", "IPL", "India", "T20", "Cricket & IPL"],
    relatedTeam: "India",
    views: 6240,
    isBreaking: true,
    isFeatured: true,
    author: "Rohan Sharma",
    readTime: 3,
    source: "CricIntel",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1200",
    content: `
      <h2>Unbelievable Drama in the Desert of Runs</h2>
      <p>The 2026 Indian Premier League began with a breath-taking encounter that went down to the absolute wire. Tied at 214 runs apiece after 40 pulsating overs, the match was decided in a dramatic Super Over.</p>
      
      <p>With 18 required off the extra 6 balls, two towering sixes over long-on brought home an unforgettable opening night triumph.</p>
    `,
  },
  {
    title: "Chelsea's Next Era: Youth Project Reaches Turning Point as Stars Mature",
    excerpt: "Chelsea's multi-million youth recruitment strategy is beginning to bear fruit as tactical stability and individual growth power a top-four charge.",
    category: "Premier League",
    categorySlug: "premier-league",
    tags: ["Chelsea", "Premier League", "Transfers", "Cole Palmer"],
    relatedTeam: "Chelsea",
    views: 2950,
    isBreaking: false,
    isFeatured: false,
    author: "Liam Vance",
    readTime: 4,
    source: "London Football Review",
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=1200",
    content: `
      <h2>Patience Rewarded at Stamford Bridge</h2>
      <p>After periods of transition, Chelsea's young squad is showing the defensive cohesion and attacking dynamism required to contend at the very highest level of English football.</p>
    `,
  },
  {
    title: "Editor's Pick: The Unsung Heroes Who Dictate the Tempo of Global Sport",
    excerpt: "From deep-lying playmakers to defensive stoppers, we celebrate the tactical architects whose quiet brilliance turns good teams into dynasties.",
    category: "Editor's Picks",
    categorySlug: "editors-picks",
    tags: ["Editor's Picks", "Tactics", "Football", "Champions League", "Deep Dive"],
    relatedTeam: "Real Madrid",
    views: 3900,
    isBreaking: false,
    isFeatured: true,
    author: "Chief Sports Editor",
    readTime: 5,
    source: "GoalMills Longform",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=1200",
    content: `
      <h2>Beyond the Glamour of the Goalscorers</h2>
      <p>While strikers grab the headlines and Ballon d'Or podiums, tactical superiority is won in the subtle battles of tempo, body shape, and defensive recovery runs.</p>
      
      <p>In this special feature, we dissect five world-class midfield architects whose spatial awareness elevates everyone around them.</p>
    `,
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL as string);
    console.log('MongoDB connected successfully.');

    // 1. Seed Categories
    console.log('Seeding Categories...');
    for (const cat of CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true }
      );
    }
    console.log(`Successfully seeded ${CATEGORIES.length} categories.`);

    // 2. Seed Articles
    console.log('Seeding News Articles...');
    for (const art of ARTICLES) {
      await News.findOneAndUpdate(
        { title: art.title },
        { $set: art },
        { upsert: true, new: true }
      );
    }
    console.log(`Successfully seeded ${ARTICLES.length} news articles.`);

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
