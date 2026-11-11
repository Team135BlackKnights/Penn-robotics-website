(() => {
  const anime = window.anime;
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (
    !anime ||
    typeof anime.animate !== "function" ||
    prefersReducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    return;
  }

  const heroItems = document.querySelectorAll(
    ".landing .hero .title, .landing .hero .typed-title"
  );

  heroItems.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(22px)";

    anime.animate(element, {
      opacity: [0, 1],
      translateY: [22, 0],
      duration: 720,
      delay: index * 120,
      ease: "out(3)",
    });
  });

  const revealItems = document.querySelectorAll(
    ".main > .title, .main > .subtitle, .grid .box, .main .content .section, " +
      ".team-grid .team-box, .team-container .team, .quote-section .title, " +
      ".sponsors > .title, .sponsors .preview > a"
  );

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        currentObserver.unobserve(entry.target);
        anime.animate(entry.target, {
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 650,
          delay: Math.min(
            Array.prototype.indexOf.call(
              entry.target.parentElement.children,
              entry.target
            ) * 70,
            280
          ),
          ease: "out(3)",
        });
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -32px 0px",
    }
  );

  revealItems.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(18px)";
    observer.observe(element);
  });
})();