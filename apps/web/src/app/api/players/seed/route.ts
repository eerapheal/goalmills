import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Player from '@/models/Player';

const SEED_AFRICAN_SUPERSTARS = [
  {
    name: 'Victor Osimhen',
    slug: 'victor-osimhen',
    number: 45,
    position: 'Striker / Forward',
    nationality: 'Nigeria',
    countryFlag: '🇳🇬',
    africanOrigin: true,
    clubSlug: 'galatasaray',
    clubName: 'Galatasaray (Loan from Napoli)',
    competitionSlug: 'caf-champions-league',
    photo: 'https://media.api-sports.io/football/players/1458.png',
    age: 26,
    height: '186 cm',
    marketValue: '€75.00M',
    contractUntil: 'June 2027',
    weeklyWage: '€160,000',
    releaseClause: '€75.00M',
    agent: 'Roberto Calenda',
    marketValueTrend: 'up',
    bio: 'Victor Osimhen is a world-class Nigerian striker renowned for explosive acceleration, dominant aerial leap, and clinical finishing. CAF African Footballer of the Year talisman.',
    seasonStats: {
      appearances: 18,
      goals: 16,
      assists: 4,
      yellowCards: 2,
      passAccuracy: '81.4%',
      rating: 8.35,
    },
    isFeatured: true,
  },
  {
    name: 'Mohamed Salah',
    slug: 'mohamed-salah',
    number: 11,
    position: 'Right Winger',
    nationality: 'Egypt',
    countryFlag: '🇪🇬',
    africanOrigin: true,
    clubSlug: 'liverpool',
    clubName: 'Liverpool FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/306.png',
    age: 33,
    height: '175 cm',
    marketValue: '€55.00M',
    contractUntil: 'June 2027',
    weeklyWage: '€350,000',
    releaseClause: 'None',
    agent: 'Ramy Abbas Issa',
    marketValueTrend: 'stable',
    bio: 'Egyptian icon and Premier League record-breaker. Mohamed Salah remains one of the world elite forwards with devastating pace, creative incisiveness, and clinical finishing.',
    seasonStats: {
      appearances: 22,
      goals: 15,
      assists: 11,
      yellowCards: 1,
      passAccuracy: '83.8%',
      rating: 8.28,
    },
    isFeatured: true,
  },
  {
    name: 'Ademola Lookman',
    slug: 'ademola-lookman',
    number: 11,
    position: 'Left Winger / Second Striker',
    nationality: 'Nigeria',
    countryFlag: '🇳🇬',
    africanOrigin: true,
    clubSlug: 'atalanta',
    clubName: 'Atalanta BC',
    competitionSlug: 'serie-a',
    photo: 'https://media.api-sports.io/football/players/18883.png',
    age: 27,
    height: '174 cm',
    marketValue: '€50.00M',
    contractUntil: 'June 2027',
    weeklyWage: '€85,000',
    releaseClause: '€60.00M',
    agent: 'Wasserman',
    marketValueTrend: 'up',
    bio: 'UEFA Europa League final hat-trick hero and Ballon d\'Or nominee. Ademola Lookman is an electrifying dribbler with devastating finishing off either flank.',
    seasonStats: {
      appearances: 20,
      goals: 12,
      assists: 7,
      yellowCards: 1,
      passAccuracy: '84.1%',
      rating: 8.12,
    },
    isFeatured: true,
  },
  {
    name: 'Achraf Hakimi',
    slug: 'achraf-hakimi',
    number: 2,
    position: 'Right Wing-back / Right-back',
    nationality: 'Morocco',
    countryFlag: '🇲🇦',
    africanOrigin: true,
    clubSlug: 'paris-saint-germain',
    clubName: 'Paris Saint-Germain',
    competitionSlug: 'ligue-1',
    photo: 'https://media.api-sports.io/football/players/126.png',
    age: 26,
    height: '181 cm',
    marketValue: '€65.00M',
    contractUntil: 'June 2029',
    weeklyWage: '€240,000',
    releaseClause: 'None',
    agent: 'Alejandro Camaño',
    marketValueTrend: 'up',
    bio: 'Widely considered the world best attacking right-back. The Atlas Lions talisman combines supersonic recovery speed with pinpoint crossing delivery.',
    seasonStats: {
      appearances: 21,
      goals: 5,
      assists: 9,
      yellowCards: 3,
      passAccuracy: '88.7%',
      rating: 8.18,
    },
    isFeatured: true,
  },
  {
    name: 'Mohammed Kudus',
    slug: 'mohammed-kudus',
    number: 14,
    position: 'Attacking Midfielder / Winger',
    nationality: 'Ghana',
    countryFlag: '🇬🇭',
    africanOrigin: true,
    clubSlug: 'west-ham',
    clubName: 'West Ham United',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/35926.png',
    age: 24,
    height: '177 cm',
    marketValue: '€55.00M',
    contractUntil: 'June 2028',
    weeklyWage: '€90,000',
    releaseClause: '€85.00M',
    agent: 'Jennifer Mendelewitsch',
    marketValueTrend: 'up',
    bio: 'Ghana dynamic dribbling sensation celebrated for low centre of gravity, press resistance, and thunderous long-range shooting.',
    seasonStats: {
      appearances: 19,
      goals: 8,
      assists: 5,
      yellowCards: 4,
      passAccuracy: '85.3%',
      rating: 7.95,
    },
    isFeatured: true,
  },
  {
    name: 'Bryan Mbeumo',
    slug: 'bryan-mbeumo',
    number: 19,
    position: 'Right Winger / Forward',
    nationality: 'Cameroon',
    countryFlag: '🇨🇲',
    africanOrigin: true,
    clubSlug: 'brentford',
    clubName: 'Brentford FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/20349.png',
    age: 26,
    height: '171 cm',
    marketValue: '€45.00M',
    contractUntil: 'June 2027',
    weeklyWage: '€75,000',
    releaseClause: '€65.00M',
    agent: 'Unique Sports Group',
    marketValueTrend: 'up',
    bio: 'Cameroon international with explosive counter-attacking burst, lethal cut-in finishing, and high-pressing work rate in the Premier League.',
    seasonStats: {
      appearances: 20,
      goals: 11,
      assists: 6,
      yellowCards: 2,
      passAccuracy: '82.6%',
      rating: 8.05,
    },
    isFeatured: true,
  },
];

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    let createdCount = 0;
    let updatedCount = 0;

    for (const data of SEED_AFRICAN_SUPERSTARS) {
      const existing = await Player.findOne({ slug: data.slug });
      if (!existing) {
        await Player.create(data as any);
        createdCount++;
      } else {
        await Player.updateOne({ slug: data.slug }, { $set: data });
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database synchronized successfully. Created ${createdCount}, updated ${updatedCount} superstars.`,
      createdCount,
      updatedCount,
    });
  } catch (error: any) {
    console.error('Error seeding players:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed players' },
      { status: 500 }
    );
  }
}
