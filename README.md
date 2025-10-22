# RefBox - Soundboard Collaborative PWA

RefBox est une Progressive Web App (PWA) mobile-first de soundboard collaborative avec authentification Firebase.

## Features

- PWA installable sur écran d'accueil (iOS & Android)
- Design mobile-first responsive (2/3/4 colonnes)
- Authentification Firebase (Email/Password + Google)
- Traçabilité des propositions (user ID + email)
- Support offline avec Service Worker
- Formulaires d'upload via Formspree
- Lecture audio optimisée avec Web Audio API
- Couleurs assignées de façon stable via hash

## Structure

```
REFBOX/
├── index.html           # Soundboard principal
├── login.html           # Authentification
├── propose-ref.html     # Proposition de ref
├── propose-son.html     # Upload de son
├── style.css            # Design system mobile-first
├── app.js               # Logique soundboard
├── auth.js              # Gestion authentification
├── firebase-config.js   # Configuration Firebase
├── service-worker.js    # Support offline PWA
├── manifest.json        # Configuration PWA
├── refs.json            # Base de données des refs
├── sounds/              # Fichiers audio MP3
└── icons/               # Icônes PWA
```

## Configuration Firebase

### 1. Créer un projet Firebase

1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Clique sur "Ajouter un projet"
3. Nomme ton projet (ex: "RefBox")
4. Désactive Google Analytics (optionnel)
5. Clique sur "Créer le projet"

### 2. Activer l'authentification

1. Dans la console Firebase, va dans **Authentication**
2. Clique sur **Get started**
3. Active les providers :
   - **Email/Password** : Active-le
   - **Google** : Active-le et configure l'email de support

### 3. Ajouter une app Web

1. Va dans **Paramètres du projet** (icône engrenage)
2. Clique sur l'icône **</> Web**
3. Nomme ton app (ex: "RefBox Web")
4. **NE COCHE PAS** Firebase Hosting (on utilise GitHub Pages)
5. Clique sur **Enregistrer l'application**

### 4. Copier la configuration

Tu verras un bloc de code comme ceci :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "refbox-xxxxx.firebaseapp.com",
  projectId: "refbox-xxxxx",
  storageBucket: "refbox-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxx"
};
```

### 5. Configurer l'app

1. Ouvre le fichier `firebase-config.js`
2. Remplace les valeurs `YOUR_*` par tes credentials Firebase :

```javascript
const firebaseConfig = {
  apiKey: "TA_CLÉ_API",
  authDomain: "TON_PROJET.firebaseapp.com",
  projectId: "TON_PROJET_ID",
  storageBucket: "TON_PROJET.appspot.com",
  messagingSenderId: "TON_SENDER_ID",
  appId: "TON_APP_ID"
};
```

### 6. Configurer les domaines autorisés

1. Dans Firebase Console > **Authentication** > **Settings**
2. Va dans **Authorized domains**
3. Ajoute ton domaine GitHub Pages : `ton-username.github.io`

## Déploiement GitHub Pages

1. **Push le code** :
   ```bash
   git add .
   git commit -m "Add Firebase authentication"
   git push
   ```

2. **Activer GitHub Pages** :
   - Va sur https://github.com/TON-USERNAME/refbox/settings/pages
   - Source : **main** branch
   - Clique sur **Save**

3. **Attendre 1-2 minutes**

4. **Accéder à l'app** :
   - URL : https://ton-username.github.io/refbox/

## Générer les icônes PWA

1. Ouvre `icons/icon-generator.html` dans ton navigateur
2. Télécharge les 2 icônes PNG :
   - `icon-192.png`
   - `icon-512.png`
3. Place-les dans le dossier `icons/`
4. Commit et push :
   ```bash
   git add icons/*.png
   git commit -m "Add PWA icons"
   git push
   ```

## Test en local

Pour tester l'app en local avec un serveur HTTP :

```bash
# Python 3
python -m http.server 8000

# OU Node.js
npx http-server -p 8000
```

Puis ouvre http://localhost:8000

## Workflow d'utilisation

### Utilisateurs

1. **Se connecter** : Via email/password ou Google
2. **Proposer une ref** : Formulaire avec nom + contexte
3. **Proposer un son** : Upload MP3/M4A/WAV (max 10 MB)

### Admin (Toi)

1. **Recevoir les propositions** par email (Formspree)
2. **Valider les refs** :
   - Éditer `refs.json`
   - Ajouter la ref avec `hasSound: false`
3. **Publier les sons** :
   - Télécharger le meilleur son depuis Formspree
   - Le placer dans `/sounds/`
   - Mettre à jour `refs.json` avec `hasSound: true` et `soundUrl: "sounds/nom.mp3"`
4. **Push les changements** :
   ```bash
   git add .
   git commit -m "Add new ref: Nom de la ref"
   git push
   ```

## Format refs.json

```json
{
  "refs": [
    {
      "id": "ayudame",
      "name": "Ayudame",
      "hasSound": false,
      "soundUrl": null,
      "addedBy": "Mamadou",
      "dateAdded": "2025-10-22"
    },
    {
      "id": "cest-parti",
      "name": "C'est parti !",
      "hasSound": true,
      "soundUrl": "sounds/cest-parti.mp3",
      "addedBy": "Alex",
      "dateAdded": "2025-10-20"
    }
  ]
}
```

## Endpoints Formspree configurés

- **Propositions de ref** : https://formspree.io/f/xldpynzl
- **Propositions de son** : https://formspree.io/f/xeorbknp

Chaque soumission inclut maintenant :
- `userId` : ID Firebase de l'utilisateur
- `userEmail` : Email de l'utilisateur
- `userName` : Nom affiché

## Compatibilité

- iOS Safari 14+
- Chrome Android 90+
- Mode standalone (installé sur écran d'accueil)

## Technologies

- HTML5 / CSS3 / JavaScript ES6+
- Firebase Authentication 9.x
- Service Worker API
- Web Audio API
- Formspree
- PWA (Progressive Web App)

---

**Version 1.0** • PWA installable avec auth Firebase

🤖 Generated with [Claude Code](https://claude.com/claude-code)
