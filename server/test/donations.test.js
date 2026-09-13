import test from 'node:test';
import assert from 'node:assert/strict';
import { donationLink, donationPrice, donationPaymentLink, DONATION_THANK_YOU } from '../../shared/donations.js';

test('donations use a donor-chosen one-time price and Stripe-hosted thank-you', () => {
 assert.deepEqual(donationPrice.custom_unit_amount, {enabled:true,minimum:100});
 assert.equal(donationPrice.recurring, undefined);
 assert.equal(donationPrice.unit_amount, undefined);
 const link = donationPaymentLink('price_fixture');
 assert.deepEqual(link.line_items, [{price:'price_fixture',quantity:1}]);
 assert.equal(link.after_completion.type, 'hosted_confirmation');
 assert.equal(link.after_completion.hosted_confirmation.custom_message, DONATION_THANK_YOU);
 assert.equal(link.payment_method_types, undefined);
});

test('checkout fails closed for missing, test-mode or non-Stripe links', () => {
 for (const value of ['', 'https://buy.stripe.com/test_fixture', 'javascript:alert(1)', 'https://buy.stripe.com.evil.test/abc', 'https://name@buy.stripe.com/abc', 'http://buy.stripe.com/abc', 'https://buy.stripe.com:8443/abc']) assert.equal(donationLink(value), '');
 assert.equal(donationLink('https://buy.stripe.com/aB123'), 'https://buy.stripe.com/aB123');
});
