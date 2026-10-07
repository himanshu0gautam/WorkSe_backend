/**
 * Generic SMS Adapter Service
 * To switch provider (e.g. Fast2SMS -> Twilio / MSG91 / AWS SNS),
 * only update the internal logic of sendSMS function below.
 */

export const sendSMS = async (phone, otp) => {
  const message = `Your verification code is ${otp}. Valid for 5 minutes. Do not share it with anyone.`;

  // EXAMPLE 1: Development Mode Logging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n========================================`);
    console.log(`[SMS PROVIDER DEV LOG] Sent to: ${phone}`);
    console.log(`[OTP CODE]: ${otp}`);
    console.log(`========================================\n`);
    return { success: true, provider: 'DEV_CONSOLE' };
  }

  // EXAMPLE 2: Fast2SMS Integration (Uncomment to use)
  /*
  const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      'authorization': process.env.FAST2SMS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      route: 'otp',
      variables_values: otp,
      numbers: phone,
    })
  });
  return await response.json();
  */

  // EXAMPLE 3: Twilio Integration (Uncomment to use)
  /*
  import twilio from 'twilio';
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  return await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
  */

  return { success: true };
};