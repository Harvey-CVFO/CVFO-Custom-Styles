// .github/scripts/parse-elitert.js
// Fetches EliteRT embed pages, parses member data, writes static JSON files.

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_TOKEN = 'ZBnJl96j5A0My2XrV0plu4Jq5Nsf5b4KoDpEyECm';
const BASE_URL = `https://api.elitert.com/teams/${BASE_TOKEN}`;

const TEAMS = [
  { key: 'ppt', file: 'team-ppt.json' },
  { key: 'ast', file: 'team-ast.json' },
  { key: 'vfo', file: 'team-vfo.json' },
];

async function fetchTeam(teamKey) {
  const url = `${BASE_URL}?team=${teamKey}`;
  const res = await fetch(url, {
    headers: {
      // Mimic a real browser request
      'User-Agent': 'Mozilla/5.0 (compatible; CVFO-Sync/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch team ${teamKey}: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

function parseMembers(html) {
  const $ = cheerio.load(html);
  const members = [];

  // Each member lives in .elite-vfo--member-container
  $('.elite-vfo--member-container, [class*="member-container"]').each((i, el) => {
    const $el = $(el);

    // Name — try the known class first, fall back to any name-like element
    const name = (
      $el.find('[class*="member-name"]').first().text().trim() ||
      $el.find('[class*="member__name"]').first().text().trim()
    );

    if (!name) return; // skip if no name found

    // Title / short bio
    const title = $el.find('[class*="member-shortbio"], [class*="shortbio"]').first().text().trim();

    // Photo
    const photo = $el.find('img').first().attr('src') || '';

    // Bio text — stored in data-description attribute on the Bio button
    // Clean <br /> tags and collapse excess whitespace
    const rawBio = $el.find('button[data-description]').first().attr('data-description') || '';
    const bio = rawBio
      .replace(/<br\s*\/?>/gi, '\n')   // <br /> → newline
      .replace(/\n{3,}/g, '\n\n')       // collapse 3+ newlines to 2
      .trim();

    // Button label (usually "Bio")
    const buttonLabel = $el.find('button').first().text().trim() || 'Bio';

    members.push({ name, title, photo, bio, buttonLabel });
  });

  return members;
}

async function run() {
  console.log('Starting EliteRT sync...');

  for (const team of TEAMS) {
    try {
      console.log(`Fetching team: ${team.key}`);
      const html = await fetchTeam(team.key);
      const members = parseMembers(html);

      if (!members.length) {
        console.warn(`⚠️  No members found for team ${team.key} — check selector`);
      } else {
        console.log(`  Found ${members.length} members`);
      }

      const output = {
        team: team.key,
        updated: new Date().toISOString(),
        members,
      };

      const outPath = path.join(process.cwd(), team.file);
      fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
      console.log(`  Written: ${team.file}`);

    } catch (err) {
      console.error(`Error on team ${team.key}:`, err.message);
      // Don't fail the whole job if one team fails
    }
  }

  console.log('Done.');
}

run();
