# Imran's Barber Shop — Booking Website

A static website that lets customers book barber appointments online. Built with plain HTML, CSS, and JavaScript — no frameworks, no server, no database. Hosted for free on GitHub Pages.

## Features

- **Service showcase** — displays all haircut services with prices and durations
- **Online booking** — 3-step form: choose service → pick date/time slot → enter contact details
- **Email notifications** — booking details sent directly to the barber's email via FormSubmit
- **Mobile responsive** — looks great on phones and desktops
- **Easy to customize** — edit services, prices, and hours in a single config file

## Quick Start (Development)

Since this is a static site, you can open `index.html` directly in your browser for basic viewing. However, some interactive features require a local web server (due to JavaScript module loading).

To run a local development server:

```bash
# Python (if installed)
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

## How to Customize

All configuration lives in **`js/config.js`**. Edit this single file to change:

### Services & Pricing
```javascript
SERVICES: [
  {
    id: "haircut",
    name: "Standard Haircut",
    price: 25,          // ← change price here
    duration: 30,       // ← change duration (minutes) here
    description: "..."
  },
  // ... add or remove services
]
```

> **Note**: Also update `data/services.json` and `data/schedule.json` to keep them in sync (they serve as human-readable reference files).

### Working Hours & Availability
```javascript
SCHEDULE: {
  days: ["monday", "tuesday", "wednesday", "thursday", "friday"],  // working days
  dayNames: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  openHour: 9,               // 9 AM
  closeHour: 18,             // 6 PM (24-hour format)
  slotIntervalMinutes: 30,   // time between slots
  weeksAhead: 2              // how many weeks of dates to show in the dropdown
}
```

### Contact Information
```javascript
CONTACT: {
  businessName: "Imran's Barber Shop",
  phone: "(555) 123-4567",
  email: "imran@barbershop.com",
  address: "123 Main Street, Your City, ST 12345"
}
```

### Booking Email Address (FormSubmit)
```javascript
FORM_SUBMIT_URL: "https://formsubmit.com/imran@barbershop.com"
```
Replace with your actual email address. FormSubmit will send all booking details to this email.

## Setting Up FormSubmit (Booking Notifications)

This site uses [FormSubmit](https://formsubmit.com/) to send booking details to your email — no account required.

1. Go to [https://formsubmit.com/](https://formsubmit.com/)
2. Enter your email address in the input field and click "Sign Up"
3. Check your email inbox for a confirmation message from FormSubmit and click the verification link
4. Your form endpoint is now `https://formsubmit.com/YOUR_EMAIL_ADDRESS`
5. Update `FORM_SUBMIT_URL` in `js/config.js` with your verified email
6. (Optional) In the FormSubmit dashboard, you can:
   - Customize the email subject
   - Disable the CAPTCHA (the site sets `_captcha=false` already)
   - Configure redirect behavior

**Important**: The first time someone submits a booking, FormSubmit will send you a verification email. You must click the link in that email before any submissions are forwarded to you.

## Deploying to GitHub Pages (Free Hosting)

1. Create a GitHub account at [github.com](https://github.com) (if you don't have one)
2. Create a new repository called `barber-shop` (or any name you like)
3. Upload all files from this project to the repository:
   - Using Git:
     ```bash
     git init
     git remote add origin https://github.com/YOUR_USERNAME/barber-shop.git
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git push -u origin main
     ```
   - Or upload directly via GitHub's web interface (drag & drop files)
4. Go to your repository → Settings → Pages
5. Under "Build and deployment", set Source to "Deploy from a branch"
6. Select branch: `main`, folder: `/ (root)`
7. Click "Save"
8. Wait 1–2 minutes. Your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/barber-shop/
   ```

## How It Works

1. A customer visits your website and clicks "Book Now"
2. They choose a service (haircut, beard trim, or combo)
3. They pick a date from the dropdown and select an available time slot
4. They enter their name, phone number, and optional email/notes
5. On submit, FormSubmit emails you the booking details
6. You call them to confirm the appointment

Since this is a static site with no backend, time slots are not locked in real-time. The barber reviews each email and confirms the appointment via phone call.

## File Structure

```
imran-website/
├── index.html          # Landing page
├── book.html           # Booking form
├── thank-you.html      # Confirmation page
├── css/
│   └── style.css       # All styling
├── js/
│   ├── config.js       # Configuration (edit this to customize)
│   └── app.js          # Booking form logic
├── data/
│   ├── services.json   # Reference: service definitions
│   └── schedule.json   # Reference: working schedule
├── plan.md             # Implementation plan
└── README.md           # This file
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome for Android)
- Requires JavaScript for interactive booking form (form still submits via standard HTML form action as fallback)
