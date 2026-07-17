# Witness Checklists — 5 screens, phone + desktop

Simple yes/no checks for the owner. No technical knowledge needed.

**How to test on the PHONE:** hold the phone upright, in ONE hand. Try everything
with your thumb only. Answer each check with yes or no.

**How to test on the DESKTOP:** open the browser window full screen. Answer each
check with yes or no.

**"No" = a failed check.** Write down the number of every check that failed.

**Log in first** (for screens 1–3): use your test login from `docs/team/TEST-LOGINS.md`.
Screens 4–5 need NO login at all — that is on purpose.

---

## 1. Login

**Open:** `https://www.lock.show/app/login`

**PHONE — answer yes/no:**
1. Does the page load with no red error text?
2. Is it clear this page has ONE job — signing in?
3. Is there exactly ONE bright green button?
4. Can you tap every button and field easily with your thumb?
5. Does anything hang off the screen edge? (Yes here = FAIL — you should never scroll sideways.)
6. Do the email field, password field and green button all fit on one screen, without scrolling?
7. If you type a wrong password, do you get a friendly message in human words (not a code)?
8. Is there a way to reach "forgot password" and "sign up" from this page?

**DESKTOP — answer yes/no:**
1. Does the page load with no red error text?
2. Is there only ONE menu on the page (not one at the top AND one at the side)?
3. Is the page title written only once (not repeated twice)?
4. Is there exactly ONE bright green button?
5. Can you read every word easily — nothing pale grey on white, nothing black on black?
6. Do you have to scroll sideways? (Yes = FAIL.)
7. After a wrong password, is the message polite and clear, and can you simply try again?
8. Does pressing Enter after typing the password sign you in?

**Tell Claude:** "Login — phone: [numbers that failed] / desktop: [numbers that failed]" (example: "Login — phone: 5, 7 / desktop: none").

---

## 2. Act editor

**Open:** `https://www.lock.show/app/artist/act/edit` (log in as the artist first)

**PHONE — answer yes/no:**
1. Is it clear this page has ONE job — editing your act's identity (name, one-liner, genre, city, photo)?
2. Is the bottom menu bar still there?
3. Is there exactly ONE bright green button?
4. Can you tap every field and button easily with your thumb?
5. Does anything hang off the screen edge? (Yes = FAIL.)
6. When you tap a field, can you see what you are typing (keyboard not covering it)?
7. After you change a field and save, do you SEE a clear "saved" confirmation?
8. If you clear a field and leave it empty, do you get a friendly hint (not a scary error)?

**DESKTOP — answer yes/no:**
1. Is there only ONE menu on the page?
2. Is the page title written only once?
3. At the top, do you see only two identity things — the LOCK brand and your own avatar?
4. Is there exactly ONE bright green button?
5. Type a very long value into a field — does the page still look tidy, nothing spilling out?
6. Type something in HEBREW — does it show correctly, right-to-left?
7. After saving, is there a visible confirmation AND a way to undo?
8. Do you have to scroll sideways? (Yes = FAIL.)

**Tell Claude:** "Act editor — phone: [failed numbers] / desktop: [failed numbers]".

---

## 3. Artist Radar

**Open:** `https://www.lock.show/app/artist/home` (log in as the artist first)

**PHONE — answer yes/no:**
1. Is the Radar the clear star of the screen — one job, not crowded with other things?
2. Is the bottom menu bar still there?
3. Can you tap a planet/dot and zoom into it, and pull down (or tap close) to get back out?
4. When you tap a planet, does the detail open as a small sheet sliding up — NOT a whole new page?
5. Is there exactly ONE bright green button at a time?
6. Does anything hang off the screen edge? (Yes = FAIL.)
7. Can you always reach your account (your avatar) from this screen?
8. Do you see anywhere a score, a rank, a percent, or a follower count? (Yes = FAIL — tell Claude immediately.)

**DESKTOP — answer yes/no:**
1. Do you see the Radar as a big canvas with a detail panel on the side?
2. Is there only ONE menu (not one on top AND one on the side)?
3. Is the page title written only once?
4. Is the ONE bright green button inside the side detail panel (not floating somewhere else too)?
5. Click a planet — does the side panel update, without jumping to a new page?
6. Do you have to scroll sideways? (Yes = FAIL.)
7. Is any red error text visible anywhere?
8. Do you see anywhere a score, a rank, a percent, or a follower count? (Yes = FAIL — tell Claude immediately.)

**Tell Claude:** "Radar — phone: [failed numbers] / desktop: [failed numbers]".

---

## 4. Public Passport

**Open:** your act's share link — it looks like `https://www.lock.show/app/passport/YOUR-ID`.
Get it from the Passport tab inside the app (or ask Claude for your test artist's link).
**Open it in a private/incognito window — you must NOT be logged in.** Buyers never log in.

**PHONE — answer yes/no:**
1. Does the page open with NO login screen in the way?
2. In the first screen you see: photo, artist name, and one line saying what they do — all clear?
3. Is there exactly ONE bright green button (asking about availability), and does it stay in reach while you scroll down?
4. Does anything hang off the screen edge? (Yes = FAIL.)
5. Does every proof say HOW it was checked (a small method label), in plain words?
6. Do you see anywhere a score, a rank, a percent, a gauge, or an exact crowd/follower number? (Yes = FAIL — tell Claude immediately.)
7. Do you see any private artist things — gaps, to-dos, "missing" warnings? (Yes = FAIL — buyers must see strengths only.)
8. Could a stranger decide "worth talking to or not" in about a minute, just by scrolling once?

**DESKTOP — answer yes/no:**
1. Does the page open with NO login screen in the way?
2. Is the page title/artist name written only once (not repeated twice)?
3. Is there exactly ONE bright green button?
4. Can you read every word easily — including text on top of the dark photo area?
5. Do you have to scroll sideways? (Yes = FAIL.)
6. Do you see anywhere a score, a rank, a percent, a gauge, or an exact crowd/follower number? (Yes = FAIL — tell Claude immediately.)
7. Do you see any private artist things — gaps, to-dos, "missing" warnings? (Yes = FAIL.)
8. Is any red error text visible anywhere?

**Tell Claude:** "Passport — phone: [failed numbers] / desktop: [failed numbers]".

---

## 5. Availability request

**Open:** on the Public Passport (screen 4), press the ONE bright green button.
The address becomes `.../request`. Stay logged OUT (private/incognito window).

**PHONE — answer yes/no:**
1. Is it clear this page has ONE job — asking if the artist is available?
2. Does the form open with NO login demand — can a stranger send it?
3. Is there exactly ONE bright green button (the send button)?
4. Can you tap every field and button easily with your thumb?
5. Does anything hang off the screen edge? (Yes = FAIL.)
6. Is the form short enough to fill without getting lost — and if you leave something out, is the hint friendly?
7. After sending, do you land on a clear "sent" receipt page that says what happens next?
8. From the receipt, is there a way BACK to the Passport (no dead end)?

**DESKTOP — answer yes/no:**
1. Is there only ONE menu on the page (or none — this is a public page)?
2. Is the page title written only once?
3. Is there exactly ONE bright green button?
4. Type a very long answer in one field — does the page stay tidy?
5. Type something in HEBREW — does it show correctly, right-to-left?
6. Do you have to scroll sideways? (Yes = FAIL.)
7. After sending, does the receipt page appear with no red error text?
8. Press the browser BACK button from the receipt — do you get anywhere sensible (not a broken page)?

**Tell Claude:** "Availability request — phone: [failed numbers] / desktop: [failed numbers]".

---

## How to report everything at once

Send Claude one short message, one line per screen, like this:

```
Login — phone: none / desktop: 3
Act editor — phone: 5, 7 / desktop: none
Radar — phone: 4 / desktop: 1, 5
Passport — phone: none / desktop: none
Availability request — phone: 6 / desktop: none
```

If check 8 on the Radar or check 6/7 on the Passport failed (a score, rank,
percent, follower count, or private gaps visible to buyers) — say so FIRST.
That is the most serious kind of failure and blocks release.
