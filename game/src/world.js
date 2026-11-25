import { CANVAS_W, CHEF_R, PLAY_BOTTOM, PLAY_TOP, SOLIDS, TIMING } from './config.js';
import { nextSpawnDelay } from './orders.js';

export function createGame() {
  return {
    screen: 'title', timeLeft: TIMING.shiftLength, elapsed: 0, coins: 0,
    combo: 0, bestCombo: 0, dishes: 0, served: 0, wrong: 0, hearts: 3,
    chef: { x: 590, y: 570, tx: 590, ty: 570, dir: 1, moving: false, walkPhase: 0, pendingStation: null },
    carried: null,
    burners: [{ item: null, progress: 0, state: 'empty', burnT: 0 }, { item: null, progress: 0, state: 'empty', burnT: 0 }],
    board: { item: null, progress: 0, state: 'empty' }, plate: [], windowPlate: null, windowPlateT: 0,
    orders: [], spawnT: 6, particles: [], floaters: [], shake: 0, flash: 0, flashColor: '#f2b705',
    rush: false, rushFlash: 0, endReason: null, stars: 0, muted: false, shotMode: null,
    hint: '', hintT: 0,
  };
}

export function resetGame(state) {
  const fresh = createGame();
  fresh.screen = 'playing';
  fresh.spawnT = nextSpawnDelay(false);
  Object.assign(state, fresh);
}

export function addFloater(state, x, y, text, color = '#f2b705') {
  state.floaters.push({ x, y, text, color, life: 1.45, maxLife: 1.45 });
}

export function showHint(state, text) {
  state.hint = text;
  state.hintT = 2.2;
}

export function collideChef(chef) {
  chef.x = Math.max(20 + CHEF_R, Math.min(CANVAS_W - 20 - CHEF_R, chef.x));
  chef.y = Math.max(PLAY_TOP + 8 + CHEF_R, Math.min(PLAY_BOTTOM - CHEF_R, chef.y));
  for (const solid of SOLIDS) {
    const x = Math.max(solid.x, Math.min(chef.x, solid.x + solid.w));
    const y = Math.max(solid.y, Math.min(chef.y, solid.y + solid.h));
    const dx = chef.x - x;
    const dy = chef.y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 >= CHEF_R * CHEF_R) continue;
    if (d2 < 0.001) {
      chef.y = solid.y + solid.h + CHEF_R;
    } else {
      const distance = Math.sqrt(d2);
      chef.x = x + dx / distance * CHEF_R;
      chef.y = y + dy / distance * CHEF_R;
    }
  }
}
