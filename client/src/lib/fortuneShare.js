export function canShareFortune(file,device=globalThis.navigator) {
 try {
  return Boolean(file&&typeof device?.share==='function'&&typeof device?.canShare==='function'&&device.canShare({files:[file]}));
 } catch {
  return false;
 }
}

export async function shareFortune(file,device=globalThis.navigator) {
 if(!canShareFortune(file,device))return 'preview';
 try {
  // The PNG is prepared before the click. Do not await rendering or fetching here:
  // Safari needs share() to run directly within the visitor's tap.
  // Send only the image so the system offers image actions rather than link actions.
  await device.share({files:[file]});
  return 'shared';
 } catch(error) {
  // Cancelling the sheet must never start a download or open a second save flow.
  return error?.name==='AbortError'?'cancelled':'preview';
 }
}
