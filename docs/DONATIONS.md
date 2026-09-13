# The Fold voluntary support

Prepared September 13, 2026. David explicitly authorized Bravo K9's main live Stripe account (acct_1UE6e4IjdZtbYCrs) to receive The Fold donations, using a separate The Fold checkout identity. The Stripe connection currently exposes GET operations only for prices and payment links; no existing active links were found. Activation remains blocked on creation access or a donor-chosen live Payment Link supplied by David. Do not change Bravo's global business identity.

The public site is https://enterthefold.io, repository Ghostnet12/new-repo, Vercel project fracture-shadow-deck-mern-v2. This change adds a prominent donation action to Support The Fold once its verified live link is supplied. No login is required to donate. No card details or Stripe keys enter this application.

## Activation

1. Connect/confirm the correct receiving Stripe account and verify it can accept live payments.
2. Create a Price using `donationPrice` from shared/donations.js. This uses USD and `custom_unit_amount.enabled=true`, with no preset price, recurring interval, or site-imposed maximum. Stripe's supported limits still apply; its documented default maximum for this pricing model is $10,000 USD.
3. Create a Payment Link using `donationPaymentLink(price.id)`. This sets Donate as the checkout action and the custom thank-you text on Stripe's hosted confirmation page. Leave dynamic payment methods enabled.
4. Read back the link, its price and account. Verify live mode, active link, donor-chosen amount, one-time payment and the exact thank-you message. Verify the hosted amount editor in a browser without submitting a live payment. A test-mode checkout must use a sandbox separately; never publish its URL.
5. Put the verified public buy.stripe.com URL in `DONATION_LINK`, then build and deploy the reviewed commit. Verify /support on the custom domain.

The thank-you appears on Stripe's confirmation screen. A query parameter or opening The Fold's support page never claims payment success. Stripe handles payment confirmation and receipts; the site does not send email or text messages.

This voluntary support does not purchase cards, draws, credits, rewards or membership. Collector payment flags, inventory, editorial gates and webhooks remain independent.

References: https://docs.stripe.com/payment-links/create and https://docs.stripe.com/payment-links/post-payment.
