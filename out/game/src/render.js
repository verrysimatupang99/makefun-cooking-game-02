import { CANVAS_H, CANVAS_W, COMPONENT_ITEM, ITEMS, PALETTE, PLAY_BOTTOM, PLAY_TOP, RECIPES, STATIONS, TIMING } from './config.js';
import { nearestStation, plateCompletesRecipe } from './stations.js';
import { drawEffects } from './effects.js';

const FONT = '"Trebuchet MS", Verdana, sans-serif';

function rr(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function label(ctx, value, x, y, size, color, align = 'center', weight = 700) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function outlined(ctx, value, x, y, size, color, outline = PALETTE.navy, align = 'center', weight = 800) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, size / 6);
  ctx.strokeStyle = outline;
  ctx.strokeText(value, x, y);
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function panel(ctx, x, y, w, h, fill, radius = 12) {
  ctx.fillStyle = fill;
  rr(ctx, x, y, w, h, radius);
  ctx.fill();
}

export function drawFood(ctx, id, x, y, size) {
  const u = size / 20;
  ctx.save();
  ctx.translate(x, y);
  switch (id) {
    case 'nasi-mentah':
      panel(ctx, -14 * u, -5 * u, 28 * u, 19 * u, '#d9b380', 4 * u);
      ctx.fillStyle = '#f7ead1';
      ctx.beginPath(); ctx.ellipse(0, -5 * u, 12 * u, 5 * u, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 5; i++) ctx.fillRect((-8 + i * 4) * u, (-9 + (i % 2) * 3) * u, 1.6 * u, 1.6 * u);
      break;
    case 'nasi-matang':
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(0, 4 * u, 17 * u, 11 * u, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = '#d8cdb4'; ctx.lineWidth = 1.4 * u;
      ctx.beginPath(); ctx.ellipse(0, 4 * u, 17 * u, 11 * u, 0, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = '#f1e6c8';
      ctx.beginPath(); ctx.ellipse(0, 4 * u, 17 * u, 3 * u, 0, 0, Math.PI); ctx.fill();
      break;
    case 'ayam-mentah':
      ctx.fillStyle = '#f2a0a8';
      ctx.beginPath(); ctx.ellipse(0, 2 * u, 15 * u, 11 * u, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e87f8b';
      ctx.beginPath(); ctx.ellipse(-3 * u, 0, 8 * u, 5 * u, -0.3, 0, Math.PI * 2); ctx.fill();
      break;
    case 'ayam-potong':
      ctx.fillStyle = '#f2a0a8';
      for (const [dx, dy] of [[-7, 2], [2, -3], [8, 4]]) {
        ctx.beginPath(); ctx.arc(dx * u, dy * u, 6 * u, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'ayam-goreng':
      ctx.fillStyle = '#c97b1e';
      ctx.beginPath(); ctx.ellipse(0, 2 * u, 15 * u, 11 * u, -0.25, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8a83c';
      ctx.beginPath(); ctx.ellipse(-2 * u, 0, 10 * u, 7 * u, -0.25, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a5426';
      for (const [dx, dy] of [[-8, -2], [2, 4], [6, -4]]) {
        ctx.beginPath(); ctx.arc(dx * u, dy * u, 1.5 * u, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'telur-mentah':
      ctx.fillStyle = '#fff8e7';
      ctx.beginPath(); ctx.ellipse(0, 0, 11 * u, 14 * u, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8dcc0';
      ctx.beginPath(); ctx.ellipse(0, 3 * u, 8 * u, 10 * u, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'telur-dadar':
      ctx.fillStyle = '#e8a83c';
      ctx.beginPath(); ctx.ellipse(0, 2 * u, 17 * u, 10 * u, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#f7cf5a';
      ctx.beginPath(); ctx.ellipse(0, 1 * u, 14 * u, 7 * u, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#c97b1e';
      ctx.beginPath(); ctx.arc(-6 * u, -1 * u, 1.6 * u, 0, Math.PI * 2); ctx.arc(5 * u, -3 * u, 1.6 * u, 0, Math.PI * 2); ctx.fill();
      break;
    case 'sayur-mentah':
      ctx.fillStyle = '#2e9e5b';
      ctx.beginPath(); ctx.arc(0, 2 * u, 13 * u, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#57c785';
      ctx.beginPath(); ctx.arc(-4 * u, -2 * u, 8 * u, 0, Math.PI * 2); ctx.arc(5 * u, -3 * u, 6 * u, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#1e7a44'; ctx.lineWidth = 1.5 * u;
      ctx.beginPath(); ctx.moveTo(-6 * u, -6 * u); ctx.quadraticCurveTo(0, 2 * u, 6 * u, -6 * u); ctx.stroke();
      break;
    case 'sayur-potong':
      ctx.fillStyle = '#2e9e5b';
      for (const [dx, dy, r] of [[-8, 3, 5], [0, -4, 5], [8, 3, 5], [-2, 6, 4]]) {
        ctx.beginPath(); ctx.arc(dx * u, dy * u, r * u, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'mie-mentah':
      ctx.fillStyle = '#e8c48d';
      rr(ctx, -14 * u, -9 * u, 28 * u, 20 * u, 4 * u); ctx.fill();
      ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 1.6 * u;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(-11 * u, (i * 3) * u); ctx.bezierCurveTo(-3 * u, (i * 3 - 3) * u, 3 * u, (i * 3 + 3) * u, 11 * u, (i * 3) * u); ctx.stroke();
      }
      ctx.fillStyle = '#d92632';
      ctx.beginPath(); ctx.arc(9 * u, -7 * u, 2.5 * u, 0, Math.PI * 2); ctx.fill();
      break;
    case 'mie-goreng':
      ctx.fillStyle = '#fff8e7';
      ctx.beginPath(); ctx.ellipse(0, 6 * u, 15 * u, 7 * u, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 3 * u; ctx.lineCap = 'round';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(-11 * u, (i * 3) * u); ctx.bezierCurveTo(-3 * u, (i * 3 - 4) * u, 4 * u, (i * 3 + 4) * u, 12 * u, (i * 3) * u); ctx.stroke();
      }
      ctx.fillStyle = '#2e9e5b';
      ctx.beginPath(); ctx.arc(-5 * u, -4 * u, 2.2 * u, 0, Math.PI * 2); ctx.arc(5 * u, 5 * u, 1.8 * u, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d92632';
      ctx.beginPath(); ctx.arc(7 * u, -5 * u, 1.8 * u, 0, Math.PI * 2); ctx.fill();
      break;
    case 'sambal':
      ctx.fillStyle = '#fff8e7';
      ctx.beginPath(); ctx.ellipse(0, 6 * u, 14 * u, 7 * u, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#d92632';
      ctx.beginPath(); ctx.ellipse(0, 4 * u, 13 * u, 8 * u, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#f0555f';
      ctx.beginPath(); ctx.arc(-4 * u, -1 * u, 4 * u, 0, Math.PI * 2); ctx.arc(5 * u, 0, 3 * u, 0, Math.PI * 2); ctx.fill();
      break;
    case 'hangus':
      ctx.fillStyle = '#2b2b2b';
      ctx.beginPath(); ctx.ellipse(0, 3 * u, 14 * u, 9 * u, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#555';
      ctx.beginPath(); ctx.arc(-5 * u, -2 * u, 2.4 * u, 0, Math.PI * 2); ctx.arc(4 * u, -3 * u, 2 * u, 0, Math.PI * 2); ctx.fill();
      break;
    default:
      ctx.fillStyle = '#999';
      ctx.beginPath(); ctx.arc(0, 0, 9 * u, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawFloor(ctx) {
  const tile = 64;
  for (let y = PLAY_TOP; y < PLAY_BOTTOM; y += tile) {
    for (let x = 0; x < CANVAS_W; x += tile) {
      ctx.fillStyle = ((x / tile) + (y / tile)) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.fillStyle = PALETTE.wallDark;
  ctx.fillRect(0, PLAY_TOP, CANVAS_W, 6);
}

function drawSign(ctx, x, y, text) {
  panel(ctx, x - 62, y - 15, 124, 30, PALETTE.woodDark, 8);
  panel(ctx, x - 58, y - 11, 116, 22, PALETTE.wood, 6);
  label(ctx, text, x, y + 1, 14, PALETTE.cream);
}

function highlight(ctx, x, y, w, h) {
  ctx.strokeStyle = PALETTE.mustard;
  ctx.lineWidth = 4;
  rr(ctx, x - 3, y - 3, w + 6, h + 6, 13);
  ctx.stroke();
}

function drawCrates(ctx, state, nearId) {
  for (const crate of STATIONS.crates) {
    const near = nearId === crate.id;
    panel(ctx, crate.x, crate.y, crate.w, crate.h, near ? '#e8b06a' : PALETTE.wood, 9);
    ctx.strokeStyle = PALETTE.woodDark;
    ctx.lineWidth = 3;
    rr(ctx, crate.x, crate.y, crate.w, crate.h, 9);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(138,84,38,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(crate.x + 7, crate.y + 46); ctx.lineTo(crate.x + crate.w - 7, crate.y + 46); ctx.stroke();
    drawFood(ctx, crate.item, crate.x + crate.w / 2, crate.y + 24, 24);
    label(ctx, crate.label, crate.x + crate.w / 2, crate.y + 59, 14, PALETTE.cream);
    if (near) highlight(ctx, crate.x, crate.y, crate.w, crate.h);
  }
}

function drawStove(ctx, state, nearId, t) {
  const stove = STATIONS.stove;
  panel(ctx, stove.x, stove.y, stove.w, stove.h, PALETTE.steelDark, 12);
  panel(ctx, stove.x + 8, stove.y + 8, stove.w - 16, stove.h - 16, '#3d4c55', 8);
  if (nearId === 'stove') highlight(ctx, stove.x, stove.y, stove.w, stove.h);
  drawSign(ctx, stove.x + stove.w / 2, stove.y - 2, stove.label);
  state.burners.forEach((burner, index) => {
    const spot = stove.burners[index];
    ctx.fillStyle = '#1c2730';
    ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2c3a44';
    ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.r - 8, 0, Math.PI * 2); ctx.fill();
    if (burner.state === 'cooking') {
      const flicker = 0.6 + 0.4 * Math.sin(t * 13 + index * 2);
      ctx.fillStyle = `rgba(245,158,11,${0.55 * flicker})`;
      ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.r - 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(217,38,50,${0.4 * flicker})`;
      ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.r - 16, 0, Math.PI * 2); ctx.fill();
    }
    if (burner.item) drawFood(ctx, burner.item, spot.x, spot.y, 33);
    if (burner.state === 'cooking') {
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.r + 8, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = burner.progress > 0.8 ? PALETTE.amber : PALETTE.green;
      ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.r + 8, -Math.PI / 2, -Math.PI / 2 + burner.progress * Math.PI * 2); ctx.stroke();
    }
    if (burner.state === 'done') outlined(ctx, 'MATANG!', spot.x, spot.y - spot.r - 16, 14, '#7ed491', PALETTE.navy);
    if (burner.state === 'burnt') outlined(ctx, 'HANGUS!', spot.x, spot.y - spot.r - 16, 14, '#ff6b6b', PALETTE.navy);
  });
}

function drawBoard(ctx, state, nearId) {
  const board = STATIONS.board;
  panel(ctx, board.x, board.y, board.w, board.h, '#e8c48d', 12);
  ctx.strokeStyle = '#b98a4e';
  ctx.lineWidth = 4;
  rr(ctx, board.x, board.y, board.w, board.h, 12);
  ctx.stroke();
  if (nearId === 'board') highlight(ctx, board.x, board.y, board.w, board.h);
  drawSign(ctx, board.x + board.w / 2, board.y - 2, board.label);
  ctx.save();
  ctx.translate(board.x + board.w - 48, board.y + 32);
  ctx.rotate(0.5);
  panel(ctx, -26, -5, 40, 10, '#cfd8dc', 4);
  panel(ctx, 14, -4, 18, 8, '#5d4037', 3);
  ctx.restore();
  if (state.board.item) drawFood(ctx, state.board.item, board.cx, board.cy, 34);
  if (state.board.state === 'chopping') {
    panel(ctx, board.cx - 70, board.cy - 52, 140, 14, 'rgba(23,50,74,0.85)', 7);
    panel(ctx, board.cx - 66, board.cy - 48, 132 * Math.min(1, state.board.progress), 6, PALETTE.mustard, 3);
    label(ctx, 'TAHAN E — CINCANG!', board.cx, board.cy + 58, 13, PALETTE.navy);
  } else if (state.board.state === 'done') {
    outlined(ctx, 'SIAP DIAMBIL!', board.cx, board.cy + 58, 13, '#7ed491', PALETTE.navy);
  }
}

function drawPlate(ctx, x, y, items, scale) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(x, y, 52 * scale, 34 * scale, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d8cdb4'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(x, y, 52 * scale, 34 * scale, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#f1e6c8';
  ctx.beginPath(); ctx.ellipse(x, y, 38 * scale, 24 * scale, 0, 0, Math.PI * 2); ctx.fill();
  const slots = [-30, 0, 30];
  items.forEach((id, index) => {
    ctx.fillStyle = 'rgba(23,50,74,0.12)';
    ctx.beginPath(); ctx.ellipse(x + slots[index] * scale, y + 6 * scale, 17 * scale, 7 * scale, 0, 0, Math.PI * 2); ctx.fill();
    drawFood(ctx, id, x + slots[index] * scale, y - 2 * scale, 26 * scale);
  });
  for (let index = items.length; index < 3; index++) {
    ctx.strokeStyle = 'rgba(23,50,74,0.32)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + slots[index] * scale, y - 2 * scale, 13 * scale, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawAssembly(ctx, state, nearId, t) {
  const counter = STATIONS.assembly;
  panel(ctx, counter.x, counter.y, counter.w, counter.h, PALETTE.woodDark, 12);
  panel(ctx, counter.x + 8, counter.y + 8, counter.w - 16, counter.h - 16, PALETTE.cream, 8);
  if (nearId === 'assembly') highlight(ctx, counter.x, counter.y, counter.w, counter.h);
  drawSign(ctx, counter.x + counter.w / 2, counter.y - 2, counter.label);
  drawPlate(ctx, counter.plateX, counter.plateY, state.plate, 1.35);
  if (plateCompletesRecipe(state.plate)) {
    const pulse = 0.6 + 0.4 * Math.sin(t * 5);
    ctx.strokeStyle = `rgba(46,158,91,${pulse})`;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(counter.plateX, counter.plateY, 84, 57, 0, 0, Math.PI * 2); ctx.stroke();
    outlined(ctx, 'SIAP DISAJIKAN!', counter.plateX, counter.plateY + 66, 16, PALETTE.green, PALETTE.cream);
  }
}

function drawWindow(ctx, state, nearId, t) {
  const windowStation = STATIONS.window;
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.red : PALETTE.cream;
    ctx.fillRect(windowStation.x + i * 30.5, windowStation.y - 26, 30.5, 26);
  }
  panel(ctx, windowStation.x, windowStation.y, windowStation.w, windowStation.h, PALETTE.cream, 10);
  ctx.strokeStyle = PALETTE.woodDark; ctx.lineWidth = 5;
  rr(ctx, windowStation.x, windowStation.y, windowStation.w, windowStation.h, 10);
  ctx.stroke();
  if (nearId === 'window') highlight(ctx, windowStation.x, windowStation.y, windowStation.w, windowStation.h);
  drawSign(ctx, windowStation.x + windowStation.w / 2, windowStation.y + 22, windowStation.label);
  ctx.fillStyle = PALETTE.mustard;
  ctx.beginPath(); ctx.arc(windowStation.x + 34, windowStation.y + 66, 13, Math.PI, 0); ctx.fill();
  ctx.fillRect(windowStation.x + 20, windowStation.y + 66, 28, 5);
  if (state.windowPlate) {
    drawPlate(ctx, windowStation.plateX, windowStation.plateY, state.windowPlate, 0.85);
    const pulse = 0.6 + 0.4 * Math.sin(t * 5);
    ctx.strokeStyle = `rgba(242,183,5,${pulse})`;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(windowStation.plateX, windowStation.plateY, 56, 38, 0, 0, Math.PI * 2); ctx.stroke();
    outlined(ctx, 'SIAP DIANTAR!', windowStation.plateX, windowStation.plateY - 52, 14, PALETTE.mustard, PALETTE.navy);
  } else {
    label(ctx, '— sajikan di sini —', windowStation.plateX, windowStation.plateY, 15, '#8a97a0');
  }
}

function drawTrash(ctx, nearId) {
  const trash = STATIONS.trash;
  panel(ctx, trash.x, trash.y, trash.w, trash.h, PALETTE.steelDark, 12);
  if (nearId === 'trash') highlight(ctx, trash.x, trash.y, trash.w, trash.h);
  drawSign(ctx, trash.x + trash.w / 2, trash.y - 2, trash.label);
  panel(ctx, trash.cx - 42, trash.cy - 42, 84, 84, '#5b6b76', 10);
  panel(ctx, trash.cx - 48, trash.cy - 52, 96, 16, '#7b8b95', 8);
  ctx.strokeStyle = '#46565f'; ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(trash.cx + i * 22, trash.cy - 30); ctx.lineTo(trash.cx + i * 22, trash.cy + 32); ctx.stroke();
  }
}

function drawPrepBoard(ctx) {
  const cx = 576;
  const cy = 192;
  ctx.fillStyle = 'rgba(23,50,74,0.16)';
  ctx.beginPath(); ctx.ellipse(cx, cy + 6, 48, 32, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d99a5b';
  ctx.beginPath(); ctx.ellipse(cx, cy, 46, 31, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.woodDark; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(cx, cy, 46, 31, 0, 0, Math.PI * 2); ctx.stroke();
  drawFood(ctx, 'sayur-potong', cx - 15, cy - 2, 19);
  drawFood(ctx, 'sambal', cx + 17, cy + 4, 17);
}

function drawChef(ctx, chef, carried, t) {
  const bob = chef.moving ? Math.sin(chef.walkPhase * 10) * 3 : Math.sin(t * 2) * 1.2;
  const x = chef.x;
  const y = chef.y + bob * 0.3;
  ctx.fillStyle = 'rgba(23,50,74,0.25)';
  ctx.beginPath(); ctx.ellipse(x, chef.y + 26, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.navy;
  const step = chef.moving ? Math.sin(chef.walkPhase * 10) * 6 : 0;
  ctx.fillRect(x - 14, y + 8 + step * 0.4, 11, 18);
  ctx.fillRect(x + 3, y + 8 - step * 0.4, 11, 18);
  panel(ctx, x - 22, y - 12, 44, 34, PALETTE.wall, 12);
  panel(ctx, x - 16, y - 6, 32, 26, PALETTE.cream, 8);
  ctx.fillStyle = PALETTE.red;
  ctx.fillRect(x - 16, y - 6, 32, 4);
  ctx.fillStyle = PALETTE.wall;
  ctx.beginPath(); ctx.arc(x - 24, y + 2, 8, 0, Math.PI * 2); ctx.arc(x + 24, y + 2, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath(); ctx.arc(x, y - 26, 19, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x - 10, y - 40, 9, 0, Math.PI * 2); ctx.arc(x, y - 44, 11, 0, Math.PI * 2); ctx.arc(x + 10, y - 40, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x - 17, y - 42, 34, 8);
  const look = chef.dir * 3;
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath(); ctx.arc(x - 7 + look, y - 26, 2.4, 0, Math.PI * 2); ctx.arc(x + 7 + look, y - 26, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x + look, y - 20, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  if (carried) {
    const carryY = y - 78;
    ctx.fillStyle = 'rgba(255,248,231,0.9)';
    ctx.beginPath(); ctx.ellipse(x, carryY + 12, 24, 7, 0, 0, Math.PI * 2); ctx.fill();
    if (carried.plate) drawPlate(ctx, x, carryY + 4, carried.items, 0.55);
    else drawFood(ctx, carried, x, carryY, 29);
    ctx.strokeStyle = PALETTE.wall; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(x - 20, y - 4); ctx.lineTo(x - 14, carryY + 16); ctx.moveTo(x + 20, y - 4); ctx.lineTo(x + 14, carryY + 16); ctx.stroke();
  }
}

function drawAwning(ctx) {
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.red : PALETTE.cream;
    ctx.fillRect(i * 80, 0, 80, 26);
  }
  ctx.fillStyle = PALETTE.redDark;
  for (let i = 0; i < 16; i++) {
    ctx.beginPath(); ctx.arc(i * 80 + 40, 26, 12, 0, Math.PI); ctx.fill();
  }
}

function drawTicket(ctx, state, index, t) {
  const x = 12 + index * 140;
  const y = 34;
  const w = 132;
  const h = 66;
  panel(ctx, x, y, w, h, 'rgba(23,50,74,0.35)', 10);
  const order = state.orders[index];
  if (!order) {
    label(ctx, '— kosong —', x + w / 2, y + h / 2, 13, 'rgba(255,248,231,0.55)');
    return;
  }
  const ratio = Math.max(0, order.patience / order.maxPatience);
  const urgent = order.patience <= 10;
  ctx.globalAlpha = urgent ? 0.75 + 0.25 * Math.sin(t * 8) : 1;
  panel(ctx, x, y, w, h, PALETTE.cream, 10);
  panel(ctx, x, y, 8, h, order.recipe.color, 4);
  ctx.globalAlpha = 1;
  let size = 12.5;
  ctx.font = `700 ${size}px ${FONT}`;
  while (ctx.measureText(order.recipe.name).width > 112 && size > 9) {
    size -= 0.5;
    ctx.font = `700 ${size}px ${FONT}`;
  }
  label(ctx, order.recipe.name, x + w / 2 + 2, y + 12, size, PALETTE.navy);
  order.recipe.components.forEach((component, componentIndex) => {
    const shift = order.recipe.components.length === 2 ? 19 : 0;
    drawFood(ctx, COMPONENT_ITEM[component], x + 30 + componentIndex * 38 + shift, y + 34, 22);
  });
  panel(ctx, x + 10, y + h - 13, w - 46, 7, 'rgba(23,50,74,0.2)', 3);
  panel(ctx, x + 10, y + h - 13, (w - 46) * ratio, 7, ratio > 0.5 ? PALETTE.green : ratio > 0.25 ? PALETTE.amber : PALETTE.red, 3);
  label(ctx, `${Math.ceil(order.patience)} dtk`, x + w - 8, y + h - 10, 11, urgent ? PALETTE.red : '#5b6b76', 'right');
}

function drawHud(ctx, state, t) {
  for (let i = 0; i < TIMING.maxOrders; i++) drawTicket(ctx, state, i, t);
  panel(ctx, 596, 34, 124, 66, 'rgba(23,50,74,0.45)', 10);
  label(ctx, 'SHIFT', 658, 46, 11, PALETTE.mustard);
  const seconds = Math.max(0, Math.ceil(state.timeLeft));
  label(ctx, `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`, 658, 74, 34, state.timeLeft <= 30 ? '#ff6b6b' : PALETTE.cream, 'center', 800);
  panel(ctx, 732, 34, 150, 66, 'rgba(23,50,74,0.45)', 10);
  ctx.fillStyle = PALETTE.mustard;
  ctx.beginPath(); ctx.arc(762, 67, 17, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a6d00';
  ctx.beginPath(); ctx.arc(762, 67, 12, 0, Math.PI * 2); ctx.fill();
  label(ctx, 'Rp', 762, 67, 13, PALETTE.mustard, 'center', 800);
  label(ctx, String(state.coins), 786, 67, 27, PALETTE.cream, 'left', 800);
  for (let i = 0; i < 3; i++) {
    const hx = 920 + i * 34;
    const hy = 67;
    ctx.fillStyle = i < state.hearts ? PALETTE.red : 'rgba(255,248,231,0.25)';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 10);
    ctx.bezierCurveTo(hx - 16, hy - 4, hx - 8, hy - 16, hx, hy - 6);
    ctx.bezierCurveTo(hx + 8, hy - 16, hx + 16, hy - 4, hx, hy + 10);
    ctx.fill();
  }
  if (state.combo >= 2) {
    const pulse = 1 + 0.08 * Math.sin(t * 6);
    ctx.save();
    ctx.translate(1116, 67);
    ctx.scale(pulse, pulse);
    outlined(ctx, `KOMBO x${state.combo}`, 0, 0, 21, PALETTE.mustard, PALETTE.navy);
    ctx.restore();
  } else {
    label(ctx, 'KOMBO x0', 1116, 67, 16, 'rgba(255,248,231,0.6)');
  }
  if (state.rush && state.timeLeft > 0) {
    ctx.globalAlpha = 0.82 + 0.18 * Math.sin(t * 6);
    panel(ctx, 470, 116, 340, 30, 'rgba(217,38,50,0.92)', 8);
    ctx.globalAlpha = 1;
    label(ctx, 'RUSH HOUR! Pesanan makin cepat!', 640, 131, 16, PALETTE.cream);
  }
}

function drawBottomBar(ctx, state) {
  ctx.fillStyle = PALETTE.navy;
  ctx.fillRect(0, PLAY_BOTTOM, CANVAS_W, CANVAS_H - PLAY_BOTTOM);
  label(ctx, 'WASD / Panah: gerak   •   E / Spasi: ambil • taruh • tahan E: cincang   •   Klik stasiun: jalan   •   P: jeda   •   M: musik', 16, 684, 14, '#cfe3e0', 'left', 600);
  if (state.carried) {
    const value = state.carried.plate
      ? `Piring (${state.carried.items.map((id) => ITEMS[id].short).join(' + ')})`
      : ITEMS[state.carried].name;
    label(ctx, `DIBAWA: ${value}`, CANVAS_W - 16, 684, 15, PALETTE.mustard, 'right', 800);
  } else {
    label(ctx, 'Tangan kosong', CANVAS_W - 16, 684, 15, 'rgba(255,248,231,0.55)', 'right', 600);
  }
  if (state.hintT > 0) {
    ctx.globalAlpha = Math.min(1, state.hintT);
    outlined(ctx, state.hint, CANVAS_W / 2, PLAY_BOTTOM - 16, 18, PALETTE.cream, PALETTE.navy);
    ctx.globalAlpha = 1;
  }
}

function drawTitle(ctx, t) {
  ctx.fillStyle = 'rgba(10,25,35,0.56)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  outlined(ctx, 'DAPUR KILAT', CANVAS_W / 2, 146, 82, PALETTE.mustard, PALETTE.redDark);
  label(ctx, 'Warung cepat saji — masak, rakit, sajikan sebelum pelanggan kabur!', CANVAS_W / 2, 206, 21, PALETTE.cream);
  panel(ctx, 300, 244, 680, 250, 'rgba(255,248,231,0.97)', 16);
  label(ctx, 'CARA MAIN', 640, 272, 22, PALETTE.navy);
  const lines = [
    '1. Ambil bahan dari peti di kolom kiri.',
    '2. Masak di KOMPOR, cincang di TALENAN (tahan E).',
    '3. Rakit hidangan di MEJA RAKIT sesuai tiket pesanan.',
    '4. Bawa piring jadi ke JENDELA SAJI. Tip besar kalau cepat!',
    'Shift 180 detik, 3 nyawa. 45 detik terakhir: RUSH HOUR!',
  ];
  lines.forEach((line, index) => label(ctx, line, 640, 304 + index * 29, 16, PALETTE.ink, 'center', 600));
  const pills = RECIPES.map((recipe) => recipe.name);
  label(ctx, pills.join('  •  '), 640, 466, 12.5, '#5b6b76', 'center', 700);
  if (Math.sin(t * 4) > -0.3) outlined(ctx, 'TEKAN ENTER / KLIK UNTUK MULAI', CANVAS_W / 2, 546, 25, '#ffffff', PALETTE.navy);
  label(ctx, 'WASD / panah gerak  •  E / Spasi interaksi  •  klik stasiun untuk jalan ke sana', CANVAS_W / 2, 590, 15, '#cfe3e0');
}

function drawStars(ctx, x, y, count, size) {
  for (let i = 0; i < 3; i++) {
    const sx = x + (i - 1) * (size * 1.3);
    ctx.fillStyle = i < count ? PALETTE.mustard : 'rgba(255,248,231,0.25)';
    ctx.strokeStyle = '#8a6d00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const radius = k % 2 === 0 ? size : size * 0.45;
      const angle = -Math.PI / 2 + k * Math.PI / 5;
      const px = sx + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawEnd(ctx, state) {
  ctx.fillStyle = 'rgba(10,25,35,0.63)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  const failed = state.endReason === 'hearts';
  outlined(ctx, failed ? 'WARUNG TUTUP!' : 'SHIFT SELESAI!', CANVAS_W / 2, 130, 62, failed ? '#ff6b6b' : PALETTE.mustard, PALETTE.navy);
  label(ctx, failed ? 'Tiga pelanggan kabur kecewa. Coba lagi, chef!' : 'Kerja bagus, chef! Ini hasil shiftmu:', CANVAS_W / 2, 184, 21, PALETTE.cream);
  drawStars(ctx, CANVAS_W / 2, 248, state.stars, 33);
  panel(ctx, 420, 306, 440, 190, 'rgba(255,248,231,0.97)', 16);
  const rows = [
    ['Hidangan disajikan', String(state.dishes)],
    ['Koin didapat', `Rp ${state.coins}`],
    ['Kombo terbaik', `x${state.bestCombo}`],
    ['Pesanan salah', String(state.wrong)],
  ];
  rows.forEach(([key, value], index) => {
    label(ctx, key, 450, 336 + index * 38, 19, '#5b6b76', 'left', 600);
    label(ctx, value, 830, 336 + index * 38, 19, PALETTE.navy, 'right', 800);
  });
  outlined(ctx, 'TEKAN R UNTUK MAIN LAGI', CANVAS_W / 2, 556, 25, '#ffffff', PALETTE.navy);
}

function drawPause(ctx) {
  ctx.fillStyle = 'rgba(10,25,35,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  outlined(ctx, 'JEDA', CANVAS_W / 2, 300, 70, PALETTE.cream, PALETTE.navy);
  label(ctx, 'P / Esc untuk lanjut  •  M untuk musik nyala / mati', CANVAS_W / 2, 368, 20, '#cfe3e0');
}

function drawInteractBubble(ctx, state, t) {
  const pulse = 1 + 0.06 * Math.sin(t * 6);
  ctx.save();
  ctx.translate(Math.min(state.chef.x + 46, CANVAS_W - 34), state.chef.y - 34);
  ctx.scale(pulse, pulse);
  panel(ctx, -16, -16, 32, 32, PALETTE.mustard, 8);
  ctx.strokeStyle = PALETTE.navy; ctx.lineWidth = 3;
  rr(ctx, -16, -16, 32, 32, 8);
  ctx.stroke();
  label(ctx, 'E', 0, 1, 19, PALETTE.navy, 'center', 800);
  ctx.restore();
}

export function drawFrame(ctx, state, t) {
  ctx.save();
  if (state.shake > 0) ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawFloor(ctx);
  drawPrepBoard(ctx);
  const near = state.screen === 'playing' ? nearestStation(state) : null;
  const nearId = near?.id ?? null;
  drawCrates(ctx, state, nearId);
  drawStove(ctx, state, nearId, t);
  drawBoard(ctx, state, nearId);
  drawAssembly(ctx, state, nearId, t);
  drawWindow(ctx, state, nearId, t);
  drawTrash(ctx, nearId);
  if (state.screen === 'playing' || state.screen === 'paused') drawChef(ctx, state.chef, state.carried, t);
  drawEffects(ctx, state);
  ctx.fillStyle = PALETTE.wallDark;
  ctx.fillRect(0, 30, CANVAS_W, 78);
  drawAwning(ctx);
  drawHud(ctx, state, t);
  drawBottomBar(ctx, state);
  if (near && state.screen === 'playing') drawInteractBubble(ctx, state, t);
  if (state.screen === 'title') drawTitle(ctx, t);
  if (state.screen === 'paused') drawPause(ctx);
  if (state.screen === 'end') drawEnd(ctx, state);
  if (state.flash > 0) {
    ctx.globalAlpha = state.flash * 0.3;
    ctx.fillStyle = state.flashColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
