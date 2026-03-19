"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";

interface AuthCtx { user: User|null; loading: boolean; signIn: ()=>void; signOut: ()=>void; }
const Ctx = createContext<AuthCtx>({ user:null, loading:true, signIn:()=>{}, signOut:()=>{} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  async function signIn() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch(e) { console.error(e); }
  }

  async function signOutUser() {
    await signOut(auth);
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, signIn, signOut: signOutUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
