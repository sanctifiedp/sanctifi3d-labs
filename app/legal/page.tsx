"use client";

export default function Legal() {
  const sections = [
    ["Disclaimer","The content on Sanctifi3d Labs is for informational purposes only. Nothing here constitutes financial, legal, or investment advice. Always do your own research (DYOR) before making any financial decisions."],
    ["AI-Generated Content","Some posts on this platform are generated or summarized using AI tools including Groq LLM. While we review AI content before publishing, we cannot guarantee 100% accuracy. AI content is clearly labeled with '✦ AI'."],
    ["No Financial Advice","Alpha posts, airdrop alerts, bounty listings, and any other earning opportunities listed on this platform are NOT financial advice. We curate opportunities but do not endorse, verify, or guarantee any listed project or protocol."],
    ["Intellectual Property","All original content, branding, and design elements on Sanctifi3d Labs are the intellectual property of Sanctifi3d. Third-party content is attributed to its respective sources."],
    ["Privacy","We collect only your email address if you choose to subscribe to our newsletter. We do not sell your data to third parties. Comments are stored in our database solely to display them publicly on posts."],
    ["Cookies","This website may use essential cookies for functionality. No advertising or tracking cookies are used."],
    ["Limitation of Liability","Sanctifi3d Labs is not liable for any losses, damages, or negative outcomes resulting from actions taken based on content found on this platform."],
    ["Third-Party Links","Our content may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of those sites."],
    ["Changes to Policy","These policies may be updated at any time. Continued use of the platform constitutes acceptance of any changes."],
    ["Contact","For any concerns or inquiries, reach us on 𝕏 Twitter: @Sanctifi3d_1"],
  ];

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"80px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:740, margin:"0 auto" }}>
        <h1 style={{ fontSize:"clamp(28px,5vw,44px)", fontWeight:900, marginBottom:10, color:"var(--fg)" }}>Legal & Policies</h1>
        <p style={{ color:"var(--sub)", fontSize:15, marginBottom:40 }}>Last updated: March 2026</p>
        {sections.map(([title,body])=>(
          <div key={title} style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:"var(--fg)", marginBottom:8 }}>{title}</h2>
            <p style={{ fontSize:15, color:"var(--sub)", lineHeight:1.8, margin:0 }}>{body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
