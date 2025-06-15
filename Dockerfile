FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    git \
    ca-certificates \
    --no-install-recommends

# 🧊 Installer Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    dpkg -i google-chrome*.deb || apt-get -fy install && \
    apt-get clean && rm -rf /var/lib/apt/lists/* google-chrome*.deb

# 🧠 Installer Node.js + Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn

WORKDIR /app/leboncoin

# 📦 Installer les dépendances Node
COPY ./package.json ./package.json
RUN yarn

# 💡 Le code sera monté dynamiquement
CMD ["yarn", "dev"]
