#!/bin/bash
# Configura o caminho completo para ferramentas do sistema e Node
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/home/leydson/.local/bin:/home/leydson/.nvm/versions/node/v22.23.1/bin:$PATH"

# Navega para a pasta do projeto
cd "/home/leydson/development/COA/dashboard-cgb"

# Compila o projeto e inicia o servidor Express (que serve o frontend e a API proxy /api/siv-proxy)
npm run build
node server.ts
