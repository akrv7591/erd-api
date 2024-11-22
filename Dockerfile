FROM node:20-alpine as builder
COPY . .

RUN yarn
RUN yarn build

FROM keymetrics/pm2:latest-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3002

CMD [ "pm2-runtime", "start", "ecosystem.config.js"]
