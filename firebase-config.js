/* ============================================
   FIREBASE CONFIGURATION
   ============================================ */

// IMPORTANT: Remplace ces valeurs par tes propres credentials Firebase
// Obtiens-les depuis: Firebase Console > Project Settings > Your apps > Web app

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
