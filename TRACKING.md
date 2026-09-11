# Download tracking

Added 2026-09-11. Before this, the only download signal was GitHub's per-asset
counter on the releases page, which cannot say which platform, which version or
where the visitor came from, and resets when an asset is re-uploaded.

**Nothing is displayed on the site.** The count is recorded and that is all.
That was the explicit instruction; do not add a counter to the page without
being asked.

## The path

```
Download anchor (src/sections/downloads.tsx)
  └─ trackDownload()          src/lib/track.ts     sendBeacon, never blocks
       └─ POST /api/track     api/track.ts         Vercel edge, holds the key
            └─ teminali_events in the DukaBot Supabase project
```

The browser cannot write the row itself: the table has RLS on and no policies,
so the anon key is refused by design. The service-role key lives only in the
edge function's environment.

`api/track.ts` is the only server-side code in this repo. Two consequences:

- `vercel.json`'s SPA catch-all is scoped to `/((?!api/).*)` so it cannot
  swallow the function. If you ever widen it back to `/(.*)`, tracking dies
  silently and `/api/track` starts returning the index page with a 200.
- `tsconfig.api.json` puts `api/` under the same `tsc -b` that covers `src`, so
  `npm run typecheck` and `npm run build` both cover the endpoint.

## The table

`teminali_events`, created by
`my_projects/teminali/dukabot/supabase/migrations/20260911000001_teminali_events.sql`.

It is general, not downloads-only — an `event_type` column carries the kind, so
a later signup or demo-play event needs no migration. Only `download` is emitted
today, and `api/track.ts` rejects anything else with a 400. Widen the `EVENTS`
set there and the table comment together.

Only a real release asset counts. Both Download anchors fall back to the
releases page when the current release has no build for a platform; that
fallback is a navigation, not a download, and is not recorded.

## Environment

| Variable | Where it comes from |
| --- | --- |
| `SUPABASE_URL` | DukaBot project URL — `dukabot/apps/web-app/.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Same file. Never commit it; never expose it to the client. |

Set on **production** and **development**. Preview is *not* set: the Vercel CLI
(2.105.0) loops on its own documented `--value … --yes` command for preview
branches. This is not worth fixing — preview traffic polluting real download
counts would be worse than not recording it. An unset key makes the endpoint log
a warning and return 204; it never throws.

## Privacy

No IP is stored or hashed. `visitor_id` is a random id in localStorage,
`session_id` a random id in sessionStorage, `country` is the Vercel edge's own
geo header, and `referrer` is a hostname, not a URL. Storage being unavailable
is handled: the event still sends, without ids.

The endpoint is public and unauthenticated, so the counts are inflatable by
anyone who reads this file. That is the same exposure as the DukaBot storefront
tracker and is accepted for the same reason: these are product signals, not
billing.

## Verifying it live

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://teminali.dukabotai.com/api/track
#   405 — the function is live and the SPA rewrite is not swallowing it

curl -s -X POST https://teminali.dukabotai.com/api/track \
  -H 'Content-Type: application/json' -d '{"event_type":"nonsense"}'
#   400 Unknown event_type

curl -s -o /dev/null -w '%{http_code}\n' -X POST https://teminali.dukabotai.com/api/track \
  -H 'Content-Type: application/json' \
  -d '{"event_type":"download","platform":"mac-arm","version":"0.0.9","asset_name":"verify.dmg","asset_size":1}'
#   202 written · 502 Supabase refused · 204 key unset
```

The three codes are distinguishable on purpose: 204 and 502 mean different
things and would otherwise both look like "it didn't work". A 202 writes a real
row — delete test rows afterwards.
