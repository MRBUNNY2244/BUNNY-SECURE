# 🐰 BUNNY Website — Next.js

## ⚡ LOCAL SETUP

```bash
# 1. Dependencies install karo
npm install

# 2. .env.local edit karo (EMAIL_PASS zaroor daalo)

# 3. Run karo
npm run dev

# 4. Browser: http://localhost:3000
# Admin: http://localhost:3000/raheel
```

---

## 🔑 LOGIN
- URL: `/raheel`
- Username: `RAHEEL`
- Password: `BUNNY`

---

## 📧 GMAIL APP PASSWORD (Forgot Password ke liye)
1. Gmail → Settings → Security
2. 2-Step Verification ON karo
3. App Passwords → "Mail" → Generate
4. Wo 16-char password `.env.local` mein `EMAIL_PASS` mein daalo

---

## 🚀 RAILWAY DEPLOYMENT (Best ✅)

1. https://railway.app → New Project → GitHub repo
2. Environment Variables add karo:
   ```
   JWT_SECRET=random_long_string_here
   ADMIN_USERNAME=RAHEEL
   ADMIN_PASSWORD=BUNNY
   EMAIL_USER=kamibroken5@gmail.com
   EMAIL_PASS=gmail_app_password
   NEXT_PUBLIC_SITE_URL=https://your-app.railway.app
   NODE_ENV=production
   ```
3. Auto deploy ho jayega!

---

## 🚀 VERCEL DEPLOYMENT

```bash
npm install -g vercel
vercel --prod
```
Environment variables Vercel dashboard mein add karo.

> ⚠️ Note: Vercel pe SQLite data persist nahi hota (serverless).
> Railway use karo production ke liye.

---

## 📁 URLs

| Page | URL |
|------|-----|
| Home | / |
| Open/Blocks | /open |
| Dynamic Page | /page/{slug} |
| Admin Login | /raheel |
| Admin Panel | /raheel/panel |
| Reset Password | /reset-password?token=... |

---

## ✅ Features

- Pages add → Auto block banta hai OPEN page pe
- Har page mein unlimited APIs (1, 2, 3... unlimited)
- API display: Cards / Text / List / Table / Raw JSON
- Forgot Password → Gmail pe email
- Username/Password change
- Login logs + IP tracking
- Page hide/show
- AI Assistant (Claude)
- Data backup JSON
- Rate limiting (5 login attempts per 15 min)
