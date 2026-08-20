# Setup — the steps only you can do

Four things stand between the review engine and its first send. Everything else
is already written. Roughly 45 minutes total, and step 1 alone is enough to
start.

> Google changes these screens regularly. If what you see doesn't match what's
> written here, tell me what's on screen and I'll re-check it rather than having
> you hunt.

---

## 1. Get your Google review link — 5 minutes, do this first

Nothing sends without it.

> **Sign in as `paintnpete@gmail.com` first.** Resolved 2026-08-19: Google
> reports the profile is managed by `pa…@gmail.com`, which is that account.
>
> `kanwalconsulting297@gmail.com` is not a Paint'n Pete account. Never use it
> here. If the browser is on it, switch. Nothing needs claiming. **Do not
> click "Request Access"** — that asks permission from yourself and starts a
> multi-day wait for nothing.

1. Sign in to Google with the account that manages the business.
2. Go to <https://business.google.com>, or just search "Paint'n Pete" while
   signed in — your profile manager panel appears directly in the results.
3. Find **Ask for reviews** (sometimes **Get more reviews**).
4. Copy the short link. It looks like `https://g.page/r/XXXXXXXXXX/review`.

**If you can't find that button**, use the fallback — it produces an identical
result:

1. Open <https://developers.google.com/maps/documentation/places/web-service/place-id>
2. Search your business name, copy the Place ID.
3. Your link is `https://search.google.com/local/writereview?placeid=PASTE_HERE`

**Test it on your own phone before sending to a single client.** It should open
the review box with the stars ready. If it opens your profile instead of the
review box, the link is wrong and 30 people will hit a dead end.

Then send me the link and your profile URL and I'll put them into the config.

---

## 2. Import the tracker — 5 minutes

1. Open <https://sheets.google.com>, create a blank sheet, name it
   **Paint'n Pete — Review Backlog**.
2. **File → Import → Upload**, choose `review-tracker.csv` from this folder.
3. Pick **Replace current sheet**.
4. Fill in your last 30 completed clients, newest at the top.
5. In `batch_day`, number them 1 through 6 — five clients per day. Oldest
   clients get day 1.

Why paced: a profile sitting at 14 reviews for years that suddenly takes 20 in
two days can have the burst caught by Google's spam filter, and filtered reviews
are very hard to get back. Six days of five reads as organic.

If pulling 30 clients from memory and old invoices is the slow part, start with
whoever you can name today. Ten reviews is still most of the gain.

---

## 3. Put the messages in your phone — 10 minutes

So the ask takes ten seconds from a driveway.

**iPhone:** Settings → General → Keyboard → Text Replacement → **+**. Paste
Message 1 from `review-engine.md` into *Phrase*, set *Shortcut* to `revask`.
Repeat with `revfollow` for Message 2 and `revpast` for Message 3.

**Android:** Gboard settings → Dictionary → Personal dictionary → your language
→ **+**. Same three shortcuts. The path varies by manufacturer; if yours differs,
search "text shortcut" in Settings.

Leave the `[SPECIFIC DETAIL]` bracket in the saved text. It's a prompt to
personalise, and it's the part that makes the message work.

---

## 4. Domain email — mostly done already

**`noah@paintnpete.com` is the client outreach address.** Decided 2026-08-19.
Everything client-facing sends from it: proposals, follow-ups, objection
replies, and all commercial outreach. `paintnpete@gmail.com` stays as the
internal system address — it owns the Google Business Profile and receives
KaiCalls alerts — and never appears on a document a client sees.

**The domain is already on Google Workspace.** Checked the DNS directly on
2026-08-19:

```
MX   →  smtp.google.com          Google is handling mail for paintnpete.com
TXT  →  v=spf1 include:_spf.google.com ~all      SPF present and correct
TXT  →  google-site-verification=WGCO8iNx…       domain verified with Google
```

So no domain adding, no MX editing, none of the risky DNS work. What's left is
one screen: <https://admin.google.com> → Directory → Users → your user → add
`noah@paintnpete.com`, as primary or as an alias. Alias is safer — mail lands
in the same inbox, nothing breaks, and you can send *as* it from Gmail settings.

### ⚠️ Email authentication — done 2026-08-19

DKIM (`google._domainkey`, 2048-bit) and DMARC (`p=none`, reports to
`noah@paintnpete.com`) are live. Google Admin status is **Authenticating email
with DKIM**. Do not generate a new key or click Stop authentication. Leave
`p=none` for a few weeks of reports, then tighten to `p=quarantine`. Never open
at `p=reject`.

Why it still matters: cold email to GCs and designers is judged on
authentication. Keep these records; the channel fails silently without them.

DNS stays at Wix (`ns6`/`ns7.wixdns.net`) even though the site is on Netlify.
Do not touch the existing A, CNAME, MX, or SPF entries. Do not add a second
DKIM or DMARC record.

---

## After these four

Reply with the review link and I'll wire it into the config so every template
resolves. Then the first five texts go out the same day.
