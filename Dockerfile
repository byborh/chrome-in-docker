FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

# Dépendances système
RUN apt-get update && apt-get install -y \
  wget curl gnupg unzip ca-certificates \
  fonts-liberation libappindicator3-1 libasound2 \
  libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
  libgdk-pixbuf2.0-0 libnspr4 libgl1 libnss3 libx11-xcb1 \
  libxcomposite1 libxdamage1 libxrandr2 xdg-utils --no-install-recommends

# Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
  && dpkg -i google-chrome*.deb || apt-get -fy install \
  && rm google-chrome*.deb

# Node.js (16.x par exemple)
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

# Dossier de travail
WORKDIR /app
COPY . .

# Installer Puppeteer
RUN npm install

# Exécuter ton script automatiquement
CMD ["node", "app.js"]
