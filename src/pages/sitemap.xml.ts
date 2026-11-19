import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { caseFiles } from '../data/profile';

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://matheesan.ca');
  const notes = (await getCollection('notes')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const staticPages = [
    { path: '/', changefreq: 'monthly', priority: '1.0' },
    { path: '/music/', changefreq: 'monthly', priority: '0.9' },
    { path: '/games/', changefreq: 'monthly', priority: '0.9' },
    { path: '/lab/', changefreq: 'monthly', priority: '0.8' },
    { path: '/notes/', changefreq: 'weekly', priority: '0.8' },
    { path: '/about/', changefreq: 'yearly', priority: '0.7' },
    { path: '/career/', changefreq: 'monthly', priority: '0.7' },
    { path: '/tooling/', changefreq: 'monthly', priority: '0.6' },
    { path: '/resume/', changefreq: 'monthly', priority: '0.7' },
    { path: '/contact/', changefreq: 'yearly', priority: '0.5' },
  ];

  const urls = [
    ...staticPages.map(
      (page) => `  <url>
    <loc>${escape(new URL(page.path, base).href)}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    ),
    ...caseFiles.map((file) => {
      const loc = escape(new URL(`/career/${file.id}/`, base).href);
      return `  <url>
    <loc>${loc}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }),
    ...notes.map((note) => {
      const loc = escape(new URL(`/notes/${note.id}/`, base).href);
      const lastmod = note.data.date.toISOString().slice(0, 10);
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
