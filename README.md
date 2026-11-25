# Dapur Kilat

Dapur Kilat is a fast-paced Indonesian warung cooking game built with a 1280 × 720 canvas and plain browser ES modules. Take customer tickets, gather ingredients, cook and chop at the stations, assemble the requested dish, and serve it before patience runs out.

## Play

Open `game/index.html` in a modern browser, or run the static server:

```sh
node serve.ts
```

Controls: WASD or arrow keys to move; click a station to walk there; E or Space to interact; hold E to chop; P or Escape to pause; M to toggle music; R to restart after a shift.

The kitchen has ingredient crates for rice, chicken, egg, vegetables, sambal and noodles. The five recipes are Nasi Ayam Geprek, Nasi Telur Dadar, Ayam Geprek Sayur, Nasi Campur Kilat and Mie Goreng. Rice, chicken, egg and noodles cook on the two-burner stove; chicken and vegetables are chopped on the board. Keep an eye on the cooking timer so food does not burn.

A shift lasts 180 seconds. The last 45 seconds are Rush Hour; tips reward quick service, consecutive correct dishes build a combo, and expired orders cost hearts. Steam, coin sparkles and combo bursts respond to the action.

The game has no external runtime dependencies or network requests. Art is drawn on canvas and sound is synthesized with WebAudio. Screenshot scenes are staged with `?shot=start|cover|rush|end&seed=7`.

## Build the submission dossier

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The entry script copies `game/` and `screenshots/` into the output directory and creates `dossier.json` using the vendored make.fun game library.

## Structure

- `game/index.html` — canvas shell and ES module entry
- `game/src/config.js` — recipes, ingredients, timings and station layout
- `game/src/world.js` — mutable game state and collision rules
- `game/src/stations.js` — cooking, chopping, assembling and serving
- `game/src/orders.js` — ticket queue, patience and scoring
- `game/src/input.js` — keyboard and pointer input
- `game/src/effects.js` — steam, sparkles, combo feedback and particle updates/drawing
- `game/src/audio.js` — synthesized sound and music
- `game/src/render.js` — kitchen, tickets, HUD and screen rendering
- `game/src/shots.js` — deterministic screenshot scenes
- `game/src/main.js` — update loop and game state machine
- `serve.ts` — small static server on port 8080

## License

MIT. Copyright (c) 2026 Immanuel Simatupang.

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/verrysimatupang99/makefun-cooking-game-02/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/verrysimatupang99/makefun-cooking-game-02/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Built for the [best cooking game bounty](https://make.fun/bounty/best-cooking-game-20261125-0137) on make.fun.
