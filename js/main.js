const featured = [
  { file: "foyer-red-art.jpg", title: "Foyer" },
  { file: "bath-soaking-tub.jpg", title: "Bath, soaking tub" },
  { file: "living-shutters-sectional.jpg", title: "Living room" },
  { file: "hero-craftsman.jpg", title: "Craftsman porch" },
  { file: "apt-open-living-wide.jpg", title: "Open living" },
  { file: "bath-navy-double-vanity.jpg", title: "Navy vanity" },
  { file: "exterior-white-black-ranch.jpg", title: "Ranch exterior" },
];

const archive = [
  { file: "about-skyline.jpg", title: "Skyline light" },
  { file: "apt-empty-city-view.jpg", title: "City view" },
  { file: "foyer-art-doors.jpg", title: "Entry" },
  { file: "hall-dark-green.jpg", title: "Dark green hall" },
  { file: "hall-white-mauve-alcove.jpg", title: "Mauve alcove" },
  { file: "bath-navy-gold-sconces.jpg", title: "Gold sconces" },
  { file: "bath-tub-shower-chandelier.jpg", title: "Tub & shower" },
  { file: "bath-double-vanity.jpg", title: "Double vanity" },
  { file: "kitchen-sage-sink.jpg", title: "Sage kitchen" },
  { file: "kitchen-curved.jpg", title: "Kitchen" },
  { file: "bar-sage-wine-rack.jpg", title: "Bar" },
  { file: "dining-charcoal.jpg", title: "Dining" },
  { file: "staircase.jpg", title: "Stair" },
  { file: "action-scaffold-ceiling-white.jpg", title: "Ceiling, in progress" },
  { file: "craftsman-straighton.jpg", title: "Craftsman front" },
  { file: "craftsman-front.jpg", title: "Elevation" },
  { file: "exterior-charcoal.jpg", title: "Charcoal exterior" },
  { file: "exterior-green-column.jpg", title: "Column" },
  { file: "exterior-two-tone-garage.jpg", title: "Outbuilding" },
  { file: "exterior-palm-black-window.jpg", title: "Window" },
  { file: "commercial-saltlight-hires.jpg", title: "Storefront" },
];

const allWorks = [...featured, ...archive];
let lightboxIndex = 0;

const row = document.getElementById("exhibition-row");
const archiveGrid = document.getElementById("archive-grid");
const lightbox = document.getElementById("lightbox");
const lightImg = lightbox.querySelector("img");
const lightCap = document.getElementById("lightbox-cap");
const hudIndex = document.getElementById("hud-index");
const hudBar = document.getElementById("hud-bar");
const hudTitle = document.getElementById("hud-title");

document.getElementById("exhibition-count").textContent =
  `${String(featured.length).padStart(2, "0")} plates`;

featured.forEach((item, i) => {
  const el = document.createElement("article");
  el.className = "plate panel";
  el.tabIndex = 0;
  el.dataset.index = String(i);
  const n = String(i + 1).padStart(2, "0");
  el.innerHTML = `
    <div class="plate-media">
      <img src="images/work/${item.file}" alt="${item.title}" loading="${i < 2 ? "eager" : "lazy"}" />
      <div class="plate-overlay">
        <span class="plate-index">${n}</span>
        <h3 class="plate-title">${item.title}</h3>
      </div>
    </div>
  `;
  const open = () => openLightbox(i);
  el.addEventListener("click", open);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });
  row.appendChild(el);
});

archive.forEach((item, i) => {
  const globalIndex = featured.length + i;
  const fig = document.createElement("figure");
  fig.className = "archive-item";
  fig.tabIndex = 0;
  fig.innerHTML = `
    <div class="archive-frame">
      <img src="images/work/${item.file}" alt="${item.title}" loading="lazy" />
    </div>
    <figcaption>
      <span>${item.title}</span>
      <span>${String(i + 1).padStart(2, "0")}</span>
    </figcaption>
  `;
  const open = () => openLightbox(globalIndex);
  fig.addEventListener("click", open);
  fig.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });
  archiveGrid.appendChild(fig);
});

function openLightbox(index) {
  lightboxIndex = index;
  const work = allWorks[lightboxIndex];
  lightImg.src = `images/work/${work.file}`;
  lightImg.alt = work.title;
  lightCap.textContent = work.title;
  lightbox.showModal();
}

function stepLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + allWorks.length) % allWorks.length;
  const work = allWorks[lightboxIndex];
  lightImg.src = `images/work/${work.file}`;
  lightImg.alt = work.title;
  lightCap.textContent = work.title;
}

lightbox.querySelector("[data-close]").addEventListener("click", () => lightbox.close());
lightbox.querySelector("[data-prev]").addEventListener("click", () => stepLightbox(-1));
lightbox.querySelector("[data-next]").addEventListener("click", () => stepLightbox(1));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.close();
});
window.addEventListener("keydown", (e) => {
  if (!lightbox.open) return;
  if (e.key === "ArrowLeft") stepLightbox(-1);
  if (e.key === "ArrowRight") stepLightbox(1);
});

/* Lenis + GSAP */
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const mm = gsap.matchMedia();

mm.add("(min-width: 861px)", () => {
  const pin = document.querySelector(".exhibition-pin");
  const getScroll = () => Math.max(0, row.scrollWidth - window.innerWidth);

  const tween = gsap.to(row, {
    x: () => -getScroll(),
    ease: "none",
    scrollTrigger: {
      trigger: pin,
      start: "top top",
      end: () => `+=${getScroll()}`,
      scrub: 0.65,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        hudBar.style.width = `${p * 100}%`;
        const idx = Math.min(
          featured.length - 1,
          Math.floor(p * featured.length + 0.001)
        );
        hudIndex.textContent = String(idx + 1).padStart(2, "0");
        hudTitle.textContent = featured[idx]?.title || "";
      },
    },
  });

  hudTitle.textContent = featured[0].title;
  hudIndex.textContent = "01";

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(row, { clearProps: "transform" });
  };
});

/* Hero entrance after load */
function playHero() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(".hero-line", { opacity: 1, y: 0, duration: 1.05, stagger: 0.12 }, 0)
    .to(".hero-kicker", { opacity: 1, y: 0, duration: 0.8 }, 0.35)
    .to(".hero-lede", { opacity: 1, y: 0, duration: 0.8 }, 0.45)
    .to(".hero-enter", { opacity: 1, y: 0, duration: 0.8 }, 0.55)
    .to(".hero-locale", { opacity: 1, duration: 0.8 }, 0.65);

  gsap.to(".hero-img", {
    scale: 1.03,
    xPercent: -0.5,
    yPercent: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

/* Archive reveal */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".archive-item").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

/* Nav active state */
const navMap = [
  { id: "exhibition", key: "exhibition" },
  { id: "about", key: "about" },
  { id: "contact", key: "contact" },
];
const navLinks = [...document.querySelectorAll("[data-nav]")];
const sectionIo = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const key = entry.target.id;
      navLinks.forEach((a) => {
        a.classList.toggle("is-active", a.dataset.nav === key);
      });
    });
  },
  { threshold: 0.35 }
);
navMap.forEach(({ id }) => {
  const el = document.getElementById(id);
  if (el) sectionIo.observe(el);
});

/* Custom cursor */
const cursor = document.getElementById("cursor");
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.body.classList.add("has-cursor");
  const pos = { x: 0, y: 0 };
  const mouse = { x: 0, y: 0 };
  let hover = false;
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    cursor.style.opacity = "1";
  });
  gsap.ticker.add(() => {
    pos.x += (mouse.x - pos.x) * 0.2;
    pos.y += (mouse.y - pos.y) * 0.2;
    const s = hover ? 3.4 : 1;
    gsap.set(cursor, {
      x: pos.x,
      y: pos.y,
      scale: s,
    });
  });
  document.querySelectorAll("a, button, .plate, .archive-item").forEach((el) => {
    el.addEventListener("mouseenter", () => { hover = true; });
    el.addEventListener("mouseleave", () => { hover = false; });
  });
}

/* Loader */
document.body.classList.add("is-loading");
const fill = document.getElementById("loader-fill");
gsap.to(fill, {
  width: "100%",
  duration: 1.15,
  ease: "power2.inOut",
  onComplete: () => {
    document.getElementById("loader").classList.add("is-done");
    document.body.classList.remove("is-loading");
    playHero();
    ScrollTrigger.refresh();
  },
});

document.getElementById("year").textContent = String(new Date().getFullYear());
