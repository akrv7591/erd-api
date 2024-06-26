FROM node:20-alpine

WORKDIR /app

# Wildcard used to copy to container "package.json" AND "package-lock.json"
COPY ./ ./

RUN yarn install
RUN yarn build
EXPOSE 3002

CMD ["node", "dist/index.js"]

