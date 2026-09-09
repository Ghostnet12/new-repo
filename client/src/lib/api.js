import { getClientToken } from './clientId.js';

const API_BASE = (import.meta.env?.VITE_API_BASE || '').replace(/\/$/, '');

export async function api(path, options = {}) {
  const {timeoutMs=30000,signal,...requestOptions}=options;
  const controller=new AbortController();
  let timedOut=false;
  const cancel=()=>controller.abort(signal?.reason);
  if(signal?.aborted)cancel();else signal?.addEventListener('abort',cancel,{once:true});
  const timeout=setTimeout(()=>{timedOut=true;controller.abort();},timeoutMs);
  try {
  // Vercel routes /api/* to its function; Vite proxies the same paths to Express.
  // Calling /api/router directly would rewrite its route parameter to "router".
  const response = await fetch(`${API_BASE}${path}`, {
    ...requestOptions,
    signal:controller.signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Shadow-Client': getClientToken(),
      ...(requestOptions.headers || {})
    }
  });
  const contentType = response.headers.get('content-type') || '';
  let payload={};
  if(contentType.includes('application/json')){
    try{payload=await response.json();}
    catch(error){
      if(controller.signal.aborted)throw error;
      if(response.ok)throw new Error('The Fold could not finish that request. Please try again.');
    }
  }

  if (!response.ok) { const error=new Error(payload?.issues?.[0]?.message || payload?.error || `Request failed (${response.status})`); error.status=response.status; throw error; }
  if (!contentType.includes('application/json')) throw new Error('The Fold could not finish that request. Please try again.');
  return payload;
  } catch(error) {
    if(timedOut)throw new Error('The connection took too long. Please try again.');
    throw error;
  } finally {
    clearTimeout(timeout);signal?.removeEventListener('abort',cancel);
  }
}
