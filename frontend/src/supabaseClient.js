import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const showNetworkError = () => {
  if (document.getElementById('network-error-toast')) return;
  
  const toast = document.createElement('div');
  toast.id = 'network-error-toast';
  toast.innerText = "You're offline or the server is unreachable.";
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #dc2626;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 9999;
    font-family: sans-serif;
    font-weight: 500;
    transition: opacity 0.3s;
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

const customFetch = async (url, options) => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    showNetworkError();
    throw error;
  }
};

const customStorage = {
  getItem: (key) => {
    return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (window.localStorage.getItem('remember_me') === 'true') {
      window.localStorage.setItem(key, value);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    persistSession: true,
  },
  global: {
    fetch: customFetch
  }
});
