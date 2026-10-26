(() => {
  document.documentElement.classList.add("js");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll(".hero-slide")];
    const dots = [...carousel.querySelectorAll(".hero-dot")];
    const counter = carousel.querySelector(".hero-count");
    const previous = carousel.querySelector(".hero-prev");
    const next = carousel.querySelector(".hero-next");
    let activeIndex = 0;
    let timer;

    if (slides.length < 2) return;

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
        counter.textContent = `${activeIndex + 1} / ${slides.length}`;
      }
    };

    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (!reducedMotion) timer = window.setInterval(() => showSlide(activeIndex + 1), 5500);
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

  const productData = {
    boiler: {
      name: "高压锅炉管",
      summary: "用于锅炉受热面、集箱和蒸汽管道，先按设计温度和压力确认牌号。",
      material: "20G、15CrMoG、12Cr1MoVG",
      standard: "GB/T 5310",
      size: "外径 6–426 mm / 壁厚 1–60 mm",
      href: "products/20g-boiler-tube.html"
    },
    alloy: {
      name: "合金管",
      summary: "面向高温高压工况，材质与热处理要求需要结合设计条件确认。",
      material: "P91、P22、12Cr1MoVG、15CrMoG",
      standard: "GB/T 5310 / ASME SA335",
      size: "外径 6–426 mm / 壁厚 1–60 mm",
      href: "products/alloy-pipe.html"
    },
    line: {
      name: "管线管",
      summary: "用于石油天然气输送，重点核对牌号、钢管等级和项目技术条件。",
      material: "L245N、L360N、L415",
      standard: "GB/T 9711 / API 5L",
      size: "外径 60–820 mm / 壁厚 3–30 mm",
      href: "products/line-pipe.html"
    },
    structure: {
      name: "结构管",
      summary: "用于机械加工与工程结构，需同时确认尺寸、牌号和交货状态。",
      material: "10#、20#、35#、45#、Q345B",
      standard: "GB/T 8162",
      size: "外径 6–426 mm / 壁厚 1–60 mm",
      href: "products/structural-pipe.html"
    },
    fluid: {
      name: "流体管",
      summary: "用于一般流体输送，选型时看介质、压力、温度和执行标准。",
      material: "10#、20#、Q345B/C/D/E",
      standard: "GB/T 8163",
      size: "外径 6–426 mm / 壁厚 1–60 mm",
      href: "products/fluid-pipe.html"
    },
    stainless: {
      name: "不锈钢管",
      summary: "面向化工与耐腐蚀工况，牌号和表面要求需要结合介质确认。",
      material: "304、304L、316L、310S、409L",
      standard: "GB/T 14976",
      size: "外径 6–426 mm / 壁厚 1–20 mm",
      href: "products/stainless-pipe.html"
    }
  };

  const finder = document.querySelector(".finder-layout");
  if (finder) {
    const tabs = [...finder.querySelectorAll("[data-product]")];
    const result = finder.querySelector(".finder-result");
    const name = finder.querySelector("[data-result-name]");
    const summary = finder.querySelector("[data-result-summary]");
    const material = finder.querySelector("[data-result-material]");
    const standard = finder.querySelector("[data-result-standard]");
    const size = finder.querySelector("[data-result-size]");
    const link = finder.querySelector("[data-result-link]");
    let switchTimer;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const selected = productData[tab.dataset.product];
        if (!selected) return;

        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });

        window.clearTimeout(switchTimer);
        result.classList.add("is-switching");
        switchTimer = window.setTimeout(() => {
          name.textContent = selected.name;
          summary.textContent = selected.summary;
          material.textContent = selected.material;
          standard.textContent = selected.standard;
          size.textContent = selected.size;
          link.href = selected.href;
          link.textContent = `查看${selected.name}参数`;
          result.classList.remove("is-switching");
        }, reducedMotion ? 0 : 150);
      });
    });
  }

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

      output.textContent = lines.length
        ? `${lines.join("\n")}\n\n以上内容仅保存在当前页面，尚未发送。`
        : "请先填写至少一项需求。";
      result.classList.add("is-visible");
    });
  });
})();
