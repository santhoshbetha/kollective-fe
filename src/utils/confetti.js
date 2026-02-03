import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  // A professional "burst" from the center
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#1DA1F2', '#17BF63', '#FFAD1F', '#E0245E'], // Kollective Brand Colors
  });
};

export const firePrideConfetti = () => {
  // Side cannons for bigger celebrations
  const end = Date.now() + (2 * 1000);

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

//============================================================================
//Disable Animations
//To respect users with vestibular sensitivities, you can wrap your confetti utility in a check for the
//prefers-reduced-motion media query. This ensures that your "moments of delight" don't cause 
// physical discomfort for users who have requested minimal animation at the OS level MDN prefers-reduced-motion.

// /Modify src/utils/confetti.js to include a check for the user's motion preferences.
import confetti from 'canvas-confetti';

/**
 * Checks if the user has requested reduced motion at the OS level.
 */
export const shouldReduceMotion = () => 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const fireConfetti = () => {
  // 1. Silent return if user prefers no movement
  if (shouldReduceMotion()) return;

  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#1DA1F2', '#17BF63', '#FFAD1F', '#E0245E'],
  });
};

/* src/styles/animations.css */

//@media (prefers-reduced-motion: reduce) {
//  *, ::before, ::after {
//   animation-delay: -1ms !important;
//    animation-duration: 1ms !important;
//    animation-iteration-count: 1 !important;
//   background-attachment: initial !important;
//   scroll-behavior: auto !important;
//    transition-duration: 0s !important;
//    transition-delay: 0s !important;
//  }
  
//  .animate-shake {
//    /* Instead of shaking, just turn the border red */
//    border-color: #ff4d4f !important;
//    transform: none !important;
//  }
//}

//=============================================================================
//"OLED-Safe Confetti" mode that uses darker, higher-contrast colors specifically for your theme-oled users?
// src/utils/confetti.js
import confetti from 'canvas-confetti';
import { useSettingsStore } from '@/features/settings/store/useSettingsStore';

export const fireConfetti = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const theme = useSettingsStore.getState().theme;

  // OLED Palette: High-vibrancy neons that look sharp on #000000
  const oledColors = ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ffffff'];
  // Standard Palette: Brand colors for Light/Dark modes
  const standardColors = ['#1DA1F2', '#17BF63', '#FFAD1F', '#E0245E'];

  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: theme === 'oled' ? oledColors : standardColors,
    // Add a slight glow effect for OLED
    scalar: theme === 'oled' ? 1.2 : 1, 
  });
};

/*
Infinite Contrast: On an OLED screen, the black pixels are off. Using neon colors like #00ff00 (Electric Green) creates a stunning visual "float" effect that standard muted colors can't achieve MDN OLED Performance.
Sub-pixel Optimization: Pure white and neons utilize the OLED sub-pixels most efficiently, making the animation appear crisper during movement.
Store Integration: By reaching into useSettingsStore.getState(), the utility stays pure-functional and doesn't require being a React hook.
*/

//=============================================================================


