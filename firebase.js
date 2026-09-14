import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMCcUXZGJCGpvCLLiJVJqtUF23soNqpt0",
  authDomain: "wedding-invitation-c4ea3.firebaseapp.com",
  projectId: "wedding-invitation-c4ea3",
  storageBucket: "wedding-invitation-c4ea3.firebasestorage.app",
  messagingSenderId: "504435640026",
  appId: "1:504435640026:web:258f14bd5d1f517c0b47e3",
  measurementId: "G-PC48N2XVQ4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  app, auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp
};
