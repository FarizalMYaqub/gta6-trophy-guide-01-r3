[![Leonida Legend on make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/FarizalMYaqub/gta6-trophy-guide-01-r3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/FarizalMYaqub/gta6-trophy-guide-01-r3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Legend

An offline trophy guide and tracker for **Grand Theft Auto VI** on PlayStation 5: all **55 trophies** (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden) with a checklist that saves in the browser, a roadmap to platinum, a missable warning, and a guide for every trophy with its sources.

Built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Tracker**: tick trophies off as they pop. Progress saves in localStorage, with export and import as JSON so you can back it up or move it to another device.
- **Filters**: search by name or description, filter by kind (Story, Collectibles, Activities, Missable) and by grade, hide earned trophies.
- **Spoiler setting**: story trophies stay hidden until you earn them. Turn the setting off to read every guide.
- **Roadmap to platinum**: five stages in the order that wastes the least time, each with its own completion badge.
- **Missable warning**: only one trophy is confirmed missable, Positive Mental Attitude. The guide explains why and what to do in Chapter 1.
- **Guides with sources**: every trophy has a guide written in our own words from the official description, plus links to the sources used (Exophase, PSNProfiles, Push Square, KeenGamer, PlanetGTA6, OutputLag). Where the community has not pinned down a method yet, the guide says so plainly instead of inventing steps.
- **Counters**: trophies with a numeric target (250 stunts, 100 WAiNK It spots, $250,000 laundered and more) have a counter so you can track progress toward the target.
- **Offline**: static files only. No network, no account, no tracking.

## The trophy list

Names, descriptions, grades and hidden flags are the official PlayStation 5 list as published on Exophase and PSNProfiles on 18 November 2026. The data lives in `app/data/trophies.json`, one entry per trophy with its guide and sources.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or open `app/index.html` through any static file server.

## Build the entry

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with the kit's `buildDossier` library. It needs Node 22 and nothing else.

## Files

- `app/index.html`, `app/app.js`, `app/style.css`: the guide and tracker.
- `app/data/trophies.json`: the 55 official trophies with guides and sources.
- `screenshots/`: renders of the app.
- `main.ts`: entrypoint that assembles the output.
- `serve.ts`: static server for local testing.
- `vendor/makefun-frontend.ts`: the kit's dossier library, copied unchanged.

## Notes

- Unofficial fan guide. Not affiliated with Rockstar Games or Sony. No Rockstar logo or official artwork is used.
- Cheats disable trophies, and there is no mission replay, so keep a manual save at the start of every chapter.
- All 55 trophies unlock in single player. There are no online trophies.

## License

MIT. See [LICENSE](LICENSE).
