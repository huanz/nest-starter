module.exports = {
  apps: [
    {
      name: 'test',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
  deploy: {
    production: {
      user: 'root',
      host: 'test.noonme.com',
      ref: 'origin/master',
      repo: 'git@github.com:huanz/nest-starter.git',
      path: '/home/wwwroot/test',
      'post-deploy':
        'npm install --production && npm run build && pm2 startOrRestart ecosystem.config.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
