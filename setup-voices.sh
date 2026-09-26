#!/usr/bin/env bash
# ============================================================
# setup-voices.sh
# Installe et configure les voix MBROLA pour Speech Dispatcher
# Utilisé par Candidatissim-pro
# ============================================================

set -e

# ------------------------------------------------------------
# Couleurs pour la sortie
# ------------------------------------------------------------
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
ok()      { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()    { echo -e "${YELLOW}[ATTENTION]${NC} $1"; }
error()   { echo -e "${RED}[ERREUR]${NC} $1"; }

# ------------------------------------------------------------
# Vérification : on est bien sur une distro Debian/Ubuntu
# ------------------------------------------------------------
if ! command -v apt >/dev/null 2>&1; then
    error "Ce script nécessite apt (Debian/Ubuntu). Adaptez-le pour votre distribution."
    exit 1
fi

# ------------------------------------------------------------
# Vérification : on n'est pas root
# ------------------------------------------------------------
if [ "$EUID" -eq 0 ]; then
    error "Ne lancez pas ce script en root. Il utilisera sudo quand nécessaire."
    exit 1
fi

echo ""
info "=== Candidatissim-pro : installation des voix ==="
echo ""

# ------------------------------------------------------------
# 1. Installation des paquets
# ------------------------------------------------------------
info "Installation des paquets (mbrola, espeak-ng, speech-dispatcher)..."

sudo apt update -qq

sudo apt install -y \
    mbrola \
    mbrola-fr1 \
    mbrola-fr4 \
    espeak-ng \
    speech-dispatcher \
    speech-dispatcher-espeak-ng \
    speech-dispatcher-pico

ok "Paquets installés."

# ------------------------------------------------------------
# 2. Vérification des fichiers MBROLA
# ------------------------------------------------------------
info "Vérification des voix MBROLA..."

if [ -d /usr/share/mbrola/fr1 ]; then
    ok "Voix fr1 présente."
else
    warn "Voix fr1 absente de /usr/share/mbrola/"
fi

if [ -d /usr/share/mbrola/fr4 ]; then
    ok "Voix fr4 présente."
else
    warn "Voix fr4 absente de /usr/share/mbrola/"
fi

# ------------------------------------------------------------
# 3. Configuration de speechd.conf
# ------------------------------------------------------------
CONF="/etc/speech-dispatcher/speechd.conf"
BACKUP="${CONF}.backup.$(date +%Y%m%d_%H%M%S)"

info "Sauvegarde de la configuration dans ${BACKUP}..."
sudo cp "$CONF" "$BACKUP"

info "Activation des modules espeak-ng et espeak-ng-mbrola..."

sudo python3 - "$CONF" <<'PYEOF'
import re
import sys
from pathlib import Path

conf_path = Path(sys.argv[1])
contenu = conf_path.read_text(encoding="utf-8")

def activer_ligne(texte, motif):
    """Décommente une ligne qui commence par # suivi du motif."""
    pattern = re.compile(
        r'^\s*#\s*(' + re.escape(motif) + r'.*)$',
        re.MULTILINE
    )
    return pattern.sub(r'\1', texte)

# Décommenter les deux AddModule
contenu = activer_ligne(
    contenu,
    'AddModule "espeak-ng"'
)
contenu = activer_ligne(
    contenu,
    'AddModule "espeak-ng-mbrola-generic"'
)

# Décommenter DefaultModule espeak-ng
contenu = activer_ligne(
    contenu,
    'DefaultModule espeak-ng'
)

# Si DefaultModule espeak-ng n'existe plus du tout (ligne supprimée),
# on l'ajoute à la fin.
if 'DefaultModule espeak-ng' not in contenu:
    contenu += '\nDefaultModule espeak-ng\n'

conf_path.write_text(contenu, encoding="utf-8")
print("Configuration mise à jour.")
PYEOF

ok "Configuration de speechd.conf modifiée."

# ------------------------------------------------------------
# 4. Redémarrage de speech-dispatcher
# ------------------------------------------------------------
info "Redémarrage de speech-dispatcher..."

if systemctl --user is-active --quiet speech-dispatcher 2>/dev/null; then
    systemctl --user restart speech-dispatcher
    ok "speech-dispatcher redémarré via systemd."
else
    # Fallback : kill manuel, il redémarrera tout seul
    pkill -f speech-dispatcher 2>/dev/null || true
    ok "speech-dispatcher arrêté (il redémarrera à la prochaine demande)."
fi

# ------------------------------------------------------------
# 5. Test rapide
# ------------------------------------------------------------
info "Test rapide de la synthèse..."

sleep 1

if command -v spd-say >/dev/null 2>&1; then
    spd-say -o espeak-ng "Test de la synthèse vocale" &
    ok "Un test audio a été lancé. Vous devriez entendre une phrase."
else
    warn "spd-say introuvable, test ignoré."
fi

# ------------------------------------------------------------
# 6. Résumé final
# ------------------------------------------------------------
echo ""
echo "============================================================"
ok "Installation terminée."
echo "============================================================"
echo ""
echo -e "${YELLOW}À FAIRE MAINTENANT :${NC}"
echo ""
echo "  1. FERMEZ complètement votre navigateur (pas juste l'onglet)."
echo "     $ killall firefox"
echo "     ou"
echo "     $ killall chrome"
echo ""
echo "  2. Relancez votre serveur Flask :"
echo "     $ python server/main.py"
echo ""
echo "  3. Ouvrez http://127.0.0.1:8000"
echo ""
echo "  4. Allez dans l'onglet Éditeur → vous devriez voir"
echo "     des voix comme :"
echo "       • fr1 — fr"
echo "       • fr4 — fr"
echo "       • French (France)+Iven — fr-FR"
echo "       • ..."
echo ""
echo "  5. Choisissez une voix différente pour Recruteur"
echo "     et pour Candidat, puis cliquez sur « Tester la voix »."
echo ""
echo -e "${BLUE}Si un problème persiste, lancez ces diagnostics :${NC}"
echo "  $ spd-say -O"
echo "  $ spd-say -o espeak-ng -L | head -20"
echo "  $ ls /usr/share/mbrola/"
echo ""