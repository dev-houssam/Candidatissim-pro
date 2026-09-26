let voixDisponibles = [];

const syntheseDisponible =
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;


function chargerVoix() {

    if (!syntheseDisponible) {
        return;
    }

    voixDisponibles =
        window.speechSynthesis.getVoices();
}


if (syntheseDisponible) {

    chargerVoix();

    window.speechSynthesis.addEventListener(
        "voiceschanged",
        chargerVoix
    );
}


export class SpeechSynthesisController {

    constructor() {
        this.utterance = null;
        this.enPause = false;

        // Callback appelé quand la synthèse se termine
        // naturellement (ou est annulée).
        this.onEnd = null;
    }


    estDisponible() {
        return syntheseDisponible;
    }


    obtenirVoix() {
        return [...voixDisponibles];
    }


    trouverVoix(nom, langue) {

        if (!nom) {
            return null;
        }


        const correspondanceExacte =
            voixDisponibles.find(
                voix =>
                    voix.name === nom &&
                    voix.lang === langue
            );


        if (correspondanceExacte) {
            return correspondanceExacte;
        }


        const correspondanceNom =
            voixDisponibles.find(
                voix => voix.name === nom
            );


        return correspondanceNom || null;
    }


    parler(texte, configuration = {}) {

        if (!this.estDisponible()) {
            return false;
        }


        window.speechSynthesis.cancel();


        const utterance =
            new SpeechSynthesisUtterance(
                texte
            );


        const langue =
            configuration.lang ||
            "fr-FR";


        utterance.lang = langue;


        const voix =
            this.trouverVoix(
                configuration.voice,
                langue
            );


        if (voix) {
            utterance.voice = voix;
        }


        utterance.rate =
            this.limiter(
                configuration.rate ?? 1,
                0.1,
                10
            );


        utterance.pitch =
            this.limiter(
                configuration.pitch ?? 1,
                0,
                2
            );


        utterance.volume =
            this.limiter(
                configuration.volume ?? 1,
                0,
                1
            );


        utterance.onend = () => {

            this.utterance = null;
            this.enPause = false;

            // Prévient le player que la voix a fini
            if (typeof this.onEnd === "function") {
                const callback = this.onEnd;
                this.onEnd = null;
                callback();
            }
        };


        utterance.onerror = () => {

            this.utterance = null;
            this.enPause = false;

            if (typeof this.onEnd === "function") {
                const callback = this.onEnd;
                this.onEnd = null;
                callback();
            }
        };


        this.utterance = utterance;
        this.enPause = false;


        window.speechSynthesis.speak(
            utterance
        );


        return true;
    }


    /**
     * Annule la voix en cours. Si "declencherOnEnd" est vrai,
     * le callback onEnd sera quand même appelé (utile pour
     * ne pas bloquer le player si on annule volontairement).
     */
    annuler(declencherOnEnd = false) {

        if (this.estDisponible()) {
            window.speechSynthesis.cancel();
        }


        this.utterance = null;
        this.enPause = false;


        if (declencherOnEnd && typeof this.onEnd === "function") {
            const callback = this.onEnd;
            this.onEnd = null;
            callback();
        } else {
            this.onEnd = null;
        }
    }


    estEnPause() {
        return this.enPause;
    }


    limiter(valeur, minimum, maximum) {

        const nombre =
            Number(valeur);


        if (Number.isNaN(nombre)) {
            return minimum;
        }


        return Math.max(
            minimum,
            Math.min(
                maximum,
                nombre
            )
        );
    }
}