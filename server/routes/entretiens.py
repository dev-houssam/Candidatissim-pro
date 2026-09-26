from flask import Blueprint, jsonify, request


def creer_routes_entretiens(service):

    blueprint = Blueprint(
        "entretiens",
        __name__
    )


    @blueprint.get("/api/entretiens")
    def lister_entretiens():

        entretiens = service.lister_entretiens()

        return jsonify({
            "entretiens": entretiens
        })


    @blueprint.get(
        "/api/entretiens/<entretien_id>"
    )
    def recuperer_entretien(entretien_id):

        entretien = service.recuperer_entretien(
            entretien_id
        )

        if entretien is None:

            return jsonify({
                "erreur": "Entretien introuvable."
            }), 404

        return jsonify(entretien)


    @blueprint.put(
        "/api/entretiens/<entretien_id>"
    )
    def enregistrer_entretien(entretien_id):

        donnees = request.get_json(
            silent=True
        )

        if not donnees:

            return jsonify({
                "erreur": "Données invalides."
            }), 400


        entretien = service.recuperer_entretien(
            entretien_id
        )

        if entretien is None:

            return jsonify({
                "erreur": "Entretien introuvable."
            }), 404


        succes = service.enregistrer_entretien(
            entretien_id,
            donnees
        )


        if not succes:

            return jsonify({
                "erreur": "Impossible d'enregistrer l'entretien."
            }), 500


        entretien_modifie = service.recuperer_entretien(
            entretien_id
        )


        return jsonify({
            "message": "Entretien enregistré.",
            "entretien": entretien_modifie
        })


    return blueprint