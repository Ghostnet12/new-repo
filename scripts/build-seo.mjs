import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pages,siteOrigin} from '../shared/pages.js';
const root=new URL('../client/dist/',import.meta.url);const template=await readFile(new URL('index.html',root),'utf8');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const image=siteOrigin+'/assets/the-fold/deck-preview.png';
for(const page of Object.values(pages)){
 const url=siteOrigin+page.path;
 const meta=`<title>${esc(page.title)}</title><meta name="description" content="${esc(page.description)}"><meta name="robots" content="index, follow"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="The Fold"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${image}"><meta property="og:image:alt" content="The Fold Shadow Deck with gold celestial artwork"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(page.title)}"><meta name="twitter:description" content="${esc(page.description)}"><meta name="twitter:image" content="${image}"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'WebSite','@id':siteOrigin+'/#website',name:'The Fold',url:siteOrigin+'/',description:pages.read.description},{'@type':'WebPage',url,name:page.title,description:page.description,isPartOf:{'@id':siteOrigin+'/#website'}}]})}</script>`;
 const fallback=`<main><h1>${esc(page.heading)}</h1><p>${esc(page.text)}</p><nav aria-label="Explore The Fold">${Object.values(pages).map(p=>`<p><a href="${p.path}">${esc(p.label)}</a></p>`).join('')}</nav><p>Enable JavaScript to use the interactive readings and review form.</p></main>`;
 const html=template.replace(/<title>.*?<\/title>/s,'').replace(/<meta name="description"[^>]*>/,'').replace('</head>',meta+'</head>').replace('<div id="root"></div>',`<div id="root">${fallback}</div>`);
 const dir=page.path==='/'?root:new URL('.'+page.path+'/',root);await mkdir(dir,{recursive:true});await writeFile(new URL('index.html',dir),html);
}
await writeFile(new URL('robots.txt',root),`User-agent: *\nAllow: /\nDisallow: /api/\nAllow: /api/reviews\nDisallow: /api/reviews/mine\nDisallow: /history\nSitemap: ${siteOrigin}/sitemap.xml\n`);
await writeFile(new URL('sitemap.xml',root),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.values(pages).map(p=>`<url><loc>${siteOrigin+p.path}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${Object.keys(pages).length} public pages, structured metadata, robots.txt and sitemap.xml`);

const historyPage=(await readFile(new URL('index.html',root),'utf8')).replace('content="index, follow"','content="noindex, nofollow"').replace(/<title>.*?<\/title>/s,'<title>Your Past Readings | The Fold</title>');
await mkdir(new URL('history/',root),{recursive:true});await writeFile(new URL('history/index.html',root),historyPage);
await writeFile(new URL('404.html',root),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | The Fold</title></head><body style="background:#100b19;color:#f0dfbe;font:20px Georgia;padding:8vw"><h1>This page is outside The Fold.</h1><p>The address may have changed.</p><a style="color:#e4bd70" href="/">Return to The Fold</a></body></html>');
