import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email, password, username) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // create the matching profile document in Firestore
      await setDoc(doc(db, "profiles", cred.user.uid), {
        username,
        createdAt: serverTimestamp()
      });
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  // shape kept similar to before (session.user.id) so screens barely change
  const session = user ? { user: { id: user.uid, email: user.email } } : null;

  return (
    <AuthContext.Provider value={{ session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
