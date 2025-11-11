'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    '¡Hola! Soy Ayudante Vecinal. Puedo guiarte con trámites, certificados o accesos dentro de la plataforma.',
};

const MAX_HISTORY = 10;
const MAX_MESSAGES_PER_MINUTE = 5;

export default function HelpChatWidget() {
  const { user, userProfile, loading } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }, [messages]);

  const metadata = useMemo(() => {
    if (!userProfile) {
      return {
        role: user ? 'vecino' : 'visitante',
        status: user ? 'sin_estado' : 'sin_autenticar',
      };
    }

    return {
      userId: userProfile.id,
      role: userProfile.rol || 'vecino',
      status: userProfile.estado || 'sin_estado',
      latestAction: userProfile.updated_at
        ? `Última actualización de perfil: ${new Date(userProfile.updated_at).toLocaleDateString('es-CL')}`
        : undefined,
    };
  }, [userProfile, user]);

  const messageTimestampsRef = useRef([]);

  const canSendMessage = () => {
    const now = Date.now();
    messageTimestampsRef.current = messageTimestampsRef.current.filter(
      (timestamp) => now - timestamp < 60_000,
    );

    return messageTimestampsRef.current.length < MAX_MESSAGES_PER_MINUTE;
  };

  const registerMessage = () => {
    messageTimestampsRef.current = [...messageTimestampsRef.current, Date.now()];
  };

  const formatMessageContent = (content) => {
    if (!content) return '';

    const escapeHtml = (text) =>
      text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const escaped = escapeHtml(content);
    const formattedBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return formattedBold.replace(/\n/g, '<br />');
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setError('');
  };

  const resetConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setError('');
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!canSendMessage()) {
      setError('Has enviado demasiados mensajes en poco tiempo. Intenta nuevamente en unos minutos.');
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    const nextHistory = [...messages, userMessage]
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      registerMessage();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          history: nextHistory,
          metadata,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo contactar al asistente.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply || 'No tengo una respuesta en este momento.',
        },
      ]);
    } catch (err) {
      console.error('Chatbot fetch error:', err);
      setError(err.message || 'No pudimos responder en este momento. Intenta más tarde.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isSending) {
        sendMessage();
      }
    }
  };

  const hiddenRoutes = useMemo(() => new Set(['/', '/login', '/register']), []);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
    }
  }, [user]);

  if (loading || !user || hiddenRoutes.has(pathname)) {
    return null;
  }

  return (
    <div className={`chat-widget ${isOpen ? 'chat-widget--open' : ''}`}>
      {isOpen && (
        <div className="chat-widget__panel shadow-lg">
          <header className="chat-widget__header">
            <div>
              <p className="chat-widget__title mb-0">Ayudante Vecinal</p>
              <small className="text-muted">
                {userProfile?.nombres ? `Hola, ${userProfile.nombres}` : 'Te ayudo con tus dudas'}
              </small>
            </div>
            <div className="chat-widget__header-actions">
              <button
                type="button"
                className="btn btn-link btn-sm px-2"
                onClick={resetConversation}
                disabled={isSending}
              >
                Reiniciar
              </button>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={handleToggle} />
            </div>
          </header>

          <div className="chat-widget__messages" ref={messagesContainerRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-widget__message chat-widget__message--${message.role}`}
                dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
              />
            ))}
            {error && <p className="chat-widget__error">{error}</p>}
          </div>

          <div className="chat-widget__composer">
            <textarea
              className="form-control"
              rows={2}
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
            />
            <button
              type="button"
              className="btn btn-primary w-100 mt-2"
              onClick={sendMessage}
              disabled={isSending || !input.trim()}
            >
              {isSending ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </div>
      )}

      <button type="button" className="chat-widget__toggle-btn btn btn-primary" onClick={handleToggle}>
        <i className="bi bi-chat-dots me-2" />
        {isOpen ? 'Ocultar ayuda' : 'Ayuda vecinal'}
      </button>
    </div>
  );
}
