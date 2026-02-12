module.exports = {
  apps: [
    {
      name: "fact-checker-user:server",
      script: "./dist/index.js",

      exec_mode: "cluster",
      instances: "2",
      max_memory_restart: "1000M",

      watch: false,

      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      time: true,
    },
  ],
};
