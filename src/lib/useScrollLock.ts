import { useEffect } from 'react';

// Contador compartido: con varios paneles abiertos (ej. carrito + editar producto),
// el scroll del fondo se libera recién cuando se cierra el último.
let locks = 0;

export const useScrollLock = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    locks++;
    document.body.style.overflow = 'hidden';
    return () => {
      locks--;
      if (locks === 0) document.body.style.overflow = '';
    };
  }, [active]);
};

/** Ejecuta `onEscape` al apretar Escape mientras `active` sea true. */
export const useEscape = (active: boolean, onEscape: () => void) => {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onEscape]);
};
