import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('apps/web/src/lib/competitionCategories.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove WAFU-B Nations Cup entry
const wafuRegex = /\s*{\s*id:\s*631,\s*apiSportsId:\s*631,\s*name:\s*'WAFU-B Nations Cup'[\s\S]*?ageGroup:\s*'senior',\s*},?\n?/;
if (wafuRegex.test(content)) {
  content = content.replace(wafuRegex, '\n');
  console.log('Removed WAFU-B Nations Cup from competitionCategories.ts');
} else {
  console.warn('WAFU-B regex did not match!');
}

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

let updatedCount = 0;
content = content.replace(/  {\r?\n    id: (\d+),([\s\S]*?\r?\n  },)/g, (block, oldId, body) => {
  const slugMatch = body.match(/slug: '([^']+)'/);
  if (slugMatch && ID_UPDATES[slugMatch[1]]) {
    const slug = slugMatch[1];
    const newId = ID_UPDATES[slug];
    updatedCount++;
    console.log(`[UPDATED] ${slug}: ${oldId} -> ${newId}`);
    return `  {\n    id: ${newId},${body}`;
  }
  return block;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Finished: updated ${updatedCount} of ${Object.keys(ID_UPDATES).length} entries in competitionCategories.ts`);
