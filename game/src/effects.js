export function burst(state, x, y, count, color = '#f2b705', kind = 'spark') {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 24 + Math.random() * 96;
    const life = 0.45 + Math.random() * 0.65;
    state.particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 28,
      life, maxLife: life, size: 2 + Math.random() * 4, color, kind,
    });
  }
}

export function steamPuff(state, x, y) {
  const life = 0.8 + Math.random() * 0.55;
  state.particles.push({
    x: x + (Math.random() - 0.5) * 28, y,
    vx: (Math.random() - 0.5) * 11, vy: -24 - Math.random() * 24,
    life, maxLife: life, size: 5 + Math.random() * 7,
    color: 'rgba(255,255,255,0.55)', kind: 'steam',
  });
}

export function coinSparkle(state, x, y) {
  burst(state, x, y, 22, '#ffd54a', 'coin');
  burst(state, x, y, 9, '#fff8e7', 'spark');
}

export function comboMilestone(state, x, y, combo) {
  state.shake = Math.max(state.shake, combo >= 5 ? 7 : 4);
  state.flash = Math.max(state.flash, 0.22);
  state.flashColor = '#f2b705';
  burst(state, x, y, combo >= 5 ? 22 : 12, '#f2b705', 'spark');
}

export function updateEffects(state, dt) {
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    if (particle.kind === 'steam') {
      particle.vy -= 10 * dt;
      particle.size += 5 * dt;
    } else {
      particle.vy += 85 * dt;
    }
    particle.life -= dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
  for (const floater of state.floaters) {
    floater.y -= 32 * dt;
    floater.life -= dt;
  }
  state.floaters = state.floaters.filter((floater) => floater.life > 0);
  state.shake = Math.max(0, state.shake - dt * 25);
  state.flash = Math.max(0, state.flash - dt * 2.4);
  state.hintT = Math.max(0, state.hintT - dt);
  state.rushFlash = Math.max(0, state.rushFlash - dt);
}

export function drawEffects(ctx, state) {
  for (const particle of state.particles) {
    const alpha = Math.max(0, particle.life / particle.maxLife);
    if (particle.kind === 'steam') {
      ctx.fillStyle = `rgba(255,255,255,${0.45 * alpha})`;
      ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); ctx.fill();
    } else if (particle.kind === 'coin') {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.life * 4);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = Math.max(1, particle.size * 0.45);
      ctx.beginPath();
      ctx.moveTo(-particle.size, 0); ctx.lineTo(particle.size, 0);
      ctx.moveTo(0, -particle.size); ctx.lineTo(0, particle.size);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  for (const floater of state.floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, floater.life / (floater.maxLife * 0.5)));
    ctx.font = '800 23px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#17324a';
    ctx.strokeText(floater.text, floater.x, floater.y);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, floater.x, floater.y);
    ctx.globalAlpha = 1;
  }
}
