/**
 * SMS Service — clean abstraction layer for sending OTP SMS messages.
 *
 * Default provider: Fast2SMS (popular in India, affordable).
 * To swap providers, change ONLY this file and the env variables.
 *
 * Environment variables:
 *   SMS_PROVIDER   — 'fast2sms' (default) | 'twilio' | 'console' (dev)
 *   FAST2SMS_API_KEY — Fast2SMS API key
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER — for Twilio
 */

/**
 * Normalize an Indian mobile number to 10 digits.
 * Accepts: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
 */
export const normalizePhone = (raw) => {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) return digits.slice(1);
  if (digits.length === 10) return digits;
  throw new Error('Invalid phone number format. Please enter a 10-digit Indian mobile number.');
};

/**
 * Send an OTP via SMS.
 * @param {string} phone — normalized 10-digit number
 * @param {string} otp   — the 6-digit OTP (never logged)
 */
export const sendOtpSms = async (phone, otp) => {
  const provider = process.env.SMS_PROVIDER || 'console';

  if (provider === 'fast2sms') {
    await sendViaFast2SMS(phone, otp);
  } else if (provider === 'twilio') {
    await sendViaTwilio(phone, otp);
  } else {
    // 'console' provider — for local development without real SMS
    consoleDev(phone, otp);
  }
};

// ─── Provider: Fast2SMS ────────────────────────────────────────────────────────
async function sendViaFast2SMS(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) throw new Error('FAST2SMS_API_KEY is not set in environment variables.');

  const message = `Your Zaevyul login code is ${otp}. Valid for 10 minutes. Do not share.`;

  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'q',          // transactional route
      message,
      language: 'english',
      flash: 0,
      numbers: phone,
    }),
  });

  const data = await res.json();
  if (!data.return) {
    throw new Error(data.message?.[0] || 'Failed to send SMS via Fast2SMS');
  }
}

// ─── Provider: Twilio ──────────────────────────────────────────────────────────
async function sendViaTwilio(phone, otp) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    throw new Error('Twilio credentials are not set in environment variables.');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const body = new URLSearchParams({
    To: `+91${phone}`,
    From: TWILIO_FROM_NUMBER,
    Body: `Your Zaevyul login code is ${otp}. Valid for 10 minutes.`,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await res.json();
  if (data.error_code) {
    throw new Error(data.message || 'Failed to send SMS via Twilio');
  }
}

// ─── Provider: Console (dev fallback) ─────────────────────────────────────────
function consoleDev(phone, otp) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SmsService] Dev OTP for +91${phone}: ${otp}`);
  } else {
    console.log(`[SmsService] SMS_PROVIDER=console — OTP sent to +91${phone}: [REDACTED for security]`);
  }
}
