##
##  broadcast.dockerfile -- Docker Build Configuration
##

#   build arguments (early)
ARG         IMAGE_PREFIX=ghcr.io/rse/
ARG         IMAGE_NAME=broadcast
ARG         IMAGE_VERSION=0.9.0
ARG         IMAGE_RELEASE=20260727
ARG         IMAGE_ALIAS=latest

#   ==== STAGE 1 ====

#   derive image from a certain base image
FROM        node:26.5-trixie AS stage1

#   prepare Debian
RUN         apt-get update && \
            apt-get upgrade -y

#   extend Debian
RUN         apt-get install -y --no-install-recommends bash curl gosu nftables && \
            apt-get install -y --no-install-recommends libc6 libssl3 libc-ares2 libsqlite3-0 liblua5.4

#   establish application area and user/group
RUN         groupadd -g 2000 app
RUN         useradd -u 2000 -g app -d /app -m -s /bin/bash -p '!' -l app
RUN         mkdir -p -m 755 /app

#   establish application area
RUN         mkdir -p -m 755 /app/src

#   install Junction
COPY        . /app/src/
WORKDIR     /app/src
RUN         npm install # --legacy-peer-deps
RUN         npm start build

#   ==== STAGE 2 ====

#   derive image from a certain base image
FROM        node:26.5-trixie

#   prepare Debian
RUN         apt-get update && \
            apt-get upgrade -y

#   extend Debian
RUN         apt-get install -y --no-install-recommends bash curl gosu nftables && \
            apt-get install -y --no-install-recommends libc6 libssl3 libc-ares2 libsqlite3-0 liblua5.4

#   establish application area and user/group
RUN         groupadd -g 2000 app
RUN         useradd -u 2000 -g app -d /app -m -s /bin/bash -p '!' -l app
RUN         mkdir -p -m 755 /app

#   establish application area
RUN         mkdir -p -m 755 /app/bin /app/etc /app/lib/{client,server,server/node_modules} /app/var /app/share

#  copy artifacts from STAGE 1
COPY        --chown=app:app --from=stage1 /app/src/src/client/dst/*          /app/lib/client/
COPY        --chown=app:app --from=stage1 /app/src/src/server/dst/*          /app/lib/server/
COPY        --chown=app:app --from=stage1 /app/src/src/server/node_modules/* /app/lib/server/node_modules/
COPY        --chown=app:app --from=stage1 /app/src/src/server/package.json   /app/lib/server/

#   extend environment
ENV         PATH=/app/bin:$PATH

#   cleanup Debian
RUN         apt-get clean && \
            rm -rf /var/lib/apt/lists/*

#   fixate ownerships
RUN         chown -R app:app /app

#   provide volume
VOLUME      [ "/app/var" ]

#   provide entrypoint
ENTRYPOINT  [ "node", "/app/lib/server/app.js" ]
CMD         [ "" ]

