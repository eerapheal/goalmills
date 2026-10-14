import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('apps/web/src/lib/football/competitionRegistry.ts');
let content = fs.readFileSync(filePath, 'utf8');

const UPDATES_BY_KEY = {
  'CAF-WAFCON': 7547,
  'CAF-AFCON-U20': 619,
  'CAF-AFCON-U17': 10253,
  'NGA-NPFL': 248,
  'EGY-PREMIER-LEAGUE': 141,
  'MAR-BOTOLA-PRO': 239,
  'GHA-PREMIER-LEAGUE': 177,
  'ENG-EFL-CUP': 147,
  'GER-DFB-POKAL': 172,
  'FRA-COUPE-DE-FRANCE': 165,
  'UEFA-SUPER-CUP': 372,
  'CONMEBOL-LIBERTADORES': 18,
  'CONMEBOL-SUDAMERICANA': 385,
  'ARG-PRIMERA-DIVISION': 44,
  'SCO-PREMIERSHIP': 279,
  'BEL-PRO-LEAGUE': 63,
  'USA-MLS': 332,
  'AFC-CHAMPIONS-LEAGUE': 10,
  'CONCACAF-CHAMPIONS-CUP': 5,
  'UEFA-U21-EURO': 511,
};

let count = 0;
for (const [key, newProviderId] of Object.entries(UPDATES_BY_KEY)) {
  const regex = new RegExp(`('${key}':\\s*{[\\s\\S]*?providerId:)\\s*\\d+,`, 'g');
  if (regex.test(content)) {
    content = content.replace(regex, `$1 ${newProviderId},`);
    count++;
    console.log(`Updated ${key} -> providerId: ${newProviderId}`);
  } else {
    console.warn(`Could not find ${key} in competitionRegistry.ts`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Updated ${count} canonical competitions in competitionRegistry.ts`);
