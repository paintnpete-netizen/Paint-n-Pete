# The Four Standard Responses

The painting contractor who answers first wins a disproportionate share of the
work. These exist so a good reply takes ten seconds from the top of a ladder.

**Standard:** every inbound inquiry gets a real human reply within five minutes
during working hours, and by 8am the next morning otherwise.

**Every response ends with a question.** Never "let me know" — that puts the next
move on someone who is currently comparing you to two other painters.

Save all four as phone text shortcuts. Suggested triggers in brackets.

---

## 1. Website form inquiry `[wform]`

> Thanks for reaching out — Noah here, Paint'n Pete. You're well inside the area
> we work. I'd rather see the space before putting numbers to it. I have
> [DAY] morning or [DAY] afternoon open this week — does either of those work?

Offering two specific windows converts far better than "when are you free?",
which asks them to do the scheduling work.

---

## 2. Missed call text-back — **now handled by Kai**

> Noah here, Paint'n Pete — sorry I missed you, I was on a ladder. What kind of
> project are you looking at?

Kai answers the line and texts missed callers back automatically, so you no
longer send this by hand. Keep it as the *voice* Kai should use — short, real,
a person who is genuinely working rather than a polished auto-reply.

See `kai-setup.md`.

---

## 3. "What's your ballpark price?" `[wball]` — **also give this to Kai**

> Honest answer: I could give you a number now, but it would be a guess, and
> guesses are how people end up with a change order halfway through. Twenty
> minutes at the house and I can give you a real itemized price instead. When
> are you around this week?

Do not dodge this question — evasiveness is what they're testing for. Explain
*why* you quote after seeing it, then move straight to scheduling.

---

## 4. Outside the service area `[warea]`

> Thanks for thinking of us. You're outside where I can get a crew reliably, and
> I'd rather tell you that than stretch and do it badly. Happy to point you
> toward someone decent closer to you — want me to?

Declining well is worth more than it looks. People remember it, and they refer
to the person who was straight with them.

---

## Wiring it up

**Phone calls go to Kai**, which answers in about two seconds, runs intake, and
books. Responses 2, 3, and 4 become Kai's configuration rather than things you
type — see `kai-setup.md`.

**Web form submissions** still run through workflow 1 in `../07-automation/`,
which sends the acknowledgment the moment a form lands so the five-minute clock
never runs out while you're spraying cabinets. That automated reply buys you
time; **it is not the personal reply**. Send response 1 yourself as well.

Service-area boundaries for response 4 are still `todo` in the config. Worth
settling — right now you'd be guessing at the edge of your own map.
