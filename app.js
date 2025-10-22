/* ============================================
   REFBOX - App Logic
   ============================================ */

// État global de l'application
const AppState = {
  refs: [],
  currentAudio: null,
  isLoading: false
};

// Palette de couleurs (doit correspondre au CSS)
const COLORS = [
  '#FF6B9D', // color-1
  '#FFC837', // color-2
  '#00D9FF', // color-3
  '#C724B1', // color-4
  '#4ADE80', // color-5
  '#FF6B35'  // color-6
];

/* ============================================
   UTILITAIRES
   ============================================ */

// Hash simple pour assigner une couleur stable à chaque ref
function hashStringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

// Logger les erreurs de façon user-friendly
function handleError(message, error) {
  console.error(message, error);
  // Optionnel : afficher un toast ou message d'erreur
}

/* ============================================
   CHARGEMENT DES DONNÉES
   ============================================ */

// Charger les refs depuis refs.json
async function loadRefs() {
  try {
    AppState.isLoading = true;

    // Ajouter un timestamp pour éviter le cache
    const response = await fetch(`refs.json?t=${Date.now()}`);

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des refs');
    }

    const data = await response.json();
    AppState.refs = data.refs || [];

    renderRefs();
  } catch (error) {
    handleError('Impossible de charger les refs', error);
    showEmptyState();
  } finally {
    AppState.isLoading = false;
  }
}

/* ============================================
   RENDU DE L'INTERFACE
   ============================================ */

// Afficher les refs dans la grille
function renderRefs() {
  const refsGrid = document.getElementById('refsGrid');
  const emptyState = document.getElementById('emptyState');

  // Si aucune ref, afficher l'état vide
  if (AppState.refs.length === 0) {
    showEmptyState();
    return;
  }

  // Cacher l'état vide
  emptyState.style.display = 'none';
  refsGrid.style.display = 'grid';

  // Vider la grille
  refsGrid.innerHTML = '';

  // Créer un bouton pour chaque ref
  AppState.refs.forEach(ref => {
    const button = createRefButton(ref);
    refsGrid.appendChild(button);
  });
}

// Créer un bouton de ref
function createRefButton(ref) {
  const button = document.createElement('button');
  button.className = `ref-btn ${ref.hasSound ? 'has-sound' : 'no-sound'}`;

  // Assigner une couleur stable basée sur l'ID
  const color = hashStringToColor(ref.id);
  button.style.setProperty('--ref-color', color);

  // Contenu du bouton
  if (ref.hasSound) {
    // Bouton avec son
    button.innerHTML = `
      <span class="ref-name">${escapeHtml(ref.name)}</span>
    `;
    button.onclick = () => playSound(ref);
  } else {
    // Bouton sans son (redirige vers proposition)
    button.innerHTML = `
      <span class="badge">🎤</span>
      <span class="ref-name">${escapeHtml(ref.name)}</span>
      <span class="ref-status">En attente de son</span>
    `;
    button.onclick = () => {
      window.location.href = `propose-son.html?ref=${encodeURIComponent(ref.id)}`;
    };
  }

  return button;
}

// Afficher l'état vide
function showEmptyState() {
  const refsGrid = document.getElementById('refsGrid');
  const emptyState = document.getElementById('emptyState');

  refsGrid.style.display = 'none';
  emptyState.style.display = 'block';
}

// Échapper les caractères HTML pour éviter les injections
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ============================================
   LECTURE AUDIO
   ============================================ */

// Jouer un son
function playSound(ref) {
  if (!ref.soundUrl) {
    console.warn('Aucun son disponible pour cette ref');
    return;
  }

  // Arrêter le son précédent s'il y en a un
  if (AppState.currentAudio) {
    AppState.currentAudio.pause();
    AppState.currentAudio.currentTime = 0;
  }

  // Créer et jouer le nouveau son
  const audio = new Audio(ref.soundUrl);
  AppState.currentAudio = audio;

  // Trouver le bouton correspondant pour l'animation
  const buttons = document.querySelectorAll('.ref-btn.has-sound');
  let targetButton = null;

  buttons.forEach(button => {
    if (button.querySelector('.ref-name').textContent === ref.name) {
      targetButton = button;
    }
  });

  // Animation de lecture
  if (targetButton) {
    targetButton.classList.add('playing');
    audio.addEventListener('ended', () => {
      targetButton.classList.remove('playing');
    });
  }

  // Jouer le son
  audio.play().catch(error => {
    handleError('Erreur lors de la lecture du son', error);
    if (targetButton) {
      targetButton.classList.remove('playing');
    }
  });
}

/* ============================================
   GESTION DU MENU MODAL
   ============================================ */

// Ouvrir/fermer le menu modal
function setupModal() {
  const menuBtn = document.getElementById('menuBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const aboutModal = document.getElementById('aboutModal');
  const closeAboutBtn = document.getElementById('closeAboutBtn');
  const aboutBtn = document.getElementById('aboutBtn');
  const refreshBtn = document.getElementById('refreshBtn');

  // Ouvrir le menu
  menuBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
  });

  // Fermer le menu
  closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  // Fermer en cliquant sur l'overlay
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  // Ouvrir le modal "À propos"
  aboutBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    aboutModal.classList.add('active');
  });

  // Fermer le modal "À propos"
  closeAboutBtn.addEventListener('click', () => {
    aboutModal.classList.remove('active');
  });

  aboutModal.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
      aboutModal.classList.remove('active');
    }
  });

  // Rafraîchir l'app
  refreshBtn.addEventListener('click', async () => {
    modalOverlay.classList.remove('active');

    // Vider le cache du service worker
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
    }

    // Recharger les refs
    await loadRefs();

    // Feedback visuel
    refreshBtn.innerHTML = '✓ Actualisé !';
    setTimeout(() => {
      refreshBtn.innerHTML = '🔄 Rafraîchir l\'app';
    }, 2000);
  });

  // Déconnexion
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const result = await signOut();
      if (result.success) {
        window.location.href = 'login.html';
      }
    });
  }
}

/* ============================================
   GESTION DE L'AUTHENTIFICATION
   ============================================ */

// Afficher les informations utilisateur dans le header
function updateUserDisplay() {
  const userInfo = getUserInfo();
  const userInfoContainer = document.getElementById('userInfo');

  if (!userInfoContainer) return;

  if (!userInfo) {
    // Si pas connecté, afficher un lien de connexion
    userInfoContainer.innerHTML = '<a href="login.html" style="color: var(--text-secondary); text-decoration: none; font-size: 14px;">Connexion</a>';
    return;
  }

  // Afficher le nom et la photo de l'utilisateur
  const photoHTML = userInfo.photoURL
    ? `<img src="${userInfo.photoURL}" alt="${userInfo.displayName}" class="user-avatar">`
    : `<div class="user-avatar" style="background: var(--color-1); display: flex; align-items: center; justify-content: center; font-weight: bold;">${userInfo.displayName.charAt(0).toUpperCase()}</div>`;

  userInfoContainer.innerHTML = `
    ${photoHTML}
    <span class="user-name">${escapeHtml(userInfo.displayName)}</span>
  `;
}

/* ============================================
   INITIALISATION
   ============================================ */

// Initialiser l'app au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  console.log('RefBox v1.0 - Initialisation...');

  // Initialiser l'observateur d'authentification
  initAuthObserver((user) => {
    // Mettre à jour l'affichage utilisateur quand l'état d'auth change
    updateUserDisplay();

    // Charger les refs uniquement si l'utilisateur est connecté
    if (user) {
      loadRefs();
    }
  });

  // Configurer le modal
  setupModal();

  // Support du pull-to-refresh sur mobile
  if ('onpulltorefresh' in window) {
    window.addEventListener('pulltorefresh', () => {
      loadRefs();
    });
  }
});

// Recharger les refs quand la page redevient visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !AppState.isLoading) {
    loadRefs();
  }
});
