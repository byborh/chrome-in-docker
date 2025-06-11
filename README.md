# 🐧 Dockerfile - Exécution de Google Chrome dans un conteneur Ubuntu

## Objectif

Ce `Dockerfile` crée une **image Docker basée sur Ubuntu 20.04**, capable de **lancer Google Chrome** de manière autonome, par exemple pour faire du **web scraping**, des **tests end-to-end**, ou du **rendering headless**.

---

## 🧱 Étapes et explications

### \`\`\`Dockerfile

FROM ubuntu:20.04

````
On commence avec une **image officielle Ubuntu 20.04** comme base. C’est un environnement Linux minimaliste, stable et populaire, idéal pour construire des images légères et fiables.

---

### ```Dockerfile
ENV DEBIAN_FRONTEND=noninteractive
````

On **désactive les invites interactives** lors des installations (évite les "Yes/No" à l'installation des paquets), ce qui est nécessaire dans un environnement automatisé comme Docker.

---

### \`\`\`Dockerfile

RUN apt-get update && apt-get install -y&#x20;
wget&#x20;
gnupg&#x20;
unzip&#x20;
curl&#x20;
fonts-liberation&#x20;
libappindicator3-1&#x20;
libasound2&#x20;
libatk-bridge2.0-0&#x20;
libatk1.0-0&#x20;
libcups2&#x20;
libdbus-1-3&#x20;
libgdk-pixbuf2.0-0&#x20;
libnspr4&#x20;
libgl1&#x20;
libnss3&#x20;
libx11-xcb1&#x20;
libxcomposite1&#x20;
libxdamage1&#x20;
libxrandr2&#x20;
xdg-utils&#x20;
ca-certificates&#x20;
\--no-install-recommends

````

- `apt-get update` : met à jour la liste des paquets.
- `apt-get install -y [...]` : installe les paquets nécessaires.
- `--no-install-recommends` : installe uniquement les paquets strictement demandés (pas de dépendances "optionnelles").

### Pourquoi ces paquets ?
- `wget`, `curl`, `unzip`, `gnupg` : outils de base pour télécharger, décompresser et gérer les paquets ou clés GPG.
- `fonts-liberation` : améliore l'affichage des polices (utile pour rendering web).
- Tous les paquets qui **commencent par `lib`** sont des **bibliothèques partagées nécessaires à l'exécution de Chrome**.
  - Exemple : `libasound2` = support audio, `libgl1` = support graphique, `libx11-xcb1` = interface graphique X11, etc.
- `xdg-utils` : outils pour interagir avec le système desktop (même dans un environnement sans GUI).
- `ca-certificates` : pour que Chrome reconnaisse les certificats HTTPS (SSL/TLS).

👉 Tous les paquets `lib*` sont des **libs partagées** nécessaires pour que les programmes comme Chrome puissent tourner correctement. Ceux **sans `lib`** sont des **programmes ou utilitaires** qu’on utilise dans l’image pour des tâches précises.

---

### ```Dockerfile
ENV XDG_RUNTIME_DIR=/tmp/runtime-root
RUN mkdir -p /tmp/runtime-root && chmod 700 /tmp/runtime-root
````

* `XDG_RUNTIME_DIR` est une **variable d’environnement** utilisée par certaines applications graphiques (comme Chrome) pour stocker des fichiers temporaires d’exécution.
* On crée ce répertoire manuellement et on lui donne les bons droits pour éviter les erreurs à l’exécution.

---

### \`\`\`Dockerfile

RUN wget [https://dl.google.com/linux/direct/google-chrome-stable\_current\_amd64.deb](https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb)

````
On télécharge **le paquet .deb officiel de Google Chrome** (version stable, architecture 64 bits).

---

### ```Dockerfile
RUN dpkg -i google-chrome*.deb || apt-get -fy install
````

* `dpkg -i` : installe le paquet `.deb`.
* `|| apt-get -fy install` : si l’installation échoue à cause de dépendances manquantes, cette commande les installe automatiquement (`-f` = fix, `-y` = assume yes).

---

### \`\`\`Dockerfile

RUN apt-get clean && rm -rf /var/lib/apt/lists/\* google-chrome\*.deb

````
On **nettoie** pour réduire la taille de l’image :
- `apt-get clean` : supprime les fichiers temporaires d’APT.
- `rm -rf` : supprime les listes de paquets et le `.deb` de Chrome.

---

### ```Dockerfile
CMD ["google-chrome", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-first-run", "--disable-software-rasterizer", "--disable-features=TranslateUI,Sync"]
````

C’est la **commande par défaut** que le conteneur exécutera :

* `--no-sandbox` : désactive le sandboxing (nécessaire en environnement Docker).
* `--disable-dev-shm-usage` : évite les erreurs liées au stockage partagé en mémoire (`/dev/shm`).
* `--disable-gpu` : désactive le GPU (pas utile ici, on n’a pas de GPU dans le conteneur).
* `--no-first-run` : évite les écrans de bienvenue.
* `--disable-software-rasterizer` : évite que Chrome tente de simuler le GPU via CPU.
* `--disable-features=TranslateUI,Sync` : évite de charger des fonctionnalités inutiles comme la traduction et la synchronisation.