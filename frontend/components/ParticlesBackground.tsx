'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    particlesJS: any;
  }
}

export default function ParticlesBackground() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.async = true;
    script.onload = () => {
      window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 40, // Reduced from 120
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: ['#00FF94', '#00b8ff']  // Reduced colors
          },
          shape: {
            type: 'circle'
          },
          opacity: {
            value: 0.5,
            random: false, // Disabled random opacity
            anim: {
              enable: false // Disabled animation
            }
          },
          size: {
            value: 2,
            random: true,
            anim: {
              enable: false // Disabled animation
            }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#00FF94',
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 1.5, // Reduced speed
            direction: 'none',
            random: false, // Disabled random movement
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: false // Disabled attract
            }
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: true,
              mode: 'repulse'
            },
            onclick: {
              enable: false // Disabled click interaction
            },
            resize: true
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4
            }
          }
        },
        retina_detect: false // Disabled retina detection
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div 
      id="particles-js" 
      className="fixed inset-0 z-0"
      style={{ 
        background: 'linear-gradient(135deg, #0A0B0E 0%, #12151a 100%)'
      }}
    />
  );
} 