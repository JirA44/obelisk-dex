module.exports = {
  apps: [{
    name: 'obelisk',
    script: 'src/backend/server-ultra.js',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    restart_delay: 5000,
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    }
  }]
};
