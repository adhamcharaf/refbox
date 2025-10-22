/* ============================================
   FIREBASE CONFIGURATION
   ============================================ */

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAfv1Oz0L0LzZuPf0dfXKFbdNkKy_NAXnU",
  authDomain: "refbox-a3845.firebaseapp.com",
  projectId: "refbox-a3845",
  storageBucket: "refbox-a3845.firebasestorage.app",
  messagingSenderId: "1015497034547",
  appId: "1:1015497034547:web:c6d34b3a530ee65b73cc46"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Exporter les services Firebase
const auth = firebase.auth();
const db = firebase.firestore(); // Pour future migration (Phase 2)
const storage = firebase.storage(); // Pour future migration (Phase 3)

// Configuration des providers d'authentification
const googleProvider = new firebase.auth.GoogleAuthProvider();

console.log('Firebase initialized');
