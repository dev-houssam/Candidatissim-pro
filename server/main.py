from pathlib import Path

from flask import Flask, send_from_directory

from routes.entretiens import creer_routes_entretiens
from routes.simulation import creer_routes_simulation
from services.entretien_service import EntretienService


BASE_DIR = Path(__file__).resolve().parent.parent

CLIENT_DIR = BASE_DIR / "client"
DATA_DIR = BASE_DIR / "data"

XML_FILE = DATA_DIR / "entretiens.xml"


app = Flask(
    __name__,
    static_folder=None
)


entretien_service = EntretienService(XML_FILE)


app.register_blueprint(
    creer_routes_entretiens(entretien_service)
)

app.register_blueprint(
    creer_routes_simulation()
)


@app.get("/")
def index():
    return send_from_directory(
        CLIENT_DIR,
        "index.html"
    )


@app.get("/<path:path>")
def fichiers_client(path):
    return send_from_directory(
        CLIENT_DIR,
        path
    )


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=8000,
        debug=True
    )