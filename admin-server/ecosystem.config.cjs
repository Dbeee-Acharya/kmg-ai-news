module.exports = {
  apps: [
    {
      name: "fact-checker-admin:server",
      script: "./dist/index.js",

      max_memory_restart: "500M",
      exec_mode: "fork",

      watch: false,

      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      time: true,
    },
  ],
};
