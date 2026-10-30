import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  phase: number;
  pulseSpeed: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const PARTICLE_COLORS = [
  'rgba(139, 92, 246, ', // Indigo
  'rgba(6, 182, 212, ',  // Cyan
  'rgba(168, 85, 247, ', // Violet
  'rgba(59, 130, 246, ', // Electric Blue
  'rgba(236, 72, 153, ', // Pink Accent
];

export function HeroInteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse coordinates & smoothed interpolated position
    let targetX = -1000;
    let targetY = -1000;
    let mouseX = -1000;
    let mouseY = -1000;
    let isMouseInside = false;
    let lastMoveTime = 0;

    const ripples: Ripple[] = [];
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 65;

    function initSize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const baseRadius = 1.6 + Math.random() * 2.2;
        particles.push({
          x: Math.random() * (width || 800),
          y: Math.random() * (height || 500),
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: baseRadius,
          baseRadius,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
        });
      }
    }

    initSize();
    spawnParticles();

    function addRipple(x: number, y: number, maxRadius = 160) {
      if (ripples.length > 8) ripples.shift();
      ripples.push({
        x,
        y,
        radius: 4,
        maxRadius,
        alpha: 0.55,
      });
    }

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (
        currentX >= 0 &&
        currentX <= rect.width &&
        currentY >= 0 &&
        currentY <= rect.height
      ) {
        if (!isMouseInside) {
          mouseX = currentX;
          mouseY = currentY;
          isMouseInside = true;
        }
        targetX = currentX;
        targetY = currentY;

        // Spawn subtle acoustic ripple on swift movement
        const now = performance.now();
        const dx = targetX - mouseX;
        const dy = targetY - mouseY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (speed > 16 && now - lastMoveTime > 120) {
          addRipple(targetX, targetY, 80 + Math.min(speed * 2, 130));
          lastMoveTime = now;
        }
      } else {
        isMouseInside = false;
        targetX = -1000;
        targetY = -1000;
      }
    }

    function handleClick(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (
        clickX >= 0 &&
        clickX <= rect.width &&
        clickY >= 0 &&
        clickY <= rect.height
      ) {
        addRipple(clickX, clickY, 240);

        // Acoustic blast: push particles outward from click point
        particles.forEach((p) => {
          const dx = p.x - clickX;
          const dy = p.y - clickY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220 && dist > 1) {
            const force = (220 - dist) / 220;
            p.vx += (dx / dist) * force * 5;
            p.vy += (dy / dist) * force * 5;
          }
        });
      }
    }

    function handleResize() {
      initSize();
      particles.forEach((p) => {
        p.x = Math.min(Math.max(p.x, 10), width - 10);
        p.y = Math.min(Math.max(p.y, 10), height - 10);
      });
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    let time = 0;

    function render() {
      time += 0.02;

      // Smooth cursor lerp
      if (isMouseInside) {
        mouseX += (targetX - mouseX) * 0.12;
        mouseY += (targetY - mouseY) * 0.12;
      } else {
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. DYNAMIC MOUSE TORCH / SPOTLIGHT GLOW
      if (mouseX > -500 && mouseY > -500) {
        const torch = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 320);
        torch.addColorStop(0, 'rgba(139, 92, 246, 0.16)');
        torch.addColorStop(0.35, 'rgba(6, 182, 212, 0.09)');
        torch.addColorStop(0.7, 'rgba(168, 85, 247, 0.03)');
        torch.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = torch;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. ACOUSTIC RIPPLE WAVEFRONTS
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.8;
        r.alpha *= 0.965;

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${r.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 6]);
        ctx.stroke();

        // Inner harmonic echo ring
        if (r.radius > 25) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(168, 85, 247, ${(r.alpha * 0.45).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.stroke();
        }
        ctx.restore();

        if (r.alpha < 0.02 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // 3. UPDATE & DRAW PARTICLES
      const MOUSE_RADIUS = 160;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.phase += p.pulseSpeed;
        p.radius = p.baseRadius + Math.sin(p.phase) * 0.7;

        // Apply mouse interaction (elastic attraction & subtle orbital spin)
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (isMouseInside && dist < MOUSE_RADIUS && dist > 2) {
          const factor = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          // Soft magnetic pull
          p.vx += (dx / dist) * factor * 0.28;
          p.vy += (dy / dist) * factor * 0.28;

          // Tangential micro-spin around cursor
          p.vx += (-dy / dist) * factor * 0.15;
          p.vy += (dx / dist) * factor * 0.15;

          // Particle expands when illuminated by cursor
          p.radius = p.baseRadius + factor * 2.5;

          // Synaptic laser beam to mouse cursor
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          const beamGradient = ctx.createLinearGradient(p.x, p.y, mouseX, mouseY);
          beamGradient.addColorStop(0, `${p.color}0.7)`);
          beamGradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
          ctx.strokeStyle = beamGradient;
          ctx.lineWidth = 1 + factor * 1.5;
          ctx.stroke();
        }

        // Particle speed damping & boundary bouncing
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx + Math.sin(time + i) * 0.22;
        p.y += p.vy + Math.cos(time + i * 0.7) * 0.22;

        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }

        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.radius, 1), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}0.85)`;
        ctx.shadowColor = `${p.color}0.9)`;
        ctx.shadowBlur = dist < MOUSE_RADIUS ? 12 : 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 4. PARTICLE-TO-PARTICLE NEURAL SYNAPSE CONNECTIONS
      const MAX_CONNECT_DIST = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < MAX_CONNECT_DIST) {
            let alpha = (1 - dist / MAX_CONNECT_DIST) * 0.28;

            // Illuminate connection if near mouse cursor
            const mouseDist1 = Math.hypot(mouseX - p1.x, mouseY - p1.y);
            const mouseDist2 = Math.hypot(mouseX - p2.x, mouseY - p2.y);
            if (isMouseInside && (mouseDist1 < MOUSE_RADIUS || mouseDist2 < MOUSE_RADIUS)) {
              alpha = Math.min(alpha * 2.4, 0.75);
            }

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha.toFixed(3)})`;
            ctx.lineWidth = alpha > 0.4 ? 1.4 : 0.8;
            ctx.stroke();
          }
        }
      }

      // 5. HARMONIC ORBITAL VOICE ENERGY AROUND CURSOR
      if (isMouseInside && mouseX > 0 && mouseY > 0) {
        const rings = [
          { r: 24, speed: 2.2, color: 'rgba(6, 182, 212, 0.8)', size: 2.5 },
          { r: 36, speed: -1.8, color: 'rgba(168, 85, 247, 0.8)', size: 2 },
          { r: 50, speed: 1.4, color: 'rgba(236, 72, 153, 0.7)', size: 1.8 },
        ];

        rings.forEach((ring, idx) => {
          const angle = time * ring.speed + (idx * Math.PI) / 1.5;
          const orbX = mouseX + Math.cos(angle) * ring.r;
          const orbY = mouseY + Math.sin(angle) * (ring.r * 0.7);

          ctx.beginPath();
          ctx.arc(orbX, orbY, ring.size, 0, Math.PI * 2);
          ctx.fillStyle = ring.color;
          ctx.shadowColor = ring.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Subtle orbital tracer arc
          ctx.beginPath();
          ctx.ellipse(mouseX, mouseY, ring.r, ring.r * 0.7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color.replace('0.8', '0.12').replace('0.7', '0.1');
          ctx.lineWidth = 0.75;
          ctx.stroke();
        });
      }

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-90 transition-opacity duration-700"
      />
    </div>
  );
}
