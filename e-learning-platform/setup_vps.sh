#!/bin/bash

sudo apt update && sudo apt upgrade -y
  

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

sudo apt install -y git
sudo npm install -g pm2

sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

echo "✅ Ambiente VPS configurado com Node.js, MongoDB, Git, PM2 e NGINX."


echo "✔️ Ambiente pronto. Faça o upload dos arquivos e inicie com: pm2 start server.js"
