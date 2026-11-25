import { ITEMS, RECIPES, TIMING } from './config.js';

let nextId = 1;

export function makeOrder(rush) {
  const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  const patience = TIMING.patienceMin + Math.random() * (TIMING.patienceMax - TIMING.patienceMin);
  return { id: nextId++, recipe, patience, maxPatience: patience, rush };
}

export function nextSpawnDelay(rush) {
  const min = rush ? TIMING.spawnRushMin : TIMING.spawnMin;
  const max = rush ? TIMING.spawnRushMax : TIMING.spawnMax;
  return min + Math.random() * (max - min);
}

export function updateOrders(state, dt) {
  state.spawnT -= dt;
  if (state.spawnT <= 0 && state.orders.length < TIMING.maxOrders) {
    state.orders.push(makeOrder(state.rush));
    state.spawnT = nextSpawnDelay(state.rush);
  }
  const expired = [];
  state.orders = state.orders.filter((order) => {
    order.patience -= dt;
    if (order.patience > 0) return true;
    expired.push(order);
    return false;
  });
  return expired;
}

export function findMatchingOrder(state, plateItems) {
  const got = new Set(plateItems.map((id) => ITEMS[id]?.component).filter(Boolean));
  return state.orders.find(({ recipe }) => recipe.components.length === got.size && recipe.components.every((part) => got.has(part))) ?? null;
}

export function servePayout(order, combo) {
  const patienceRatio = Math.max(0, order.patience / order.maxPatience);
  const tip = Math.round(TIMING.maxTip * patienceRatio);
  const multiplier = Math.min(TIMING.comboCap, 1 + TIMING.comboStep * Math.max(0, combo - 1));
  return { coins: Math.round((TIMING.basePay + tip) * multiplier), tip, multiplier };
}

export function starsFor(dishes) {
  return dishes >= 12 ? 3 : dishes >= 8 ? 2 : dishes >= 4 ? 1 : 0;
}
