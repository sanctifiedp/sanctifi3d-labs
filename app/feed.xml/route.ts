import { db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET() {
  const base = "https://sanctifi3d-labs.vercel.app";
  try {
    const snap = await getDocs(query(collection(db,"posts"), where("status","==","approved")));
    const posts = snap.docs
      .map(d => ({ id:d.id, ...d.data() as any }))
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0,20);

    const items = posts.map(p => `
    <item>
      <title><![CDATA[${p.title || ""}]]></title>
      <link>${base}/post/${p.id}</link>
      <guid isPermaLink="true">${base}/post/${p.id}</guid>
      <pubDate>${new Date(p.createdAt || Date.now()).toUTCString()}</pubDate>
      <category>${p.category || ""}</category>
      <description><![CDATA[${p.content?.replace(/<[^>]+>/g,"").slice(0,300) || ""}]]></description>
    </item>`).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sanctifi3d Labs</title>
    <link>${base}</link>
    <description>AI-powered Web3, Crypto, Design and AI intelligence from Lagos, Nigeria.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

    return new Response(xml, { headers: { "Content-Type":"application/xml", "Cache-Control":"public, max-age=3600" } });
  } catch(e) {
    return new Response("Error generating feed", { status: 500 });
  }
}
