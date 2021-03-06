# first stage - install dependencies
FROM mhart/alpine-node AS builder
WORKDIR /app

COPY . .
RUN npm install && \
  adduser -D discord-translator && \
  chown discord-translator:discord-translator $(pwd)

USER discord-translator

CMD node index