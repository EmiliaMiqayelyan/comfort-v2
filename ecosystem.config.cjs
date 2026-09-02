/** PM2 process definitions for production VPS deployment. */
module.exports = {
  apps: [
    {
      name: "comfort-web",
      cwd: __dirname,
      script: "./start-web.sh",
      interpreter: "bash",
      instances: 1,
      exec_mode: "fork",
      kill_timeout: 10000,
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
        PORT: 4871,
      },
    },
  ],
};
