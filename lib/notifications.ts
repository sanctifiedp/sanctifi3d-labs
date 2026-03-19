import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export async function createNotification({
  uid, type, title, message, link
}: {
  uid: string;
  type: "post_approved" | "post_rejected" | "comment_reply" | "room_message" | "new_post" | "system";
  title: string;
  message: string;
  link?: string;
}) {
  await addDoc(collection(db, "notifications"), {
    uid,
    type,
    title,
    message,
    link: link || null,
    read: false,
    createdAt: Date.now(),
  });
}
