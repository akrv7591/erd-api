FROM node:20-alpine as builder
WORKDIR /app
COPY . .

# Run yarn and build to prepare the application for build
RUN yarn
RUN yarn build

FROM keymetrics/pm2:18-slim
WORKDIR /app

# Copy files from the builder image to maintain consistency between environments
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js

# Expose port 3002 to the application
EXPOSE 3002

# Specify the command to run when the container starts
CMD [ "pm2-runtime", "start", "ecosystem.config.js"]
