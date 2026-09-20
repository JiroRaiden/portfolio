import { useState, type FormEvent, type ReactNode } from 'react';
import { profile, contact, isPlaceholder } from '../content';
import { icons } from '../assets/icons';
import { scrollToChapter } from '../components/scroll';
import { decodeEmail } from '../emailCode';

type Status = 'idle' | 'sending' | 'sent' | 'opened' | 'error';

// Unscrambled here, in the visitor's browser (see scripts/encode-email.mjs).
const email = decodeEmail(profile.links.emailCode);
const hasEmail = email.includes('@');
// Which way the form sends (see `contact` in content.ts).
const mode: 'formspree' | 'mailto' | 'off' = contact.formspreeId ? 'formspree' : hasEmail ? 'mailto' : 'off';

/** Chapter 05: ways to reach you, a message form, and the end screen. */
export function Contact() {
  const rows: { label: string; value: string; href: string; icon: ReactNode }[] = [];
  if (hasEmail) rows.push({ label: 'EMAIL', value: email, href: `mailto:${email}`, icon: <MailIcon /> });
  rows.push({ label: 'GITHUB', value: shortUrl(profile.links.github), href: profile.links.github, icon: <img src={icons.github} alt="" /> });
  if (!isPlaceholder(profile.links.linkedin)) {
    rows.push({ label: 'LINKEDIN', value: shortUrl(profile.links.linkedin), href: profile.links.linkedin, icon: <img src={icons.linkedin} alt="" /> });
  }
  rows.push({ label: 'LEETCODE', value: shortUrl(profile.links.leetcode), href: profile.links.leetcode, icon: <img src={icons.leetcode} alt="" /> });

  return (
    <section id="contact" className="chapter chapter--contact" aria-labelledby="contact-title">
      <div className="chapter-head">
        <div>
          <span className="kicker">CHAPTER 05</span>
          <h2 id="contact-title" className="chapter-title">CONTACT ME</h2>
        </div>
      </div>

      <div className="contact-body">
        <div className="contact-links">
          <p className="contact-blurb">{contact.blurb}</p>
          {rows.map((r) => (
            <div key={r.label} className="contact-row">
              <a
                className="contact-row__link"
                href={r.href}
                {...(r.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
              >
                <span className="contact-row__icon" aria-hidden="true">{r.icon}</span>
                <span className="contact-row__text">
                  <span className="contact-row__label">{r.label}</span>
                  <span className="contact-row__value">{r.value}</span>
                </span>
                <ArrowIcon />
              </a>
              {r.label === 'EMAIL' && <CopyButton text={email} />}
            </div>
          ))}
        </div>

        <MessageForm />
      </div>

      <footer className="end-screen">
        <span className="end-screen__text">THANKS FOR PLAYING · © {new Date().getFullYear()} {profile.name.first} {profile.name.last}</span>
        <button type="button" className="end-screen__again" onClick={() => scrollToChapter('origin')}>
          PLAY AGAIN <span aria-hidden="true">↑</span>
        </button>
      </footer>
    </section>
  );
}

function MessageForm() {
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get('_gotcha')) return;   // a bot filled the hidden field: pretend nothing happened

    if (mode === 'mailto') {
      const subject = `Hello from ${data.get('name')}`;
      const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus('opened');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${contact.formspreeId}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent' || status === 'opened') {
    return (
      <div className="message-form message-form--done" role="status">
        <span className="message-form__title">{status === 'sent' ? 'MESSAGE DELIVERED' : 'ALMOST THERE'}</span>
        <p>
          {status === 'sent'
            ? "Thanks for writing. I'll get back to you soon."
            : 'Your email app should have opened with the message ready. Hit send there and it reaches me.'}
        </p>
        <button type="button" className="btn-ghost" onClick={() => setStatus('idle')}>WRITE ANOTHER</button>
      </div>
    );
  }

  const off = mode === 'off';
  return (
    <form className="message-form" aria-labelledby="message-title" onSubmit={onSubmit}>
      <span id="message-title" className="message-form__title">LEAVE A MESSAGE</span>
      <div className="message-form__pair">
        <label className="field">
          <span className="field__label">NAME</span>
          <input name="name" type="text" required autoComplete="name" placeholder="Your name" disabled={off} />
        </label>
        <label className="field">
          <span className="field__label">EMAIL</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" disabled={off} />
        </label>
      </div>
      <label className="field">
        <span className="field__label">MESSAGE</span>
        <textarea name="message" rows={4} required placeholder="Hi Bishal, we have a role that fits…" disabled={off} />
      </label>
      {/* Honeypot: hidden from people, but bots fill in every field. */}
      <input className="honeypot" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="message-form__foot">
        <button type="submit" className="btn-send" disabled={off || status === 'sending'}>
          {status === 'sending' ? 'SENDING…' : 'SEND MESSAGE →'}
        </button>
        {status === 'error' && (
          <span className="message-form__note message-form__note--error" role="alert">
            Couldn't send. {hasEmail ? `Try emailing ${email} directly.` : 'Please try again in a moment.'}
          </span>
        )}
        {off && <span className="message-form__note">The form switches on once an email or Formspree ID is added.</span>}
      </div>
    </form>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked: the mailto link is still there */ }
  };
  return (
    <button type="button" className="contact-row__copy" onClick={copy} aria-label={copied ? 'Email copied' : 'Copy email address'}>
      {copied ? 'COPIED' : 'COPY'}
    </button>
  );
}

// "https://github.com/JiroRaiden/" → "github.com/JiroRaiden"
const shortUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

function MailIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" /><path d="M3 6 L12 13 L21 6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="contact-row__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12 H19" /><path d="M13 6 L19 12 L13 18" />
    </svg>
  );
}
