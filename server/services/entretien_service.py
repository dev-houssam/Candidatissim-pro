from pathlib import Path
import xml.etree.ElementTree as ET


class EntretienService:

    def __init__(self, fichier_xml):
        self.fichier_xml = Path(fichier_xml)

    def charger_xml(self):
        return ET.parse(self.fichier_xml)

    def lister_entretiens(self):
        arbre = self.charger_xml()
        racine = arbre.getroot()

        entretiens = []

        for entretien in racine.findall("entretien"):
            entretiens.append({
                "id": entretien.get("id"),
                "titre": entretien.findtext("titre", ""),
                "description": entretien.findtext("description", "")
            })

        return entretiens

    def recuperer_entretien(self, entretien_id):
        arbre = self.charger_xml()
        racine = arbre.getroot()

        entretien = racine.find(
            f"./entretien[@id='{entretien_id}']"
        )

        if entretien is None:
            return None

        dialogue = []

        for replique in entretien.findall("./dialogue/replique"):
            dialogue.append(self._lire_replique(replique))

        return {
            "id": entretien.get("id"),
            "titre": entretien.findtext("titre", ""),
            "description": entretien.findtext("description", ""),
            "dialogue": dialogue,
            "syntheseVocale": self._lire_synthese_vocale(entretien),
            "avatars": self._lire_avatars(entretien)
        }

    def enregistrer_entretien(self, entretien_id, donnees):
        arbre = self.charger_xml()
        racine = arbre.getroot()

        entretien = racine.find(
            f"./entretien[@id='{entretien_id}']"
        )

        if entretien is None:
            return False

        titre = entretien.find("titre")

        if titre is None:
            titre = ET.SubElement(entretien, "titre")

        titre.text = donnees.get("titre", "")

        description = entretien.find("description")

        if description is None:
            description = ET.SubElement(
                entretien,
                "description"
            )

        description.text = donnees.get(
            "description",
            ""
        )

        dialogue = entretien.find("dialogue")

        if dialogue is None:
            dialogue = ET.SubElement(
                entretien,
                "dialogue"
            )

        for replique in list(dialogue):
            dialogue.remove(replique)

        for index, replique_data in enumerate(
            donnees.get("dialogue", []),
            start=1
        ):
            self._ecrire_replique(
                dialogue,
                index,
                replique_data
            )

        synthese = donnees.get("syntheseVocale")

        if synthese is not None:
            self._ecrire_synthese_vocale(
                entretien,
                synthese
            )

        avatars = donnees.get("avatars")

        if avatars is not None:
            self._ecrire_avatars(
                entretien,
                avatars
            )

        arbre.write(
            self.fichier_xml,
            encoding="utf-8",
            xml_declaration=True
        )

        return True


    # ========================================================
    # RÉPLIQUES (rétro-compatible)
    # ========================================================

    def _lire_replique(self, replique):

        texte_element = replique.find("texte")

        if texte_element is not None:
            texte = self._texte(texte_element)

            alternatives = []

            for alt in replique.findall("alternative"):
                valeur = self._texte(alt)

                if valeur:
                    alternatives.append({
                        "texte": valeur
                    })
        else:
            texte = self._texte(replique)

            alternatives = []

        resultat = {
            "id": int(replique.get("id", "0")),
            "role": replique.get("role", "recruteur"),
            "texte": texte,
            "duree": int(replique.get("duree", "8"))
        }

        if alternatives:
            resultat["alternatives"] = alternatives

        return resultat

    def _ecrire_replique(self, dialogue, index, donnees):

        role = donnees.get("role", "recruteur")
        texte = donnees.get("texte", "")

        try:
            duree = int(donnees.get("duree", 8))
        except (TypeError, ValueError):
            duree = 8

        alternatives = []

        for alt in donnees.get("alternatives", []) or []:
            valeur = alt.get("texte", "") if isinstance(alt, dict) else str(alt)

            if valeur and valeur.strip():
                alternatives.append(valeur)

        replique = ET.SubElement(
            dialogue,
            "replique"
        )

        replique.set("id", str(index))
        replique.set("role", role)
        replique.set("duree", str(duree))

        if alternatives:
            texte_element = ET.SubElement(
                replique,
                "texte"
            )
            texte_element.text = texte

            for valeur in alternatives:
                alt_element = ET.SubElement(
                    replique,
                    "alternative"
                )
                alt_element.text = valeur
        else:
            replique.text = texte


    # ========================================================
    # SYNTHÈSE VOCALE
    # ========================================================

    def _lire_synthese_vocale(self, entretien):
        section = entretien.find("synthese-vocale")

        def config_par_defaut():
            return {
                "voice": "",
                "lang": "fr-FR",
                "rate": 1,
                "pitch": 1,
                "volume": 1
            }

        if section is None:
            return {
                "active": False,
                "recruteur": config_par_defaut(),
                "candidat": config_par_defaut()
            }

        def lire_role(nom):
            element = section.find(nom)

            if element is None:
                return config_par_defaut()

            def nombre(cle, defaut):
                try:
                    return float(element.get(cle, defaut))
                except (TypeError, ValueError):
                    return defaut

            return {
                "voice": element.get("voice", ""),
                "lang": element.get("lang", "fr-FR"),
                "rate": nombre("rate", 1),
                "pitch": nombre("pitch", 1),
                "volume": nombre("volume", 1)
            }

        return {
            "active": section.get("active", "false") == "true",
            "recruteur": lire_role("recruteur"),
            "candidat": lire_role("candidat")
        }

    def _ecrire_synthese_vocale(self, entretien, synthese):
        ancienne = entretien.find("synthese-vocale")

        if ancienne is not None:
            entretien.remove(ancienne)

        section = ET.SubElement(
            entretien,
            "synthese-vocale"
        )

        section.set(
            "active",
            "true" if synthese.get("active") else "false"
        )

        def ecrire_role(nom, config):
            element = ET.SubElement(section, nom)

            element.set("voice", str(config.get("voice", "")))
            element.set("lang", str(config.get("lang", "fr-FR")))
            element.set("rate", str(config.get("rate", 1)))
            element.set("pitch", str(config.get("pitch", 1)))
            element.set("volume", str(config.get("volume", 1)))

        ecrire_role("recruteur", synthese.get("recruteur", {}))
        ecrire_role("candidat", synthese.get("candidat", {}))


    # ========================================================
    # AVATARS
    # ========================================================

    def _lire_avatars(self, entretien):
        """
        Lit le bloc <avatars> s'il existe.
        Sinon, renvoie None : c'est le frontend qui décidera
        des avatars par défaut (source unique de vérité : avatars.js).
        """
        section = entretien.find("avatars")

        if section is None:
            return None

        recruteur = section.findtext("recruteur", "").strip()
        candidat = section.findtext("candidat", "").strip()

        # Si les deux sont vides → considéré comme absent
        if not recruteur and not candidat:
            return None

        return {
            "recruteur": recruteur or None,
            "candidat": candidat or None
        }

    def _ecrire_avatars(self, entretien, avatars):
        ancienne = entretien.find("avatars")

        if ancienne is not None:
            entretien.remove(ancienne)

        # Si aucun avatar n'est fourni, on ne crée pas la section
        if not avatars:
            return

        recruteur = avatars.get("recruteur")
        candidat = avatars.get("candidat")

        if not recruteur and not candidat:
            return

        section = ET.SubElement(entretien, "avatars")

        if recruteur:
            elem = ET.SubElement(section, "recruteur")
            elem.text = str(recruteur)

        if candidat:
            elem = ET.SubElement(section, "candidat")
            elem.text = str(candidat)


    # ========================================================
    # UTILITAIRES
    # ========================================================

    def _texte(self, element):
        return "".join(
            element.itertext()
        ).strip()