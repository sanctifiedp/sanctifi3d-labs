require("dotenv").config({ path: ".env.local" });
const { initializeApp } = require("firebase/app");
const { getFirestore, addDoc, collection, query, where, getDocs } = require("firebase/firestore");

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});
const db = getFirestore(app);
const GROQ_KEY = process.env.GROQ_API_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

const SEARCHES = [
  { topic:"crypto airdrop free tokens 2026", audience:"Crypto", type:"Airdrop", site:"https://airdrops.io" },
  { topic:"web3 bounty program 2026", audience:"Web3", type:"Bounty", site:"https://earn.superteam.fun" },
  { topic:"web3 hackathon prize 2026", audience:"Web3", type:"Hackathon", site:"https://dorahacks.io" },
  { topic:"NFT presale whitelist 2026", audience:"Web3", type:"Presale", site:"https://nftcalendar.io" },
  { topic:"design contest prize 2026", audience:"Graphic Design", type:"Contest", site:"https://99designs.com/contests" },
  { topic:"AI grant program 2026", audience:"AI Tools", type:"Grant", site:"https://openai.com/fund" },
  { topic:"crypto trading competition 2026", audience:"Crypto", type:"Contest", site:"https://binance.com/en/competition" },
];

async function getImage(keyword) {
  try {
    const res = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&orientation=landscape&client_id=${UNSPLASH_KEY}`);
    return (await res.json())?.urls?.regular || "";
  } catch { return ""; }
}

async function hunt(topic, audience, type, site) {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model:"llama-3.3-70b-versatile", messages:[{ role:"user", content:`You are a Web3 alpha curator. Write a SHORT (150-250 words) summary of this earning opportunity for ${audience} enthusiasts.\n\nTopic: ${topic}\nType: ${type}\nSource: ${site}\n\nInclude:\n- What it is\n- How to participate (bullet points)\n- Rewards if known\n- End with: "👉 Participate: ${site}"\n- End with: "⚠️ Always DYOR."\n\nBe concise and actionable.` }], max_tokens:400 })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch(e) { return ""; }
}

async function exists(title) {
  try {
    const snap = await getDocs(query(collection(db,"alpha"), where("title","==",title)));
    return !snap.empty;
  } catch { return false; }
}

async function run() {
  console.log("Alpha Hunter running...");
  for (const s of SEARCHES) {
    try {
      const title = `${s.type}: ${s.audience} Opportunity — ${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;
      if (await exists(title)) { console.log("Skip:", title); continue; }
      console.log("Hunting:", s.type, s.audience);
      const content = await hunt(s.topic, s.audience, s.type, s.site);
      if (!content || content.length < 80) { console.log("Skipped - empty"); continue; }
      const imageUrl = await getImage(s.audience.toLowerCase());
      await addDoc(collection(db,"alpha"), { title, type:s.type, audience:s.audience, content, imageUrl, sourceUrl:s.site, sourceLabel:s.site.replace("https://","").split("/")[0], status:"pending", date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}), createdAt:new Date().toISOString() });
      console.log("Saved:", title);
    } catch(e) { console.error("Error:", e.message); }
  }
  console.log("Alpha Hunt complete."); process.exit(0);
}
run();
