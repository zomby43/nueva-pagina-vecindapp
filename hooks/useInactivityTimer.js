'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para manejar la inactividad del usuario
 * @param {number} warningTime - Tiempo en minutos antes de mostrar advertencia
 * @param {number} logoutTime - Tiempo en minutos antes del logout automático
 * @param {function} onLogout - Función a ejecutar cuando se agote el tiempo
 */
export function useInactivityTimer(warningTime = 25, logoutTime = 30, onLogout) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetTimers = useCallback(() => {
    // Limpiar timers existentes
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Ocultar advertencia si está visible
    setShowWarning(false);
    setTimeLeft(null);
    
    // Actualizar última actividad
    lastActivityRef.current = Date.now();

    // Configurar nuevo timer de advertencia
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      const warningDuration = (logoutTime - warningTime) * 60; // en segundos
      setTimeLeft(warningDuration);

      // Countdown timer
      countdownRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            if (onLogout) {
              onLogout();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    }, warningTime * 60 * 1000); // convertir minutos a milisegundos

  }, [warningTime, logoutTime, onLogout]);

  const extendSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  // Eventos que resetean el timer
  const handleActivity = useCallback(() => {
    const now = Date.now();
    // Solo resetear si han pasado al menos 30 segundos desde la última actividad
    // para evitar demasiados resets
    if (now - lastActivityRef.current > 30000) {
      resetTimers();
    }
  }, [resetTimers]);

  useEffect(() => {
    // Eventos a escuchar
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Agregar listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Inicializar timer
    resetTimers();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [handleActivity, resetTimers]);

  return {
    showWarning,
    timeLeft,
    extendSession
  };
}