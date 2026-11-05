const { animate } = anime;

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  animate(".landing .hero .title", {
    opacity: [0, 1],
    translateY: [24, 0],
    duration: 850,
    ease: "out(3)",
  });

  animate(".landing .hero .typed-title", {
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 700,
    delay: 300,
    ease: "out(3)",
  });
}
