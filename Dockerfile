FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y curl gnupg wget unzip git tor tor-geoipdb iproute2 ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Pas de port en conflit
RUN echo "SocksPort 9052" >> /etc/tor/torrc && \
    echo "ControlPort auto" >> /etc/tor/torrc && \
    echo "CookieAuthentication 0" >> /etc/tor/torrc && \
    echo "HashedControlPassword \"\"" >> /etc/tor/torrc && \
    echo "Log notice stdout" >> /etc/tor/torrc

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

EXPOSE 9052

CMD ["sh", "-c", "\
  tor & \
  echo '⏳ Attente du démarrage de Tor...'; \
  sleep 35; \
  echo '🚀 Lancement du test...'; \
  yarn 01-test-tor-http-request"]

