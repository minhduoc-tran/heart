import React, { useEffect, useRef } from "react";

const HeartCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDevice =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        (
          navigator.userAgent ||
          navigator.vendor ||
          (window as any).opera
        ).toLowerCase()
      );

    const mobile = isDevice;
    const koef = mobile ? 0.5 : 1;

    let width = (canvas.width = koef * window.innerWidth);
    let height = (canvas.height = koef * window.innerHeight);
    const rand = Math.random;

    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);

    const heartPosition = (rad: number): [number, number] => {
      return [
        Math.pow(Math.sin(rad), 3),
        -(
          15 * Math.cos(rad) -
          5 * Math.cos(2 * rad) -
          2 * Math.cos(3 * rad) -
          Math.cos(4 * rad)
        ),
      ];
    };

    const scaleAndTranslate = (
      pos: [number, number],
      sx: number,
      sy: number,
      dx: number,
      dy: number
    ): [number, number] => {
      return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    const handleResize = () => {
      width = canvas.width = koef * window.innerWidth;
      height = canvas.height = koef * window.innerHeight;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, width, height);
    };

    window.addEventListener("resize", handleResize);

    const traceCount = mobile ? 20 : 50;
    const pointsOrigin: [number, number][] = [];
    const dr = mobile ? 0.3 : 0.1;
    for (let i = 0; i < Math.PI * 2; i += dr) {
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    }

    const heartPointsCount = pointsOrigin.length;
    const targetPoints: [number, number][] = [];

    const pulse = (kx: number, ky: number) => {
      for (let i = 0; i < pointsOrigin.length; i++) {
        targetPoints[i] = [
          kx * pointsOrigin[i][0] + width / 2,
          ky * pointsOrigin[i][1] + height / 2,
        ];
      }
    };

    const e = Array.from({ length: heartPointsCount }).map((_, i) => {
      const x = rand() * width;
      const y = rand() * height;
      return {
        vx: 0,
        vy: 0,
        R: 2,
        speed: rand() + 5,
        q: ~~(rand() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * rand() + 0.7,
        f: `hsla(330,${~~(40 * rand() + 60)}%,${~~(60 * rand() + 30)}%,.3)`,
        trace: Array.from({ length: traceCount }).map(() => ({ x, y })),
      };
    });

    const config = {
      traceK: 0.4,
      timeDelta: 0.01,
    };

    let time = 0;

    const loop = () => {
      const n = -Math.cos(time);
      pulse((1 + n) * 0.5, (1 + n) * 0.5);
      time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

      ctx.fillStyle = "rgba(0,0,0,.1)";
      ctx.fillRect(0, 0, width, height);

      for (let i = e.length; i--; ) {
        const u = e[i];
        const q = targetPoints[u.q];
        const dx = u.trace[0].x - q[0];
        const dy = u.trace[0].y - q[1];
        const length = Math.sqrt(dx * dx + dy * dy);

        if (10 > length) {
          if (0.95 < rand()) {
            u.q = ~~(rand() * heartPointsCount);
          } else {
            if (0.99 < rand()) u.D *= -1;
            u.q += u.D;
            u.q %= heartPointsCount;
            if (u.q < 0) u.q += heartPointsCount;
          }
        }

        u.vx += (-dx / length) * u.speed;
        u.vy += (-dy / length) * u.speed;
        u.trace[0].x += u.vx;
        u.trace[0].y += u.vy;
        u.vx *= u.force;
        u.vy *= u.force;

        for (let k = 0; k < u.trace.length - 1; k++) {
          const T = u.trace[k];
          const N = u.trace[k + 1];
          N.x -= config.traceK * (N.x - T.x);
          N.y -= config.traceK * (N.y - T.y);
        }

        ctx.fillStyle = u.f;
        for (let k = 0; k < u.trace.length; k++) {
          ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
        }
      }

      // Draw text
      ctx.save();
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#ff69b4";
      ctx.textAlign = "center";
      ctx.shadowColor = "#f00";
      ctx.shadowBlur = 10;
      ctx.fillText("Trần Được", width / 2, height / 2 + 120);
      ctx.restore();

      requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="heart"
      style={{ display: "block", width: "100vw", height: "100vh" }}
    />
  );
};

export default HeartCanvas;
