#!/bin/bash

apt update && apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

apt install -y mongodb
systemctl start mongodb
systemctl enable mongodb

apt install -y git
npm install -g pm2

apt install -y nginx

echo "✅ Ambiente VPS configurado com Node.js, MongoDB, Git, PM2 e NGINX."
