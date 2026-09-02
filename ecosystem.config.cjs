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
      env: {
        NODE_ENV: "production",
        WEB_PORT: 3847,
        PORT: 3847,
        API_PORT: 4871,
        API_URL: "http://127.0.0.1:4871/api",
        NEXT_PUBLIC_API_URL: "/api",
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
        PORT: 4871,
      },
    },
  ],
};
