FROM node:alpine as builder

WORKDIR /app

# Wildcard used to copy to container "package.json" AND "package-lock.json"
COPY ./ ./

RUN yarn install
RUN yarn build

FROM node:alpine
WORKDIR /app
COPY --from=builder /app/ ./
CMD ["node", "dist/index.js"]
