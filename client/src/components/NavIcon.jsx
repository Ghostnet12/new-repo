const paths = {
 support: <><path d="M12 17 4 10C0 5 7 1 12 6c5-5 12-1 8 4Z"/><path d="M3 20h18M7 23h10"/></>,
 close: <path d="m5 5 14 14M19 5 5 19"/>,
 arrow: <path d="M3 12h18m-7-7 7 7-7 7"/>,
 plus: <path d="M12 5v14M5 12h14"/>,
 check: <path d="m5 12 4 4L19 6"/>,
 eye: <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/></>,
 read: <><rect x="7" y="3" width="13" height="19" rx="1"/><path d="M4 19 2 2l12-1"/><circle cx="13.5" cy="12" r="2"/><path d="M10 6h1m5 13h1"/></>,
 history: <><path d="M12 5C8 2 4 2 1 4v16c4-2 7-2 11 0 4-2 7-2 11 0V4c-3-2-7-2-11 1Zm0 0v15"/></>,
 card: <><circle cx="12" cy="12" r="5"/><path d="M12 0v4m0 16v4M0 12h4m16 0h4M3 3l3 3m12 12 3 3M3 21l3-3M18 6l3-3"/></>,
 daily: <path d="M19 2A10 10 0 1 0 22 18 10 10 0 0 1 19 2Z" fill="currentColor" stroke="none"/>,
 natal: <path d="m12 0 1 9 8-6-6 8 9 1-9 1 6 8-8-6-1 9-1-9-8 6 6-8-9-1 9-1-6-8 8 6Z"/>,
 match: <path d="M12 22 2 12C-4 4 6-2 12 5c6-7 16-1 10 7Z"/>,
 learn: <><path d="M12 5 2 2v18l10 3 10-3V2Zm0 0v18M7 7v8m-3-5 3-3 3 3m5 4 3 3 3-3m-3-7v10"/></>,
 reviews: <path d="m12 1 3.4 7 7.6 1.1-5.5 5.4 1.3 7.5-6.8-3.6L5.2 22l1.3-7.5L1 9.1 8.6 8Z"/>,
 profile: <><circle cx="12" cy="7" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2Z"/></>,
 menu: <path d="M2 4h20M2 12h20M2 20h20"/>
};
export default function NavIcon({name}) { return <svg className="nav-icon" viewBox="-1 -1 26 26" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>; }
