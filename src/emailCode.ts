// Undo scripts/encode-email.mjs: base64-decode, then reverse.
// The plain address only ever exists in the visitor's browser, never in the site's files.
export function decodeEmail(code: string) {
  if (!code) return '';
  try {
    return [...atob(code)].reverse().join('');
  } catch {
    return '';   // a mistyped code shouldn't break the page; the email row just stays hidden
  }
}
