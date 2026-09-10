#!/bin/bash
# Script de Execução Android - CGB Dashboard v1.7.0
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/home/leydson/.local/bin:/home/leydson/.nvm/versions/node/v22.23.1/bin:/home/leydson/Android/Sdk/platform-tools:/home/leydson/Android/Sdk/emulator:$PATH"
export ANDROID_HOME="/home/leydson/Android/Sdk"

unset ANDROID_PREFS_ROOT
cd "/home/leydson/development/COA/dashboard-cgb"

echo "--- Sincronizando arquivos Web (Capacitor) ---"
npx cap sync android

echo "--- ATENÇÃO ---"
echo "Para compilar o APK nativo neste ambiente de desenvolvimento com Java 25,"
echo "recomenda-se abrir a pasta 'android' no Android Studio e clicar em Build > Build APK(s)."
echo "Ou utilize a versão web de testes em http://localhost:3000"
