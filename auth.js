/* ============================================
   REFBOX - Authentication Logic
   ============================================ */

// État global de l'utilisateur
let currentUser = null;

/* ============================================
   VÉRIFICATION DE L'AUTHENTIFICATION
   ============================================ */

// Observer l'état d'authentification
function initAuthObserver(callback) {
  auth.onAuthStateChanged((user) => {
    currentUser = user;

    if (callback) {
      callback(user);
    }

    // Logger l'état d'auth
    if (user) {
      console.log('User logged in:', user.email || user.uid);
    } else {
      console.log('User logged out');
    }
  });
}

// Obtenir l'utilisateur actuel
function getCurrentUser() {
  return currentUser;
}

// Vérifier si l'utilisateur est connecté
function isUserLoggedIn() {
  return currentUser !== null;
}

// Rediriger vers login si non connecté
function requireAuth(redirectUrl = 'login.html') {
  if (!isUserLoggedIn() && !auth.currentUser) {
    // Sauvegarder la page actuelle pour redirection après login
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && currentPage !== 'index.html') {
      sessionStorage.setItem('refbox_redirect_after_login', currentPage);
    }

    window.location.href = redirectUrl;
    return false;
  }
  return true;
}

/* ============================================
   CONNEXION
   ============================================ */

// Connexion par email/mot de passe
async function signInWithEmail(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// Inscription par email/mot de passe
async function signUpWithEmail(email, password, displayName) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);

    // Mettre à jour le profil avec le nom
    if (displayName) {
      await userCredential.user.updateProfile({
        displayName: displayName
      });
    }

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// Connexion avec Google
async function signInWithGoogle() {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// Connexion anonyme (pour test)
async function signInAnonymously() {
  try {
    const userCredential = await auth.signInAnonymously();
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

/* ============================================
   DÉCONNEXION
   ============================================ */

async function signOut() {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
}

/* ============================================
   UTILITAIRES
   ============================================ */

// Obtenir les informations utilisateur formatées
function getUserInfo() {
  if (!currentUser) return null;

  return {
    uid: currentUser.uid,
    email: currentUser.email || 'Anonyme',
    displayName: currentUser.displayName || currentUser.email || 'Utilisateur',
    photoURL: currentUser.photoURL || null,
    isAnonymous: currentUser.isAnonymous
  };
}

// Messages d'erreur en français
function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/invalid-email': 'Adresse email invalide',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/weak-password': 'Mot de passe trop faible (min 6 caractères)',
    'auth/operation-not-allowed': 'Opération non autorisée',
    'auth/popup-closed-by-user': 'Popup fermée avant la fin de la connexion',
    'auth/cancelled-popup-request': 'Popup annulée',
    'auth/network-request-failed': 'Erreur réseau, vérifie ta connexion'
  };

  return errorMessages[errorCode] || 'Une erreur est survenue';
}

// Réinitialisation du mot de passe
async function resetPassword(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// Mettre à jour le profil utilisateur
async function updateUserProfile(updates) {
  if (!currentUser) return { success: false, error: 'Non connecté' };

  try {
    await currentUser.updateProfile(updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}

/* ============================================
   UI HELPERS
   ============================================ */

// Afficher les infos user dans l'interface
function displayUserInfo(containerId = 'userInfo') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const userInfo = getUserInfo();
  if (!userInfo) {
    container.innerHTML = '<a href="login.html">Connexion</a>';
    return;
  }

  const photoHTML = userInfo.photoURL
    ? `<img src="${userInfo.photoURL}" alt="${userInfo.displayName}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px;">`
    : '';

  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      ${photoHTML}
      <span>${userInfo.displayName}</span>
    </div>
  `;
}

// Créer un bouton de déconnexion
function createLogoutButton(containerId = 'logoutBtn') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const button = document.createElement('button');
  button.textContent = 'Déconnexion';
  button.onclick = async () => {
    const result = await signOut();
    if (result.success) {
      window.location.href = 'login.html';
    }
  };

  container.appendChild(button);
}

console.log('Auth module loaded');
