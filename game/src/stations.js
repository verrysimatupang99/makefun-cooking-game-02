import { ITEMS, RECIPES, STATIONS, TIMING } from './config.js';
import { findMatchingOrder, servePayout } from './orders.js';
import { addFloater, showHint } from './world.js';
import { burst, coinSparkle, comboMilestone, steamPuff } from './effects.js';

const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

export function allStations() {
  return [
    ...STATIONS.crates.map(({ id, ix, iy }) => ({ id, ix, iy, range: 118 })),
    { id: 'stove', ix: STATIONS.stove.ix, iy: STATIONS.stove.iy, range: 132 },
    { id: 'board', ix: STATIONS.board.ix, iy: STATIONS.board.iy, range: 132 },
    { id: 'assembly', ix: STATIONS.assembly.ix, iy: STATIONS.assembly.iy, range: 132 },
    { id: 'window', ix: STATIONS.window.ix, iy: STATIONS.window.iy, range: 132 },
    { id: 'trash', ix: STATIONS.trash.ix, iy: STATIONS.trash.iy, range: 132 },
  ];
}

export function nearestStation(state) {
  let best = null;
  let bestDistance = Infinity;
  for (const station of allStations()) {
    const d = distance(state.chef.x, state.chef.y, station.ix, station.iy);
    if (d < station.range && d < bestDistance) { best = station; bestDistance = d; }
  }
  return best;
}

export function stationAtPoint(x, y) {
  for (const crate of STATIONS.crates) {
    if (x >= crate.x && x <= crate.x + crate.w && y >= crate.y && y <= crate.y + crate.h) return { id: crate.id, ix: crate.ix, iy: crate.iy };
  }
  for (const [id, rect] of [['stove', STATIONS.stove], ['board', STATIONS.board], ['assembly', STATIONS.assembly], ['window', STATIONS.window], ['trash', STATIONS.trash]]) {
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return { id, ix: rect.ix, iy: rect.iy };
  }
  return null;
}

function nearestBurner(state) {
  let best = 0;
  let bestDistance = Infinity;
  STATIONS.stove.burners.forEach((burner, index) => {
    const d = distance(state.chef.x, state.chef.y, burner.x, burner.y);
    if (d < bestDistance) { best = index; bestDistance = d; }
  });
  return best;
}

export function plateCompletesRecipe(plate) {
  const components = new Set(plate.map((id) => ITEMS[id]?.component).filter(Boolean));
  return RECIPES.find((recipe) => recipe.components.length === components.size && recipe.components.every((part) => components.has(part))) ?? null;
}

export function isPlate(carried) {
  return Boolean(carried && typeof carried === 'object' && carried.plate);
}

export function pressInteract(state, audio) {
  const station = nearestStation(state);
  if (!station) return;

  if (station.id.startsWith('crate-')) {
    const crate = STATIONS.crates.find((entry) => entry.id === station.id);
    if (state.carried) { audio.error(); showHint(state, 'Tangan penuh! Taruh atau buang dulu.'); return; }
    state.carried = crate.item;
    audio.pickup();
    burst(state, crate.ix, crate.iy, 5, '#f2b705');
    return;
  }

  if (station.id === 'stove') {
    const burnerIndex = nearestBurner(state);
    const burner = state.burners[burnerIndex];
    const position = STATIONS.stove.burners[burnerIndex];
    if (burner.state === 'empty') {
      if (!state.carried || isPlate(state.carried)) { audio.error(); showHint(state, 'Bawa bahan mentah ke kompor!'); return; }
      const food = ITEMS[state.carried];
      if (!food?.cooksTo) { audio.error(); showHint(state, 'Bahan ini tidak dimasak di kompor.'); return; }
      burner.item = state.carried;
      burner.progress = 0;
      burner.state = 'cooking';
      burner.cookTime = food.cookTime;
      state.carried = null;
      audio.place();
      steamPuff(state, position.x, position.y - 20);
      return;
    }
    if (burner.state === 'cooking') { showHint(state, 'Masih dimasak... tunggu sampai matang!'); return; }
    if (state.carried) { audio.error(); showHint(state, 'Tangan penuh!'); return; }
    state.carried = burner.item;
    burner.item = null;
    burner.progress = 0;
    burner.burnT = 0;
    burner.state = 'empty';
    audio.pickup();
    return;
  }

  if (station.id === 'board') {
    const board = state.board;
    if (board.state === 'empty') {
      if (!state.carried || isPlate(state.carried)) { audio.error(); showHint(state, 'Bawa ayam atau sayur ke talenan!'); return; }
      const food = ITEMS[state.carried];
      if (!food?.chopsTo) { audio.error(); showHint(state, 'Bahan ini tidak perlu dicincang.'); return; }
      board.item = state.carried;
      board.progress = 0;
      board.state = 'chopping';
      state.carried = null;
      audio.place();
      return;
    }
    if (board.state === 'chopping') { showHint(state, 'Tahan E untuk mencincang!'); return; }
    if (board.state === 'done') {
      if (state.carried) { audio.error(); showHint(state, 'Tangan penuh!'); return; }
      state.carried = board.item;
      board.item = null;
      board.progress = 0;
      board.state = 'empty';
      audio.pickup();
    }
    return;
  }

  if (station.id === 'assembly') {
    if (!state.carried) {
      if (!state.plate.length) { showHint(state, 'Piring kosong. Taruh masakan di sini!'); return; }
      state.carried = { plate: true, items: state.plate };
      state.plate = [];
      audio.pickup();
      return;
    }
    if (isPlate(state.carried)) { audio.error(); showHint(state, 'Piring sudah di tangan — sajikan di jendela!'); return; }
    const food = ITEMS[state.carried];
    if (!food || food.kind !== 'food') { audio.error(); showHint(state, 'Masak atau cincang dulu sampai jadi!'); return; }
    if (state.plate.length >= 3) { audio.error(); showHint(state, 'Piring penuh (maksimal 3)!'); return; }
    if (state.plate.some((id) => ITEMS[id].component === food.component)) { audio.error(); showHint(state, `Sudah ada ${food.name} di piring!`); return; }
    state.plate.push(state.carried);
    state.carried = null;
    audio.place();
    burst(state, STATIONS.assembly.plateX, STATIONS.assembly.plateY, 7, '#2e9e5b');
    const completed = plateCompletesRecipe(state.plate);
    if (completed) {
      audio.cookDone();
      addFloater(state, STATIONS.assembly.plateX, STATIONS.assembly.plateY - 60, `${completed.name} SIAP!`, '#2e9e5b');
    }
    return;
  }

  if (station.id === 'window') {
    if (!isPlate(state.carried)) { audio.error(); showHint(state, 'Bawa piring lengkap ke jendela saji!'); return; }
    const order = findMatchingOrder(state, state.carried.items);
    if (!order) {
      state.wrong++;
      state.combo = 0;
      state.carried = null;
      audio.error();
      state.shake = 10;
      addFloater(state, STATIONS.window.plateX, STATIONS.window.plateY - 50, 'SALAH PESANAN!', '#d92632');
      showHint(state, 'Tidak ada pesanan yang cocok — piring dibuang.');
      return;
    }
    state.combo++;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const payout = servePayout(order, state.combo);
    state.coins += payout.coins;
    state.dishes++;
    state.served++;
    state.orders = state.orders.filter((entry) => entry.id !== order.id);
    state.windowPlate = state.carried.items.slice();
    state.windowPlateT = 1.5;
    state.carried = null;
    audio.ding();
    audio.coin();
    coinSparkle(state, STATIONS.window.plateX, STATIONS.window.plateY - 12);
    addFloater(state, STATIONS.window.plateX, STATIONS.window.plateY - 50, `+${payout.coins} koin${payout.tip ? ` (tip +${payout.tip})` : ''}`, '#f2b705');
    if (state.combo >= 2) {
      addFloater(state, state.chef.x, state.chef.y - 62, `KOMBO x${state.combo}!`, '#f2b705');
      if (state.combo % 2 === 0) comboMilestone(state, STATIONS.window.plateX, STATIONS.window.plateY, state.combo);
    }
    return;
  }

  if (station.id === 'trash') {
    if (!state.carried) { showHint(state, 'Tidak ada yang dibuang.'); return; }
    state.carried = null;
    audio.place();
    addFloater(state, STATIONS.trash.cx, STATIONS.trash.cy - 60, 'Dibuang', '#9fb3bd');
  }
}

let chopSoundTimer = 0;

export function holdInteract(state, dt, audio) {
  const station = nearestStation(state);
  if (station?.id !== 'board' || state.board.state !== 'chopping') return;
  const board = state.board;
  const food = ITEMS[board.item];
  board.progress += dt / (food.chopTime || TIMING.chopTime);
  chopSoundTimer -= dt;
  if (chopSoundTimer <= 0) { audio.chop(); chopSoundTimer = 0.3; }
  if (Math.random() < dt * 9) burst(state, STATIONS.board.cx, STATIONS.board.cy, 1, '#8a5426');
  if (board.progress >= 1) {
    board.item = food.chopsTo;
    board.progress = 0;
    board.state = 'done';
    audio.chopDone();
    addFloater(state, STATIONS.board.cx, STATIONS.board.cy - 60, `${ITEMS[board.item].name} siap!`, '#2e9e5b');
  }
}

export function updateCooking(state, dt, audio) {
  state.burners.forEach((burner, index) => {
    const position = STATIONS.stove.burners[index];
    if (burner.state === 'cooking') {
      burner.progress += dt / (burner.cookTime || 6);
      if (Math.random() < dt * 7) steamPuff(state, position.x, position.y - 24);
      if (burner.progress >= 1) {
        burner.item = ITEMS[burner.item].cooksTo;
        burner.progress = 1;
        burner.state = 'done';
        burner.burnT = 0;
        audio.cookDone();
        addFloater(state, position.x, position.y - 70, `${ITEMS[burner.item].name} MATANG!`, '#2e9e5b');
      }
    } else if (burner.state === 'done') {
      burner.burnT += dt;
      if (Math.random() < dt * 2.5) steamPuff(state, position.x, position.y - 24);
      if (burner.burnT >= TIMING.burnAfterDone) {
        burner.item = 'hangus';
        burner.state = 'burnt';
        audio.burn();
        state.shake = 12;
        state.flash = 0.7;
        state.flashColor = '#d92632';
        addFloater(state, position.x, position.y - 70, 'HANGUS! Buang ke tong sampah.', '#d92632');
      }
    }
  });
  if (state.windowPlateT > 0) {
    state.windowPlateT -= dt;
    if (state.windowPlateT <= 0) state.windowPlate = null;
  }
}
