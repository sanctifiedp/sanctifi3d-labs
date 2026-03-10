import Script from "next/script";
export default function AdSense() {
  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2613718694144871"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
