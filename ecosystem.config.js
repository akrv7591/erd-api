module.exports = {
  apps: [
    {
      name: "erdiagramly",
      script: "./dist/index.js",
      instances: "4",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
