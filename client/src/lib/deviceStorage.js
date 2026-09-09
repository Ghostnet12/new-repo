import {checkTextLimits} from '../../../server/src/validation/limits.js';
import {natalDefaults} from '../../../shared/natalDefaults.js';

const PROFILE_KEY='fracture-shadow-profile-v3';
const HISTORY_KEY='fracture-shadow-history-v3';

function readStored(key,fallback) {
 try {return JSON.parse(localStorage.getItem(key))??fallback;}
 catch {return fallback;}
}

export function loadLocalProfile() {
 const value=readStored(PROFILE_KEY,null);
 return value&&typeof value==='object'&&!Array.isArray(value)?value:null;
}

export function saveLocalProfile(profile) {
 checkTextLimits(profile);
 const clean={name:String(profile?.name||''),gender:String(profile?.gender||''),birthday:String(profile?.birthday||'').slice(0,10),natal:{...natalDefaults,...profile?.natal},preferredSpread:profile?.preferredSpread||'three'};
 localStorage.setItem(PROFILE_KEY,JSON.stringify(clean));
 return clean;
}

export function loadLocalHistory() {
 const value=readStored(HISTORY_KEY,[]);
 return Array.isArray(value)?value.filter(item=>item&&typeof item==='object'&&typeof item.localId==='string'&&typeof item.spreadName==='string'&&Number.isFinite(Date.parse(item.createdAt))).slice(0,50):[];
}

function writeHistory(history) {
 const next=history.slice(0,50);
 localStorage.setItem(HISTORY_KEY,JSON.stringify(next));
 return next;
}

export function saveLocalReading(reading) {
 const history=loadLocalHistory();
 const entry={localId:reading.readingId||crypto.randomUUID(),_local:true,spreadName:reading.spread?.name||'Tarot Reading',question:reading.question||'',focus:reading.focus||'general',favorite:false,createdAt:new Date().toISOString()};
 return writeHistory([entry,...history.filter(item=>item.localId!==entry.localId)]);
}

export function toggleLocalFavorite(localId) {
 return writeHistory(loadLocalHistory().map(item=>item.localId===localId?{...item,favorite:!item.favorite}:item));
}

export function deleteLocalReading(localId) {
 return writeHistory(loadLocalHistory().filter(item=>item.localId!==localId));
}
