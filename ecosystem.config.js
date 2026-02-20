module.exports = {
  apps: [
    {
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
    },
    {
      name: 'stablecoin-trader',
      script: 'src/backend/stablecoin-trader.js',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M',
      restart_delay: 15000,
      env: {
        NODE_ENV: 'production',
      }
    },
    {
      name: 'sonic-hft',
      script: 'sonic-hft-pm2.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      restart_delay: 10000,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'sonic-hft-apex',
      script: 'sonic-hft-apex-pm2.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      restart_delay: 10000,
      env: {
        NODE_ENV: 'production',
        HFT_APEX_SIZE: '1'
      }
    },
    {
      name: 'breakout-bot',
      script: 'breakout-pm2.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      restart_delay: 10000,
      env: {
        NODE_ENV: 'production',
        BREAKOUT_EXECUTOR: 'obelisk',
        BREAKOUT_SIZE: '5',
        BREAKOUT_TOUCHES: '3'
      }
    }
  ]
};
