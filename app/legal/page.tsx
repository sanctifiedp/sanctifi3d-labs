export default function Legal() {
  return (
    <main style={{ fontFamily:"system-ui,sans-serif", background:"#080808", color:"#fff", minHeight:"100vh", padding:"80px 24px" }}>
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        <a href="/" style={{ color:"#34d399", fontSize:13, textDecoration:"none" }}>← Back to Sanctifi3d Labs</a>
        <h1 style={{ fontSize:36, fontWeight:800, letterSpacing:"-.02em", margin:"24px 0 8px" }}>Legal & Policies</h1>
        <p style={{ color:"rgba(255,255,255,.4)", marginBottom:48 }}>Last updated: March 2026</p>

        {[
          { title:"1. Disclaimer", body:"Sanctifi3d Labs is an independent blog and AI-powered news aggregation platform. All content published on this site is for informational and educational purposes only. Nothing on this site constitutes financial, investment, legal, or professional advice. Always do your own research (DYOR) before making any financial decisions." },
          { title:"2. AI-Generated Content", body:"Some posts on this platform are generated or summarized by artificial intelligence (AI) using Groq AI. While we review AI-generated content before publishing, we cannot guarantee its accuracy, completeness, or timeliness. AI content is clearly labeled. Sanctifi3d Labs is not responsible for errors or omissions in AI-generated posts." },
          { title:"3. No Financial Advice", body:"Cryptocurrency, Web3, and DeFi content published here is strictly informational. We are not registered financial advisors. Crypto markets are highly volatile. Never invest more than you can afford to lose. Sanctifi3d Labs and its owner bear no responsibility for financial losses incurred based on content found on this site." },
          { title:"4. Intellectual Property", body:"All original written content, branding, design, and media on Sanctifi3d Labs is the intellectual property of Sanctifi3d and may not be reproduced, redistributed, or used commercially without explicit written permission." },
          { title:"5. Third-Party Links", body:"This site may contain links to third-party websites. Sanctifi3d Labs has no control over and assumes no responsibility for the content, privacy policies, or practices of any third-party sites." },
          { title:"6. Privacy Policy", body:"Sanctifi3d Labs collects email addresses voluntarily submitted through our newsletter signup. We do not sell, share, or distribute your data to third parties. Your email is used solely for sending updates from Sanctifi3d Labs. You may unsubscribe at any time." },
          { title:"7. Cookie Policy", body:"This site may use minimal cookies for analytics and performance purposes. By using this site, you consent to the use of cookies in accordance with this policy." },
          { title:"8. Limitation of Liability", body:"Sanctifi3d Labs, its owner, and contributors shall not be held liable for any direct, indirect, incidental, or consequential damages arising from your use of this website or reliance on its content." },
          { title:"9. Changes to Policies", body:"We reserve the right to update these policies at any time. Continued use of the site after changes constitutes acceptance of the updated policies." },
          { title:"10. Contact", body:"For questions regarding these policies, reach out via X (Twitter): @Sanctifi3d_1" },
        ].map(s => (
          <div key={s.title} style={{ marginBottom:36 }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:10 }}>{s.title}</h2>
            <p style={{ color:"rgba(255,255,255,.55)", lineHeight:1.8, fontSize:15 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
