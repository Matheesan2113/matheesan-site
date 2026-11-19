import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://matheesan.ca');
  const notes = (await getCollection('notes')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const items = notes
    .map((note) => {
      const link = new URL(`/notes/${note.id}/`, base).href;
      return `    <item>
      <title>${escape(note.data.title)}</title>
      <link>${escape(link)}</link>
      <guid isPermaLink="true">${escape(link)}</guid>
      <description>${escape(note.data.description)}</description>
      <pubDate>${note.data.date.toUTCString()}</pubDate>
${note.data.tags.map((tag) => `      <category>${escape(tag)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Matheesan — field notes</title>
    <link>${escape(base.href)}</link>
    <description>Notes on production AI, evals, testing and systems.</description>
    <language>en-ca</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escape(new URL('/rss.xml', base).href)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
