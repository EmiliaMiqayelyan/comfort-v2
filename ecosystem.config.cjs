/** PM2 process definitions for production VPS deployment. */
module.exports = {
  apps: [
    {
      name: "comfort-web",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      kill_timeout: 10000,
      env: {
        NODE_ENV: "production",
        // PORT comes from .env on the server (e.g. 3847 behind nginx)
      },
    },
    {
      name: "comfort-api",
      cwd: `${__dirname}/server`,
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      kill_timeout: 10000,
      env: {
        NODE_ENV: "production",
        // PORT comes from server/.env on the server
      },
    },
  ],
};
