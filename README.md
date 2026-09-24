# The Crown & Razor Co.

Website and online booking for a premium barbershop in Cape Town (fictional business), built by **Stacey-Lee Pietersen** for the Talent Forge Junior Full-Stack Developer Practical Assessment.

**Stack:** React 19 · Vite · React Router · Motion · Lucide · Supabase (Postgres + Edge Functions) · Vitest

## Features

- Pages: Home, Services, About, Our Barbers, Contact, Booking, Cancel a Booking, Terms, Privacy, and a custom 404 page
- Services, prices, durations, barbers and opening hours are loaded live from Supabase
- Booking in five steps: service → barber (or any available barber) → date and time → details → review → confirmation
- The business is located in Cape Town. Prices are shown in South African Rand (ZAR), and times are in South African Standard Time (SAST, `Africa/Johannesburg`)
- Available times are calculated server-side from opening hours, service length, existing bookings and a 30-minute minimum notice. The time conversion also handles daylight saving time for zones that use it
- Double booking is prevented by a Postgres exclusion constraint, so two simultaneous requests cannot both succeed
- The `CROWN15` first-visit code gives 15% off the Signature Crown Cut and the Executive Package only. It is checked against earlier bookings made with the same email address
- Add to Google Calendar and a downloadable `.ics` file (Apple Calendar, Outlook), both generated from the confirmed booking record
- A confirmation email is sent through Resend. It includes the same details as the calendar event, an Add to Google Calendar button and the `.ics` file attached. A failed email never cancels a booking; the confirmation screen says whether the email was sent
- Customers can cancel online with their booking reference and email, which frees the slot
- First-visit popup that can be dismissed, remembers the dismissal, traps keyboard focus and closes with Escape. The "View the Offer Popup" button in the homepage's first-visit section opens it at any time
- Responsive from 320px to wide desktop, accessible forms and dialogs, and support for reduced motion

## Project structure

```
src/
  components/  layout/ ui/ home/ services/ barbers/ booking/
  context/     ShopDataProvider (services, barbers, hours from Supabase)
  data/        business.js, services.js (imagery), barbers.js, images.js
  hooks/       useBooking, useAvailability, useFocusTrap, useDocumentMeta
  lib/         api.js, bookingFlow.js (state machine), calendar.js, format.js, hours.js
  pages/       one file per route
  styles/      base, layout, components, pages, booking
supabase/
  config.toml
  migrations/     SAST time zone for the validate_appointment trigger
  functions/
    _shared/          schedule.js + validation.js (also imported by the React app via @shared)
    get-availability/ available start times for a service/barber/date
    create-booking/   validates, prices and creates an appointment (or previews a promo code)
    cancel-booking/   cancels using booking reference + email
```

The scheduling and validation rules live in `supabase/functions/_shared/` and are shared by the browser and the server, so both apply the same rules.

## Data model (Supabase)

| Table | Access |
| --- | --- |
| `services`, `barbers`, `business_hours` | Public read of active rows (RLS) |
| `appointments` | No public access. Only reached through Edge Functions using the service-role key |
| `promotions`, `promotion_services` | No public access |

`appointments` has these columns: `id`, `service_id`, `barber_id`, `promotion_id`, `customer_name`, `customer_email`, `customer_phone`, `customer_notes`, `starts_at`, `ends_at`, `status` (`confirmed` / `completed` / `cancelled` / `no_show`), `original_price_cents`, `discount_cents`, `final_price_cents`, `created_at`, `updated_at`.

Two database rules are the final authority:

- `validate_appointment` (a BEFORE INSERT/UPDATE trigger) recalculates the end time, price and discount, and checks opening hours, the 15-minute start grid, past or future limits and promotion eligibility.
- `prevent_barber_double_booking` is an exclusion constraint on `(barber_id, tstzrange(starts_at, ends_at))` that ignores cancelled rows.

The frontend never sends a price, discount or duration.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm test` | Unit tests (time zones and DST, slots, validation, discounts, Google/ICS output) |
| `npm run lint` | ESLint |
| `npm run build` | Production build to `dist/` |

## Environment variables

These frontend variables are public and are set in `.env.local` and on your hosting provider:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | The project's anon / publishable key |

These Edge Function secrets are server-side only. Set them with `npx supabase secrets set NAME=value`:

| Name | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Required to send confirmation emails |
| `EMAIL_FROM` | Optional. Sender address, e.g. `The Crown & Razor Co. <bookings@yourdomain.com>`. It needs a domain verified in Resend; the default is Resend's test sender, which can only deliver to the Resend account owner's address |
| `SITE_URL` | Optional. The public website URL, used for the "Cancel your booking online" link in the email |

**Never** put the service-role key in a `VITE_` variable or anywhere in the frontend. Supabase injects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into deployed Edge Functions automatically, so no extra secrets need to be set. If you add a secret later, use `npx supabase secrets set NAME=value`; it is stored server-side only. `.env*` files other than `.env.example` are git-ignored.

## Deploying

### Edge Functions

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase functions deploy get-availability create-booking cancel-booking --use-api
```

JWT verification is turned off for these three functions in `supabase/config.toml` because guests book without an account. Each function validates its own input and returns only the data it needs to. Availability responses contain times only, never customer details.

### Frontend: Vercel or Netlify

1. Import the repository.
2. Build command: `npm run build`. Output directory: `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy.

`vercel.json` and `netlify.toml` already contain the fallback rules that let a React Router app load, so `/services`, `/booking` and other routes open directly and survive a page refresh.

## Content notes

- The business is fictional. The contact page uses an illustrative map instead of pretending to show a verified location.
- Barber portraits are SVG illustrations and are labelled as illustrative. They do not depict real people.
- Photography comes from Unsplash (Unsplash licence) and is stored locally in `src/assets/images`.
- Policies that the business has not yet confirmed are marked as drafts on the Terms and Privacy pages.
- The only email the site sends is the booking confirmation. There is no marketing email.
