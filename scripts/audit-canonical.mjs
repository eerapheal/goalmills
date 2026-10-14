import fs from 'node:fs';

const regPath = 'apps/web/src/lib/football/competitionRegistry.ts';
const content = fs.readFileSync(regPath, 'utf8');

const ID_UPDATES = {
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

const compRegex = /'([^']+)':\s*{[\s\S]*?providerId:\s*(\d+),[\s\S]*?slug:\s*'([^']+)'/g;
let m;
const foundInReg = [];
while ((m = compRegex.exec(content)) !== null) {
  foundInReg.push({ key: m[1], providerId: Number(m[2]), slug: m[3] });
}

console.log('Total entries parsed in CANONICAL_COMPETITIONS:', foundInReg.length);
let matchedCount = 0;
let notFoundCount = 0;
for (const [slug, newId] of Object.entries(ID_UPDATES)) {
  const match = foundInReg.find(e => e.slug === slug);
  if (match) {
    console.log(`[CANONICAL MATCH] ${match.key} (${slug}): providerId ${match.providerId} -> ${newId}`);
    matchedCount++;
  } else {
    console.log(`[CANONICAL NOT FOUND] slug: ${slug}`);
    notFoundCount++;
  }
}
console.log(`Matched: ${matchedCount}, Not found in canonical: ${notFoundCount}`);
