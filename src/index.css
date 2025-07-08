@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply font-sans transition-colors duration-500;
  }

  /* Dark theme (default) */
  body {
    @apply bg-gray-950 text-white;
    background: linear-gradient(135deg, #0a0a0f 0%, #1a0a1f 50%, #0f0a1a 100%);
    background-size: 400% 400%;
    animation: gradient-shift 20s ease infinite;
  }

  /* Light theme */
  body.light {
    @apply bg-gray-50 text-gray-900;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
    background-size: 400% 400%;
  }

  /* Vaporwave theme */
  body.vaporwave {
    @apply bg-purple-950 text-pink-100;
    background: linear-gradient(135deg, #2d1b69 0%, #11052c 50%, #3c096c 100%);
    background-size: 400% 400%;
  }

  html {
    scroll-behavior: smooth;
  }
}

@layer components {
  .glass-card {
    @apply backdrop-blur-glass border rounded-2xl transition-all duration-300;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  /* Dark theme glass */
  .glass-card {
    @apply bg-glass-light border-white/20;
  }

  /* Light theme glass */
  body.light .glass-card {
    @apply bg-white/80 border-gray-200/50;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  /* Vaporwave theme glass */
  body.vaporwave .glass-card {
    @apply bg-purple-900/30 border-pink-400/30;
    box-shadow: 0 8px 32px rgba(236, 72, 153, 0.2);
  }

  .glass-button {
    @apply glass-card px-6 py-3 font-medium transition-all duration-300 hover:scale-105 cursor-pointer;
  }

  .glass-button:hover {
    @apply bg-glass-medium;
  }

  body.light .glass-button:hover {
    @apply bg-white/90;
  }

  body.vaporwave .glass-button:hover {
    @apply bg-purple-800/50;
  }

  .psychedelic-text {
    @apply bg-gradient-to-r from-psychedelic-purple via-psychedelic-pink to-psychedelic-cyan bg-clip-text text-transparent;
    background-size: 200% 100%;
    animation: gradient-shift 6s ease-in-out infinite;
  }

  .glow-subtle {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
  }

  .glow-medium {
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
  }

  .nav-glass {
    @apply fixed top-0 left-0 right-0 z-50 transition-all duration-500;
    backdrop-filter: blur(16px);
  }

  .nav-glass {
    background: rgba(10, 10, 15, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  body.light .nav-glass {
    background: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  body.vaporwave .nav-glass {
    background: rgba(45, 27, 105, 0.8);
    border-bottom: 1px solid rgba(236, 72, 153, 0.3);
  }

  .floating-shape {
    @apply absolute opacity-10 pointer-events-none;
    background: linear-gradient(45deg, #8B5CF6, #EC4899);
    border-radius: 50% 30% 70% 40%;
    animation: float 8s ease-in-out infinite;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

body.light ::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #8B5CF6, #EC4899);
  border-radius: 3px;
}

/* Selection styling */
::selection {
  background: rgba(139, 92, 246, 0.3);
  color: white;
}

body.light ::selection {
  background: rgba(139, 92, 246, 0.2);
  color: black;
}

/* Focus styles for accessibility */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid #8B5CF6;
  outline-offset: 2px;
}
