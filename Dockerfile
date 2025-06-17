FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    git \
    ca-certificates \
    tor \
    --no-install-recommends

# 🧊 Installer Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    dpkg -i google-chrome*.deb || apt-get -fy install && \
    apt-get clean && rm -rf /var/lib/apt/lists/* google-chrome*.deb

# 🧠 Installer Node.js + Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn

# 🧅 Configurer Tor
# 🧅 Configurer Tor
RUN echo "SOCKSPort 9050" >> /etc/tor/torrc && \
    echo "Log notice stdout" >> /etc/tor/torrc && \
    echo "ControlPort 9051" >> /etc/tor/torrc && \
    echo "CookieAuthentication 1" >> /etc/tor/torrc

# Répertoire de travail
WORKDIR /app/leboncoin

# 📦 Dépendances Node
COPY ./package.json ./package.json
RUN yarn

# Le code sera monté au runtime
CMD ["sh", "-c", "service tor start && sleep 5 && yarn dev"]
