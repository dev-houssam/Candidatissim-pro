import {
    chargerEntretiens,
    chargerEntretien
} from "./data/xml-parser.js";

import { Player } from "./player/player.js";
import { Editor } from "./editor/editor.js";


class Application {

    constructor() {

        this.entretien = null;

        this.player = null;

        this.editor = null;

        this.elements = {};

        this.vueCourante = "simulation";
    }


    async initialiser() {

        this.recupererElements();

        this.initialiserNavigation();

        this.player = new Player(this.elements.player);

        this.editor = new Editor(this.elements.editor);


        try {

            const entretiens = await chargerEntretiens();


            if (entretiens.length === 0) {
                throw new Error("Aucun entretien disponible.");
            }


            await this.chargerEntretien(entretiens[0].id);

        } catch (erreur) {

            console.error(erreur);

            this.afficherErreur(erreur.message);
        }
    }


    recupererElements() {

        this.elements = {
            player: document.getElementById("player"),
            editor: document.getElementById("editor"),
            simulationView: document.getElementById("simulation-view"),
            editorView: document.getElementById("editor-view"),
            navigationButtons: document.querySelectorAll(".navigation-button")
        };
    }


    initialiserNavigation() {

        this.elements.navigationButtons.forEach(bouton => {

            bouton.addEventListener("click", () => {

                const vueCible = bouton.dataset.view;

                if (vueCible === this.vueCourante) return;


                // Si on quitte l'éditeur avec des modifications
                // non enregistrées, on demande confirmation.
                if (
                    this.vueCourante === "editor" &&
                    this.editor &&
                    this.editor.aDesModifications()
                ) {

                    const confirmer = window.confirm(
                        "Vous avez des modifications non enregistrées.\n\n" +
                        "Voulez-vous vraiment quitter l'éditeur ?"
                    );

                    if (!confirmer) return;
                }


                this.changerVue(vueCible);
            });
        });
    }


    changerVue(vue) {

        this.vueCourante = vue;


        this.elements.navigationButtons.forEach(bouton => {

            bouton.classList.toggle(
                "active",
                bouton.dataset.view === vue
            );
        });


        this.elements.simulationView.classList.toggle(
            "active",
            vue === "simulation"
        );


        this.elements.editorView.classList.toggle(
            "active",
            vue === "editor"
        );
    }


    async chargerEntretien(id) {

        this.entretien = await chargerEntretien(id);

        this.player.charger(this.entretien);

        this.editor.charger(this.entretien);
    }


    afficherErreur(message) {

        this.elements.player.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h2>Impossible de charger l'application</h2>
                <p>${message}</p>
            </div>
        `;
    }
}


const application = new Application();

application.initialiser();