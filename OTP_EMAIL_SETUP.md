# OTP Email Setup Guide

## Overview
The app now has OTP (One-Time Password) email functionality integrated. To enable actual email sending to Gmail, you need to set up **EmailJS**.

## Setup Steps

### Step 1: Create EmailJS Account
1. Go to [EmailJS](https://www.emailjs.com/)
2. Click "Sign Up Free"
3. Create an account (you can use Gmail)
4. Verify your email

### Step 2: Add Email Service
1. Go to **Email Services** in the dashboard
2. Click **Add Service**
3. Select **Gmail** as the service
4. Click **Connect Account**
5. Sign in with your Gmail account
6. Allow EmailJS to access your account
7. Name your service (e.g., "gmail_service")
8. Save the **Service ID** (e.g., `service_xxxxx`)

### Step 3: Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Name it (e.g., "OTP_Verification")
4. Set **To Email**: `{{to_email}}`
5. Set **Subject**: `Health Trainer - OTP Verification Code`
6. Replace the template content with:

```html
<h2>Health Trainer OTP Verification</h2>

<p>Hi {{to_name}},</p>

<p>Your OTP verification code is:</p>

<h1 style="color: #7c3aed; font-size: 32px; letter-spacing: 5px;">{{otp_code}}</h1>

<p>This code will expire in 10 minutes.</p>

<p>If you didn't request this code, please ignore this email.</p>

<p>Best regards,<br>Health Trainer Team</p>
```

7. Click **Save** and note the **Template ID** (e.g., `template_xxxxx`)

### Step 4: Get Your Public Key
1. Go to **Account** → **API Keys**
2. Copy your **Public Key** (starts with your email prefix)

### Step 5: Update App Configuration
Edit `src/App.jsx` and replace these lines (around line 27):

```javascript
// Initialize EmailJS
emailjs.init('YOUR_PUBLIC_KEY_HERE'); // Replace with your EmailJS public key
```

Replace:
- `YOUR_PUBLIC_KEY_HERE` with your actual public key

And replace these in the code (around lines 510-515 and 595-600):

```javascript
await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
```

Replace:
- `YOUR_SERVICE_ID` with your Service ID
- `YOUR_TEMPLATE_ID` with your Template ID

### Example:
```javascript
// Initialize EmailJS
emailjs.init('your_email_prefix_abc123xyz');

// In handleRegister function:
await emailjs.send('service_abc123xyz', 'template_xyz789abc', templateParams);
```

## Testing

1. Stop the development server (Ctrl+C)
2. Restart: `npm run dev`
3. Register a new account with a Gmail address
4. You should receive an OTP email!

## Troubleshooting

### Email not sending?
- Check browser console for errors (F12)
- Verify all IDs are correct
- Ensure Gmail is connected in Email Services
- Check spam folder

### "ไม่สามารถส่งอีเมลได้" message?
- This means EmailJS keys aren't configured
- Follow steps 1-5 above carefully
- Restart the app after updating keys

## Security Notes
- The public key is safe to expose in frontend code
- You can generate new keys if needed
- EmailJS has a free tier (200 emails/month)

## Features Implemented
✓ OTP generation on registration
✓ Email sending via EmailJS
✓ Resend OTP button in Settings (if not verified)
✓ OTP verification before account creation
✓ Email verification status display

## Environment Variables (Optional)
For production, consider using environment variables:

```bash
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

Then update `src/App.jsx`:
```javascript
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

await emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  templateParams
);
```
