(() => {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll(".hero-slide")];
    const dots = [...carousel.querySelectorAll(".hero-dot")];
    const counter = carousel.querySelector(".hero-count");
    const previous = carousel.querySelector(".hero-prev");
    const next = carousel.querySelector(".hero-next");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeIndex = 0;
    let timer;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === activeIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === activeIndex;
        dot.classList.toggle("is-active", active);
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      if (counter) {
        counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      }
    };

    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (reducedMotion || slides.length < 2) return;
      timer = window.setInterval(() => showSlide(activeIndex + 1), 5500);
    };

    previous?.addEventListener("click", () => {
      showSlide(activeIndex - 1);
      start();
    });
    next?.addEventListener("click", () => {
      showSlide(activeIndex + 1);
      start();
    });
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
        start();
      });
    });

    carousel.addEventListener("pointerenter", stop);
    carousel.addEventListener("pointerleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) start();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    showSlide(0);
    start();
  });

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "打开导航");
      }
    });
  }

  document.querySelectorAll(".inquiry-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const lines = [];
      form.querySelectorAll("[name]").forEach((field) => {
        const value = field.value.trim();
        if (!value) return;
        const label = field.dataset.label || field.getAttribute("aria-label") || field.name;
        lines.push(`${label}：${value}`);
      });

      const result = form.querySelector(".inquiry-result");
      const output = form.querySelector(".inquiry-result pre");
      if (!result || !output) return;

      if (!lines.length) {
        output.textContent = "请先填写至少一项需求。";
      } else {
        output.textContent = `${lines.join("\n")}\n\n以上内容仅保存在当前页面，尚未发送。`;
      }
      result.classList.add("is-visible");
    });
  });
})();
