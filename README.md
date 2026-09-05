# HECTAR

The world's land cut into 999 equal plots. Every one is its own token, its
own market and its own set of holders.

`HECTAR` is a placeholder name — it is one string in `src/lib/site-config.ts`
plus the `NEXT_PUBLIC_HECTAR_*` env prefix, so renaming is a two-line change.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · wagmi v3 + viem ·
TypeScript. Injected wallets only, Robinhood Chain, no backend.

## The globe is the product

`src/components/Globe.tsx` draws the coastline, the graticule and all 999 hex
plots on a canvas, and colours only the ground that actually has a market. It
is the artwork, the proof of scarcity and the activity counter at once, which
is why it is the only place on the page allowed to burn.

Every point on it — plot centres, plot corners, coastlines, graticule — is
turned into a unit vector once at module load, so a frame is a rotation, a
back-hemisphere cull and an orthographic projection with no trigonometry per
point. That is what makes 999 clickable hexes on a spinning sphere cheap
enough to run at 60fps.

Geometry is generated once and committed — nothing is fetched at build or run
time:

```bash
python scripts/build-parcels.py
```

That script reads Natural Earth's public-domain 110m land and country files
(committed next to it) and writes `src/data/parcels.json` and
`src/data/coastline.json`.

**Why an equal-area projection.** Plots have to be genuinely equal or "one
plot" means nothing. The grid is laid in Equal Earth, which is equal-area, so
every hexagon covers the same amount of planet. On a lat/lon grid a plot in
Norway would quietly be worth a fraction of one in Kenya.

**How it lands on exactly 999.** A binary search on the hex radius finds the
smallest lattice with at least 999 land cells, then the overshoot is dropped
lowest-land-fraction first — which shaves coastal slivers rather than punching
holes inland. Plots are numbered north to south.

The counts that fall out of this are facts about area, not editorial choices:
Russia holds 108 plots, Antarctica 97, Canada 71, the United States 64.

## The contract this page expects

The ABI in `src/lib/hectarAbi.ts` is specced around the map rather than the
other way round:

| Function | Why |
| --- | --- |
| `claim(uint256 parcelId) payable` | Claiming is by id, so you take the ground you picked rather than whatever the next mint hands you. |
| `claimedBitmap() view returns (uint256[4])` | The map needs all 999 states every time it draws. 999 bits pack into four words, so that is one view call instead of 999 `ownerOf` lookups or an indexer. Bit *n* of word *n >> 8* is plot *n + 1*. |
| `totalSupply() view returns (uint256)` | Claim count. |

If the deployed contract names these differently, that one file is the only
thing to change.

## Pre-launch state

The site ships before the contract does, so it runs entirely on env vars:

- The globe draws a seeded starting state behind a `LIVE PREVIEW` tag. Those
  markets are not on-chain — the tag is what keeps the counters from asserting
  activity that has not happened. Three plots, a handful of wallets each,
  market caps in the low thousands: a fresh project showing sixty thousand
  owners would be advertising a lie about its size even with the word
  "preview" over it.
- Wallets connect. There is no contract to call yet, so the buy button itself
  stays disabled and says so rather than looking live and doing nothing.
- Everything flips automatically once `NEXT_PUBLIC_HECTAR_CONTRACT_ADDRESS`,
  `NEXT_PUBLIC_HECTAR_PRICE_ETH` and `NEXT_PUBLIC_HECTAR_LIVE=true` exist:
  the tag disappears, the figures read the chain, the button buys. No code
  change. `src/lib/worldState.tsx` is that seam.
- No yield rate, floor, valuation or launch date appears anywhere. None of it
  is decided, and inventing a figure here is the one thing on this page a
  holder could actually be hurt by.

## Setup

```bash
npm install
cp .env.example .env.local   # optional — it runs with no env at all
npm run dev
```

## Going live

1. Deploy a contract exposing the three functions above.
2. Set `NEXT_PUBLIC_HECTAR_CONTRACT_ADDRESS`, `NEXT_PUBLIC_HECTAR_PRICE_ETH`
   and `NEXT_PUBLIC_HECTAR_LIVE=true`.
3. Re-verify the Robinhood Chain values in `src/lib/chain.ts` against
   https://docs.robinhood.com/chain before pointing this at real funds. They
   were gathered from third-party sources and are marked as such in the file.
4. Set `NEXT_PUBLIC_SITE_URL` so metadata, `sitemap.xml` and `robots.txt` point
   at the real domain.

Social links stay hidden until their env vars are set, so no dead link ships.

## Art direction

A phosphor read-out of a planet. Near-black ground with a green cast, pale
neutral line work — coastlines, graticule, 999 empty hexagons — and saturated
green `#2ee27b` reserved for one thing only: ground that has a market. The
brighter a hectar burns the more is trading on it, and the one that has pulled
in the most owners flips to cyan `#5ce4ff`, because "people are piling in" is a
different fact from "this trades" and two facts drawn in one colour read as
one. Colour is never decoration here; on a sphere of 999 identical shapes it
has to mean activity or it means nothing.

The atmosphere halo is lit green rather than blue, so the whole sphere reads as
something lit from within by its own markets rather than a photograph of Earth.

The accent token is named `--signal`, not `--green`. It means "this ground has
a market" — the hue is free to change again without the name turning into a
lie.

Display type is heavy and wide with a signal keyline, the way a game wordmark
is built; data type is IBM Plex Mono, tabular, so numbers read as a trading
dashboard rather than as marketing copy. The loud voice sells the world, the
quiet one reports on it.

## Attribution

Coastlines and country boundaries from [Natural Earth](https://www.naturalearthdata.com/),
public domain. Projection: Equal Earth (Šavrič, Patterson & Jenny, 2018).

## Verification

`npx tsc --noEmit`, `npx eslint` and `npx next build` all pass clean.
