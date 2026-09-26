export class Timeline {

    constructor(progressElement, currentElement, totalElement) {

        this.progressElement = progressElement;

        this.currentElement = currentElement;

        this.totalElement = totalElement;

        this.totalDuration = 0;
        this.currentTime = 0;
    }


    definirDuree(duree) {

        this.totalDuration = duree;

        this.currentTime = 0;

        this.mettreAJour();
    }


    definirTemps(temps) {

        this.currentTime = temps;

        this.mettreAJour();
    }


    avancer(delta) {

        this.currentTime += delta;

        if (this.currentTime > this.totalDuration) {
            this.currentTime = this.totalDuration;
        }

        this.mettreAJour();
    }


    mettreAJour() {

        let pourcentage = 0;

        if (this.totalDuration > 0) {
            pourcentage =
                (this.currentTime / this.totalDuration) * 100;
        }


        this.progressElement.style.width =
            `${pourcentage}%`;


        this.currentElement.textContent =
            this.formaterTemps(this.currentTime);


        this.totalElement.textContent =
            this.formaterTemps(this.totalDuration);
    }


    formaterTemps(secondes) {

        secondes = Math.max(
            0,
            Math.floor(secondes)
        );


        const minutes =
            Math.floor(secondes / 60);


        const secondesRestantes =
            secondes % 60;


        return `${minutes}:${secondesRestantes
            .toString()
            .padStart(2, "0")}`;
    }
}