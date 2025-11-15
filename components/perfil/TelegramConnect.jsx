// components/perfil/TelegramConnect.jsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { removeChannelFromPreference } from '@/lib/notifications/preferences';

export default function TelegramConnect() {
  const { userProfile } = useAuth();
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(false);

  const isConnected = !!userProfile?.telegram_chat_id;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'VecindAppBot';
  const telegramLink = `https://t.me/${botUsername}`;

  const handleDesvincular = async () => {
    if (!confirm('¿Estás seguro de desvincular tu cuenta de Telegram?\n\nDejarás de recibir notificaciones instantáneas.')) {
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const newPreference = removeChannelFromPreference(
        userProfile.preferencia_notificacion,
        'telegram'
      );

      const { error } = await supabase
        .from('usuarios')
        .update({
          telegram_chat_id: null,
          preferencia_notificacion: newPreference
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      alert('✅ Cuenta desvinculada exitosamente.\n\nVolverás a recibir notificaciones solo por email.');
      window.location.reload();

    } catch (error) {
      console.error('Error desvinculando cuenta:', error);
      alert('⚠️ Error al desvincular la cuenta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyCommand = () => {
    const command = `/vincular ${userProfile?.rut || 'TU_RUT'}`;
    navigator.clipboard.writeText(command);
    alert('📋 Comando copiado al portapapeles');
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center">
          <i className="bi bi-telegram me-2" style={{ fontSize: '1.5rem', color: '#0088cc' }}></i>
          Notificaciones por Telegram
        </h5>

        {isConnected ? (
          <>
            <div className="alert alert-success d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2"></i>
              <div>
                <strong>Telegram conectado</strong>
                <p className="mb-0 small">Recibirás notificaciones instantáneas en tu celular.</p>
              </div>
            </div>

            <div className="mt-3">
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm me-2"
              >
                <i className="bi bi-telegram me-2"></i>
                Abrir Bot
              </a>

              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleDesvincular}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Desvinculando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-unlink me-2"></i>
                    Desvincular
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted">
              Recibe notificaciones instantáneas en tu celular con Telegram, ¡completamente gratis!
            </p>

            <div className="alert alert-info">
              <strong><i className="bi bi-stars me-1"></i> Ventajas:</strong>
              <ul className="mb-0 mt-2 small">
                <li><i className="bi bi-bell-fill me-2"></i>Notificaciones push en tiempo real</li>
                <li><i className="bi bi-hand-index-thumb me-2"></i>Respuestas interactivas con botones</li>
                <li><i className="bi bi-lightning-charge-fill me-2"></i>Consulta información con comandos</li>
                <li><i className="bi bi-cash-coin me-2"></i>Completamente gratis, sin costo</li>
              </ul>
            </div>

            {!showInstructions ? (
              <button
                className="btn btn-telegram"
                onClick={() => setShowInstructions(true)}
                style={{
                  backgroundColor: '#0088cc',
                  color: 'white',
                  border: 'none'
                }}
              >
                <i className="bi bi-telegram me-2"></i>
                Conectar Telegram
              </button>
            ) : (
              <div className="alert alert-warning">
                <h6 className="alert-heading">📋 Instrucciones:</h6>
                <ol className="mb-0">
                  <li className="mb-3">
                    <strong>Descarga Telegram</strong> (si no lo tienes instalado)
                    <div className="mt-2">
                      <a
                        href="https://play.google.com/store/apps/details?id=org.telegram.messenger"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-success me-2"
                      >
                        <i className="bi bi-google-play me-1"></i> Android
                      </a>
                      <a
                        href="https://apps.apple.com/app/telegram-messenger/id686449807"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-dark"
                      >
                        <i className="bi bi-apple me-1"></i> iPhone
                      </a>
                    </div>
                  </li>

                  <li className="mb-3">
                    <strong>Abre nuestro bot</strong>
                    <div className="mt-2">
                      <a
                        href={telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-telegram"
                        style={{
                          backgroundColor: '#0088cc',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        <i className="bi bi-telegram me-2"></i>
                        Abrir @{botUsername}
                      </a>
                    </div>
                  </li>

                  <li className="mb-3">
                    <strong>Presiona "INICIAR"</strong> en el bot
                  </li>

                  <li className="mb-3">
                    <strong>Envía este comando</strong> en el chat:
                    <div className="input-group mt-2">
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={`/vincular ${userProfile?.rut || 'TU_RUT'}`}
                        readOnly
                        style={{ fontSize: '0.9rem' }}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={copyCommand}
                        title="Copiar comando"
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </div>
                  </li>

                  <li>
                    <strong>¡Listo!</strong> Recibirás una confirmación del bot y comenzarás a recibir notificaciones.
                  </li>
                </ol>

                <div className="mt-3">
                  <button
                    className="btn btn-link text-decoration-none"
                    onClick={() => setShowInstructions(false)}
                  >
                    ← Volver
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .btn-telegram:hover {
          opacity: 0.9;
          transform: scale(1.02);
          transition: all 0.2s ease;
        }

        .font-monospace {
          font-family: 'Courier New', monospace;
        }
      `}</style>
    </div>
  );
}
