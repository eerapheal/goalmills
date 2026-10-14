import fs from 'node:fs';
import path from 'node:path';

export const CORRECTED_IDS = {
  'npfl': 248,
  'egyptian-premier-league': 141,
  'botola-pro': 239,
  'ghanaian-premier-league': 177,
  'afcon-u20': 619,
  'afcon-u17': 10253,
  'afcon-women': 7547,
  'uefa-super-cup': 372,
  'scottish-premiership': 279,
  'belgian-pro-league': 63,
  'austrian-bundesliga': 56,
  'greek-super-league': 178,
  'russian-premier-league': 344,
  'czech-first-league': 134,
  'danish-superliga': 135,
  'norwegian-eliteserien': 253,
  'swedish-allsvenskan': 307,
  'ukrainian-premier-league': 325,
  'croatian-first-league': 124,
  'serbian-superliga': 288,
  'romanian-liga-1': 272,
  'efl-league-cup': 147,
  'dfb-pokal': 172,
  'coupe-de-france': 165,
  'fifa-world-cup-women': 20,
  'fifa-u20-world-cup': 425,
  'fifa-u17-world-cup': 415,
  'fifa-club-world-cup': 12614,
  'uefa-euro-u21': 511,
  'uefa-euro-u19': 611,
  'uefa-euro-u17': 7099,
  'uefa-womens-euro': 499,
  'copa-libertadores': 18,
  'copa-sudamericana': 385,
  'concacaf-gold-cup': 15,
  'concacaf-nations-league': 664,
  'concacaf-champions-cup': 5,
  'afc-asian-cup': 347,
  'afc-champions-league': 10,
  'mls': 332,
  'liga-profesional': 44,
  'j1-league': 209,
  'k-league-1': 219,
  'indian-super-league': 566,
  'a-league': 49,
};

const catPath = path.resolve('apps/web/src/lib/competitionCategories.ts');
const catContent = fs.readFileSync(catPath, 'utf8');

// Parse entries in ALL_COMPETITIONS
const entries = [];
const entryRegex = /{\s*id:\s*(\d+),[\s\S]*?name:\s*(?:"([^"]+)"|'([^']+)'),\s*slug:\s*'([^']+)'/g;
let match;
while ((match = entryRegex.exec(catContent)) !== null) {
  entries.push({
    id: Number(match[1]),
    name: match[2] || match[3],
    slug: match[4],
  });
}

console.log(`Found ${entries.length} competitions in competitionCategories.ts`);

let mismatches = 0;
for (const [slug, expectedId] of Object.entries(CORRECTED_IDS)) {
  const found = entries.find((e) => e.slug === slug);
  if (!found) {
    console.error(`❌ [NOT IN CATEGORIES] slug '${slug}' expected ${expectedId}`);
    mismatches++;
  } else if (found.id !== expectedId) {
    console.error(`❌ [MISMATCH] ${slug} (${found.name}): current ${found.id} !== expected ${expectedId}`);
    mismatches++;
  } else {
    console.log(`✅ [OK] ${slug} -> ${found.id} (${found.name})`);
  }
}

// Also check that WAFU-B is NOT present in competitionCategories.ts
const wafuFound = entries.find((e) => e.slug === 'wafu-b-nations-cup' || e.id === 631);
if (wafuFound) {
  console.error(`❌ [WAFU-B PRESENT] WAFU-B Nations Cup should not be in catalogue.`);
  mismatches++;
} else {
  console.log(`✅ [OK] WAFU-B excluded as requested.`);
}

// Audit canonical registry
const regPath = path.resolve('apps/web/src/lib/football/competitionRegistry.ts');
const regContent = fs.readFileSync(regPath, 'utf8');
const compRegex = /'([^']+)':\s*{[\s\S]*?providerId:\s*(\d+),[\s\S]*?slug:\s*'([^']+)'/g;
const regEntries = [];
while ((match = compRegex.exec(regContent)) !== null) {
  regEntries.push({ key: match[1], providerId: Number(match[2]), slug: match[3] });
}

console.log(`\nAuditing ${regEntries.length} canonical competitions in competitionRegistry.ts...`);
for (const [slug, expectedId] of Object.entries(CORRECTED_IDS)) {
  const found = regEntries.find((e) => e.slug === slug);
  if (found) {
    if (found.providerId !== expectedId) {
      console.error(`❌ [CANONICAL MISMATCH] ${found.key} (${slug}): current ${found.providerId} !== expected ${expectedId}`);
      mismatches++;
    } else {
      console.log(`✅ [CANONICAL OK] ${found.key} (${slug}) -> ${found.providerId}`);
    }
  }
}

console.log(`\nVerification finished with ${mismatches} mismatch(es).`);
if (mismatches > 0) {
  process.exit(1);
} else {
  console.log(`All league IDs verified successfully against AllSports provider specifications.`);
}
