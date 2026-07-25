import React, { useRef, useEffect } from 'react';
import { ActiveBattleUnit, FloatingText, ParticleEffect, StageData } from '../types';

interface BattleCanvasProps {
  stage: StageData;
  units: ActiveBattleUnit[];
  playerCastleHp: number;
  playerCastleMaxHp: number;
  enemyCastleHp: number;
  enemyCastleMaxHp: number;
  cannonChargePercent: number; // 0 to 100
  isCannonFiring: boolean;
  cannonLaserX: number | null;
  speedMultiplier: number;
  isPaused: boolean;
  floatingTexts: FloatingText[];
  particles: ParticleEffect[];
  onUnitAttackHit?: (attacker: ActiveBattleUnit, targetX: number) => void;
}

export const BattleCanvas: React.FC<BattleCanvasProps> = ({
  stage,
  units,
  playerCastleHp,
  playerCastleMaxHp,
  enemyCastleHp,
  enemyCastleMaxHp,
  cannonChargePercent,
  isCannonFiring,
  cannonLaserX,
  floatingTexts,
  particles,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let timeAcc = 0;

    const render = () => {
      timeAcc += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const groundY = height - 70;

      // 1. Clear & Draw Rich Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, stage.bgGradient[0]);
      bgGrad.addColorStop(1, stage.bgGradient[1]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Background Parallax Stars / Clouds
      drawParallaxBackground(ctx, width, height, timeAcc);

      // 2. Draw Ground with Texture
      drawRichGround(ctx, width, height, groundY, stage.groundColor);

      // Coordinate mapper (0 to 1000 map X -> canvas pixel X)
      const castleWidth = 100;
      const playableStartX = 85;
      const playableEndX = width - 85;

      const mapXToCanvas = (mapX: number) => {
        return playableStartX + (mapX / 1000) * (playableEndX - playableStartX);
      };

      // 3. Draw Player Castle (Left - mapX = 0)
      const playerCastleCanvasX = mapXToCanvas(0) - castleWidth / 2;
      drawPlayerCastle(ctx, playerCastleCanvasX, groundY, playerCastleHp, playerCastleMaxHp, cannonChargePercent, timeAcc);

      // 4. Draw Enemy Castle (Right - mapX = 1000)
      const enemyCastleCanvasX = mapXToCanvas(1000) + castleWidth / 2;
      drawEnemyCastle(ctx, enemyCastleCanvasX, groundY, enemyCastleHp, enemyCastleMaxHp, stage.castleColor, timeAcc);

      // 5. Draw Laser Cannon Beam if firing
      if (isCannonFiring && cannonLaserX !== null) {
        drawCannonLaserBeam(ctx, playerCastleCanvasX + castleWidth / 2, mapXToCanvas(cannonLaserX), groundY, timeAcc);
      }

      // 6. Sort and Draw Units with Aura & Shadows
      const sortedUnits = [...units].sort((a, b) => a.y - b.y);
      sortedUnits.forEach((unit) => {
        const cx = mapXToCanvas(unit.x);
        const cy = groundY - 10 + unit.y; // Y Depth
        drawAdvancedUnitCharacter(ctx, cx, cy, unit, timeAcc);
      });

      // 7. Draw Particles (Sparks, Explosions)
      particles.forEach((p) => {
        const px = mapXToCanvas(p.x);
        const py = groundY - 20 + p.y;
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 8. Draw Floating Texts (Damage / Healing / Critical)
      floatingTexts.forEach((ft) => {
        const fx = mapXToCanvas(ft.x);
        const fy = groundY - 45 + ft.y;
        ctx.save();
        ctx.globalAlpha = Math.min(1.0, ft.opacity);
        ctx.font = `black ${Math.floor(20 * ft.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        
        // Text Glow / Outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText(ft.text, fx, fy);

        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, fx, fy);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stage, units, playerCastleHp, enemyCastleHp, cannonChargePercent, isCannonFiring, cannonLaserX, floatingTexts, particles]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 360; // Tactical battle height
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (canvasRef.current?.parentElement) {
      observer.observe(canvasRef.current.parentElement);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border-4 border-amber-400 bg-slate-950 shadow-2xl">
      <canvas ref={canvasRef} className="block w-full h-[360px]" />
    </div>
  );
};

// --- BACKGROUND & GROUND HELPERS ---
function drawParallaxBackground(ctx: CanvasRenderingContext2D, width: number, height: number, timeAcc: number) {
  ctx.save();
  // Soft Clouds / Stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  const cloudOffset = (timeAcc * 10) % width;

  ctx.beginPath();
  ctx.arc((width * 0.15 + cloudOffset) % width, height * 0.22, 35, 0, Math.PI * 2);
  ctx.arc((width * 0.2 + cloudOffset) % width, height * 0.18, 45, 0, Math.PI * 2);
  ctx.arc((width * 0.26 + cloudOffset) % width, height * 0.22, 35, 0, Math.PI * 2);

  ctx.arc((width * 0.65 + cloudOffset) % width, height * 0.15, 40, 0, Math.PI * 2);
  ctx.arc((width * 0.71 + cloudOffset) % width, height * 0.12, 50, 0, Math.PI * 2);
  ctx.arc((width * 0.77 + cloudOffset) % width, height * 0.15, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRichGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  groundColor: string
) {
  ctx.save();
  // Ground Fill
  ctx.fillStyle = groundColor;
  ctx.fillRect(0, groundY, width, height - groundY);

  // Top Light Border
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(0, groundY, width, 4);

  // Decorative Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x - 30, height);
    ctx.stroke();
  }
  ctx.restore();
}

// --- ADVANCED CASTLE RENDERERS ---
function drawPlayerCastle(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  hp: number,
  maxHp: number,
  cannonCharge: number,
  timeAcc: number
) {
  const width = 90;
  const height = 135;
  const y = groundY - height;

  ctx.save();
  // Castle Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, groundY, width * 0.6, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main Stone Body with Shading Gradient
  const grad = ctx.createLinearGradient(x, y, x + width, y);
  grad.addColorStop(0, '#0284c7');
  grad.addColorStop(0.5, '#38bdf8');
  grad.addColorStop(1, '#0284c7');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y + 25, width, height - 25);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y + 25, width, height - 25);

  // Castle Roof Turret
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 6, y, width + 12, 28);

  // Giant Cat Ears on Castle Roof
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;

  // Left Ear
  ctx.beginPath();
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + 24, y - 32);
  ctx.lineTo(x + 38, y);
  ctx.fill();
  ctx.stroke();

  // Right Ear
  ctx.beginPath();
  ctx.moveTo(x + width - 38, y);
  ctx.lineTo(x + width - 24, y - 32);
  ctx.lineTo(x + width - 8, y);
  ctx.fill();
  ctx.stroke();

  // Cannon Barrel
  const isReady = cannonCharge >= 100;
  ctx.save();
  ctx.fillStyle = isReady ? '#eab308' : '#64748b';
  if (isReady) {
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 12 + Math.sin(timeAcc * 8) * 4;
  }
  ctx.fillRect(x + width - 5, y + 45, 35, 20);
  ctx.strokeRect(x + width - 5, y + 45, 35, 20);
  ctx.restore();

  // Cat Face Window
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x + 30, y + 65, 6, 0, Math.PI * 2);
  ctx.arc(x + 60, y + 65, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(x + 45, y + 74, 4, 0, Math.PI * 2);
  ctx.fill();

  // Health Bar
  drawAdvancedHealthBar(ctx, x - 15, y - 42, width + 30, 12, hp, maxHp, '#38bdf8', '味方自城');
  ctx.restore();
}

function drawEnemyCastle(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  hp: number,
  maxHp: number,
  themeColor: string,
  timeAcc: number
) {
  const width = 95;
  const height = 145;
  const y = groundY - height;

  ctx.save();
  // Castle Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x - width / 2, groundY, width * 0.6, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark Castle Main Body
  const grad = ctx.createLinearGradient(x - width, y, x, y);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(0.5, themeColor || '#4c1d95');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(x - width, y + 20, width, height - 20);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - width, y + 20, width, height - 20);

  // Evil Horns
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.moveTo(x - width + 10, y + 20);
  ctx.lineTo(x - width - 15, y - 28);
  ctx.lineTo(x - width + 30, y + 20);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x - 30, y + 20);
  ctx.lineTo(x + 15, y - 28);
  ctx.lineTo(x - 10, y + 20);
  ctx.fill();

  // Pulsing Glowing Eyes
  const eyeGlow = Math.sin(timeAcc * 5) * 4;
  ctx.save();
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#dc2626';
  ctx.shadowBlur = 10 + eyeGlow;
  ctx.beginPath();
  ctx.arc(x - width + 30, y + 60, 7, 0, Math.PI * 2);
  ctx.arc(x - 30, y + 60, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Health Bar
  drawAdvancedHealthBar(ctx, x - width - 15, y - 42, width + 30, 12, hp, maxHp, '#f43f5e', '敵軍要塞');
  ctx.restore();
}

function drawCannonLaserBeam(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  groundY: number,
  timeAcc: number
) {
  ctx.save();
  const laserY = groundY - 65;

  // Outer Aura Blast
  ctx.strokeStyle = '#38bdf8';
  ctx.shadowColor = '#0284c7';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 36 + Math.sin(timeAcc * 20) * 8;
  ctx.beginPath();
  ctx.moveTo(startX, laserY);
  ctx.lineTo(endX, laserY);
  ctx.stroke();

  // Core Laser
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(startX, laserY);
  ctx.lineTo(endX, laserY);
  ctx.stroke();

  // End Impact Explosion
  ctx.fillStyle = '#fde047';
  ctx.shadowColor = '#ea580c';
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(endX, laserY, 48 + Math.random() * 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAdvancedHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  current: number,
  max: number,
  fillColor: string,
  label?: string
) {
  const pct = Math.max(0, Math.min(1, current / max));

  // Label
  if (label) {
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(`${label} ${current.toLocaleString()} / ${max.toLocaleString()}`, x + w / 2, y - 4);
  }

  // Background Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Fill
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, fillColor);
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(x + 1, y + 1, (w - 2) * pct, h - 2);
}

// --- HIGH QUALITY PROCEDURAL CHARACTER SYSTEM ---
function drawAdvancedUnitCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  unit: ActiveBattleUnit,
  timeAcc: number
) {
  ctx.save();
  const scale = (unit.sizeScale || 1.0) * 1.25;
  ctx.translate(x, y);

  // Knockback Animation
  if (unit.isKnockedBack) {
    ctx.rotate(unit.side === 'player' ? -0.35 : 0.35);
    ctx.translate(unit.side === 'player' ? -18 : 18, -12);
  }

  // Walk Bobbing Cycle
  const walkSpeed = unit.attackAnimTimer > 0 ? 0 : 0.35;
  const walkBob = Math.sin(unit.walkFrame * walkSpeed) * 5;
  ctx.translate(0, -walkBob);

  // Attack Animation Forward Leap
  if (unit.attackAnimTimer > 0) {
    const atkProgress = unit.attackAnimTimer / 10;
    const forwardOffset = Math.sin(atkProgress * Math.PI) * 16;
    ctx.translate(unit.side === 'player' ? forwardOffset : -forwardOffset, -Math.abs(forwardOffset * 0.3));
  }

  // Face Direction
  if (unit.side === 'enemy') {
    ctx.scale(-1, 1);
  }

  // 1. AURA & MAGIC CIRCLE (For High Lv / Rarity / Boss)
  drawUnitAura(ctx, unit, scale, timeAcc);

  // 2. SHADOW ON GROUND
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 6, 20 * scale, 7 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. MAIN CREATURE BODY
  if (unit.side === 'player') {
    drawUltraCatUnit(ctx, unit, scale, timeAcc);
  } else {
    drawUltraEnemyUnit(ctx, unit, scale, timeAcc);
  }

  // 4. ATTACK IMPACT SLASH / SPARK EFFECT
  if (unit.attackAnimTimer > 0 && unit.attackAnimTimer < 6) {
    drawAttackImpactEffect(ctx, scale, unit.side);
  }

  // 5. BOSS RASTER CROWN / RING
  if (unit.isBoss) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, -28 * scale, 42 * scale, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  // 6. HEALTH BAR ABOVE CHARACTER
  if (unit.hp < unit.maxHp) {
    const hpBarWidth = 42 * scale;
    drawAdvancedHealthBar(
      ctx,
      x - hpBarWidth / 2,
      y - 58 * scale - walkBob,
      hpBarWidth,
      6,
      unit.hp,
      unit.maxHp,
      unit.side === 'player' ? '#22c55e' : '#f43f5e'
    );
  }
}

// --- AURA & IMPACT EFFECTS ---
function drawUnitAura(
  ctx: CanvasRenderingContext2D,
  unit: ActiveBattleUnit,
  scale: number,
  timeAcc: number
) {
  const isHighPower = unit.level >= 10 || unit.rarity === 'SuperRare' || unit.rarity === 'Legend' || unit.isBoss;
  if (!isHighPower) return;

  ctx.save();
  const auraColor = unit.rarity === 'Legend' ? '#facc15' : unit.rarity === 'SuperRare' ? '#a855f7' : '#38bdf8';

  // Rotating Floor Magic Ring
  ctx.strokeStyle = auraColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = auraColor;
  ctx.shadowBlur = 12;

  ctx.beginPath();
  ctx.ellipse(0, 4, 26 * scale, 9 * scale, timeAcc * 2, 0, Math.PI * 2);
  ctx.stroke();

  // Rising Energy Particles
  ctx.fillStyle = auraColor;
  for (let i = 0; i < 3; i++) {
    const px = Math.sin(timeAcc * 4 + i * 2) * (18 * scale);
    const py = -((timeAcc * 30 + i * 15) % (40 * scale));
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawAttackImpactEffect(ctx: CanvasRenderingContext2D, scale: number, side: 'player' | 'enemy') {
  ctx.save();
  const slashX = side === 'player' ? 25 * scale : -25 * scale;
  const slashY = -20 * scale;

  // Flash Spark
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 20;

  ctx.beginPath();
  ctx.arc(slashX, slashY, 18 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Slash Lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(slashX - 20, slashY - 20);
  ctx.lineTo(slashX + 20, slashY + 20);
  ctx.moveTo(slashX + 20, slashY - 20);
  ctx.lineTo(slashX - 20, slashY + 20);
  ctx.stroke();
  ctx.restore();
}

// --- ULTRA CAT UNIT BODY RENDERER ---
function drawUltraCatUnit(ctx: CanvasRenderingContext2D, unit: ActiveBattleUnit, scale: number, timeAcc: number) {
  const radius = 18 * scale;
  const mainColor = unit.color || '#f8fafc';
  const outlineColor = unit.secondaryColor || '#1e293b';

  // Legs Animation
  const legAngle = Math.sin(unit.walkFrame * 0.4) * 0.4;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 3;

  // Left Leg
  ctx.beginPath();
  ctx.moveTo(-6 * scale, -5);
  ctx.lineTo(-6 * scale + Math.sin(legAngle) * 8, 8);
  ctx.stroke();

  // Right Leg
  ctx.beginPath();
  ctx.moveTo(6 * scale, -5);
  ctx.lineTo(6 * scale - Math.sin(legAngle) * 8, 8);
  ctx.stroke();

  // 1. Radial Shaded Sphere Body
  ctx.save();
  const bodyGrad = ctx.createRadialGradient(
    -radius * 0.3, -radius - radius * 0.3, radius * 0.2,
    0, -radius, radius
  );
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.7, mainColor);
  bodyGrad.addColorStop(1, '#cbd5e1');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(0, -radius, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();

  // 2. Ears
  // Left Ear
  ctx.fillStyle = mainColor;
  ctx.beginPath();
  ctx.moveTo(-radius + 2, -radius - 4);
  ctx.lineTo(-radius - 10, -radius - 20);
  ctx.lineTo(-radius + 12, -radius - 12);
  ctx.fill();
  ctx.stroke();

  // Right Ear
  ctx.beginPath();
  ctx.moveTo(radius - 2, -radius - 4);
  ctx.lineTo(radius + 10, -radius - 20);
  ctx.lineTo(radius - 12, -radius - 12);
  ctx.fill();
  ctx.stroke();

  // Inner Ear Pink
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(-radius + 4, -radius - 6);
  ctx.lineTo(-radius - 6, -radius - 16);
  ctx.lineTo(-radius + 10, -radius - 11);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(radius - 4, -radius - 6);
  ctx.lineTo(radius + 6, -radius - 16);
  ctx.lineTo(radius - 10, -radius - 11);
  ctx.fill();

  // 3. Facial Features
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-6 * scale, -radius - 2, 3 * scale, 0, Math.PI * 2); // Left Eye
  ctx.arc(6 * scale, -radius - 2, 3 * scale, 0, Math.PI * 2);  // Right Eye
  ctx.fill();

  // Eye Shine
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-5 * scale, -radius - 3, 1 * scale, 0, Math.PI * 2);
  ctx.arc(7 * scale, -radius - 3, 1 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Mouth & Whiskers
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-2.5 * scale, -radius + 5, 3 * scale, 0, Math.PI);
  ctx.arc(2.5 * scale, -radius + 5, 3 * scale, 0, Math.PI);
  ctx.stroke();

  // 4. Special Equipment & Evolutions
  const name = unit.name;

  if (name.includes('バトル') || name.includes('勇者') || name.includes('剣')) {
    // Glowing Sword
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.fillRect(radius - 2, -radius - 22, 6, 26);
    ctx.strokeRect(radius - 2, -radius - 22, 6, 26);
  }

  if (name.includes('タンク') || name.includes('盾') || name.includes('壁')) {
    // Heavy Shield
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.fillRect(-radius - 12, -radius - 8, 12, 24);
    ctx.strokeRect(-radius - 12, -radius - 8, 12, 24);
  }

  if (name.includes('フェニックス') || name.includes('ドラゴン') || name.includes('翼')) {
    // Fiery Wings
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-radius, -radius - 10);
    ctx.lineTo(-radius - 24, -radius - 28);
    ctx.lineTo(-radius - 10, -radius + 8);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(radius, -radius - 10);
    ctx.lineTo(radius + 24, -radius - 28);
    ctx.lineTo(radius + 10, -radius + 8);
    ctx.fill();
  }

  if (name.includes('かみさま') || name.includes('ビッグバン') || name.includes('ゼウス')) {
    // Holy Crown & Halo
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, -radius - 30, 20 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// --- ULTRA ENEMY CREATURE RENDERER ---
function drawUltraEnemyUnit(ctx: CanvasRenderingContext2D, unit: ActiveBattleUnit, scale: number, timeAcc: number) {
  const shape = unit.shape;
  ctx.fillStyle = unit.color || '#fbbf24';
  ctx.strokeStyle = unit.secondaryColor || '#020617';
  ctx.lineWidth = 3;

  if (shape === 'dog') {
    // Guard Dog
    ctx.beginPath();
    ctx.ellipse(0, -16 * scale, 18 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Floppy Ears
    ctx.fillStyle = unit.secondaryColor || '#78350f';
    ctx.beginPath();
    ctx.ellipse(-15 * scale, -22 * scale, 7 * scale, 14 * scale, 0.3, 0, Math.PI * 2);
    ctx.ellipse(15 * scale, -22 * scale, 7 * scale, 14 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes & Mouth
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(-7 * scale, -18 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.arc(7 * scale, -18 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.arc(0, -12 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'pig') {
    // Heavy Pig
    ctx.beginPath();
    ctx.arc(0, -18 * scale, 20 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Snout
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(0, -14 * scale, 9 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'gorilla' || shape === 'robot') {
    // Mecha Gorilla
    ctx.fillRect(-20 * scale, -36 * scale, 40 * scale, 36 * scale);
    ctx.strokeRect(-20 * scale, -36 * scale, 40 * scale, 36 * scale);

    // Cyber Visor Eye
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 10;
    ctx.fillRect(-14 * scale, -28 * scale, 28 * scale, 8 * scale);
  } else if (shape === 'ufo') {
    // Alien UFO
    ctx.beginPath();
    ctx.ellipse(0, -20 * scale, 28 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dome
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.beginPath();
    ctx.arc(0, -24 * scale, 14 * scale, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'dragon') {
    // Boss Dragon
    ctx.beginPath();
    ctx.ellipse(0, -28 * scale, 32 * scale, 25 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Horns
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-12 * scale, -45 * scale);
    ctx.lineTo(-24 * scale, -68 * scale);
    ctx.lineTo(-3 * scale, -50 * scale);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12 * scale, -45 * scale);
    ctx.lineTo(24 * scale, -68 * scale);
    ctx.lineTo(3 * scale, -50 * scale);
    ctx.fill();
  } else {
    // Default Creature
    ctx.beginPath();
    ctx.arc(0, -18 * scale, 18 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}
