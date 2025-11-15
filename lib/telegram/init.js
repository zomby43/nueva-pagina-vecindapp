// lib/telegram/init.js
/**
 * Inicializar el bot de Telegram
 * Este archivo debe importarse una sola vez al inicio de la aplicación
 */

// Importar el cliente (esto inicializa el bot)
import '@/lib/telegram/client';

// Importar los comandos (esto registra los comandos)
import '@/lib/telegram/commands';

console.log('🤖 Sistema de Telegram inicializado');

export default null;
