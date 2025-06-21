FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    wget curl gnupg unzip git ca-certificates \
    tor tor-geoipdb net-tools iproute2 \
    apt-transport-https gnupg2 && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN echo "SocksPort 0.0.0.0:9050" >> /etc/tor/torrc && \
    echo "Log notice stdout" >> /etc/tor/torrc && \
    echo "ControlPort 9051" >> /etc/tor/torrc && \
    echo "CookieAuthentication 1" >> /etc/tor/torrc && \
    echo "AvoidDiskWrites 1" >> /etc/tor/torrc && \
    echo "GeoIPFile /usr/share/tor/geoip" >> /etc/tor/torrc && \
    echo "GeoIPv6File /usr/share/tor/geoip6" >> /etc/tor/torrc && \
    echo "ExitNodes YOUR_FINGERPRINT" >> /etc/tor/torrc && \
    echo "StrictNodes 1" >> /etc/tor/torrc

VOLUME ["/var/lib/tor"]
WORKDIR /app/leboncoin
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

EXPOSE 9050

CMD ["sh", "-c", "\
  tor -f /etc/tor/torrc > /tmp/tor.log 2>&1 & \
  until grep -q 'Bootstrapped 100%.*done' /tmp/tor.log; do sleep 2; done; \
  sleep 5; \
  yarn 01-test-tor-http-request"]

