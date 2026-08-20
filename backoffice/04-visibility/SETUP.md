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

> **⛔ Blocked — resolve profile ownership first.** Checked 2026-08-19 while
> signed in as `kanwalconsulting297@gmail.com`: the profile shows "Own this
> business?", "Suggest an edit", and "Suggest new hours". Those are the options
> Google shows the public, not an owner. So the profile is either unclaimed or
> claimed under a different Google account.
>
> Work out which. If you claimed it with another address — an older Gmail, or
> the Workspace account — sign in with that one and everything below works. If
> nobody has claimed it, start the claim from that panel and expect Google to
> verify by postcard, video, or phone, which takes days to a couple of weeks.
>
> The listing is live and taking calls regardless. What you cannot do until
> this is settled is respond to reviews, publish posts, add services or Q&A, or
> generate the review link this step needs.

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

## 4. Domain email — 30 minutes, already paid for

You're on Google Workspace, so `noah@paintnpete.com` costs nothing additional.
The back office currently lists `paintnpete@gmail.com` as unverified, and it
should be retired before any commercial outreach.

**First, find out which domain your Workspace is actually on** — I can't see
this. Go to <https://admin.google.com> and look at the top of the dashboard, or
Account → Domains → Manage domains.

**If paintnpete.com is already listed:** Directory → Users → your user → add
`noah@paintnpete.com`, either as the primary address or as an alias. Alias is
the safer move — mail arrives in the same inbox, nothing breaks, and you can
send *as* the new address from Gmail settings.

**If paintnpete.com is not listed**, it needs adding and verifying, which means
editing DNS records wherever the domain is managed — probably Wix, since the
site is there, but possibly a separate registrar. Google gives you a TXT record
to verify ownership and a set of MX records to route mail.

That second path is the one where people break their website by editing the
wrong record. Tell me what you find on the domains screen and where the domain
is registered, and I'll walk you through it record by record before you change
anything.

---

## After these four

Reply with the review link and I'll wire it into the config so every template
resolves. Then the first five texts go out the same day.
