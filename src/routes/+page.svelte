<script lang="ts">
  import './app.css';

  import { onMount, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  let visible = false;
  let scrollContainer: HTMLElement;
  let isScrolling = false;
  let isDesktop = false;

  let heroVisible = false;
  let featuresVisible = false;
  let howItWorksVisible = false;

  onMount(async () => {
    isDesktop = window.innerWidth >= 1280;

    if (isDesktop && scrollContainer) {
      // --- wait for DOM to be ready
      await tick();

      // --- set initial position immediately without animation
      const sectionWidth = window.innerWidth;
      scrollContainer.style.scrollBehavior = 'auto';
      scrollContainer.scrollLeft = sectionWidth * 3;

      // --- small delay to ensure scroll is set, then show content
      setTimeout(() => {
        scrollContainer.style.scrollBehavior = 'smooth';
        visible = true;
        setupIntersectionObserver();
      }, 10);

      let scrollTimeout: string | number | NodeJS.Timeout | undefined;
      scrollContainer.addEventListener('scroll', () => {
        if (isScrolling) return;

        clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(() => {
          const scrollPos = scrollContainer.scrollLeft;
          const currentSection = Math.round(scrollPos / sectionWidth);

          if (currentSection >= 6) {
            isScrolling = true;
            scrollContainer.style.scrollBehavior = 'auto';
            scrollContainer.scrollLeft = (currentSection - 3) * sectionWidth;
            setTimeout(() => {
              scrollContainer.style.scrollBehavior = 'smooth';
              isScrolling = false;
            }, 50);
          }

          if (currentSection < 3) {
            isScrolling = true;
            scrollContainer.style.scrollBehavior = 'auto';
            scrollContainer.scrollLeft = (currentSection + 3) * sectionWidth;
            setTimeout(() => {
              scrollContainer.style.scrollBehavior = 'smooth';
              isScrolling = false;
            }, 50);
          }
        }, 150);
      });
    } else {
      visible = true;
      setTimeout(() => {
        heroVisible = true;
        featuresVisible = true;
        howItWorksVisible = true;
      }, 100);
    }
  });

  function setupIntersectionObserver() {
    const observerOptions = {
      root: scrollContainer,
      threshold: 0.3,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionClass = entry.target.classList;
          if (sectionClass.contains('hero-section')) {
            heroVisible = true;
          } else if (sectionClass.contains('features-section')) {
            featuresVisible = true;
          } else if (sectionClass.contains('how-it-works-section')) {
            howItWorksVisible = true;
          }
        }
      });
    }, observerOptions);

    document
      .querySelectorAll('.hero-section, .features-section, .how-it-works-section')
      .forEach((section) => {
        observer.observe(section);
      });
  }

  let features = [
    {
      icon: '📚',
      title: 'Smart Content Extraction',
      description:
        "Only captures content you've actually read - tracks your scroll position to generate relevant quizzes."
    },
    {
      icon: '⚡',
      title: 'AI-Powered Questions',
      description:
        'Generates intelligent quiz questions using advanced AI to test your understanding of the content.'
    },
    {
      icon: '⏱️',
      title: 'Timed Challenges',
      description:
        "60-second quizzes that keep you engaged and help reinforce what you've learned quickly."
    },
    {
      icon: '📊',
      title: 'Track Your Progress',
      description:
        'View your quiz history, scores, and time taken. Retake any quiz to improve your knowledge.'
    },
    {
      icon: '🎯',
      title: 'Clean Content',
      description:
        'Automatically filters out navigation, headers, and footers to focus only on the main content.'
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description:
        'All quiz data is stored locally in your browser. Your reading habits stay private.'
    }
  ];

  let steps = [
    {
      number: '1',
      title: 'Browse & Read',
      description: 'Read any article or webpage at your own pace'
    },
    {
      number: '2',
      title: 'Click Extension',
      description: "Click the Buzz icon when you're ready to test yourself"
    },
    {
      number: '3',
      title: 'Generate Quiz',
      description: "AI creates quiz questions based on what you've read"
    },
    {
      number: '4',
      title: 'Take Quiz',
      description: 'Answer 10 questions in 60 seconds and see your results'
    }
  ];
</script>

<div
  bind:this={scrollContainer}
  class="min-h-screen bg-black xl:flex xl:overflow-x-auto xl:overflow-y-hidden xl:snap-x xl:snap-mandatory overflow-y-auto"
  style="scroll-behavior: smooth;"
>
  <!-- Scroll Right Indicator - Desktop Only -->
  <div
    class="hidden xl:flex fixed top-6 right-6 items-center gap-2 z-40 bg-black animate-bounce-horizontal"
  >
    <span class="text-white text-sm font-medium">Scroll Right</span>
    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  </div>

  {#each isDesktop ? [1, 2, 3] : [1] as clone}
    <!-- Hero Section -->
    <section
      class="hero-section min-h-screen xl:min-w-full xl:flex-shrink-0 xl:snap-start flex items-center px-4 sm:px-6 py-12 xl:py-0"
    >
      <div
        class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16 w-full"
      >
        {#if heroVisible}
          <!-- Left side - Text content -->
          <div class="flex-1 text-center lg:text-left space-y-4 sm:space-y-6">
            <h1
              class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight"
              in:fly={{ y: -50, duration: 800, delay: 100, easing: quintOut }}
            >
              Learn Better with <span class="text-white animate-pulse-slow">Buzz</span>
            </h1>
            <p
              class="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              in:fly={{ y: 30, duration: 800, delay: 300, easing: quintOut }}
            >
              Transform any webpage into an engaging quiz. Test your knowledge, track your progress,
              and retain information better with AI-powered learning.
            </p>

            <button
              onclick={() =>
                window.open(
                  'https://chromewebstore.google.com/detail/buzz/bnfnbglfgppkhloiebilejcoipkafcjg',
                  '_blank'
                )}
              in:fly={{ y: 30, duration: 800, delay: 500, easing: quintOut }}
              class="bg-white hover:bg-gray-200 text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg cursor-pointer transition transform duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              Add to Chrome - It's Free
            </button>
          </div>

          <!-- Right side - Image -->
          <div
            class="flex-1 w-full lg:w-auto max-w-md lg:max-w-none mx-auto"
            in:fly={{ x: 100, duration: 1000, delay: 500, easing: quintOut }}
          >
            <div>
              <img
                src="/icon.png"
                alt="Buzz Extension Demo"
                class="w-full h-auto rounded-lg shadow-2xl shadow-white/10"
              />
            </div>
          </div>
        {/if}
      </div>
    </section>

    <!-- Features Section -->
    <section
      class="features-section min-h-screen xl:min-w-full xl:flex-shrink-0 xl:snap-start flex items-center px-4 sm:px-6 py-12 xl:py-0"
    >
      <div class="container mx-auto w-full">
        {#if featuresVisible}
          <h2
            class="text-3xl sm:text-4xl font-bold text-center text-white mb-3 sm:mb-4"
            in:fly={{ y: 30, duration: 800, delay: 0, easing: quintOut }}
          >
            Why Buzz?
          </h2>
          <p
            class="text-center text-gray-400 mb-10 sm:mb-16 text-base sm:text-lg"
            in:fly={{ y: 30, duration: 800, delay: 100, easing: quintOut }}
          >
            The smartest way to test what you've learned
          </p>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {#each features as feature, i (feature.title)}
              <div
                class="bg-black p-6 sm:p-8 rounded-xl border border-white shadow-lg shadow-white/5 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
                style="transform-origin: center;"
              >
                <div class="text-4xl sm:text-5xl mb-3 sm:mb-4 animate-bounce-slow">
                  {feature.icon}
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p class="text-sm sm:text-base text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </section>

    <!-- How It Works Section -->
    <section
      class="how-it-works-section min-h-screen xl:min-w-full xl:flex-shrink-0 xl:snap-start flex items-center py-12 sm:py-20 border-y border-white/10 px-4 sm:px-6"
    >
      <div class="container mx-auto w-full">
        {#if howItWorksVisible}
          <h2
            class="text-3xl sm:text-4xl font-bold text-center text-white mb-3 sm:mb-4"
            in:fly={{ y: 30, duration: 800, delay: 0, easing: quintOut }}
          >
            How It Works
          </h2>
          <p
            class="text-center text-gray-400 mb-10 sm:mb-16 text-base sm:text-lg"
            in:fly={{ y: 30, duration: 800, delay: 100, easing: quintOut }}
          >
            Four simple steps to better learning
          </p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {#each steps as step, i (step.number)}
              <div
                class="text-center transform transition-all duration-300 hover:scale-110"
                in:fly|local={{ y: 60, duration: 700, delay: 200 + i * 150, easing: quintOut }}
              >
                <div
                  class="w-12 h-12 sm:w-16 sm:h-16 bg-white text-black rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 transition-all duration-300 hover:bg-gray-200 animate-pulse-slow"
                >
                  {step.number}
                </div>
                <h3 class="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">{step.title}</h3>
                <p class="text-xs sm:text-base text-gray-400">{step.description}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </section>
  {/each}
</div>

<!-- Footer - Always at bottom -->
<footer
  class="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 py-4 z-50"
>
  <div class="container mx-auto px-4 sm:px-6">
    {#if visible}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-gray-400 text-xs sm:text-sm">
          <a
            class="text-white font-semibold"
            href="https://tunny.netlify.app/"
            target="_blank"
            rel="noopener noreferrer">Adetunji Adeyemi</a
          >
        </p>

        <!-- Social Links -->
        <div class="flex gap-4 items-center">
          <a
            href="https://www.linkedin.com/in/adetunji-stephen-adeyemi-5936a1217/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-white transition-colors duration-300 text-xs sm:text-sm"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/tunjiadeyemi"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-white transition-colors duration-300 text-xs sm:text-sm"
          >
            GitHub
          </a>
          <a
            href="mailto:tvnji01@gmail.com"
            class="text-gray-400 hover:text-white transition-colors duration-300 text-xs sm:text-sm"
          >
            Contact
          </a>
        </div>
      </div>
    {/if}
  </div>
</footer>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #000;
  }

  :global(html) {
    scroll-behavior: smooth;
  }

  /* Desktop: horizontal scroll */
  @media (min-width: 1280px) {
    :global(body) {
      overflow-y: hidden;
      height: 100vh;
    }

    :global(html) {
      overflow: hidden;
      height: 100vh;
    }
  }

  /* Mobile/Tablet: vertical scroll */
  @media (max-width: 1279px) {
    :global(body) {
      overflow-y: auto;
      overflow-x: hidden;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes pulse-slow {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes bounce-slow {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes bounce-horizontal {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(10px);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  :global(.animate-float) {
    animation: float 6s ease-in-out infinite;
  }

  :global(.animate-pulse-slow) {
    animation: pulse-slow 3s ease-in-out infinite;
  }

  :global(.animate-bounce-slow) {
    animation: bounce-slow 2s ease-in-out infinite;
  }

  :global(.animate-bounce-horizontal) {
    animation: bounce-horizontal 1.5s ease-in-out infinite;
  }

  :global(.animate-fade-in) {
    animation: fade-in 1s ease-in;
  }
</style>
