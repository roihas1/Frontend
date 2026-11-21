// public/config.template.js
// Runtime substitution is handled by entrypoint.sh via envsubst.
window.RUNTIME_CONFIG = {
  VITE_BASE_URL: "${VITE_BASE_URL}",
  MAINTENANCE_MODE: "${MAINTENANCE_MODE}",
  VAPID_PUBLIC_KEY: "${VAPID_PUBLIC_KEY}",
};
