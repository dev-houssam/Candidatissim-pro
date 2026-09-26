# Candidatissim-pro

> Un simulateur d'entretien d'embauche interactif, avec synthèse vocale, avatars et éditeur intégré.

**Candidatissim-pro** transforme un simple texte en une **simulation d'entretien vivante** : les répliques apparaissent au fil du temps, les avatars s'échangent la parole, et la synthèse vocale fait parler le recruteur et le candidat.

Un éditeur intégré permet de personnaliser entièrement le scénario : titre, description, questions/réponses, répliques alternatives, avatars et voix.

---

## Sommaire

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Architecture du projet](#architecture-du-projet)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Format des entretiens (XML)](#format-des-entretiens-xml)
- [Personnalisation des voix](#personnalisation-des-voix)
- [Personnalisation des avatars](#personnalisation-des-avatars)
- [Stack technique](#stack-technique)
- [Licence](#licence)

---

## Aperçu

**Candidatissim-pro** repose sur deux vues distinctes :

### 🎬 Vue Simulation — le lecteur d'entretien

Un lecteur qui ressemble à un lecteur vidéo :

- **Barre de progression** en bas, toujours visible (temps écoulé / durée totale)
- **Bouton Play / Pause** fixe
- **Bouton Plein écran** pour ne garder que le dialogue
- **Défilement automatique** : les répliques apparaissent progressivement, le dialogue remonte pour laisser place aux suivantes
- **Avatars** côte à côte : le recruteur à gauche, le candidat à droite. Quand l'un parle, l'autre est grisé
- **Synthèse vocale** : les répliques sont lues à voix haute, avec une voix différente pour chaque rôle

### ✏️ Vue Éditeur — le constructeur d'entretien

Un éditeur complet qui permet de tout modifier :

- **Titre** et **description** de l'entretien
- **Répliques** : ajouter, modifier, supprimer, changer de rôle, réordonner
- **Timeline horizontale** : vue compacte de toutes les répliques sous forme de blocs, avec drag & drop pour réordonner
- **Répliques alternatives** : chaque réplique peut avoir des variantes interchangeables, tirées au hasard à chaque lecture
- **Avatars** : choisir le profil du recruteur et du candidat
- **Synthèse vocale** : activer/désactiver, choisir la voix, ajuster vitesse, hauteur et volume pour chaque rôle
- **Import / Export** au format JSON
- **Avertissement** si on quitte l'éditeur avec des modifications non enregistrées

---

## Fonctionnalités

### Simulation

- ✅ Lecture séquentielle avec durées personnalisées
- ✅ Barre de progression avec temps écoulé / total
- ✅ Play / Pause fiable (aucune voix coupée en plein milieu)
- ✅ Défilement automatique du dialogue
- ✅ Synthèse vocale (Web Speech API) avec voix par rôle
- ✅ Avatars avec effet « parole active » (l'autre est grisé)
- ✅ Mode plein écran
- ✅ Répliques alternatives tirées au hasard
- ✅ Affichage « Fin de la simulation »
- ✅ Échap pour quitter le plein écran

### Éditeur

- ✅ Modifier le titre et la description
- ✅ Ajouter / modifier / supprimer des répliques
- ✅ Changer de rôle (recruteur ↔ candidat)
- ✅ Déplacer les répliques (boutons ↑ ↓ ou drag & drop sur la timeline)
- ✅ Compteur de mots et caractères par réplique
- ✅ Ajouter / supprimer des répliques alternatives
- ✅ Timeline horizontale compacte
- ✅ Bloc actif surligné pendant le scroll
- ✅ Clic sur un bloc → scroll vers la réplique
- ✅ Choix des avatars (grille avec aperçu)
- ✅ Configuration de la synthèse vocale par rôle
- ✅ Bouton « Tester la voix »
- ✅ Import / Export JSON
- ✅ Indicateur de modifications non enregistrées
- ✅ Avertissement avant de quitter (changement de vue + fermeture d'onglet)

### Persistance

- ✅ Sauvegarde sur le serveur (XML côté Flask)
- ✅ Structure rétro-compatible : les anciens entretiens continuent de fonctionner

---

## Architecture du projet

```
Candidatissim-pro/
│
├── client/                       # Frontend (vanilla JS + HTML + CSS)
│   ├── assets/
│   │   └── avatars/
│   │       └── spritesheet.png   # Planche de 12 avatars
│   │
│   ├── css/
│   │   ├── main.css              # Styles globaux, layout application
│   │   ├── player.css            # Styles de la vue Simulation
│   │   └── editor.css            # Styles de la vue Éditeur
│   │
│   ├── js/
│   │   ├── app.js                # Point d'entrée, navigation entre vues
│   │   │
│   │   ├── data/
│   │   │   ├── avatars.js        # Registre des avatars (spritesheet)
│   │   │   └── xml-parser.js     # Chargement des entretiens depuis le serveur
│   │   │
│   │   ├── editor/
│   │   │   ├── editor.js         # Vue Éditeur
│   │   │   └── dialogue-form.js  # Rendu des répliques + timeline
│   │   │
│   │   └── player/
│   │       ├── player.js         # Vue Simulation
│   │       ├── dialogue.js       # Rendu des bulles + avatars
│   │       ├── timeline.js       # Barre de progression
│   │       └── speech-synthesis.js # Contrôleur de synthèse vocale
│   │
│   └── index.html                # Page principale
│
├── data/
│   └── entretiens.xml            # Stockage des entretiens
│
├── server/                       # Backend Flask
│   ├── main.py                   # Point d'entrée du serveur
│   │
│   ├── routes/
│   │   ├── entretiens.py         # API REST pour les entretiens
│   │   └── simulation.py         # API utilitaire
│   │
│   └── services/
│       └── entretien_service.py  # Lecture/écriture XML
│
└── README.md
```

---

## Installation

### Prérequis

- **Python 3.9+**
- **Flask** (`pip install flask`)
- Un **navigateur moderne** (Firefox ou Chrome recommandé)
- **Linux** : `mbrola` + `mbrola-fr1` + `mbrola-fr4` pour de meilleures voix (voir plus bas)
- **Windows** : voix Microsoft (Hortense, Julie, Paul…) déjà incluses
- **macOS** : voix Apple (Thomas, Amélie…) déjà incluses

### 1. Cloner le dépôt

```bash
git clone <url-du-depot>
cd Candidatissim-pro
```

### 2. Installer Flask

```bash
pip install flask
```

Ou avec un environnement virtuel (recommandé) :

```bash
python -m venv .venv
source .venv/bin/activate
pip install flask
```

### 3. (Linux uniquement) Installer les voix françaises

Les voix par défaut d'espeak sur Linux sont très robotiques. Pour de meilleures voix :

```bash
sudo apt update
sudo apt install mbrola mbrola-fr1 mbrola-fr4 \
    espeak-ng speech-dispatcher \
    speech-dispatcher-espeak-ng speech-dispatcher-pico
```

Puis activez les modules dans `/etc/speech-dispatcher/speechd.conf` :

```
AddModule "espeak-ng"                "sd_espeak-ng" "espeak-ng.conf"
AddModule "espeak-ng-mbrola-generic" "sd_generic"   "espeak-ng-mbrola-generic.conf"
DefaultModule espeak-ng
```

Redémarrez speech-dispatcher :

```bash
systemctl --user restart speech-dispatcher
```

**Puis fermez complètement et rouvrez votre navigateur.**

### 4. Lancer le serveur

```bash
cd server
python main.py
```

Le serveur démarre sur `http://127.0.0.1:8000`.

### 5. Ouvrir l'application

Ouvrez `http://127.0.0.1:8000` dans votre navigateur.

---

## Utilisation

### Vue Simulation

1. Au lancement, l'application charge le premier entretien disponible
2. Cliquez sur **▶** pour démarrer la lecture
3. Les répliques apparaissent une à une, les avatars s'échangent la parole
4. La synthèse vocale lit chaque réplique (si activée)
5. Cliquez sur **⛶** pour passer en plein écran
6. Appuyez sur **Échap** ou cliquez à nouveau sur **⛶** pour quitter le plein écran
7. À la fin, un bloc **Fin de la simulation** apparaît

### Vue Éditeur

1. Cliquez sur **Éditeur** dans la barre de navigation
2. Modifiez le **titre** et la **description** en haut
3. Modifiez chaque réplique dans les cartes :
   - Texte dans le `<textarea>`
   - Boutons ↑ ↓ pour déplacer
   - **Changer de rôle** pour alterner recruteur ↔ candidat
   - **Supprimer** pour retirer
   - **+ Ajouter** sous « Aucune alternative » pour ajouter des variantes
4. Utilisez la **timeline horizontale** en haut pour réordonner par drag & drop
   - Cliquez sur un bloc pour faire défiler vers la réplique
   - Le bloc correspondant à la réplique visible est surligné
5. Dans la sidebar :
   - **Avatars** : choisissez qui parle
   - **Synthèse vocale** : activez, choisissez les voix, réglez vitesse/hauteur/volume
   - **Ajouter une réplique** : pour ajouter une nouvelle réplique à la fin
6. Cliquez sur **Enregistrer** en haut à droite

### Import / Export

- **📤 Exporter** : télécharge l'entretien au format JSON
- **📥 Importer** : charge un entretien depuis un fichier JSON

Le format JSON contient tout : titre, description, dialogue (avec alternatives), synthèse vocale, avatars.

---

## Format des entretiens (XML)

Les entretiens sont stockés dans `data/entretiens.xml` au format XML.

### Structure d'un entretien

```xml
<?xml version='1.0' encoding='utf-8'?>
<entretiens>
    <entretien id="developpeur-logiciel">

        <titre>Entretien Développeur Logiciel Fullstack</titre>

        <description>
            Simulation générique d'un entretien pour un poste de développeur logiciel.
        </description>

        <dialogue>
            <replique id="1" role="recruteur" duree="7">
                <texte>Bonjour, pouvez-vous vous présenter ?</texte>
                <alternative>Bonjour, parlez-moi de vous.</alternative>
                <alternative>Présentez-vous brièvement.</alternative>
            </replique>

            <replique id="2" role="candidat" duree="12">
                Bonjour, merci de me recevoir. Je suis actuellement étudiant...
            </replique>
        </dialogue>

        <synthese-vocale active="true">
            <recruteur voice="fr1"  lang="fr" rate="0.9" pitch="1.2" volume="1" />
            <candidat  voice="fr4"  lang="fr" rate="0.8" pitch="1.5" volume="1" />
        </synthese-vocale>

        <avatars>
            <recruteur>homme-senior-blanc</recruteur>
            <candidat>femme-jeune-blanche</candidat>
        </avatars>

    </entretien>
</entretiens>
```

### Rétro-compatibilité

Le format supporte **deux variantes** pour les répliques :

**Format simple** (sans alternatives) :

```xml
<replique id="1" role="recruteur" duree="7">Bonjour...</replique>
```

**Format étendu** (avec alternatives) :

```xml
<replique id="1" role="recruteur" duree="7">
    <texte>Bonjour...</texte>
    <alternative>Salut...</alternative>
</replique>
```

Le backend choisit automatiquement le bon format **à l'écriture** selon la présence d'alternatives. Et il lit **les deux formats**.

### Champs

| Champ | Description |
|-------|-------------|
| `id` | Identifiant unique de l'entretien |
| `titre` | Titre affiché dans le player |
| `description` | Description sous le titre |
| `dialogue/replique` | Une réplique du dialogue |
| `replique@id` | Numéro de la réplique (1, 2, 3…) |
| `replique@role` | `recruteur` ou `candidat` |
| `replique@duree` | Durée en secondes (si synthèse désactivée) |
| `synthese-vocale@active` | `true` ou `false` |
| `synthese-vocale/recruteur@voice` | Nom exact de la voix (ex: `fr1`, `Thomas`) |
| `synthese-vocale/recruteur@lang` | Code langue (ex: `fr`, `fr-FR`) |
| `synthese-vocale/recruteur@rate` | Vitesse (0.5 à 2) |
| `synthese-vocale/recruteur@pitch` | Hauteur (0 à 2) |
| `synthese-vocale/recruteur@volume` | Volume (0 à 1) |
| `avatars/recruteur` | ID d'avatar (voir liste ci-dessous) |
| `avatars/candidat` | ID d'avatar |

---

## Personnalisation des voix

### Voix disponibles

La liste des voix dépend de votre **système d'exploitation** et de votre **navigateur** :

| OS | Voix disponibles |
|----|------------------|
| **Linux** (avec mbrola) | `fr1`, `fr4`, + voix espeak-ng |
| **Windows** | `Microsoft Hortense`, `Microsoft Julie`, `Microsoft Paul` |
| **macOS** | `Thomas`, `Amélie`, `Audrey` |
| **Chrome / Edge** | Voix Google en ligne (nécessite connexion) |
| **Firefox** | Voix système uniquement |

### Recommandations

Pour un entretien français, on conseille :

| Rôle | Voix suggérée | Réglages |
|------|--------------|----------|
| **Recruteur** | `fr1` (MBROLA) ou `Microsoft Paul` | Vitesse 0.9 · Hauteur 1.0 |
| **Candidat** | `fr4` (MBROLA) ou `Microsoft Julie` | Vitesse 0.9 · Hauteur 1.2 |

### Comment choisir

1. Allez dans **Éditeur** → section **Synthèse vocale**
2. Cochez **Activer la synthèse vocale**
3. Basculez entre les onglets **Recruteur** / **Candidat**
4. Choisissez une voix dans le menu déroulant
5. Ajustez **Vitesse**, **Hauteur**, **Volume**
6. Cliquez sur **▶ Tester la voix** pour écouter

### Dépannage

**Aucune voix n'apparaît dans la liste** :

- Sur Linux, vérifiez que `speech-dispatcher` est bien configuré (voir la section Installation)
- Redémarrez complètement le navigateur (pas juste l'onglet)
- Vérifiez dans la console du navigateur (`F12`) : `speechSynthesis.getVoices()`

**Les voix sont robotiques** :

- Sur Linux, installez `mbrola-fr1` et `mbrola-fr4`
- Sur Windows/macOS, utilisez les voix natives (Hortense, Thomas…)
- Évitez les voix `eSpeak` pures (souvent robotiques)

**La synthèse ne fonctionne pas** :

- Vérifiez que la case **Activer la synthèse vocale** est cochée
- Vérifiez que le bouton **▶ Tester la voix** produit du son
- Le navigateur doit supporter `speechSynthesis` (tous les navigateurs modernes)

---

## Personnalisation des avatars

Les avatars sont définis dans `client/js/data/avatars.js` sous forme d'un **registre** qui pointe vers une **planche de sprites** (`spritesheet.png`).

### Avatars disponibles

| ID | Description |
|----|-------------|
| `homme-senior-blanc` | Homme senior — Blanc |
| `homme-jeune-blanc` | Homme jeune — Blanc |
| `homme-jeune-marron` | Homme jeune — Marron |
| `femme-jeune-blanche` | Femme jeune — Blanche |
| `femme-jeune-marron` | Femme jeune — Marron |
| `femme-senior-blanche` | Femme senior — Blanche |
| `homme-jeune-blanc-2` | Homme jeune — Blanc (variante) |
| `homme-senior-marron` | Homme senior — Marron |
| `homme-jeune-asiatique` | Homme jeune — Asiatique |
| `femme-jeune-blanche-2` | Femme jeune — Blanche (variante) |
| `femme-jeune-asiatique` | Femme jeune — Asiatique |
| `femme-senior-marron` | Femme senior — Marron |

### Changer la planche de sprites

1. Remplacez `client/assets/avatars/spritesheet.png` par votre propre planche
2. Dans `avatars.js`, ajustez :

```javascript
export const SPRITESHEET = {
    chemin: "/assets/avatars/spritesheet.png",
    largeurImage: 1744,       // largeur en px
    hauteurImage: 599,        // hauteur en px
    zoneX: 0,                 // marge gauche
    zoneY: 0,                 // marge haute
    zoneLargeur: 1744,        // largeur de la zone utile
    zoneHauteur: 480,         // hauteur de la zone utile (sans étiquettes)
    colonnes: 6,
    rangees: 2,
    facteurRemplissage: 1.34  // zoom pour remplir le cercle
};
```

3. Si nécessaire, ajustez la liste `AVATARS` (ligne / colonne de chaque profil)

---

## Stack technique

- **Frontend** : HTML + CSS + JavaScript (modules ES natifs, sans framework)
- **Backend** : Python 3 + Flask
- **Stockage** : XML (via `xml.etree.ElementTree`)
- **Synthèse vocale** : Web Speech API (`SpeechSynthesis`)
- **API navigateur** : Fullscreen API, Drag & Drop API, File API

### Choix techniques

- **Aucun framework frontend** : l'application est suffisamment simple pour être codée en vanilla JS. Cela évite une dépendance lourde et facilite la maintenance.
- **XML plutôt que JSON** : le format XML permet une validation structurelle naturelle et s'intègre bien avec `ElementTree`. C'est aussi un format lisible par un humain.
- **Rétro-compatibilité** : les répliques supportent deux formats (simple / étendu) pour ne pas casser les entretiens existants.
- **Single source of truth** : les valeurs par défaut des avatars vivent dans `avatars.js` (le backend renvoie `null` si absent).

---

## Licence

Projet personnel — GPL

---

## Auteur

Développé par **Houssam** dans le cadre du projet **Candidatissim-pro**.
