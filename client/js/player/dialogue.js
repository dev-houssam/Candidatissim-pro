export class Dialogue {

    constructor(conteneur) {
        this.conteneur = conteneur;
        this.repliques = [];
    }


    charger(repliques) {

        this.repliques = repliques;

        this.conteneur.innerHTML = "";

        for (const replique of repliques) {

            const element = this.creerReplique(replique);

            this.conteneur.appendChild(element);
        }
    }


    creerReplique(replique) {

        const ligne = document.createElement("article");

        ligne.className = `dialogue-line ${replique.role}`;

        ligne.dataset.id = replique.id;


        const role = document.createElement("div");

        role.className = "dialogue-role";

        role.textContent =
            replique.role === "recruteur"
                ? "Recruteur"
                : "Candidat";


        const bulle = document.createElement("div");

        bulle.className = "dialogue-bubble";

        bulle.textContent = replique.texte;


        ligne.appendChild(role);
        ligne.appendChild(bulle);


        return ligne;
    }


    afficherTexte(index, texte) {

        const elements =
            this.conteneur.querySelectorAll(".dialogue-line");

        const element = elements[index];

        if (!element) return;


        const bulle =
            element.querySelector(".dialogue-bubble");

        if (bulle) {
            bulle.textContent = texte;
        }
    }


    appliquerTextes(textes) {

        const elements =
            this.conteneur.querySelectorAll(".dialogue-line");

        elements.forEach((element, index) => {

            const texte = textes[index];

            if (texte === undefined) return;

            const bulle =
                element.querySelector(".dialogue-bubble");

            if (bulle) {
                bulle.textContent = texte;
            }
        });
    }


    afficher(index) {

        if (index < 0 || index >= this.repliques.length) {
            return;
        }


        const elements =
            this.conteneur.querySelectorAll(".dialogue-line");


        elements.forEach((element, elementIndex) => {

            if (elementIndex <= index) {
                element.classList.add("visible");
            }
        });


        const element = elements[index];

        if (element) {

            element.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }


    reinitialiser() {

        const elements =
            this.conteneur.querySelectorAll(".dialogue-line");

        elements.forEach(element => {
            element.classList.remove("visible");
        });


        this.conteneur.scrollTop = 0;
    }
}