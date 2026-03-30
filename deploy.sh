#!/bin/bash

# SSH into the Webuzo server
ssh user@your-server-address <<EOF

  # Navigate to your app directory
  cd /path/to/your/app

  # Pull the latest code
  git pull origin main

  # Install any updated dependencies
  npm install

  # Restart your application using PM2 or another process manager
  pm2 restart your-app-name

EOF
