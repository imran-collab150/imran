# Project Summary — Imran's Barber Shop Booking Website

## Overview
A static barber shop booking website built with plain HTML, CSS, and vanilla JavaScript. Customers can view services, book appointments via a 3-step form, and receive email notifications through FormSubmit. No frameworks, no server, no database.

## Tech Stack
- **Frontend**: HTML5, CSS3, vanilla JavaScript (ES5-style IIFE module pattern)
- **Styling**: Dark barber-shop theme — charcoal background (`#1a1a1a`), cream text (`#f1faee`), red accent (`#e63946`), Google Font Poppins
- **Form backend**: Google Apps Script Web App (receives form data, writes to Google Sheet, sends email notification)
- **Config**: `js/config.js` is the runtime source of truth; `data/services.json` and `data/schedule.json` are human-readable reference copies
- **Script**: `google-apps-script.gs` — reference copy of the Apps Script code

## Pages
| File | Purpose |
|---|---|
| `index.html` | Landing page — hero, service cards preview, visit info, footer |
| `book.html` | 3-step booking form (service → date/time → contact details) |
| `thank-you.html` | Confirmation page after form submission |

## Key Files
- `js/config.js` — Runtime configuration: `SERVICES`, `SCHEDULE`, `CONTACT`, `GOOGLE_SCRIPT_URL`
- `js/app.js` — All booking logic: renders services, generates dates/slots, handles 3-step form navigation and submission
- `css/style.css` — All styling (566 lines, mobile-responsive)
- `data/services.json` — Reference copy of service definitions
- `data/schedule.json` — Reference copy of working schedule

## Services (from config.js)
- Standard Haircut — ₦33,000 / 30 min
- Beard Trim — ₦20,000 / 15 min
- Haircut + Beard — ₦46,500 / 45 min

## Schedule
Monday–Friday, 9:00 AM – 6:00 PM, 30-min slot intervals, 2 weeks of dates shown

## Booking Flow
1. **Step 1**: Click a service card → highlights selection, reveals date picker
2. **Step 2**: Choose a date → auto-generates available time slots (filtered by service duration and close time) → select a slot → reveals contact form
3. **Step 3**: Enter name, phone (required), email/notes (optional) → submit to Google Apps Script → redirects to thank-you.html with booking details in URL params

## Important Notes
- Time slots are not locked in real-time (static site); barber confirms via phone call
- Google Apps Script requires deployment as a Web App with "Anyone, even anonymous" access
- `GOOGLE_SCRIPT_URL` in config.js must be updated to the deployed Apps Script URL
- The `service` and `time_slot` hidden fields are set in book.html
- `app.js` uses an IIFE pattern with `CONFIG` global object — no module imports/exports
- Data files in `data/` are NOT loaded at runtime (avoids file:// CORS issues); they are reference copies only
- `thank-you.html` reads booking details from URL params, falls back to localStorage

## Customization
Edit `js/config.js` to change services, prices, hours, contact info, or the Google Apps Script URL. Also update `data/services.json` and `data/schedule.json` to keep them in sync.

## Deployment
Push to GitHub repo → Settings → Pages → Deploy from branch (`main`, root folder) → Live at `https://username.github.io/barber-shop/`
