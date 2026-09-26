const API_BASE = "/api";


export async function chargerEntretiens() {
    const response = await fetch(`${API_BASE}/entretiens`);

    if (!response.ok) {
        throw new Error(
            "Impossible de charger la liste des entretiens."
        );
    }

    const donnees = await response.json();

    return donnees.entretiens;
}


export async function chargerEntretien(id) {
    const response = await fetch(
        `${API_BASE}/entretiens/${encodeURIComponent(id)}`
    );

    if (!response.ok) {
        throw new Error(
            "Impossible de charger l'entretien."
        );
    }

    return await response.json();
}