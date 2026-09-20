// Every logo in ./icons, loaded at build time. Vite turns each file into a URL
// (with a content hash, so browsers can cache it forever).
const files = import.meta.glob('./icons/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const icons: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.replace('./icons/', '').replace('.svg', ''), url]),
);
