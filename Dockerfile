FROM node:20-alpine as builder
COPY . .

RUN yarn
RUN yarn build

FROM keymetrics/pm2:latest-alpine

COPY --from=builder . .
EXPOSE 3002

CMD [ "pm2-runtime", "start", "ecosystem.config.js"]
