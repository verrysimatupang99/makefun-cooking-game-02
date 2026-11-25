import { CANVAS_H, CANVAS_W, STATIONS, TIMING } from './config.js';
import { AudioEngine } from './audio.js';
import { updateEffects, steamPuff } from './effects.js';
import { Input } from './input.js';
import { updateOrders, starsFor } from './orders.js';
import { drawFrame } from './render.js';
import { applyShot } from './shots.js';
import { holdInteract, pressInteract, stationAtPoint, updateCooking } from './stations.js';
import { addFloater, collideChef, createGame, resetGame } from './world.js';

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const input = new Input(canvas);
const audio = new AudioEngine();
input.onFirstGesture = () => audio.unlock();

const params = new URLSearchParams(window.location.search);
const seed = params.get('seed');
if (seed !== null) {
  let randomState = (Number.parseInt(seed, 10) || 7) >>> 0;
  Math.random = () => {
    randomState = (randomState + 0x6d2b79f5) >>> 0;
    let value = randomState;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const state = createGame();
const shot = params.get('shot');
if (shot) applyShot(state, shot);
window.__dapur = { state, audio, resetGame, pressInteract };

function endShift(reason) {
  state.screen = 'end';
  state.endReason = reason;
  state.stars = starsFor(state.dishes);
  audio.setSizzle(false);
  if (reason === 'hearts') audio.heartLost();
}

function moveChef(dt) {
  const chef = state.chef;
  const vector = input.moveVector();
  let moving = false;
  if (vector.x || vector.y) {
    chef.x += vector.x * TIMING.chefSpeed * dt;
    chef.y += vector.y * TIMING.chefSpeed * dt;
    chef.tx = chef.x;
    chef.ty = chef.y;
    chef.pendingStation = null;
    if (vector.x) chef.dir = vector.x > 0 ? 1 : -1;
    moving = true;
  } else {
    const dx = chef.tx - chef.x;
    const dy = chef.ty - chef.y;
    const remaining = Math.hypot(dx, dy);
    if (remaining > 6) {
      const step = Math.min(remaining, TIMING.chefSpeed * dt);
      chef.x += dx / remaining * step;
      chef.y += dy / remaining * step;
      if (dx) chef.dir = dx > 0 ? 1 : -1;
      moving = true;
      if (remaining - step <= 6) {
        chef.tx = chef.x;
        chef.ty = chef.y;
        if (chef.pendingStation) {
          chef.pendingStation = null;
          pressInteract(state, audio);
        }
      }
    }
  }
  chef.moving = moving;
  if (moving) chef.walkPhase += dt;
  collideChef(chef);
}

function updatePlaying(dt) {
  state.timeLeft -= dt;
  state.elapsed += dt;
  if (!state.rush && state.timeLeft <= TIMING.rushStart) {
    state.rush = true;
    state.rushFlash = 3;
    audio.rush();
    addFloater(state, CANVAS_W / 2, 200, 'RUSH HOUR!', '#d92632');
  }
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endShift('time');
    return;
  }

  for (const order of updateOrders(state, dt)) {
    state.hearts--;
    state.combo = 0;
    state.shake = 14;
    state.flash = 0.75;
    state.flashColor = '#d92632';
    audio.heartLost();
    addFloater(state, CANVAS_W / 2, 220, `PESANAN ${order.recipe.name.toUpperCase()} KADALUWARSA!`, '#d92632');
    if (state.hearts <= 0) { endShift('hearts'); return; }
  }

  updateCooking(state, dt, audio);
  audio.setSizzle(state.burners.some((burner) => burner.state === 'cooking'));

  if (input.mouse.clicked) {
    const target = stationAtPoint(input.mouse.clickX, input.mouse.clickY);
    if (target) {
      state.chef.tx = target.ix;
      state.chef.ty = target.iy;
      state.chef.pendingStation = target.id;
    } else {
      state.chef.tx = input.mouse.clickX;
      state.chef.ty = Math.max(140, Math.min(640, input.mouse.clickY));
      state.chef.pendingStation = null;
    }
  }
  moveChef(dt);
  if (input.pressed('KeyE') || input.pressed('Space')) pressInteract(state, audio);
  if (input.interactHeld()) holdInteract(state, dt, audio);
  if (input.pressed('KeyP') || input.pressed('Escape')) {
    state.screen = 'paused';
    audio.setSizzle(false);
  }
  if (input.pressed('KeyM')) state.muted = !audio.toggleMusic();
}

let lastFrame = performance.now();
let shotSteamTimer = 0;

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  const time = now / 1000;

  if (state.shotMode) {
    shotSteamTimer -= dt;
    if (shotSteamTimer <= 0) {
      shotSteamTimer = 0.34;
      state.burners.forEach((burner, index) => {
        if (burner.state === 'cooking') {
          const position = STATIONS.stove.burners[index];
          steamPuff(state, position.x, position.y - 22);
        }
      });
    }
  } else if (state.screen === 'title') {
    if (input.anyConfirm()) { resetGame(state); audio.unlock(); }
  } else if (state.screen === 'playing') {
    updatePlaying(dt);
  } else if (state.screen === 'paused') {
    if (input.pressed('KeyP') || input.pressed('Escape')) state.screen = 'playing';
    if (input.pressed('KeyM')) state.muted = !audio.toggleMusic();
  } else if (state.screen === 'end' && (input.pressed('KeyR') || input.pressed('Enter'))) {
    resetGame(state);
  }

  updateEffects(state, dt);
  drawFrame(context, state, time);
  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
