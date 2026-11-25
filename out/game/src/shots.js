import { RECIPES, STATIONS } from './config.js';
import { makeOrder } from './orders.js';
import { steamPuff } from './effects.js';

function stagedOrder(recipeId, patience, maxPatience) {
  const order = makeOrder(false);
  order.recipe = RECIPES.find((recipe) => recipe.id === recipeId);
  order.patience = patience;
  order.maxPatience = maxPatience;
  return order;
}

export function applyShot(state, shot) {
  state.shotMode = shot;
  if (shot === 'start') {
    state.screen = 'title';
    return;
  }

  if (shot === 'cover') {
    state.screen = 'playing';
    state.timeLeft = 84;
    state.elapsed = 96;
    state.coins = 158;
    state.combo = 3;
    state.bestCombo = 3;
    state.dishes = 5;
    state.orders = [
      stagedOrder('geprek', 14, 54),
      stagedOrder('mie-goreng', 39, 60),
      stagedOrder('campur', 52, 64),
    ];
    state.plate = ['mie-goreng', 'telur-dadar'];
    state.windowPlate = ['nasi-matang', 'ayam-goreng', 'sambal'];
    state.windowPlateT = 999;
    Object.assign(state.chef, { x: 880, y: 440, tx: 880, ty: 440, dir: -1 });
    state.carried = 'sayur-potong';
    state.burners[0] = { item: 'nasi-mentah', progress: 0.6, state: 'cooking', cookTime: 5.8, burnT: 0 };
    state.board = { item: 'sayur-potong', progress: 0, state: 'done' };
    for (let i = 0; i < 6; i++) steamPuff(state, STATIONS.stove.burners[0].x, 200);
    return;
  }

  if (shot === 'rush') {
    state.screen = 'playing';
    state.timeLeft = 38;
    state.elapsed = 142;
    state.coins = 226;
    state.combo = 4;
    state.bestCombo = 4;
    state.dishes = 9;
    state.hearts = 2;
    state.rush = true;
    state.rushFlash = 999;
    state.orders = [
      stagedOrder('geprek-sayur', 8, 54),
      stagedOrder('geprek', 25, 58),
      stagedOrder('mie-goreng', 42, 64),
      stagedOrder('campur', 50, 62),
    ];
    state.plate = ['nasi-matang'];
    state.windowPlate = null;
    Object.assign(state.chef, { x: 560, y: 365, tx: 560, ty: 365, dir: -1 });
    state.carried = 'ayam-mentah';
    state.burners[0] = { item: 'ayam-potong', progress: 0.7, state: 'cooking', cookTime: 4.8, burnT: 0 };
    state.burners[1] = { item: 'mie-mentah', progress: 0.35, state: 'cooking', cookTime: 5.2, burnT: 0 };
    state.board = { item: 'sayur-mentah', progress: 0.5, state: 'chopping' };
    for (let i = 0; i < 8; i++) {
      for (const burner of STATIONS.stove.burners) steamPuff(state, burner.x, 200);
    }
    return;
  }

  if (shot === 'end') {
    state.screen = 'end';
    state.endReason = 'time';
    state.timeLeft = 0;
    state.elapsed = 180;
    state.coins = 328;
    state.combo = 0;
    state.bestCombo = 6;
    state.dishes = 14;
    state.served = 14;
    state.wrong = 1;
    state.hearts = 2;
    state.stars = 3;
    state.orders = [];
  }
}
