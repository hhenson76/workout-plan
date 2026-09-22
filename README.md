# Comeback Block

A five-day training log for getting back under the bar after time off. Push / Pull / Legs / Upper / Lower, with a weight and rep field for every set, last week's numbers under each row, and an exercise library that filters itself down to the equipment you actually have.

No build step, no dependencies, no account. Static files you can drop on GitHub Pages and open from your phone.

## What it does

- **Five sessions a week**, structured so each muscle group gets trained roughly twice: Mon Push, Tue Pull, Wed Legs, Thu rest, Fri Upper, Sat Lower, Sun rest.
- **Log every set** — weight and reps (or seconds, for holds and carries), plus a done toggle. Saves as you type.
- **Week-by-week history.** Each week is stored separately and the previous week's numbers appear under every set row, which is what double progression needs.
- **Equipment filtering.** Switch off the machines your gym doesn't have and every exercise needing them disappears, replaced by one that trains the same muscle with what you do have. 212 exercises across 37 slots; the plan still fills completely at bodyweight-only.
- **Exercise swaps.** Each card is a *slot* — "primary chest press", "hamstring curl" — not a fixed lift. Re-roll one card or shuffle the whole day. Optional auto-vary rolls a fresh selection each new week.
- **Coaching built in.** Reps-in-reserve targets shift by week (3–4 RIR in weeks 1–2, down to 1–2 by week 5), with rest periods and the progression scheme in the Guide sheet.
- **Installable and offline.** A service worker caches the app shell, so it opens in a dead-signal basement gym and can be added to your home screen.

## Files

```
index.html               markup and page head
assets/app.css           all styling, light and dark themes
assets/app.js            plan data, exercise library, state, rendering
assets/icon.svg          source icon
assets/icon-192.png      home-screen icon
assets/icon-512.png      splash / maskable icon
manifest.webmanifest     makes it installable
sw.js                    offline cache
.nojekyll                tells GitHub Pages to serve the files as-is
LICENSE                  MIT
```

## Putting it on GitHub Pages

1. Create a new repository — `comeback-block` is a fine name. Public is simplest; Pages on a private repo needs a paid plan.
2. Upload every file above, keeping `assets/` as a folder. On github.com: **Add file → Upload files**, then drag the whole folder in.
3. **Settings → Pages**. Under *Build and deployment*, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`. Save.
4. Wait a minute or two, then open `https://<your-username>.github.io/comeback-block/`.
5. On your phone, open that URL and add it to your home screen — **Share → Add to Home Screen** on iOS, **⋮ → Add to Home screen** on Android. It then opens full-screen with no browser chrome.

HTTPS matters here: the service worker and the install prompt only work over HTTPS (or `localhost`). GitHub Pages gives you HTTPS automatically.

## Running it locally

Opening `index.html` straight off disk works for everything except the service worker, which needs a real origin:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Where your data lives

In your browser's `localStorage`, on that device, under the key `comeback-block-v2`. It never leaves the device and there's no server involved.

The trade-off is that your phone and your laptop keep separate logs, and clearing site data wipes it. **Guide → Export backup** writes a JSON file; **Import backup** reads one back. Export before switching phones.

## Changing the plan

Everything lives in `assets/app.js`:

- `EQUIP` / `DEFAULT_EQ` — the equipment list and which switches start on.
- `SIDE_DELT`, `REAR_DELT`, `HAM_CURL`, `CALF`, `TRI_MAIN`, `BICEP`, `ABS` — pools shared across days.
- `PLAN` — the five days, each a list of slots. A slot sets the role, set count and rep range; `opts` is the list of exercises that can fill it.

An exercise is `o(id, name, equipment, extra)`:

```js
o("kb-goblet", "Goblet Squat", ["kettlebell"])
o("bw-plank",  "Plank", [], { bw: true, time: true })
o("db-lunge",  "Dumbbell Walking Lunge", ["dumbbell"], { perLeg: true })
```

`equipment` is an array of `EQUIP` ids — all of them must be switched on for the exercise to appear. An empty array means bodyweight, always available. In `extra`: `bw` replaces the weight field with a "Bodyweight" marker, `time` logs seconds instead of reps, `perLeg` labels the field "per side", and `lo` / `hi` override the slot's rep range for that one exercise.

Give every slot at least one option with an empty equipment array and the plan can never strand you with an unfillable card.

After editing any file, bump `CACHE` in `sw.js` — otherwise phones that already installed it keep serving the old version from cache.

## Licence

MIT. It's your training log; do what you like with it.
