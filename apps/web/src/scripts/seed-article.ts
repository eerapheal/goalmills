
import mongoose from 'mongoose';
import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'path';
import News from '../models/News';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error('Please define the MONGODB_URL environment variable inside .env');
  process.exit(1);
}

const article = {
    title: "Nigeria vs Algeria: Quarterfinal showdown",
    excerpt: "Nigeria’s 2–0 victory over Algeria in the AFCON 2025 quarterfinal was a statement win that underlined the Super Eagles’ status as genuine title contenders.",
    content: `
<h1>Nigeria vs Algeria: Quarterfinal showdown</h1>
<p>Nigeria faced Algeria in a highly anticipated AFCON 2025 quarterfinal clash in Marrakech, with both teams carrying big reputations and high expectations into the tie. The encounter was billed as a duel between Nigeria’s powerful attack and Algeria’s technical, experienced core built around stars like Riyad Mahrez.</p>

<p>From the outset, Nigeria showed greater intensity, pressing aggressively and forcing Algeria to play deeper than they would have liked. Algeria tried to slow the tempo and build through midfield, but the Super Eagles’ physicality and work rate repeatedly disrupted their rhythm.</p>

<h2>First half: balance and missed chances</h2>
<p>The first half remained goalless, but it was far from uneventful as Nigeria carved out the clearer openings. Calvin Bassey and his teammates frequently pushed high from the back, allowing the Super Eagles to pin Algeria in their own half for long spells.</p>

<p>Algeria’s defence and goalkeeper stood firm, blocking shots and dealing with crosses under sustained pressure. For all of Nigeria’s dominance, a combination of rushed finishing and last-ditch defending ensured the teams went into the break at 0–0.</p>

<h2>Second half: Osimhen and Adams seal it</h2>
<p>The match exploded into life early in the second half when Victor Osimhen finally broke the deadlock with a powerful header to give Nigeria a 1–0 lead. His goal was the product of clever movement in the box and a perfectly timed delivery that punished Algeria’s momentary lapse in marking.</p>

<p>Not long after, Akor Adams doubled the advantage, finishing off another incisive Nigerian attack to make it 2–0 and effectively end Algeria’s hopes. With a two-goal cushion, Nigeria managed the game superbly, using their control in midfield and defensive organisation to see out the result without serious alarms.</p>

<h2>Standout performances and tactical edge</h2>
<p>Osimhen once again showed why he is considered one of Africa’s elite forwards, mixing tireless pressing with a clinical, high-impact contribution in front of goal. Adams’ goal and all-round movement added an extra dimension to Nigeria’s front line, giving Algeria’s defence constant problems.</p>

<p>At the back, Nigeria’s defenders limited Algeria to half-chances, reading the game well and winning most duels in dangerous areas. The tactical structure allowed the Super Eagles to compress space, protect their box, and launch quick transitions whenever Algeria overcommitted.</p>

<h2>What this win means for Nigeria</h2>
<p>This 2–0 win sends Nigeria into the AFCON 2025 semi-finals, where they will face hosts Morocco in what promises to be another intense, high-stakes clash. The performance against Algeria boosts confidence in both the squad and coaching staff, showing that Nigeria can combine defensive discipline with attacking firepower on the biggest stage.</p>

<p>Beyond the immediate result, the victory strengthens Nigeria’s reputation as one of Africa’s most consistent tournament teams and keeps alive their ambition of lifting another continental crown. With Osimhen in form and the team structure looking solid, many observers will now see the Super Eagles as one of the favourites to go all the way at AFCON 2025.</p>
    `,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1000", // Placeholder football image
    category: "AFCON 2025",
    author: "GoalMills Editor",
    readTime: 5
};

async function seed() {
  try {
    if (!MONGODB_URL) return;
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');

    const created = await News.create(article);
    console.log('Article created successfully:', created._id);

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error seeding article:', error);
    process.exit(1);
  }
}

seed();
