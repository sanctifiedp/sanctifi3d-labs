require("dotenv").config({ path: ".env.local" });
const Parser = require("rss-parser");
const { initializeApp } = require("firebase/app");
const { getFirestore, addDoc, collection } = require("firebase/firestore");

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});
const db = getFirestore(app);
const parser = new Parser({ customFields: { item: ["media:content","enclosure"] } });
const GROQ_KEY = process.env.GROQ_API_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

const FEEDS = [
  { url: "https://cointelegraph.com/rss", category: "Crypto" },
  { url: "https://decrypt.co/feed", category: "Web3" },
  { url: "https://thedefiant.io/feed", category: "Web3" },
];

async function getImage(category) {
  try {
    const terms = { Crypto:["bitcoin","crypto"], Web3:["web3","nft"], Design:["design"], "AI Tools":["AI"] };
    const keyword = (terms[category]||["technology"])[0];
    const res = await fetch(`https://api.unsplash.com/photos/random?query=${keyword}&orientation=landscape&client_id=${UNSPLASH_KEY}`);
    return (await res.json())?.urls?.regular || "";
  } catch { return ""; }
}

async function summarize(title, content) {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role:"user", content:`Write a detailed 3-paragraph blog post about this news. Title: ${title}. Content: ${content?.slice(0,800)}. Professional tone, no headers.` }], max_tokens: 800 })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch(e) { return ""; }
}

async function run() {
  console.log("AI Engine running...");
  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items.slice(0,2)) {
        console.log("Processing:", item.title);
        const content = await summarize(item.title, item.contentSnippet||"");
        if (!content) { console.log("Skipped"); continue; }
        const imageUrl = item.enclosure?.url || await getImage(feed.category);
        await addDoc(collection(db,"posts"), { title:item.title, category:feed.category, content, imageUrl, source:item.link||"", sourceLabel:parsed.title||"", type:"ai", status:"pending", date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}), createdAt:new Date().toISOString() });
        console.log("Saved:", item.title);
      }
    } catch(e) { console.error("Error:", feed.url, e.message); }
  }
  console.log("Done."); process.exit(0);
}
run();
