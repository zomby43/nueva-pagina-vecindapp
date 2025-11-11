'use client';

const SUPABASE_KEY_FRAGMENT = 'supabase';
const SUPABASE_PREFIX = 'sb-';
const PROFILE_PREFIX = 'profile_';

const shouldRemoveKey = (key) =>
  key?.startsWith(PROFILE_PREFIX) ||
  key?.includes(SUPABASE_KEY_FRAGMENT) ||
  key?.startsWith(SUPABASE_PREFIX);

export const clearClientStorage = () => {
  if (typeof window === 'undefined') return;

  try {
    const localKeysToRemove = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && shouldRemoveKey(key)) {
        localKeysToRemove.push(key);
      }
    }
    localKeysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error limpiando localStorage:', error);
  }

  try {
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key && shouldRemoveKey(key)) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch (error) {
    console.error('Error limpiando sessionStorage:', error);
  }
};

export default clearClientStorage;
