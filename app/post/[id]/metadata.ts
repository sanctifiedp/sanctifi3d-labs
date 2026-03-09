import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const snap = await getDoc(doc(db, "posts", params.id));
    if (!snap.exists()) return { title: "Post | Sanctifi3d Labs" };
    const post = snap.data();
    const excerpt = post.content?.replace(/<[^>]+>/g, "").slice(0, 155) + "...";
    return {
      title: post.title + " | Sanctifi3d Labs",
      description: excerpt,
      openGraph: {
        title: post.title,
        description: excerpt,
        images: post.imageUrl ? [{ url: post.imageUrl, width: 1200, height: 630 }] : [],
        type: "article",
        siteName: "Sanctifi3d Labs",
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: excerpt,
        images: post.imageUrl ? [post.imageUrl] : [],
        creator: "@Sanctifi3d_1",
      },
    };
  } catch {
    return { title: "Post | Sanctifi3d Labs" };
  }
}
