import { DialogueForm } from "./dialogue-form.js";

import {
    SpeechSynthesisController
} from "../player/speech-synthesis.js";

import {
    listerAvatars,
    styleAvatar,
    AVATAR_PAR_DEFAUT_RECRUTEUR,
    AVATAR_PAR_DEFAUT_CANDIDAT
} from "../data/avatars.js";


export class Editor {

    constructor(conteneur) {
        this.conteneur = conteneur;
        this.entretien = null;
        this.form = null;

        this.syntheseVocale =
            new SpeechSynthesisController();

        this.desabonnementVoix = null;

        this.roleVoixCourant = "recruteur";
        this.roleAvatarCourant = "recruteur";

        this.modifie = false;


        this._beforeUnloadHandler = (event) => {

            if (!this.modifie) return;

            event.preventDefault();
            event.returnValue = "";

            return "";
        };

        window.addEventListener(
            "beforeunload",
            this._beforeUnloadHandler
        );
    }


    charger(entretien) {

        this.entretien = structuredClone(entretien);


        if (!this.entretien.syntheseVocale) {

            this.entretien.syntheseVocale = {
                active: false,
                recruteur: {
                    voice: "", lang: "fr-FR",
                    rate: 1, pitch: 1, volume: 1
                },
                candidat: {
                    voice: "", lang: "fr-FR",
                    rate: 1, pitch: 1, volume: 1
                }
            };
        }


        if (!this.entretien.avatars) {
            this.entretien.avatars = {};
        }

        if (!this.entretien.avatars.recruteur) {
            this.entretien.avatars.recruteur =
                AVATAR_PAR_DEFAUT_RECRUTEUR;
        }

        if (!this.entretien.avatars.candidat) {
            this.entretien.avatars.candidat =
                AVATAR_PAR_DEFAUT_CANDIDAT;
        }


        this.modifie = false;


        this.afficher();

        this.mettreAJourIndicateur();
    }


    marquerModifie() {

        if (!this.modifie) {
            this.modifie = true;
            this.mettreAJourIndicateur();
        }
    }


    mettreAJourIndicateur() {

        const bouton =
            this.conteneur.querySelector("#editor-save");

        if (!bouton) return;

        bouton.classList.toggle(
            "editor-save-modified",
            this.modifie
        );
    }


    // ========================================================
    // RENDU
    // ========================================================

    afficher() {

        if (this.desabonnementVoix) {
            this.desabonnementVoix();
            this.desabonnementVoix = null;
        }


        this.conteneur.innerHTML = `
            <div class="editor">

                <header class="editor-header">

                    <div class="editor-title-section">

                        <label
                            class="editor-title-label"
                            for="editor-title"
                        >
                            Titre de l'entretien
                        </label>

                        <input
                            type="text"
                            id="editor-title"
                            class="editor-title-input"
                            placeholder="Titre de l'entretien"
                        >


                        <label
                            class="editor-title-label editor-description-label"
                            for="editor-description"
                        >
                            Description
                        </label>

                        <input
                            type="text"
                            id="editor-description"
                            class="editor-title-input editor-description-input"
                            placeholder="Brève description de l'entretien"
                        >

                    </div>


                    <div class="editor-header-actions">

                        <button
                            type="button"
                            class="editor-secondary"
                            id="editor-import"
                        >
                            📥 Importer
                        </button>

                        <button
                            type="button"
                            class="editor-secondary"
                            id="editor-export"
                        >
                            📤 Exporter
                        </button>

                        <button
                            type="button"
                            class="editor-save"
                            id="editor-save"
                        >
                            Enregistrer
                        </button>

                        <input
                            type="file"
                            id="editor-import-input"
                            accept=".json,application/json"
                            hidden
                        >

                    </div>

                </header>


                <div class="editor-layout">

                    <div class="editor-main-column">

                        <div
                            class="editor-timeline"
                            id="editor-timeline"
                        >
                            <div class="editor-timeline-header">
                                <span>Timeline</span>
                                <span class="editor-timeline-hint">
                                    Faites glisser les blocs pour réordonner
                                </span>
                            </div>

                            <div
                                class="editor-timeline-track"
                                id="editor-timeline-track"
                            ></div>
                        </div>


                        <main
                            class="editor-dialogue"
                            id="editor-dialogue"
                        ></main>

                    </div>


                    <aside class="editor-sidebar">

                        <section
                            class="editor-panel editor-avatars"
                        >

                            <div class="editor-panel-header">

                                <div>

                                    <h2>
                                        Avatars
                                    </h2>

                                    <p>
                                        Choisissez qui parle
                                        pendant la simulation.
                                    </p>

                                </div>

                            </div>


                            <div
                                class="editor-tabs"
                                role="tablist"
                            >

                                <button
                                    type="button"
                                    class="editor-tab active"
                                    data-role-tab="recruteur"
                                >
                                    Recruteur
                                </button>

                                <button
                                    type="button"
                                    class="editor-tab"
                                    data-role-tab="candidat"
                                >
                                    Candidat
                                </button>

                            </div>


                            <div
                                class="editor-avatar-current"
                                id="editor-avatar-current"
                            ></div>

                        </section>


                        <section
                            class="editor-panel editor-speech"
                        >

                            <div class="editor-panel-header">

                                <div>

                                    <h2>
                                        Synthèse vocale
                                    </h2>

                                    <p>
                                        Faites parler le recruteur
                                        et le candidat.
                                    </p>

                                </div>

                            </div>


                            <div
                                class="editor-tabs"
                                role="tablist"
                            >

                                <button
                                    type="button"
                                    class="editor-tab active"
                                    data-voice-tab="recruteur"
                                >
                                    Recruteur
                                </button>

                                <button
                                    type="button"
                                    class="editor-tab"
                                    data-voice-tab="candidat"
                                >
                                    Candidat
                                </button>

                            </div>


                            <label
                                class="editor-speech-toggle"
                            >

                                <input
                                    type="checkbox"
                                    id="editor-speech-active"
                                >

                                <span>
                                    Activer la synthèse vocale
                                </span>

                            </label>


                            <div
                                class="editor-speech-status"
                                id="editor-speech-status"
                            ></div>


                            <div
                                class="editor-voice-current"
                                id="editor-voice-current"
                            ></div>

                        </section>


                        <section class="editor-add">

                            <h2>
                                Ajouter une réplique
                            </h2>

                            <p class="editor-add-description">
                                Choisissez qui parle.
                            </p>


                            <div class="editor-role-choice">

                                <button
                                    type="button"
                                    class="editor-role-button"
                                    data-role="recruteur"
                                >
                                    Recruteur
                                </button>

                                <button
                                    type="button"
                                    class="editor-role-button"
                                    data-role="candidat"
                                >
                                    Candidat
                                </button>

                            </div>


                            <div
                                class="editor-add-form"
                                id="editor-add-form"
                                hidden
                            >

                                <label
                                    for="editor-new-text"
                                >
                                    Réplique
                                </label>

                                <textarea
                                    id="editor-new-text"
                                    rows="6"
                                    placeholder="Écrivez la réplique..."
                                ></textarea>

                                <button
                                    type="button"
                                    class="editor-add-button"
                                    id="editor-add-button"
                                >
                                    Ajouter la réplique
                                </button>

                            </div>

                        </section>

                    </aside>

                </div>

            </div>
        `;


        this.initialiserTitre();

        this.initialiserDialogue();

        this.initialiserTimeline();

        this.initialiserAvatars();

        this.initialiserSyntheseVocale();

        this.initialiserAjoutReplique();

        this.initialiserEnregistrement();

        this.initialiserImportExport();

        this.mettreAJourIndicateur();
    }


    initialiserTitre() {

        const inputTitre =
            this.conteneur.querySelector("#editor-title");

        const inputDescription =
            this.conteneur.querySelector("#editor-description");


        inputTitre.value = this.entretien.titre || "";

        inputDescription.value = this.entretien.description || "";


        inputTitre.addEventListener("input", () => {

            this.entretien.titre = inputTitre.value;

            this.marquerModifie();
        });


        inputDescription.addEventListener("input", () => {

            this.entretien.description =
                inputDescription.value;

            this.marquerModifie();
        });
    }


    initialiserDialogue() {

        const dialogueContainer =
            this.conteneur.querySelector("#editor-dialogue");


        this.form =
            new DialogueForm(
                dialogueContainer,
                this.entretien,
                () => {
                    this.marquerModifie();
                    this.rafraichirTimeline();
                }
            );


        this.form.onAffiche = () => {
            this.rafraichirTimeline();
        };


        this.form.afficher();
    }


    // ========================================================
    // TIMELINE
    // ========================================================

    initialiserTimeline() {

        this.rafraichirTimeline();


        const dialogueContainer =
            this.conteneur.querySelector("#editor-dialogue");

        dialogueContainer.addEventListener(
            "scroll",
            () => this.mettreAJourBlocActif(),
            { passive: true }
        );
    }


    rafraichirTimeline() {

        const track =
            this.conteneur.querySelector(
                "#editor-timeline-track"
            );

        if (!track || !this.form) return;

        this.form.afficherTimeline(track);
    }


    mettreAJourBlocActif() {

        const track =
            this.conteneur.querySelector(
                "#editor-timeline-track"
            );

        const dialogueContainer =
            this.conteneur.querySelector("#editor-dialogue");


        if (!track || !dialogueContainer) return;


        const lignes =
            dialogueContainer.querySelectorAll(".editor-line");

        if (lignes.length === 0) return;


        const containerRect =
            dialogueContainer.getBoundingClientRect();

        const centreContainer =
            containerRect.top + containerRect.height / 2;


        let indexActif = 0;

        let distanceMin = Infinity;


        lignes.forEach((ligne, i) => {

            const rect = ligne.getBoundingClientRect();

            const centreLigne = rect.top + rect.height / 2;

            const distance = Math.abs(
                centreLigne - centreContainer
            );


            if (distance < distanceMin) {
                distanceMin = distance;
                indexActif = i;
            }
        });


        if (this.form) {
            this.form.mettreAJourBlocActif(
                track,
                indexActif
            );
        }
    }


    // ========================================================
    // AVATARS
    // ========================================================

    initialiserAvatars() {

        this.roleAvatarCourant = "recruteur";


        const tabs =
            this.conteneur.querySelectorAll(
                ".editor-avatars .editor-tab"
            );


        tabs.forEach(tab => {

            tab.addEventListener("click", () => {

                const role = tab.dataset.roleTab;

                if (role === this.roleAvatarCourant) return;

                this.roleAvatarCourant = role;


                tabs.forEach(t => {

                    t.classList.toggle(
                        "active",
                        t.dataset.roleTab === role
                    );
                });


                this.afficherGrilleAvatars(role);
            });
        });


        this.afficherGrilleAvatars("recruteur");
    }


    afficherGrilleAvatars(role) {

        const conteneur =
            this.conteneur.querySelector(
                "#editor-avatar-current"
            );


        const avatars = listerAvatars();

        const courant = this.entretien.avatars[role];


        conteneur.innerHTML = `

            <div class="editor-avatar-preview">

                <div
                    class="editor-avatar-preview-circle"
                    id="editor-avatar-preview"
                ></div>

                <div class="editor-avatar-preview-label">
                    Sélection actuelle
                </div>

            </div>


            <div class="editor-avatar-grid">

                ${avatars.map(a => `
                    <button
                        type="button"
                        class="editor-avatar-choice${
                            a.id === courant ? " selected" : ""
                        }"
                        data-avatar-id="${a.id}"
                        title="${a.libelle}"
                    >
                        <div class="editor-avatar-choice-circle"></div>
                    </button>
                `).join("")}

            </div>
        `;


        const preview =
            conteneur.querySelector(
                "#editor-avatar-preview"
            );

        this.appliquerAvatar(preview, courant, 120);


        conteneur
            .querySelectorAll(".editor-avatar-choice")
            .forEach(button => {

                const id = button.dataset.avatarId;

                const cercle =
                    button.querySelector(
                        ".editor-avatar-choice-circle"
                    );

                this.appliquerAvatar(cercle, id, 64);


                button.addEventListener("click", () => {

                    this.entretien.avatars[role] = id;


                    conteneur
                        .querySelectorAll(
                            ".editor-avatar-choice"
                        )
                        .forEach(b => {

                            b.classList.toggle(
                                "selected",
                                b.dataset.avatarId === id
                            );
                        });


                    this.appliquerAvatar(preview, id, 120);


                    window.dispatchEvent(
                        new CustomEvent(
                            "candidatissim:avatars-modifies",
                            {
                                detail: this.entretien.avatars
                            }
                        )
                    );


                    this.marquerModifie();
                });
            });
    }


    appliquerAvatar(element, id, taille = 180) {

        if (!element) return;

        const style = styleAvatar(id, taille);

        Object.assign(element.style, style);
    }


    // ========================================================
    // SYNTHÈSE VOCALE
    // ========================================================

    initialiserSyntheseVocale() {

        const configuration =
            this.entretien.syntheseVocale;


        const activation =
            this.conteneur.querySelector(
                "#editor-speech-active"
            );

        activation.checked = configuration.active;


        activation.addEventListener("change", () => {

            configuration.active = activation.checked;

            this.mettreAJourEtatSynthese();

            this.marquerModifie();
        });


        this.mettreAJourEtatSynthese();


        this.roleVoixCourant = "recruteur";


        const tabs =
            this.conteneur.querySelectorAll(
                ".editor-speech .editor-tab"
            );


        tabs.forEach(tab => {

            tab.addEventListener("click", () => {

                const role = tab.dataset.voiceTab;

                if (role === this.roleVoixCourant) return;

                this.roleVoixCourant = role;


                tabs.forEach(t => {

                    t.classList.toggle(
                        "active",
                        t.dataset.voiceTab === role
                    );
                });


                this.afficherConfigurationVoix(role);
            });
        });


        this.afficherConfigurationVoix("recruteur");


        if (this.syntheseVocale.estDisponible()) {

            const mettreAJour = () => {
                this.remplirSelectVoix(this.roleVoixCourant);
            };


            window.speechSynthesis.addEventListener(
                "voiceschanged",
                mettreAJour
            );


            this.desabonnementVoix = () => {

                window.speechSynthesis
                    .removeEventListener(
                        "voiceschanged",
                        mettreAJour
                    );
            };
        }
    }


    afficherConfigurationVoix(role) {

        const configuration =
            this.entretien.syntheseVocale[role];


        const conteneur =
            this.conteneur.querySelector(
                "#editor-voice-current"
            );


        conteneur.innerHTML = `
            <label class="editor-field">
                <span>Voix</span>
                <select
                    class="editor-voice-select"
                    data-role="${role}"
                >
                    <option value="">Automatique</option>
                </select>
            </label>

            <div class="editor-range">
                <div class="editor-range-header">
                    <span>Vitesse</span>
                    <output class="editor-rate-value">
                        ${configuration.rate}
                    </output>
                </div>
                <input
                    type="range"
                    class="editor-rate"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value="${configuration.rate}"
                    data-role="${role}"
                >
            </div>

            <div class="editor-range">
                <div class="editor-range-header">
                    <span>Hauteur</span>
                    <output class="editor-pitch-value">
                        ${configuration.pitch}
                    </output>
                </div>
                <input
                    type="range"
                    class="editor-pitch"
                    min="0"
                    max="2"
                    step="0.1"
                    value="${configuration.pitch}"
                    data-role="${role}"
                >
            </div>

            <div class="editor-range">
                <div class="editor-range-header">
                    <span>Volume</span>
                    <output class="editor-volume-value">
                        ${configuration.volume}
                    </output>
                </div>
                <input
                    type="range"
                    class="editor-volume"
                    min="0"
                    max="1"
                    step="0.1"
                    value="${configuration.volume}"
                    data-role="${role}"
                >
            </div>

            <button
                type="button"
                class="editor-voice-test"
                data-role="${role}"
            >
                ▶ Tester la voix
            </button>
        `;


        this.brancherConfigurationVoix(
            role,
            configuration,
            conteneur
        );

        this.remplirSelectVoix(role);
    }


    brancherConfigurationVoix(role, configuration, conteneur) {

        const select =
            conteneur.querySelector(".editor-voice-select");

        select.addEventListener("change", () => {

            const valeur = select.value;

            if (!valeur) {
                configuration.voice = "";
                return;
            }


            const sep = valeur.indexOf("|||");

            if (sep === -1) return;


            configuration.voice = valeur.substring(0, sep);

            configuration.lang = valeur.substring(sep + 3);

            this.marquerModifie();
        });


        const rate = conteneur.querySelector(".editor-rate");
        const rateValue =
            conteneur.querySelector(".editor-rate-value");

        rate.addEventListener("input", () => {
            configuration.rate = Number(rate.value);
            rateValue.textContent = rate.value;
            this.marquerModifie();
        });


        const pitch = conteneur.querySelector(".editor-pitch");
        const pitchValue =
            conteneur.querySelector(".editor-pitch-value");

        pitch.addEventListener("input", () => {
            configuration.pitch = Number(pitch.value);
            pitchValue.textContent = pitch.value;
            this.marquerModifie();
        });


        const volume =
            conteneur.querySelector(".editor-volume");

        const volumeValue =
            conteneur.querySelector(".editor-volume-value");

        volume.addEventListener("input", () => {
            configuration.volume = Number(volume.value);
            volumeValue.textContent = volume.value;
            this.marquerModifie();
        });


        const test =
            conteneur.querySelector(".editor-voice-test");

        test.addEventListener("click", () => {

            const texte =
                role === "recruteur"
                    ? "Bonjour, pouvez-vous vous présenter ?"
                    : "Bonjour, je vais vous présenter mon parcours.";

            this.syntheseVocale.parler(texte, configuration);
        });
    }


    remplirSelectVoix(role) {

        const configuration =
            this.entretien.syntheseVocale[role];


        const select =
            this.conteneur.querySelector(
                `.editor-voice-select[data-role="${role}"]`
            );


        if (!select) return;


        const voix = this.syntheseVocale.obtenirVoix();

        const valeurActuelle = configuration.voice;


        select.innerHTML = `
            <option value="">Automatique</option>
        `;


        voix
            .slice()
            .sort(
                (a, b) =>
                    a.lang.localeCompare(b.lang) ||
                    a.name.localeCompare(b.name)
            )
            .forEach(voice => {

                const option =
                    document.createElement("option");

                option.value =
                    `${voice.name}|||${voice.lang}`;

                option.textContent =
                    `${voice.name} — ${voice.lang}`;


                if (
                    voice.name === configuration.voice &&
                    voice.lang === configuration.lang
                ) {
                    option.selected = true;
                }


                select.appendChild(option);
            });


        if (
            valeurActuelle &&
            !voix.some(
                v =>
                    v.name === configuration.voice &&
                    v.lang === configuration.lang
            )
        ) {

            const option =
                document.createElement("option");

            option.value =
                `${configuration.voice}|||${configuration.lang}`;

            option.textContent =
                `${configuration.voice} — ${configuration.lang} (indisponible)`;

            option.selected = true;

            select.appendChild(option);
        }
    }


    mettreAJourEtatSynthese() {

        const activation =
            this.conteneur.querySelector(
                "#editor-speech-active"
            );

        const statut =
            this.conteneur.querySelector(
                "#editor-speech-status"
            );


        if (!activation || !statut) return;


        if (!this.syntheseVocale.estDisponible()) {

            activation.disabled = true;

            statut.textContent =
                "La synthèse vocale n'est pas disponible dans ce navigateur.";

            return;
        }


        activation.disabled = false;


        if (activation.checked) {
            statut.textContent =
                "La synthèse vocale est activée.";
        } else {
            statut.textContent =
                "La synthèse vocale est désactivée.";
        }
    }


    // ========================================================
    // AJOUTER UNE RÉPLIQUE
    // ========================================================

    initialiserAjoutReplique() {

        const roleButtons =
            this.conteneur.querySelectorAll(
                ".editor-role-button"
            );

        const addForm =
            this.conteneur.querySelector(
                "#editor-add-form"
            );

        const newText =
            this.conteneur.querySelector(
                "#editor-new-text"
            );

        const addButton =
            this.conteneur.querySelector(
                "#editor-add-button"
            );


        let roleSelectionne = null;


        roleButtons.forEach(button => {

            button.addEventListener("click", () => {

                roleSelectionne = button.dataset.role;


                roleButtons.forEach(autreButton => {
                    autreButton.classList.remove("selected");
                });


                button.classList.add("selected");

                addForm.hidden = false;

                newText.focus();
            });
        });


        addButton.addEventListener("click", () => {

            if (!roleSelectionne) return;


            const texte = newText.value.trim();

            if (!texte) {
                newText.focus();
                return;
            }


            this.form.ajouter(roleSelectionne, texte);


            newText.value = "";
            addForm.hidden = true;


            roleButtons.forEach(button => {
                button.classList.remove("selected");
            });


            roleSelectionne = null;
        });
    }


    // ========================================================
    // IMPORT / EXPORT
    // ========================================================

    initialiserImportExport() {

        const boutonExport =
            this.conteneur.querySelector("#editor-export");

        const boutonImport =
            this.conteneur.querySelector("#editor-import");

        const inputImport =
            this.conteneur.querySelector("#editor-import-input");


        boutonExport.addEventListener("click", () => this.exporter());


        boutonImport.addEventListener("click", () => inputImport.click());


        inputImport.addEventListener("change", (event) => {

            const fichier = event.target.files[0];

            if (!fichier) return;


            this.importer(fichier);

            event.target.value = "";
        });
    }


    exporter() {

        const donnees = {
            version: 1,
            exporte: new Date().toISOString(),
            entretien: this.entretien
        };

        const json = JSON.stringify(donnees, null, 2);

        const blob = new Blob([json], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);

        const lien = document.createElement("a");

        lien.href = url;


        const titreFichier =
            (this.entretien.titre || "entretien")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

        lien.download = `${titreFichier || "entretien"}.json`;


        document.body.appendChild(lien);
        lien.click();
        document.body.removeChild(lien);

        URL.revokeObjectURL(url);
    }


    async importer(fichier) {

        try {

            const texte = await fichier.text();

            const donnees = JSON.parse(texte);

            const entretien = this._validerEntretien(donnees);


            if (!entretien) {
                throw new Error(
                    "Le fichier ne contient pas un entretien valide."
                );
            }


            entretien.id = this.entretien.id;

            this.entretien = entretien;


            if (!this.entretien.syntheseVocale) {

                this.entretien.syntheseVocale = {
                    active: false,
                    recruteur: {
                        voice: "", lang: "fr-FR",
                        rate: 1, pitch: 1, volume: 1
                    },
                    candidat: {
                        voice: "", lang: "fr-FR",
                        rate: 1, pitch: 1, volume: 1
                    }
                };
            }


            if (!this.entretien.avatars) {
                this.entretien.avatars = {};
            }

            if (!this.entretien.avatars.recruteur) {
                this.entretien.avatars.recruteur =
                    AVATAR_PAR_DEFAUT_RECRUTEUR;
            }

            if (!this.entretien.avatars.candidat) {
                this.entretien.avatars.candidat =
                    AVATAR_PAR_DEFAUT_CANDIDAT;
            }


            this.afficher();

            this.marquerModifie();


            this._afficherNotification(
                "Entretien importé. Pensez à enregistrer.",
                "success"
            );

        } catch (erreur) {

            console.error(erreur);

            this._afficherNotification(
                "Erreur d'import : " + erreur.message,
                "error"
            );
        }
    }


    _validerEntretien(donnees) {

        let entretien = donnees.entretien || donnees;


        if (!entretien || typeof entretien !== "object") {
            return null;
        }

        if (!Array.isArray(entretien.dialogue)) {
            return null;
        }


        entretien.dialogue = entretien.dialogue.map(
            (replique, index) => {

                const resultat = {
                    id: index + 1,
                    role:
                        replique.role === "candidat"
                            ? "candidat"
                            : "recruteur",
                    texte: String(replique.texte || ""),
                    duree:
                        Number(replique.duree) > 0
                            ? Number(replique.duree)
                            : 8
                };


                if (
                    Array.isArray(replique.alternatives) &&
                    replique.alternatives.length > 0
                ) {
                    resultat.alternatives =
                        replique.alternatives.map(alt => ({
                            texte: String(alt.texte || "")
                        }));
                }


                return resultat;
            }
        );


        entretien.titre =
            String(entretien.titre || "Entretien importé");

        entretien.description =
            String(entretien.description || "");


        if (!entretien.avatars) {
            entretien.avatars = {};
        }

        if (!entretien.avatars.recruteur) {
            entretien.avatars.recruteur =
                AVATAR_PAR_DEFAUT_RECRUTEUR;
        }

        if (!entretien.avatars.candidat) {
            entretien.avatars.candidat =
                AVATAR_PAR_DEFAUT_CANDIDAT;
        }


        return entretien;
    }


    _afficherNotification(message, type = "info") {

        const notification = document.createElement("div");

        notification.className =
            `editor-notification editor-notification-${type}`;

        notification.textContent = message;

        document.body.appendChild(notification);


        setTimeout(() => {
            notification.classList.add("visible");
        }, 10);


        setTimeout(() => {

            notification.classList.remove("visible");

            setTimeout(() => notification.remove(), 300);

        }, 3500);
    }


    // ========================================================
    // ENREGISTREMENT
    // ========================================================

    initialiserEnregistrement() {

        this.conteneur
            .querySelector("#editor-save")
            .addEventListener("click", () => this.enregistrer());
    }


    async enregistrer() {

        const bouton =
            this.conteneur.querySelector("#editor-save");


        bouton.disabled = true;

        bouton.textContent = "Enregistrement...";


        try {

            const response = await fetch(
                `/api/entretiens/${encodeURIComponent(
                    this.entretien.id
                )}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(this.entretien)
                }
            );


            const donnees = await response.json();


            if (!response.ok) {
                throw new Error(
                    donnees.erreur ||
                    "Impossible d'enregistrer."
                );
            }


            this.entretien = donnees.entretien;

            this.modifie = false;


            this.mettreAJourIndicateur();


            window.dispatchEvent(
                new CustomEvent(
                    "candidatissim:entretien-modifie",
                    { detail: this.entretien }
                )
            );


            bouton.textContent = "Enregistré ✓";


            setTimeout(() => {
                bouton.textContent = "Enregistrer";
            }, 1500);

        } catch (erreur) {

            console.error(erreur);

            bouton.textContent = "Erreur";


            setTimeout(() => {
                bouton.textContent = "Enregistrer";
            }, 2000);

        } finally {

            bouton.disabled = false;
        }
    }


    aDesModifications() {
        return this.modifie;
    }


    recupererEntretien() {
        return structuredClone(this.entretien);
    }
}