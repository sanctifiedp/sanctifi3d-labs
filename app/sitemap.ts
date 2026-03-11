import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://sanctifi3d-labs.vercel.app";

  const snap = await getDocs(query(collection(db, "posts"), where("status", "==", "approved")));
  const posts = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));

  const staticPages = [
    { url: base, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/alpha`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${base}/settings`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/legal`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  const postPages = posts.map(p => ({
    url: `${base}/post/${p.id}`,
    lastModified: new Date(p.createdAt || Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...postPages];
}
