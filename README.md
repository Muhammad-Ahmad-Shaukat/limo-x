# Long Island Car & Limo — Website

Official static website for **Long Island Car & Limo** — a 24/7 limousine, airport transportation, chauffeur and corporate travel service based in Elmont, NY.

- **Production domain:** [longislandcarandlimo.com](https://longislandcarandlimo.com)
- **Phone:** +1 (718) 618-9155
- **Email:** info@longislandcarandlimo.com
- **Address:** 36 Circle Dr W, Elmont, NY 11003

---

## Tech stack

| Layer       | Technology                                                                  |
| ----------- | --------------------------------------------------------------------------- |
| Markup      | Static HTML5                                                                |
| Styles      | Bootstrap 5 + custom CSS (compiled from SCSS in `assets/scss/`)             |
| Scripts     | jQuery, Swiper, GSAP, Bootstrap, jQuery UI, Metismenu                       |
| Backend     | Vercel Serverless Function (`api/mailer.js`)                                |
| Mail        | Nodemailer via SMTP                                                         |

No build step is required for deployment — every page is pre-rendered HTML.

---

## Project structure

```
.
├── index.html                       Homepage (Home 2 design) with booking form
├── about.html
├── services.html                    Services overview
├── airport-transportation.html      Service detail
├── limo-service.html                Service detail
├── chauffeur-service.html           Service detail
├── corporate-travel.html            Service detail
├── fleet.html                       Fleet overview
├── luxury-sedans.html               Fleet category
├── suvs.html                        Fleet category
├── limos.html                       Fleet category
├── vans.html                        Fleet category
├── blog.html                        Blog listing
├── blog/
│   ├── booking-limo-long-island.html
│   ├── airport-transportation-benefits.html
│   └── black-car-vs-limo.html
├── faq.html
├── contact.html
├── api/
│   └── mailer.js                    Contact + booking form handler (SMTP)
├── package.json                     Node dependency manifest (nodemailer)
├── robots.txt
├── sitemap.xml
└── assets/
    ├── css/      compiled stylesheets
    ├── fonts/    icon fonts
    ├── images/   image assets (logo, fleet photos, banners, etc.)
    ├── js/       JavaScript bundles + vendor scripts
    └── scss/     SCSS sources (optional; compile with sass if you change styles)
```

---

## SEO features

Every page ships with:

- Unique `<title>` and `<meta name="description">`
- Canonical URL, Open Graph and Twitter Card meta tags
- Descriptive image `alt` text
- Semantic heading hierarchy
- JSON-LD structured data:
  - `LimousineService` / `LocalBusiness` on the homepage
  - `Service` schema on service detail pages
  - `Article` schema on every blog post
  - `FAQPage` schema on `faq.html` and the homepage FAQ
- `robots.txt` and `sitemap.xml` at the document root

---

## Local development

This site is fully static except for the serverless mail endpoint. To preview static pages:

```bash
# from the project root
python -m http.server 8080
```

Then open <http://localhost:8080>.

---

## SMTP setup (Vercel)

The site uses [Nodemailer](https://nodemailer.com/about/) in `api/mailer.js` to send mail over SMTP. Set these environment variables in your Vercel project settings:

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@longislandcarandlimo.com
SMTP_PASS=YOUR_SMTP_PASSWORD_HERE
SMTP_FROM=info@longislandcarandlimo.com
SMTP_FROM_NAME=Long Island Car & Limo
SMTP_TO=info@longislandcarandlimo.com
SMTP_TO_NAME=Long Island Car & Limo Dispatch
```

### Provider examples

| Provider                | Host                       | Port | Encryption |
| ----------------------- | -------------------------- | ---- | ---------- |
| Gmail (App Password)    | `smtp.gmail.com`           | 587  | tls        |
| Google Workspace        | `smtp.gmail.com`           | 587  | tls        |
| SendGrid                | `smtp.sendgrid.net`        | 587  | tls        |
| Mailgun                 | `smtp.mailgun.org`         | 587  | tls        |
| Microsoft 365           | `smtp.office365.com`       | 587  | tls        |
| Zoho                    | `smtp.zoho.com`            | 587  | tls        |
| Amazon SES (us-east-1)  | `email-smtp.us-east-1.amazonaws.com` | 587 | tls |

> When using Gmail or Workspace, generate an **App Password** instead of using your account password. With SendGrid/Mailgun, the username is usually `apikey` (SendGrid) or the SMTP username from your domain (Mailgun).

### Form types

The handler accepts two `form_type` values:

- `contact` — used by `contact.html`. Required fields: `name`, `email`, `message`.
- `booking` — used by the homepage `#book` form. Required fields: `name`, `email`, `phone`, `pickup_date`, `pickup_time`, `pickup_location`, `dropoff_location`.

The endpoint always returns JSON:

```json
{ "success": true,  "message": "Thank you! ..." }
{ "success": false, "message": "Reason for failure." }
```

### Troubleshooting

Common issues:

- Gmail blocking "less secure" sign-ins → switch to an **App Password**.
- 5xx errors on Mailgun → verify your domain in the Mailgun dashboard.
- Generic "could not authenticate" → double-check `SMTP_USER` matches the verified sender.

---

## Deployment

This project is ready for Vercel static + serverless deployment.

1. Push the repo to GitHub/GitLab/Bitbucket and import it into Vercel.
2. Add all SMTP environment variables listed above in Vercel project settings.
3. Deploy and submit the test reservation form on `index.html`.
4. Submit `sitemap.xml` to Google Search Console.

---

## Editing styles

If you change any SCSS in `assets/scss/` you'll need to recompile:

```bash
# install once
npm install -g sass

# compile on save
sass --watch assets/scss/style.scss:assets/css/style.css --style=compressed
```

---

## License

Proprietary — © Long Island Car & Limo. All rights reserved.
