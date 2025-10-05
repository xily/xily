#!/usr/bin/env node

/**
 * Generate VAPID keys for push notifications
 * Run this script to generate VAPID keys for your application
 */

const webpush = require('web-push');

console.log('Generating VAPID keys for push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Add these to your .env.local file:\n');
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`);
console.log('Note: Replace "your-email@example.com" with your actual email address.');
console.log('The VAPID_SUBJECT should be a mailto: URL or a URL to your application.');
