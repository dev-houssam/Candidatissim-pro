import { Dialogue } from "./dialogue.js";
import { Timeline } from "./timeline.js";

import {
    SpeechSynthesisController
} from "./speech-synthesis.js";

import {
    styleAvatar,
    AVATAR_PAR_DEFAUT_RECRUTEUR,
    AVATAR_PAR_DEFAUT_CANDIDAT
} from "../data/avatars.js";


export class Player {

    constructor(conteneur) {

        this.conteneur = conteneur;

        this.entretien = null;

        this.index = 0;

        this.enLecture = false;

        this.timer = null;

        this.tempsEcoule = 0;

        this.tempsReplique = 0;

        this.dialogue = null;

        this.timeline = null;

        this.elements = {};

        this.syntheseVocale =
            new SpeechSynthesisController();


        this.repliqueEnCours = false;

        this.textesChoisis = {};

        this.passageTimer = null;

        this.estPleinEcran = false;


        window.addEventListener(
            "candidatissim:entretien-modifie",
            (event) => {
                this.charger(event.detail);
            }
        );


        window.addEventListener(
            "candidatissim:avatars-modifies",
            (event) => {

                if (!this.entretien) {
                    return;
                }

                this.entretien.avatars = event.detail;

                this.appliquerAvatars();
            }
        );


        // Quitter le plein écran si l'utilisateur appuie sur Échap
        document.addEventListener(
            "fullscreenchange",
            () => {

                if (!document.fullscreenElement) {
                    this.quitterPleinEcran();
                }
            }
        );
    }


    charger(entretien) {

        this.pause();

        this.syntheseVocale.annuler();


        this.entretien = entretien;

        this.index = 0;

        this.tempsEcoule = 0;

        this.tempsReplique = 0;

        this.repliqueEnCours = false;

        this.textesChoisis = {};

        this.elements = {};

        this.dialogue = null;

        this.timeline = null;

        this.conteneur.innerHTML = "";


        if (!this.entretien.avatars) {

            this.entretien.avatars = {
                recruteur: AVATAR_PAR_DEFAUT_RECRUTEUR,
                candidat: AVATAR_PAR_DEFAUT_CANDIDAT
            };
        }


        const player =
            document.createElement("div");


        player.className = "player";


        player.innerHTML = `
            <header class="player-header">

                <h1 class="player-title">
                    ${this.echapperHTML(
                        entretien.titre
                    )}
                </h1>

                <p class="player-description">
                    ${this.echapperHTML(
                        entretien.description
                    )}
                </p>

            </header>


            <section class="dialogue-container">

                <div class="dialogue-scroll">

                    <div class="dialogue-list"></div>

                </div>

            </section>


            <footer class="player-controls">

                <div class="timeline">

                    <div class="timeline-track">

                        <div class="timeline-progress"></div>

                    </div>

                    <div class="timeline-info">

                        <span class="current-time">
                            0:00
                        </span>

                        <span class="total-time">
                            0:00
                        </span>

                    </div>

                </div>


                <div class="player-buttons">

                    <button
                        class="play-button"
                        type="button"
                        aria-label="Lire"
                    >
                        ▶
                    </button>

                    <button
                        class="fullscreen-button"
                        type="button"
                        aria-label="Plein écran"
                        title="Plein écran"
                    >
                        ⛶
                    </button>

                </div>

            </footer>
        `;


        this.conteneur.appendChild(player);


        this.elements.playButton =
            player.querySelector(".play-button");

        this.elements.fullscreenButton =
            player.querySelector(".fullscreen-button");

        this.elements.dialogue =
            player.querySelector(".dialogue-list");

        this.elements.progress =
            player.querySelector(".timeline-progress");

        this.elements.currentTime =
            player.querySelector(".current-time");

        this.elements.totalTime =
            player.querySelector(".total-time");


        this.entretien.dialogue.forEach(
            (replique, index) => {

                this.textesChoisis[index] =
                    this.choisirTexteAleatoire(replique);

            }
        );


        this.dialogue =
            new Dialogue(this.elements.dialogue);


        this.dialogue.charger(
            this.entretien.dialogue.map(
                (replique, index) => ({
                    ...replique,
                    texte: this.textesChoisis[index]
                })
            )
        );


        const dureeTotale =
            entretien.dialogue.reduce(
                (total, replique) => total + replique.duree,
                0
            );


        this.timeline =
            new Timeline(
                this.elements.progress,
                this.elements.currentTime,
                this.elements.totalTime
            );


        this.timeline.definirDuree(dureeTotale);


        this.elements.playButton
            .addEventListener(
                "click",
                () => this.basculerLecture()
            );


        this.elements.fullscreenButton
            .addEventListener(
                "click",
                () => this.basculerPleinEcran()
            );


        this.appliquerAvatars();

        this.mettreAJourEtatAvatars(-1);
    }


    // ========================================================
    // PLEIN ÉCRAN
    // ========================================================

    basculerPleinEcran() {

        if (this.estPleinEcran) {
            this.quitterPleinEcran();
        } else {
            this.entrerPleinEcran();
        }
    }


    entrerPleinEcran() {

        this.estPleinEcran = true;


        document.body.classList.add("player-fullscreen");


        this.elements.fullscreenButton.textContent = "⛶";
        this.elements.fullscreenButton
            .setAttribute("aria-label", "Quitter le plein écran");
        this.elements.fullscreenButton
            .setAttribute("title", "Quitter le plein écran");


        // API native (peut échouer selon le navigateur,
        // c'est pour ça qu'on gère aussi la classe body)
        const cible =
            this.conteneur.querySelector(".player");

        if (cible && cible.requestFullscreen) {

            cible.requestFullscreen().catch(() => {
                // Silencieux : on a déjà la classe body
            });
        }
    }


    quitterPleinEcran() {

        this.estPleinEcran = false;


        document.body.classList.remove("player-fullscreen");


        if (this.elements.fullscreenButton) {

            this.elements.fullscreenButton.textContent = "⛶";
            this.elements.fullscreenButton
                .setAttribute("aria-label", "Plein écran");
            this.elements.fullscreenButton
                .setAttribute("title", "Plein écran");
        }


        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    }


    // ========================================================
    // AVATARS
    // ========================================================

    appliquerAvatars() {

        const container =
            this.conteneur.querySelector(
                ".dialogue-container"
            );


        if (!container) {
            return;
        }


        let avRecruteur =
            container.querySelector(
                ".player-avatar-recruteur"
            );

        let avCandidat =
            container.querySelector(
                ".player-avatar-candidat"
            );


        if (!avRecruteur) {

            avRecruteur =
                document.createElement("div");

            avRecruteur.className =
                "player-avatar player-avatar-recruteur";

            container.appendChild(avRecruteur);
        }


        if (!avCandidat) {

            avCandidat =
                document.createElement("div");

            avCandidat.className =
                "player-avatar player-avatar-candidat";

            container.appendChild(avCandidat);
        }


        const roleRecruteur =
            this.entretien.avatars.recruteur ||
            AVATAR_PAR_DEFAUT_RECRUTEUR;

        const roleCandidat =
            this.entretien.avatars.candidat ||
            AVATAR_PAR_DEFAUT_CANDIDAT;


        Object.assign(
            avRecruteur.style,
            styleAvatar(roleRecruteur, 180)
        );

        Object.assign(
            avCandidat.style,
            styleAvatar(roleCandidat, 180)
        );
    }


    mettreAJourEtatAvatars(roleActif) {

        const container =
            this.conteneur.querySelector(
                ".dialogue-container"
            );


        if (!container) {
            return;
        }


        const avRecruteur =
            container.querySelector(
                ".player-avatar-recruteur"
            );

        const avCandidat =
            container.querySelector(
                ".player-avatar-candidat"
            );


        if (avRecruteur) {

            avRecruteur.classList.toggle(
                "inactive",
                roleActif !== "recruteur" &&
                roleActif !== -1
            );

            avRecruteur.classList.toggle(
                "active",
                roleActif === "recruteur"
            );
        }


        if (avCandidat) {

            avCandidat.classList.toggle(
                "inactive",
                roleActif !== "candidat" &&
                roleActif !== -1
            );

            avCandidat.classList.toggle(
                "active",
                roleActif === "candidat"
            );
        }
    }


    // ========================================================
    // LECTURE
    // ========================================================

    basculerLecture() {

        if (this.enLecture) {
            this.pause();
        } else {
            this.lire();
        }
    }


    lire() {

        if (!this.entretien) {
            return;
        }


        if (
            this.index >=
            this.entretien.dialogue.length
        ) {

            this.reinitialiser();
        }


        this.enLecture = true;


        if (this.elements.playButton) {

            this.elements.playButton.textContent = "Ⅱ";
            this.elements.playButton
                .setAttribute("aria-label", "Pause");
        }


        const replique =
            this.entretien.dialogue[this.index];


        if (replique) {
            this.lancerReplique();
        }
    }


    pause() {

        this.enLecture = false;


        if (this.elements.playButton) {

            this.elements.playButton.textContent = "▶";
            this.elements.playButton
                .setAttribute("aria-label", "Lire");
        }


        if (this.timer !== null) {

            clearInterval(this.timer);
            this.timer = null;
        }


        if (this.passageTimer !== null) {

            clearTimeout(this.passageTimer);
            this.passageTimer = null;
        }


        this.syntheseVocale.annuler(false);

        this.repliqueEnCours = false;
    }


    reinitialiser() {

        this.pause();

        this.syntheseVocale.annuler();


        this.index = 0;

        this.tempsEcoule = 0;

        this.tempsReplique = 0;

        this.repliqueEnCours = false;


        const fin =
            this.conteneur.querySelector(
                ".player-ended"
            );


        if (fin) {
            fin.remove();
        }


        this.entretien.dialogue.forEach(
            (replique, index) => {

                this.textesChoisis[index] =
                    this.choisirTexteAleatoire(replique);

            }
        );


        if (this.dialogue) {

            this.dialogue.reinitialiser();

            this.dialogue.appliquerTextes(
                this.textesChoisis
            );
        }


        if (this.timeline) {
            this.timeline.definirTemps(0);
        }


        this.mettreAJourEtatAvatars(-1);
    }


    lancerReplique() {

        if (!this.enLecture) {
            return;
        }


        if (
            this.index >=
            this.entretien.dialogue.length
        ) {

            this.terminer();
            return;
        }


        const replique =
            this.entretien.dialogue[this.index];


        const texte =
            this.textesChoisis[this.index] ||
            replique.texte;


        this.dialogue.afficherTexte(this.index, texte);

        this.dialogue.afficher(this.index);


        this.syntheseVocale.annuler();


        this.repliqueEnCours = true;


        this.mettreAJourEtatAvatars(replique.role);


        const voixUtilisee =
            this.lireRepliqueVocalement(replique, texte);


        this.demarrerTimerReplique();


        if (!voixUtilisee) {

            this.programmerPassageAutomatique(replique);
        }
    }


    choisirTexteAleatoire(replique) {

        const alternatives =
            Array.isArray(replique.alternatives)
                ? replique.alternatives.filter(
                    alt =>
                        alt &&
                        alt.texte &&
                        alt.texte.trim()
                )
                : [];


        if (alternatives.length === 0) {
            return replique.texte;
        }


        const tous = [
            replique.texte,
            ...alternatives.map(alt => alt.texte)
        ];


        return tous[
            Math.floor(Math.random() * tous.length)
        ];
    }


    lireRepliqueVocalement(replique, texte) {

        const configuration =
            this.entretien.syntheseVocale;


        if (!configuration) return false;
        if (!configuration.active) return false;
        if (!this.syntheseVocale.estDisponible()) return false;


        const voix = configuration[replique.role];

        if (!voix) return false;


        this.syntheseVocale.onEnd = () => {

            if (!this.enLecture) {
                return;
            }

            this.repliqueEnCours = false;

            this.tempsReplique = 0;

            this.index++;

            this.lancerReplique();
        };


        return this.syntheseVocale.parler(texte, voix);
    }


    programmerPassageAutomatique(replique) {

        if (this.passageTimer) {
            clearTimeout(this.passageTimer);
        }

        this.passageTimer = setTimeout(() => {

            if (!this.enLecture) return;
            if (!this.repliqueEnCours) return;

            this.repliqueEnCours = false;

            this.tempsReplique = 0;

            this.index++;

            this.lancerReplique();

        }, replique.duree * 1000);
    }


    demarrerTimerReplique() {

        if (!this.enLecture) return;


        const replique =
            this.entretien.dialogue[this.index];


        if (!replique) return;


        if (this.timer !== null) {

            clearInterval(this.timer);
        }


        this.timer =
            setInterval(() => {

                if (!this.enLecture) return;


                this.tempsReplique += 0.1;
                this.tempsEcoule += 0.1;


                this.timeline.definirTemps(this.tempsEcoule);

            }, 100);
    }


    terminer() {

        this.pause();

        this.syntheseVocale.annuler();


        this.index =
            this.entretien.dialogue.length;


        if (this.timeline) {

            this.timeline.definirTemps(
                this.timeline.totalDuration
            );
        }


        this.mettreAJourEtatAvatars(-1);


        this.afficherFin();
    }


    afficherFin() {

        const container =
            this.conteneur.querySelector(
                ".dialogue-container"
            );


        if (!container) return;


        if (
            container.querySelector(".player-ended")
        ) return;


        const fin =
            document.createElement("div");

        fin.className = "player-ended";

        fin.innerHTML = `
            <h2 class="player-ended-title">
                Fin de la simulation
            </h2>

            <p class="player-ended-text">
                L'entretien est terminé.
            </p>
        `;


        const liste =
            container.querySelector(".dialogue-list");

        if (liste) {
            liste.appendChild(fin);
        } else {
            container.appendChild(fin);
        }


        const scroll =
            container.querySelector(".dialogue-scroll");

        if (scroll) {

            scroll.scrollTo({
                top: scroll.scrollHeight,
                behavior: "smooth"
            });
        }
    }


    echapperHTML(texte) {

        const element = document.createElement("div");

        element.textContent = texte;

        return element.innerHTML;
    }
}