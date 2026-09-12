import confetti from 'canvas-confetti';

export function fireOptimizationCelebration() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.85 },
    colors: ['#10B981', '#3B82F6', '#F59E0B'],
    disableForReducedMotion: true
  });
}