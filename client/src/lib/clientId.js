const KEY = 'fracture-shadow-deck-client-token';
let sessionToken;

function createToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function getClientToken() {
  try {
    const stored=localStorage.getItem(KEY);
    if(stored&&/^[a-f0-9]{64}$/.test(stored)){sessionToken=stored;return stored;}
  } catch { /* Keep the current visit usable when browser storage is restricted. */ }
  sessionToken ||= createToken();
  try{localStorage.setItem(KEY,sessionToken);}catch{}
  return sessionToken;
}
