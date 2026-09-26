/* ============================================================
   REGISTRE DES AVATARS
   ============================================================ */

export const SPRITESHEET = {

    chemin: "/assets/avatars/spritesheet.png",

    largeurImage: 1744,
    hauteurImage: 599,

    // Zone occupée par les 12 profils (SANS les étiquettes)
    zoneX: 0,
    zoneY: 0,
    zoneLargeur: 1744,
    zoneHauteur: 480,

    colonnes: 6,
    rangees: 2,

    // Facteur d'agrandissement global
    facteurRemplissage: 1.34,

    // ------------------------------------------------
    // CORRECTIONS MANUELLES PAR RANGÉE
    // ------------------------------------------------
    // Si une rangée est décalée, ajustez ces valeurs.
    // Elles s'AJOUTENT à zoneX et zoneY.
    //
    // decalageX : positif = décale l'image vers la droite
    //             négatif = décale l'image vers la gauche
    // decalageY : positif = décale l'image vers le bas
    //             négatif = décale l'image vers le haut
    correctionsRangees: [
        // Rangée 0 (en haut)
        { decalageX: 0,  decalageY: 0 },

        // Rangée 1 (en bas)
        { decalageX: 0,  decalageY: 60 }
    ]
};


/**
 * Calcule le style background complet pour afficher
 * un avatar dans un cercle de taille `taille` (en pixels).
 */
export function styleAvatar(id, taille = 180) {

    const avatar =
        AVATARS.find(a => a.id === id);

    if (!avatar) {
        return {};
    }


    const largeurCase =
        SPRITESHEET.zoneLargeur /
        SPRITESHEET.colonnes;

    const hauteurCase =
        SPRITESHEET.zoneHauteur /
        SPRITESHEET.rangees;


    const zoomX =
        (taille / largeurCase) *
        SPRITESHEET.facteurRemplissage;

    const zoomY =
        (taille / hauteurCase) *
        SPRITESHEET.facteurRemplissage;


    const tailleImageX =
        SPRITESHEET.largeurImage * zoomX;

    const tailleImageY =
        SPRITESHEET.hauteurImage * zoomY;


    // Correction par rangée
    const correction =
        SPRITESHEET.correctionsRangees[avatar.ligne] ||
        { decalageX: 0, decalageY: 0 };


    // Position de la case (avec corrections)
    const xSource =
        SPRITESHEET.zoneX +
        avatar.colonne * largeurCase +
        correction.decalageX;

    const ySource =
        SPRITESHEET.zoneY +
        avatar.ligne * hauteurCase +
        correction.decalageY;


    const positionX =
        -xSource * zoomX +
        (taille - largeurCase * zoomX) / 2;

    const positionY =
        -ySource * zoomY +
        (taille - hauteurCase * zoomY) / 2;


    return {
        backgroundImage:
            `url("${SPRITESHEET.chemin}")`,

        backgroundRepeat: "no-repeat",

        backgroundSize:
            `${tailleImageX}px ${tailleImageY}px`,

        backgroundPosition:
            `${positionX}px ${positionY}px`
    };
}


export function listerAvatars() {
    return AVATARS.map(a => ({
        id: a.id,
        libelle: a.libelle
    }));
}


export function obtenirAvatar(id) {
    return AVATARS.find(a => a.id === id) || null;
}


export const AVATAR_PAR_DEFAUT_RECRUTEUR =
    "femme-senior-blanche";

export const AVATAR_PAR_DEFAUT_CANDIDAT =
    "femme-jeune-marron";


/* ============================================================
   LISTE DES 12 AVATARS
   ============================================================ */

export const AVATARS = [

    /* -------- RANGÉE 1 -------- */
    { id: "homme-senior-blanc",       libelle: "Homme senior — Blanc",       ligne: 0, colonne: 0 },
    { id: "homme-jeune-blanc",        libelle: "Homme jeune — Blanc",        ligne: 0, colonne: 1 },
    { id: "homme-jeune-marron",       libelle: "Homme jeune — Marron",       ligne: 0, colonne: 2 },
    { id: "femme-jeune-blanche",      libelle: "Femme jeune — Blanche",      ligne: 0, colonne: 3 },
    { id: "femme-jeune-marron",       libelle: "Femme jeune — Marron",       ligne: 0, colonne: 4 },
    { id: "femme-senior-blanche",     libelle: "Femme senior — Blanche",     ligne: 0, colonne: 5 },

    /* -------- RANGÉE 2 -------- */
    { id: "homme-jeune-blanc-2",      libelle: "Homme jeune — Blanc (v2)",   ligne: 1, colonne: 0 },
    { id: "homme-senior-marron",      libelle: "Homme senior — Marron",      ligne: 1, colonne: 1 },
    { id: "homme-jeune-asiatique",    libelle: "Homme jeune — Asiatique",    ligne: 1, colonne: 2 },
    { id: "femme-jeune-blanche-2",    libelle: "Femme jeune — Blanche (v2)", ligne: 1, colonne: 3 },
    { id: "femme-jeune-asiatique",    libelle: "Femme jeune — Asiatique",    ligne: 1, colonne: 4 },
    { id: "femme-senior-marron",      libelle: "Femme senior — Marron",      ligne: 1, colonne: 5 }
];