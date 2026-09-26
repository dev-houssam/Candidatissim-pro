export class DialogueForm {

    constructor(conteneur, entretien, onChange) {

        this.conteneur = conteneur;
        this.entretien = entretien;
        this.onChange = onChange;

        this.dragIndex = null;
    }


    // ========================================================
    // RENDU PRINCIPAL
    // ========================================================

    afficher() {

        this.conteneur.innerHTML = "";

        // Conteneur parent pour la timeline (créé une seule fois)
        // On utilise un wrapper externe fourni par editor.js

        this.entretien.dialogue.forEach((replique, index) => {
            this.afficherReplique(replique, index);
        });

        this.renumeroter();

        // Notifie l'extérieur qu'on vient de re-rendre
        // (utile pour que l'éditeur rafraîchisse la timeline)
        if (typeof this.onAffiche === "function") {
            this.onAffiche();
        }
    }


    afficherReplique(replique, index) {

        const element = document.createElement("article");

        element.className = `editor-line ${replique.role}`;

        element.dataset.index = index;

        // ID pour pouvoir faire scrollIntoView depuis la timeline
        element.id = `editor-line-${index}`;


        const alternatives =
            Array.isArray(replique.alternatives)
                ? replique.alternatives
                : [];


        element.innerHTML = `
            <div class="editor-line-header">

                <div class="editor-line-header-left">

                    <span class="editor-role">
                        ${replique.role === "recruteur"
                            ? "RECRUTEUR"
                            : "CANDIDAT"}
                    </span>

                </div>

                <span class="editor-number">
                    #${index + 1}
                </span>

            </div>


            <textarea
                class="editor-text"
                rows="4"
            ></textarea>


            <div class="editor-text-meta">
                <span class="editor-text-count">
                    0 mot
                </span>
            </div>


            <div class="editor-alternatives">

                <div class="editor-alternatives-header">

                    <span class="editor-alternatives-count">
                        ${alternatives.length === 0
                            ? "Aucune alternative"
                            : alternatives.length +
                              " alternative" +
                              (alternatives.length > 1
                                ? "s"
                                : "")}
                    </span>

                    <button
                        type="button"
                        class="editor-action editor-action-small"
                        data-action="add-alternative"
                    >
                        + Ajouter
                    </button>

                </div>

                <div class="editor-alternatives-list"></div>

            </div>


            <div class="editor-line-actions">

                <button
                    type="button"
                    class="editor-action"
                    data-action="up"
                >
                    ↑
                </button>

                <button
                    type="button"
                    class="editor-action"
                    data-action="down"
                >
                    ↓
                </button>

                <button
                    type="button"
                    class="editor-action"
                    data-action="role"
                >
                    Changer de rôle
                </button>

                <button
                    type="button"
                    class="editor-action editor-delete"
                    data-action="delete"
                >
                    Supprimer
                </button>

            </div>
        `;


        const textarea =
            element.querySelector(".editor-text");

        textarea.value = replique.texte;


        const compteur =
            element.querySelector(".editor-text-count");


        const mettreAJourCompteur = () => {

            const texte = textarea.value.trim();

            const mots = texte
                ? texte.split(/\s+/).length
                : 0;

            const chars = texte.length;

            compteur.textContent =
                `${mots} mot${mots > 1 ? "s" : ""} · ${chars} caractère${chars > 1 ? "s" : ""}`;
        };


        mettreAJourCompteur();


        textarea.addEventListener("input", () => {

            replique.texte = textarea.value;

            mettreAJourCompteur();

            this.onChange();
        });


        this.afficherAlternatives(
            element,
            replique,
            index
        );


        element
            .querySelectorAll(".editor-action")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const action = button.dataset.action;

                    if (action === "up") this.deplacer(index, -1);
                    if (action === "down") this.deplacer(index, 1);
                    if (action === "role") this.changerRole(index);
                    if (action === "delete") this.supprimer(index);
                    if (action === "add-alternative")
                        this.ajouterAlternative(index);

                });
            });


        this.conteneur.appendChild(element);
    }


    // ========================================================
    // TIMELINE (rendu dans un conteneur séparé)
    // ========================================================

    afficherTimeline(conteneurTimeline) {

        conteneurTimeline.innerHTML = "";


        this.entretien.dialogue.forEach((replique, index) => {

            const bloc = document.createElement("button");

            bloc.type = "button";

            bloc.className =
                `editor-timeline-block ${replique.role}`;

            bloc.dataset.index = index;

            bloc.draggable = true;

            bloc.title =
                `#${index + 1} — ${replique.role} — ${replique.texte.slice(0, 80)}`;


            bloc.innerHTML = `
                <span class="editor-timeline-number">
                    ${index + 1}
                </span>
                <span class="editor-timeline-role">
                    ${replique.role === "recruteur" ? "R" : "C"}
                </span>
            `;


            // Clic → scroll vers la réplique
            bloc.addEventListener("click", () => {
                this.scrollVers(index);
            });


            // Drag & drop
            this.brancherDragTimeline(bloc, index);


            conteneurTimeline.appendChild(bloc);
        });
    }


    brancherDragTimeline(bloc, index) {

        bloc.addEventListener("dragstart", (e) => {

            this.dragIndex = index;

            bloc.classList.add("dragging");

            e.dataTransfer.effectAllowed = "move";

            e.dataTransfer.setData(
                "text/plain",
                String(index)
            );
        });


        bloc.addEventListener("dragend", () => {

            bloc.classList.remove("dragging");

            this.dragIndex = null;


            // Nettoyer tous les indicateurs
            const parent = bloc.parentElement;

            if (parent) {

                parent
                    .querySelectorAll(".editor-timeline-block")
                    .forEach(b => {

                        b.classList.remove(
                            "drag-over-left",
                            "drag-over-right"
                        );
                    });
            }
        });


        bloc.addEventListener("dragover", (e) => {

            if (this.dragIndex === null) return;
            if (index === this.dragIndex) return;

            e.preventDefault();
            e.dataTransfer.dropEffect = "move";


            const rect = bloc.getBoundingClientRect();

            const milieu = rect.left + rect.width / 2;

            const aGauche = e.clientX < milieu;


            bloc.classList.toggle("drag-over-left", aGauche);

            bloc.classList.toggle("drag-over-right", !aGauche);
        });


        bloc.addEventListener("dragleave", () => {

            bloc.classList.remove(
                "drag-over-left",
                "drag-over-right"
            );
        });


        bloc.addEventListener("drop", (e) => {

            e.preventDefault();

            if (this.dragIndex === null) return;
            if (index === this.dragIndex) return;


            const rect = bloc.getBoundingClientRect();

            const milieu = rect.left + rect.width / 2;

            const aGauche = e.clientX < milieu;


            let destination = index;

            if (!aGauche) {
                destination = index + 1;
            }


            if (this.dragIndex < destination) {
                destination -= 1;
            }


            if (destination === this.dragIndex) {
                return;
            }


            const dialogue = this.entretien.dialogue;

            const [element] = dialogue.splice(
                this.dragIndex,
                1
            );

            dialogue.splice(destination, 0, element);


            this.dragIndex = null;

            this.renumeroter();
            this.afficher();
            this.onChange();
        });
    }


    scrollVers(index) {

        const element =
            this.conteneur.querySelector(
                `#editor-line-${index}`
            );

        if (!element) return;


        element.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        // Flash visuel
        element.classList.add("editor-line-highlight");

        setTimeout(() => {
            element.classList.remove("editor-line-highlight");
        }, 900);
    }


    mettreAJourBlocActif(conteneurTimeline, indexActif) {

        const blocs =
            conteneurTimeline.querySelectorAll(
                ".editor-timeline-block"
            );


        blocs.forEach((bloc, i) => {

            bloc.classList.toggle(
                "active",
                i === indexActif
            );
        });
    }


    // ========================================================
    // ALTERNATIVES
    // ========================================================

    afficherAlternatives(element, replique, index) {

        const liste =
            element.querySelector(".editor-alternatives-list");

        liste.innerHTML = "";


        const alternatives = replique.alternatives || [];


        alternatives.forEach((alt, altIndex) => {

            const item = document.createElement("div");

            item.className = "editor-alternative";

            item.innerHTML = `
                <textarea
                    class="editor-alternative-text"
                    rows="2"
                    placeholder="Réplique alternative..."
                ></textarea>

                <button
                    type="button"
                    class="editor-alternative-delete"
                    title="Supprimer cette alternative"
                >
                    ×
                </button>
            `;


            const ta =
                item.querySelector(".editor-alternative-text");

            ta.value = alt.texte || "";


            ta.addEventListener("input", () => {

                alt.texte = ta.value;

                this.onChange();
            });


            item
                .querySelector(".editor-alternative-delete")
                .addEventListener("click", () => {

                    this.supprimerAlternative(
                        index,
                        altIndex
                    );
                });


            liste.appendChild(item);
        });
    }


    ajouterAlternative(index) {

        const replique =
            this.entretien.dialogue[index];


        if (!replique.alternatives) {
            replique.alternatives = [];
        }


        replique.alternatives.push({
            texte: ""
        });


        this.afficher();
        this.onChange();
    }


    supprimerAlternative(index, altIndex) {

        const replique =
            this.entretien.dialogue[index];


        if (!replique.alternatives) return;


        replique.alternatives.splice(altIndex, 1);


        if (replique.alternatives.length === 0) {
            delete replique.alternatives;
        }


        this.afficher();
        this.onChange();
    }


    // ========================================================
    // OPÉRATIONS DE BASE
    // ========================================================

    ajouter(role, texte) {

        const nouvelleReplique = {
            id: 0,
            role: role,
            texte: texte,
            duree: 8
        };


        this.entretien.dialogue.push(nouvelleReplique);

        this.renumeroter();
        this.afficher();
        this.onChange();
    }


    supprimer(index) {

        this.entretien.dialogue.splice(index, 1);

        this.renumeroter();
        this.afficher();
        this.onChange();
    }


    changerRole(index) {

        const replique =
            this.entretien.dialogue[index];


        replique.role =
            replique.role === "recruteur"
                ? "candidat"
                : "recruteur";


        this.afficher();
        this.onChange();
    }


    deplacer(index, direction) {

        const nouvellePosition = index + direction;

        if (
            nouvellePosition < 0 ||
            nouvellePosition >= this.entretien.dialogue.length
        ) {
            return;
        }


        const dialogue = this.entretien.dialogue;

        [dialogue[index], dialogue[nouvellePosition]] = [
            dialogue[nouvellePosition],
            dialogue[index]
        ];


        this.renumeroter();
        this.afficher();
        this.onChange();
    }


    renumeroter() {

        this.entretien.dialogue.forEach((replique, index) => {
            replique.id = index + 1;
        });
    }
}