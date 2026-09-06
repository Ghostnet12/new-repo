const KEY = 'fracture-shadow-deck-client-token';

function createToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function getClientToken() {
  let token = localStorage.getItem(KEY);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    token = createToken();
    localStorage.setItem(KEY, token);
  }
  return token;
}
