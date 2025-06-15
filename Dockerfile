FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libxext6 \
    dbus \
    dbus-x11 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libgl1 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils git \
    ca-certificates \
    --no-install-recommends

ENV XDG_RUNTIME_DIR=/tmp/runtime-root
RUN mkdir -p /tmp/runtime-root && chmod 700 /tmp/runtime-root

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

RUN dpkg -i google-chrome*.deb || apt-get -fy install

RUN apt-get clean && rm -rf /var/lib/apt/lists/* google-chrome*.deb

RUN mkdir -p /var/run/dbus/ && touch /var/run/dbus/system_bus_socket

ENV NODE_VERSION=18.10.0
ENV NVM_DIR="$HOME/.nvm" 
RUN (git clone https://github.com/nvm-sh/nvm.git "$NVM_DIR" &&\
    cd "$NVM_DIR" && git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)`) &&\
    \. "$NVM_DIR/nvm.sh" &&\
    nvm i $NODE_VERSION

ENV PATH=$PATH:/.nvm/versions/node/v$NODE_VERSION/bin

RUN /bin/bash -c "echo -e 'export NVM_DIR=\"$HOME/.nvm\" \n\
    [ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\" \n\
    [ -s \"$NVM_DIR/bash_completion\" ] && \\. \"$NVM_DIR/bash_completion\"' >> ~/.bashrc"

WORKDIR /app/leboncoin
COPY ./package.json ./package.json
RUN npm i -g yarn &&\
    yarn

# COPY ./src ./src
# COPY ./chrome-profile /app/leboncoin/chrome-profile

# COPY ./src/chrome-profile ./src/chrome-profile

# CMD ["google-chrome", "--no-sandbox", "--headless=new", "--disable-dev-shm-usage", "--disable-gpu", "--no-first-run", "--disable-software-rasterizer", "--disable-features=TranslateUI,Sync"]
ENTRYPOINT [ "yarn", "dev" ]
