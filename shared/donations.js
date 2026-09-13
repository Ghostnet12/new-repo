// Populate only after verifying the receiving Stripe account and its live Payment Link.
export const DONATION_LINK = '';
export const DONATION_THANK_YOU = 'Thank you for supporting The Fold! Your generosity helps cover hosting and AI costs, keeps our free experiences available, and gives this little corner of magic room to grow. With gratitude, David — Creator of The Fold.';

export function donationLink(value = DONATION_LINK) {
 try {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'buy.stripe.com' || url.port || url.username || url.password || !/^\/[a-zA-Z0-9]+$/.test(url.pathname)) return '';
  return url.href;
 } catch { return ''; }
}

// A one-time, donor-chosen amount. Stripe applies its own supported amount limits.
export const donationPrice = {
 currency: 'usd', custom_unit_amount: { enabled: true },
 product_data: { name: 'Support The Fold', metadata: { project: 'the-fold', purpose: 'voluntary-support' } },
 metadata: { project: 'the-fold', purpose: 'voluntary-support' }
};

export function donationPaymentLink(price) {
 return {
  line_items: [{ price, quantity: 1 }], submit_type: 'donate',
  metadata: { project: 'the-fold', purpose: 'voluntary-support' },
  after_completion: { type: 'hosted_confirmation', hosted_confirmation: { custom_message: DONATION_THANK_YOU } }
 };
}
