# App Store screenshots

`screenshots/` holds the images uploaded to App Store Connect for version 1.0 (retaken 2026-10-07, after Today went down to two tiles):

- `iphone-*.png`: 1206 × 2622, the "iPhone with Dynamic Island (medium display)" slot. Apple scales them for other iPhones.
- `duo-*.png`: 1398 × 2034, the iPhone Duo slot (the unfolded screen; captured at 699 × 1017 points, 2x).
- `ipad-*.png`: 2064 × 2752, the iPad 13" slot. iPad screenshots are required because `supportsTablet` is on.

They show the real app, not mockups, filled with made-up sample data.

- **1-6:** Sam (they/them), on estradiol, in the default Prism theme.
- **7-10:** Eli (he/him), a trans man on weekly testosterone, in the Tidepool theme (`?persona=eli&palette=tidepool`).

This is how they were made.

## Header and Search Results artwork

`artwork/` holds the two creative assets (5244 × 2950) on the version page:

- `header-5244x2950.png`: no text, because the App Store draws the app name and icon over the header.
- `search-results-5244x2950.png`: the icon and "Your journey. Your way.".

Both show three real screenshots: Sam's Journey, Sam's Today and Eli's Today. They're built from `artwork/banner.html` (add `#search` for the version with text), rendered at 2622 × 1475 points, 2x.

## Demo mode

`apps/mobile/lib/demo/` is demo mode. It is only active when both of these are true:

- the build has `EXPO_PUBLIC_DEMO=1`
- the app is running on web

In demo mode:

- Every Supabase request is answered from `fixtures.ts`.
- The real network is never used. The Supabase URL is also pointed at a host that doesn't exist.
- The clock is set to 7:42 AM, so Today always has a dose due.

Phone builds never include this code.

These URL options change what the demo shows:

- `?theme=dark`
- `?palette=coral-reef` (or any other theme key)
- `?time=HH:MM`
- `?persona=eli`

## Retaking them

```sh
cd apps/mobile
EXPO_PUBLIC_DEMO=1 EXPO_PUBLIC_SUPABASE_URL=http://demo.localhost EXPO_PUBLIC_SUPABASE_ANON_KEY=demo \
  npx expo start --web --port 8099 --no-dev --minify

# in another terminal (Git Bash needs MSYS_NO_PATHCONV=1 so /paths stay paths)
MSYS_NO_PATHCONV=1 SHOTS=../../docs/app-store/screenshots W=402 H=874 DPR=3 \
  node scripts/app-store-screenshots.mjs iphone-1-today=/today iphone-2-care=/care
```

For iPad, use `W=1032 H=1376 DPR=2`. For iPhone Duo, use `W=699 H=1017 DPR=2`. The script drives headless Chrome through the DevTools protocol, because Chrome's `--window-size` flag doesn't give the exact page size.

## Notes

- Run the server with `--no-dev`. In dev mode Expo can draw a ⚡ tools button in the corner, and it ends up in the shot.
- After the server starts, the first page or two may come out blank while the bundle builds. Retake them.
- With the default 9 s wait, many shots came out blank (the dark background only). `WAIT=15000` fixes that. A blank shot is easy to spot by its size: under 20 KB.
- Give `SHOTS` a Windows path (`cygpath -w`). With `MSYS_NO_PATHCONV=1`, a Git Bash path like `/c/Users/...` ends up in `C:\c\Users\...`.

- Apple accepts PNG without transparency. These are RGB.
- On the version page, the upload control is under "App Previews and Screenshots". Choose a device tab first.
