# Barber Booking Website — Implementation Plan

## Goal
Build a static website for a barber (Imran) that lets customers view haircut services/prices/durations and book a time slot. Bookings are emailed to the barber via FormSubmit. Hosted on GitHub Pages for free.

## Confirmed Decisions
| Decision | Choice |
|---|---|
| Stack | Static site — HTML, CSS, vanilla JavaScript |
| Hosting | GitHub Pages (free, no server management) |
| Form backend | FormSubmit — free, no account needed, emails form data to barber |
| Time selection | Predefined time slots (prevents double-bookings) |
| Services | Standard Haircut ₦33,000 / 30 min, Beard Trim ₦20,000 / 15 min, Haircut + Beard ₦46,500 / 45 min |
| Schedule | Monday–Friday, 9:00 AM – 6:00 PM |
| Customer info | Name, phone number, email, optional notes (no accounts) |
| Config | `js/config.js` (runtime config — the source of truth), backed by `data/services.json` and `data/schedule.json` for reference |

## Project Structure
```
imran-website/
├── index.html          # Landing page — hero, services list, call-to-action
├── book.html           # Booking page — service cards, date/slot selector, form
├── thank-you.html      # Confirmation page after form submission
├── css/
│   └── style.css       # All styling — responsive, barber-shop aesthetic
├── js/
│   ├── config.js       # Runtime config: SERVICES, SCHEDULE, CONTACT, FORM_SUBMIT_URL
│   └── app.js          # Booking form logic — renders services, dates, slots, handles submission
├── data/
│   ├── services.json   # Reference copy of service definitions
│   └── schedule.json   # Reference copy of working schedule
├── plan.md             # This file
└── README.md           # Setup & deployment instructions
```

## File-by-File Spec

### `js/config.js` (source of truth)
- `SERVICES` array — each service: id, name, price, duration, description
- `SCHEDULE` object — days, dayNames, openHour, closeHour, slotIntervalMinutes, weeksAhead
- `CONTACT` object — businessName, phone, email, address (update with real info)
- `FORM_SUBMIT_URL` — `"https://formsubmit.com/YOUR-EMAIL"` (replace with barber's actual email)

### `data/services.json` / `data/schedule.json`
- Human-readable reference copies of the config data
- Not loaded at runtime (avoids file:// CORS issues); kept in sync with config.js

### `css/style.css`
- Dark barber-shop aesthetic: charcoal background (#1a1a1a), cream text (#f1faee), red accent (#e63946)
- Responsive — mobile-first, flexbox/grid
- Service cards, booking steps, form styling
- Google Font: Poppins

### `js/app.js`
Core behavior on the booking page (`book.html`):

1. **Render services** — generates service cards from `CONFIG.SERVICES` showing name, price, duration
2. **Service selection** — clicking a card marks it selected, reveals date selection step
3. **Generate date options** — next 2 weeks (14 days), filtered to working days (Mon–Fri)
4. **Generate time slots** — for selected date: 30-min slots from 9am–6pm, filtered so slot + service_duration ends by close time
5. **Slot selection** — radio buttons, selected slot reveals contact form step
6. **Form submission** — sets hidden fields (service name, slot time) and POSTs to FormSubmit endpoint
7. **Success** — FormSubmit redirects to `thank-you.html` (via `_next` hidden field)

### `index.html`
- Hero banner: "Imran's Barber Shop" with tagline and "Book Now" CTA
- Services section: 3 service cards with price, duration, description
- Visit section: hours, phone, address
- Footer with copyright
- Loads config.js and app.js

### `book.html`
- Three-step booking flow (all on one page):
  - Step 1: Choose a service (clickable cards)
  - Step 2: Choose a date (dropdown) and time slot (radio buttons)
  - Step 3: Enter contact details (name, phone, email, notes)
- Back/Next navigation between steps
- Submit button in final step

### `thank-you.html`
- Clean confirmation page: "Thank you for booking!"
- Shows a summary of the service booked
- Contact info for follow-up questions

## FormSubmit Setup
1. Go to https://formsubmit.com/
2. Enter your email address — no account required
3. FormSubmit sends a confirmation email; click to verify
4. Set the form `action` to `https://formsubmit.com/your@email.com` (in `js/config.js` as `FORM_SUBMIT_URL`)
5. FormSubmit emails you the form data on every submission
6. Optional: configure email subject, disable CAPTCHA, set redirect URL in the dashboard

## Deployment Steps (GitHub Pages)
1. Initialize a git repo in the project folder
2. Commit all files
3. Push to a GitHub repo (e.g., `username/barber-shop`)
4. In repo Settings → Pages → Source, select the branch (main) and folder (root)
5. Site goes live at `https://username.github.io/barber-shop/` within 1–2 minutes

## How the Owner Changes Things (No Coding Required)
- **Change services/prices**: Edit `SERVICES` in `js/config.js` (also update `data/services.json` to match)
- **Change working hours**: Edit `SCHEDULE` in `js/config.js` (also update `data/schedule.json`)
- **Change email (where bookings arrive)**: Edit `FORM_SUBMIT_URL` in `js/config.js`
- **Update contact info**: Edit `CONTACT` in `js/config.js`
- **Change number of weeks in date dropdown**: Edit `weeksAhead` in `SCHEDULE`

## Validation Checklist
- [ ] All 3 services display with correct price and duration
- [ ] Service cards are clickable; selected state is clear
- [ ] Date dropdown shows next 2 weeks of weekdays only
- [ ] Time slots are 30-min increments from 9am, filtered by service duration
- [ ] Selected service + slot populate hidden form fields
- [ ] Form requires name and phone; email and notes are optional
- [ ] Form submits to FormSubmit endpoint (test with real email)
- [ ] Thank-you page shows after successful submission
- [ ] Layout looks good on mobile (test in browser dev tools)
- [ ] Site deploys to GitHub Pages without errors
