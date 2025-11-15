'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { removeChannelFromPreference } from '@/lib/notifications/preferences';

export default function WhatsAppConnect() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const isConnected = Boolean(userProfile?.whatsapp_phone);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
        `VINCULAR ${userProfile?.rut || '12345678-9'}`
      )}`
    : null;

  const handleDesvincular = async () => {
    if (!confirm('¿Seguro que deseas dejar de recibir avisos por WhatsApp?')) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const newPreference = removeChannelFromPreference(
        userProfile?.preferencia_notificacion,
        'whatsapp'
      );

      const { error } = await supabase
        .from('usuarios')
        .update({
          whatsapp_phone: null,
          whatsapp_opt_in: false,
          preferencia_notificacion: newPreference,
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      alert('✅ Dejaste de recibir notificaciones por WhatsApp.');
      window.location.reload();
    } catch (error) {
      console.error('Error desvinculando WhatsApp:', error);
      alert('⚠️ No pudimos desvincular tu número. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center">
          <i className="bi bi-whatsapp me-2" style={{ fontSize: '1.5rem', color: '#25D366' }}></i>
          Notificaciones por WhatsApp
        </h5>

        {isConnected ? (
          <>
            <div className="alert alert-success d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2"></i>
              <div>
                <strong>WhatsApp conectado</strong>
                <p className="mb-0 small">
                  Número: +{userProfile.whatsapp_phone}
                </p>
              </div>
            </div>

            <p className="text-muted mb-3">
              Las noticias y avisos importantes llegarán a tu WhatsApp además del correo.
            </p>

            <button className="btn btn-outline-danger btn-sm" onClick={handleDesvincular} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Desvinculando...
                </>
              ) : (
                <>
                  <i className="bi bi-unlink me-2"></i>
                  Desvincular WhatsApp
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <p className="text-muted">
              Activa las alertas de WhatsApp para recibir avisos urgentes incluso si no revisas tu correo.
            </p>

            <ol className="small ps-3">
              <li className="mb-2">
                {whatsappNumber ? (
                  <>
                    Guarda este número: <strong>+{whatsappNumber}</strong>
                  </>
                ) : (
                  'Agrega el número oficial de la Junta en WhatsApp.'
                )}
              </li>
              <li className="mb-2">
                Envía un mensaje con el texto:{' '}
                <code>VINCULAR {userProfile?.rut || 'TU_RUT'}</code>
              </li>
              <li>Recibirás una confirmación automática cuando quede registrado.</li>
            </ol>

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                <i className="bi bi-whatsapp me-2"></i>
                Abrir WhatsApp
              </a>
            )}

            {!whatsappLink && (
              <div className="alert alert-warning mt-3 mb-0">
                Configura <code>NEXT_PUBLIC_WHATSAPP_NUMBER</code> para mostrar el enlace directo.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
