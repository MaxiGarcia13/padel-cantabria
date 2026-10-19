import gsap from 'gsap';

const IMPACT_RADIUS_PX = 56;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function impactLetters(ball: HTMLElement, letters: HTMLElement[], peakPx: number): void {
  const ballRect = ball.getBoundingClientRect();
  const ballCenterX = ballRect.left + ballRect.width / 2;

  for (const letter of letters) {
    const letterRect = letter.getBoundingClientRect();
    const letterCenterX = letterRect.left + letterRect.width / 2;
    const distance = Math.abs(ballCenterX - letterCenterX);
    if (distance >= IMPACT_RADIUS_PX)
      continue;

    const strength = Math.cos((distance / IMPACT_RADIUS_PX) * (Math.PI / 2));

    gsap
      .timeline({ overwrite: true })
      .to(letter, {
        y: strength * peakPx,
        duration: 0.08,
        ease: 'power3.in',
      })
      .to(letter, {
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.55)',
      });
  }
}

export function runHeroBrandAnimation(root: ParentNode = document): void {
  const brand = root.querySelector<HTMLElement>('[data-hero-brand]');
  const ball = brand?.querySelector<HTMLElement>('[data-hero-ball]');
  if (!brand || !ball)
    return;

  const letters = gsap.utils.toArray<HTMLElement>(brand.querySelectorAll('[data-hero-letter]'));
  gsap.killTweensOf([ball, ...letters]);
  gsap.set(ball, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, transformOrigin: '50% 100%' });
  gsap.set(letters, { y: 0 });

  if (prefersReducedMotion() || letters.length === 0)
    return;

  gsap.set(ball, { x: -110, y: -48, rotation: -14 });

  const timeline = gsap.timeline({ defaults: { force3D: true } });

  timeline.to(ball, { x: 0, duration: 1.55, ease: 'power1.out' }, 0);

  timeline.to(ball, { rotation: 10, duration: 0.55, ease: 'sine.inOut' }, 0);
  timeline.to(ball, { rotation: -6, duration: 0.5, ease: 'sine.inOut' }, 0.55);
  timeline.to(ball, { rotation: 0, duration: 0.5, ease: 'sine.out' }, 1.05);

  // First bounce — left
  timeline.to(
    ball,
    {
      y: 0,
      duration: 0.34,
      ease: 'power3.in',
      onComplete: () => impactLetters(ball, letters, 14),
    },
    0,
  );
  timeline.to(ball, { scaleX: 1.18, scaleY: 0.8, duration: 0.06, ease: 'power1.out' }, 0.34);
  timeline.to(ball, { scaleX: 1, scaleY: 1, y: -28, duration: 0.3, ease: 'power3.out' }, 0.4);

  // Second bounce — mid-left
  timeline.to(
    ball,
    {
      y: 0,
      duration: 0.28,
      ease: 'power3.in',
      onComplete: () => impactLetters(ball, letters, 11),
    },
    0.7,
  );
  timeline.to(ball, { scaleX: 1.12, scaleY: 0.86, duration: 0.05, ease: 'power1.out' }, 0.98);
  timeline.to(ball, { scaleX: 1, scaleY: 1, y: -16, duration: 0.26, ease: 'power3.out' }, 1.03);

  // Third bounce — center
  timeline.to(
    ball,
    {
      y: 0,
      duration: 0.24,
      ease: 'power3.in',
      onComplete: () => impactLetters(ball, letters, 8),
    },
    1.29,
  );
  timeline.to(ball, { scaleX: 1.08, scaleY: 0.9, duration: 0.05, ease: 'power1.out' }, 1.53);
  timeline.to(ball, { scaleX: 1, scaleY: 1, y: -6, duration: 0.2, ease: 'power3.out' }, 1.58);
  timeline.to(ball, { y: 0, duration: 0.18, ease: 'power2.in' }, 1.78);
  timeline.to(ball, { scaleX: 1.03, scaleY: 0.96, duration: 0.04, ease: 'power1.out' }, 1.96);
  timeline.to(ball, { scaleX: 1, scaleY: 1, duration: 0.16, ease: 'power2.out' }, 2);
}
