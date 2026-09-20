// Scrambles an email address so it can go in content.ts without bots reading it.
// Usage:  npm run email -- you@example.com
// Paste the printed code into `emailCode` in src/content.ts.
const email = process.argv[2];
if (!email || !email.includes('@')) {
  console.error('Usage: npm run email -- you@example.com');
  process.exit(1);
}
// Reverse it, then base64 it: no "@", no readable domain left for a scraper to match.
const code = Buffer.from([...email.trim()].reverse().join('')).toString('base64');
console.log(`\nemailCode: '${code}',\n`);
