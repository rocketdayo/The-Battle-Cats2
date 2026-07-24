import React, { useRef, useEffect } from 'react';
import { ActiveBattleUnit, FloatingText, ParticleEffect, StageData } from '../types';
import { soundManager } from '../utils/audio';

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

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const groundY = height - 70;

      // Clear & Draw background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, stage.bgGradient[0]);
      bgGrad.addColorStop(1, stage.bgGradient[1]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw background clouds / stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(width * 0.2, height * 0.25, 30, 0, Math.PI * 2);
      ctx.arc(width * 0.23, height * 0.22, 40, 0, Math.PI * 2);
      ctx.arc(width * 0.27, height * 0.25, 30, 0, Math.PI * 2);
      ctx.arc(width * 0.7, height * 0.18, 45, 0, Math.PI * 2);
      ctx.arc(width * 0.74, height * 0.15, 55, 0, Math.PI * 2);
      ctx.fill();

      // Draw Ground
      ctx.fillStyle = stage.groundColor;
      ctx.fillRect(0, groundY, width, 70);

      // Ground Top Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Map world scale: 0 to 1000 X coordinates mapped to canvas width (keeping 80px margin on sides for castles)
      const castleWidth = 90;
      const playableStartX = 70;
      const playableEndX = width - 70;

      const mapXToCanvas = (mapX: number) => {
        return playableStartX + (mapX / 1000) * (playableEndX - playableStartX);
      };

      // 1. Draw Player Castle (Left - mapX = 0)
      const playerCastleCanvasX = mapXToCanvas(0) - castleWidth / 2;
      drawPlayerCastle(ctx, playerCastleCanvasX, groundY, playerCastleHp, playerCastleMaxHp, cannonChargePercent);

      // 2. Draw Enemy Castle (Right - mapX = 1000)
      const enemyCastleCanvasX = mapXToCanvas(1000) + castleWidth / 2;
      drawEnemyCastle(ctx, enemyCastleCanvasX, groundY, enemyCastleHp, enemyCastleMaxHp, stage.castleColor);

      // 3. Draw Laser Cannon Beam if firing
      if (isCannonFiring && cannonLaserX !== null) {
        const fireX = mapXToCanvas(cannonLaserX);
        const startX = playerCastleCanvasX + castleWidth / 2;

        ctx.save();
        // Laser outer glow
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 28;
        ctx.beginPath();
        ctx.moveTo(startX, groundY - 60);
        ctx.lineTo(fireX, groundY - 60);
        ctx.stroke();

        // Laser core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(startX, groundY - 60);
        ctx.lineTo(fireX, groundY - 60);
        ctx.stroke();

        // Explosion at end
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(fireX, groundY - 60, 40 + Math.random() * 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Sort and Draw Units
      const sortedUnits = [...units].sort((a, b) => a.y - b.y);
      sortedUnits.forEach((unit) => {
        const cx = mapXToCanvas(unit.x);
        const cy = groundY - 15 + unit.y; // Y variation
        drawUnitCharacter(ctx, cx, cy, unit);
      });

      // 5. Draw Particles
      particles.forEach((p) => {
        const px = mapXToCanvas(p.x);
        const py = groundY - 20 + p.y;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 6. Draw Floating Texts (Damage / Healing / Critical)
      floatingTexts.forEach((ft) => {
        const fx = mapXToCanvas(ft.x);
        const fy = groundY - 40 + ft.y;
        ctx.save();
        ctx.globalAlpha = ft.opacity;
        ctx.font = `bold ${Math.floor(18 * ft.scale)}px sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, fx, fy);
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
      canvas.height = 340; // Fixed tactical battle height
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (canvasRef.current?.parentElement) {
      observer.observe(canvasRef.current.parentElement);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-4 border-amber-400 bg-slate-900 shadow-2xl">
      <canvas ref={canvasRef} className="block w-full h-[340px]" />
    </div>
  );
};

// --- Castle Renderers ---
function drawPlayerCastle(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  hp: number,
  maxHp: number,
  cannonCharge: number
) {
  const width = 80;
  const height = 120;
  const y = groundY - height;

  ctx.save();
  // Castle Body
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(x, y + 20, width, height - 20);

  // Roof & Turret
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x - 5, y, width + 10, 25);

  // Big Nyanko Ears on Castle
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + 25, y - 25);
  ctx.lineTo(x + 35, y);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + width - 35, y);
  ctx.lineTo(x + width - 25, y - 25);
  ctx.lineTo(x + width - 10, y);
  ctx.fill();

  // Cannon Barrel
  const cannonColor = cannonCharge >= 100 ? '#facc15' : '#94a3b8';
  ctx.fillStyle = cannonColor;
  ctx.fillRect(x + width - 10, y + 35, 30, 16);

  // Castle Face (Cute Cat Face)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x + 25, y + 55, 5, 0, Math.PI * 2);
  ctx.arc(x + 55, y + 55, 5, 0, Math.PI * 2);
  ctx.fill();

  // Cat Nose & Whisker
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(x + 40, y + 62, 3, 0, Math.PI * 2);
  ctx.fill();

  // HP Bar
  drawHealthBar(ctx, x - 10, y - 35, width + 20, 10, hp, maxHp, '#38bdf8');
  ctx.restore();
}

function drawEnemyCastle(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  hp: number,
  maxHp: number,
  themeColor: string
) {
  const width = 85;
  const height = 130;
  const y = groundY - height;

  ctx.save();
  // Castle Main Structure
  ctx.fillStyle = themeColor;
  ctx.fillRect(x - width, y + 15, width, height - 15);

  // Evil Horns
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(x - width + 10, y + 15);
  ctx.lineTo(x - width - 10, y - 20);
  ctx.lineTo(x - width + 25, y + 15);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x - 25, y + 15);
  ctx.lineTo(x + 10, y - 20);
  ctx.lineTo(x - 10, y + 15);
  ctx.fill();

  // Red Glowing Eyes
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(x - width + 25, y + 55, 6, 0, Math.PI * 2);
  ctx.arc(x - 25, y + 55, 6, 0, Math.PI * 2);
  ctx.fill();

  // Castle HP Bar
  drawHealthBar(ctx, x - width - 10, y - 35, width + 20, 10, hp, maxHp, '#ef4444');
  ctx.restore();
}

function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  current: number,
  max: number,
  color: string
) {
  const pct = Math.max(0, Math.min(1, current / max));
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, (w - 2) * pct, h - 2);
}

// --- Procedural Unit Character Renderer ---
function drawUnitCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  unit: ActiveBattleUnit
) {
  ctx.save();
  const scale = (unit.sizeScale || 1.0) * 1.2;
  ctx.translate(x, y);

  // Knockback animation effect
  if (unit.isKnockedBack) {
    ctx.rotate(unit.side === 'player' ? -0.3 : 0.3);
    ctx.translate(unit.side === 'player' ? -15 : 15, -10);
  }

  // Bobbing / Walk Cycle
  const walkBob = Math.sin(unit.walkFrame * 0.3) * 4;
  ctx.translate(0, -walkBob);

  // Attack Animation scale
  if (unit.attackAnimTimer > 0) {
    const atkProgress = unit.attackAnimTimer / 10;
    const forwardOffset = Math.sin(atkProgress * Math.PI) * 12;
    ctx.translate(unit.side === 'player' ? forwardOffset : -forwardOffset, 0);
  }

  // Face Direction
  if (unit.side === 'enemy') {
    ctx.scale(-1, 1);
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 5, 18 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  if (unit.side === 'player') {
    // --- DRAW NYANKO CAT CREATURE ---
    drawCatUnitBody(ctx, unit, scale);
  } else {
    // --- DRAW ENEMY CREATURE ---
    drawEnemyUnitBody(ctx, unit, scale);
  }

  // Boss Indicator Ring
  if (unit.isBoss) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, -25 * scale, 35 * scale, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  // Unit Health Bar (above unit)
  if (unit.hp < unit.maxHp) {
    const hpBarWidth = 36 * scale;
    drawHealthBar(
      ctx,
      x - hpBarWidth / 2,
      y - 50 * scale - walkBob,
      hpBarWidth,
      5,
      unit.hp,
      unit.maxHp,
      unit.side === 'player' ? '#22c55e' : '#f43f5e'
    );
  }
}

function drawCatUnitBody(ctx: CanvasRenderingContext2D, unit: ActiveBattleUnit, scale: number) {
  const radius = 16 * scale;

  // Main Body Circle
  ctx.fillStyle = unit.color || '#f8fafc';
  ctx.beginPath();
  ctx.arc(0, -radius, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = unit.secondaryColor || '#475569';
  ctx.stroke();

  // Cat Ears
  ctx.fillStyle = unit.color || '#f8fafc';
  // Left Ear
  ctx.beginPath();
  ctx.moveTo(-radius + 2, -radius - 5);
  ctx.lineTo(-radius - 8, -radius - 18);
  ctx.lineTo(-radius + 12, -radius - 12);
  ctx.fill();
  ctx.stroke();

  // Right Ear
  ctx.beginPath();
  ctx.moveTo(radius - 2, -radius - 5);
  ctx.lineTo(radius + 8, -radius - 18);
  ctx.lineTo(radius - 12, -radius - 12);
  ctx.fill();
  ctx.stroke();

  // Cat Face
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-5 * scale, -radius - 2, 2.5 * scale, 0, Math.PI * 2); // Left eye
  ctx.arc(5 * scale, -radius - 2, 2.5 * scale, 0, Math.PI * 2);  // Right eye
  ctx.fill();

  // Cute Pink Mouth
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-2 * scale, -radius + 4, 3 * scale, 0, Math.PI);
  ctx.arc(2 * scale, -radius + 4, 3 * scale, 0, Math.PI);
  ctx.stroke();

  // Special Visual Evolution Accessories based on level/name
  if (unit.name.includes('マッスル') || unit.name.includes('サイバー')) {
    // Muscular Arms
    ctx.fillStyle = unit.color;
    ctx.fillRect(-radius - 10, -radius, 8, 14);
    ctx.fillRect(radius + 2, -radius, 8, 14);
  }

  if (unit.name.includes('フェニックス') || unit.name.includes('ドラゴン')) {
    // Fire / Dragon Wings
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-radius, -radius - 10);
    ctx.lineTo(-radius - 20, -radius - 25);
    ctx.lineTo(-radius - 8, -radius + 5);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(radius, -radius - 10);
    ctx.lineTo(radius + 20, -radius - 25);
    ctx.lineTo(radius + 8, -radius + 5);
    ctx.fill();
  }

  if (unit.name.includes('かみさま') || unit.name.includes('ビッグバン') || unit.name.includes('神')) {
    // Holy Halo
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -radius - 26, 16 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawEnemyUnitBody(ctx: CanvasRenderingContext2D, unit: ActiveBattleUnit, scale: number) {
  const shape = unit.shape;
  ctx.fillStyle = unit.color || '#fbbf24';
  ctx.strokeStyle = unit.secondaryColor || '#0f172a';
  ctx.lineWidth = 2.5;

  if (shape === 'dog') {
    // Puppy Guard
    ctx.beginPath();
    ctx.ellipse(0, -14 * scale, 16 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dog Floppy Ears
    ctx.fillStyle = unit.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(-14 * scale, -18 * scale, 6 * scale, 12 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.ellipse(14 * scale, -18 * scale, 6 * scale, 12 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes & Nose
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-6 * scale, -16 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.arc(6 * scale, -16 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.arc(0, -10 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'pig') {
    // Piggy
    ctx.beginPath();
    ctx.arc(0, -16 * scale, 18 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Snout
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(0, -12 * scale, 8 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'gorilla' || shape === 'robot') {
    // Gorilla / Mech Robot
    ctx.fillRect(-18 * scale, -32 * scale, 36 * scale, 32 * scale);
    ctx.strokeRect(-18 * scale, -32 * scale, 36 * scale, 32 * scale);

    // Glowing Eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-12 * scale, -26 * scale, 8 * scale, 6 * scale);
    ctx.fillRect(4 * scale, -26 * scale, 8 * scale, 6 * scale);
  } else if (shape === 'ufo') {
    // UFO
    ctx.beginPath();
    ctx.ellipse(0, -18 * scale, 24 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glass Dome
    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.beginPath();
    ctx.arc(0, -22 * scale, 12 * scale, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'dragon') {
    // Dragon Boss
    ctx.beginPath();
    ctx.ellipse(0, -25 * scale, 28 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dragon Horns
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-10 * scale, -40 * scale);
    ctx.lineTo(-20 * scale, -60 * scale);
    ctx.lineTo(-2 * scale, -45 * scale);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10 * scale, -40 * scale);
    ctx.lineTo(20 * scale, -60 * scale);
    ctx.lineTo(2 * scale, -45 * scale);
    ctx.fill();
  } else {
    // Default shape
    ctx.beginPath();
    ctx.arc(0, -16 * scale, 16 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}
