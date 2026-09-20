# Phase 6 — Chapter 05 (Contact Me)

## What you'll see

- **Contact rows** for email, GitHub, LinkedIn and LeetCode, each with a logo. On hover a row slides right a little and glows cyan.
- The email row has a **COPY** button that copies your address and shows COPIED for a moment.
- Rows whose link is still a `[PLACEHOLDER]` are left out, so the live site never shows a broken link.
- **Leave a message**: name, email and message, then SEND MESSAGE. After sending, the form turns into a "MESSAGE DELIVERED" panel with a WRITE ANOTHER button.
- **End screen**: "THANKS FOR PLAYING · © 2026 BISHAL MANDI" and a **PLAY AGAIN ↑** button back to Origin. The year updates itself.

## Files

```
src/chapters/Contact.tsx   the chapter
src/content.ts             `contact` (blurb + form setting), profile.links (email, linkedin)
```

## Switching the form on

The form picks how to send by what you've filled in (`contact` in `content.ts`):

| You set | What SEND does |
|---|---|
| `formspreeId` | Posts to Formspree; the visitor stays on the page. Messages arrive in your inbox. |
| only `profile.links.emailCode` | Opens the visitor's email app with the message already written (mailto). |
| neither | Button stays off, with a note. |

To use Formspree: make a free account at formspree.io and create a form. It gives you a link like `https://formspree.io/f/abcdwxyz`. Put `abcdwxyz` in `formspreeId`.

## The ideas worth understanding

**1. The browser does the validation.**
`required` and `type="email"` stop the form submitting until the fields make sense, and the browser shows its own message. The CSS `:user-invalid` turns a field's border pink, but only after the visitor has typed in it, so an empty form doesn't start out red.

**2. `FormData` → Formspree.**
`new FormData(form)` collects every named field. It is sent with `fetch` and the header `Accept: application/json`, so Formspree replies with JSON instead of redirecting to its own thank-you page. `res.ok` decides between the "delivered" panel and an error message.

**3. Honeypot.**
There is a hidden field called `_gotcha`. People never see it, but spam bots fill in every field. If it has a value, the site quietly does nothing, and Formspree also drops any such message it receives.

**4. mailto with a pre-written message.**
`mailto:you@x.com?subject=...&body=...` opens the visitor's email app with the message ready. `encodeURIComponent` makes spaces, line breaks and `&` safe inside the link.

**5. Copy to clipboard.**
`navigator.clipboard.writeText()` needs a secure page (https or localhost) and can be refused, so it is wrapped in try/catch. The mailto link still works if it fails.

**6. Hiding the email from bots.**
Spam bots scan websites for anything shaped like `name@domain.com`. So the address is never written into the site's files. `content.ts` holds a scrambled version (`emailCode`): the address reversed, then base64-encoded, which leaves no `@` and no readable domain. `src/emailCode.ts` unscrambles it in the visitor's browser when the page runs, so people see and copy the real address. Simple scrapers read the raw files and find nothing. A bot that fully runs the page like a browser could still see it, but most don't bother.

**7. Placeholders never reach the page.**
`isPlaceholder()` (anything starting with `[`) decides which rows render. It's the same rule the header uses for the résumé link.

## To fill in (in `content.ts`)

- `profile.links.emailCode`: your email, scrambled. In the `site` folder run `npm run email -- you@example.com`; it prints a line like `emailCode: 'bW9j...',` to paste into `content.ts`.
- `profile.links.linkedin`: full URL.
- `contact.formspreeId`: if you go with Formspree.
