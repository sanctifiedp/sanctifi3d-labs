import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const resend = new Resend(process.env.RESEND_API_KEY);
const app = getApps().length ? getApps()[0] : initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

function emailTemplate(type: string, title: string, excerpt: string, link: string, category: string, email: string) {
  const isAlpha = type === "alpha";
  const accent = isAlpha ? "#fbbf24" : "#34d399";
  const icon = isAlpha ? "⚡" : "✦";
  const label = isAlpha ? "New Alpha Opportunity" : "New Post Published";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sanctifi3d-labs.vercel.app";
  const unsubUrl = 
