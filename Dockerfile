FROM node:alpine as builder

WORKDIR /home/api

# Wildcard used to copy to container "package.json" AND "package-lock.json"
COPY ./ ./

RUN yarn install
RUN yarn global add @vercel/ncc
RUN ncc build src/index.ts -o dist

FROM node:alpine
WORKDIR /home/api
COPY --from=builder /home/api/dist ./
CMD ["node", "index.js"]
