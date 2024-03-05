FROM node:alpine

WORKDIR /app

# Wildcard used to copy to container "package.json" AND "package-lock.json"
COPY ./ ./

RUN yarn install
RUN yarn build

CMD ["node", "dist/index.js"]

