import { Client } from '@upstash/qstash';

const qstashToken = process.env.QSTASH_TOKEN;
if (!qstashToken) {
  console.warn('[QStash] Missing QSTASH_TOKEN in environment variables.');
}

export const qstash = new Client({
  token: qstashToken,
});
