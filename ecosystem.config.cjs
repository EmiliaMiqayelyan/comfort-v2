/** PM2 process definitions for production VPS deployment. */
module.exports = {
  apps: [
    {
      name: "comfort-web",
      cwd: __dirname,
      script: "npm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "comfort-api",
      cwd: `${__dirname}/server`,
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
