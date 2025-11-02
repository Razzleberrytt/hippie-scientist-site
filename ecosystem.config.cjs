module.exports = {
  apps: [
    {
      name: 'snipebt',
      script: 'npx',
      args: 'tsx src/main.ts',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
