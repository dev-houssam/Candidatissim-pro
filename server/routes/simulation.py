from flask import Blueprint, jsonify


def creer_routes_simulation():

    routes = Blueprint("simulation", __name__)

    @routes.get("/api/simulation/statut")
    def statut_simulation():
        return jsonify({
            "statut": "disponible"
        })

    return routes