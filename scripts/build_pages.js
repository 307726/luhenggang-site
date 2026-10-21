#!/usr/bin/env node
/**
 * 从 data/site-data.json 生成产品页、问答页、栏目页和 sitemap。
 * 用法：node tools/site-build/build_pages.js output/luhenggang-site
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));

function readJsonDir(rel) {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
const products = readJsonDir("content/products").sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
const articles = readJsonDir("content/guides").sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
const news = readJsonDir("content/news").sort(
  (a, b) => (b.date || "").localeCompare(a.date || "") || (a.order ?? 99) - (b.order ?? 99)
);
const data = { site, products, articles, news };

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function write(rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log(`written: ${rel}`);
}

function layout({ title, description, canonicalPath, ogType, schema, body, prefix }) {
  const canonical = `${site.domain}${canonicalPath}`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="stylesheet" href="${prefix}assets/style.css">
  <script defer src="${prefix}assets/site.js"></script>
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="header-utility">
      <div class="container utility-inner">
        <p>钢管选型资料站 · 按材质、标准与规格查产品</p>
        <div class="utility-meta">
          <a href="tel:${esc(site.phone.replace(/[^\d+]/g, ""))}"><strong>${esc(site.phone)}</strong></a>
          <em class="utility-demo">演示联系方式</em>
        </div>
      </div>
    </div>
    <div class="container header-inner">
      <a class="brand" href="${prefix}index.html">
        <span class="brand-mark">鲁恒</span>
        <span>${esc(site.shortBrand)}<small>STEEL PIPE · 选型与供应资料</small></span>
      </a>
      <nav class="nav" id="site-nav" aria-label="主导航">
        <a href="${prefix}products/index.html">产品中心</a>
        <a href="${prefix}guides/index.html">技术指南</a>
        <a href="${prefix}news/index.html">行业资讯</a>
        <a href="${prefix}about.html">关于我们</a>
        <a href="${prefix}contact.html">联系我们</a>
      </nav>
      <div class="header-action">
        <a class="header-phone" href="tel:${esc(site.phone.replace(/[^\d+]/g, ""))}">${esc(site.phone)}</a>
        <a class="btn btn-primary" href="${prefix}contact.html">整理询价</a>
      </div>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="打开导航">
        <span></span>
      </button>
    </div>
  </header>

  <main>
${body}
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <span class="brand-mark">鲁恒</span>
            <strong>${esc(site.shortBrand)}</strong>
          </div>
          <p>高压锅炉管、合金管、管线管及常用无缝钢管选型资料。</p>
          <p>本站为演示项目，不构成供货、价格或材质承诺。</p>
        </div>
        <div>
          <h4>站内导航</h4>
          <p><a href="${prefix}index.html">首页</a></p>
          <p><a href="${prefix}products/index.html">产品中心</a></p>
          <p><a href="${prefix}guides/index.html">技术指南</a></p>
          <p><a href="${prefix}news/index.html">行业资讯</a></p>
          <p><a href="${prefix}about.html">关于我们</a></p>
          <p><a href="${prefix}contact.html">联系我们</a></p>
        </div>
        <div>
          <h4>采购提示</h4>
          <p>询价请准备：材质、外径×壁厚、数量、标准与交期。</p>
          <p>材质性能与实际供货范围以质保书和双方确认文件为准。</p>
        </div>
      </div>
      <p class="demo-note">© 2026 ${esc(site.brand)} · 演示站 · 电话、地址与库存均为演示信息</p>
    </div>
  </footer>
</body>
</html>
`;
}

function contactAside() {
  return `        <aside class="contact-box">
          <h3>整理采购需求</h3>
          <p>电话：${esc(site.phone)}<br>${esc(site.address)}</p>
          <form class="form inquiry-form" action="#" method="get">
            <label>称呼
              <input type="text" name="name" data-label="称呼" placeholder="怎么称呼">
            </label>
            <label>联系电话
              <input type="tel" name="phone" data-label="联系电话" placeholder="便于后续联系">
            </label>
            <label>规格与数量
              <textarea name="message" data-label="规格与数量" rows="3" placeholder="例如：20G，Φ133×10，20 吨"></textarea>
            </label>
            <button class="btn btn-primary" type="submit">生成询价摘要</button>
            <p class="form-note">仅在本页生成，不会自动发送。</p>
            <div class="inquiry-result" aria-live="polite">
              <strong>询价摘要</strong>
              <pre></pre>
            </div>
          </form>
        </aside>`;
}

function productUrl(p) {
  return `${site.domain}/products/${p.slug}.html`;
}

function articleUrl(a) {
  return `${site.domain}/guides/${a.slug}.html`;
}

function newsUrl(n) {
  return `${site.domain}/news/${n.slug}.html`;
}

function renderProduct(p) {
  const canonicalPath = `/products/${p.slug}.html`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl(p)}#product`,
        name: p.name,
        description: p.description,
        brand: { "@type": "Brand", name: site.brand },
        material: p.materials,
        category: `无缝钢管 / ${p.name}`,
        url: productUrl(p),
        additionalProperty: [
          { "@type": "PropertyValue", name: "执行标准", value: p.standard },
          { "@type": "PropertyValue", name: "外径范围", value: p.size },
          { "@type": "PropertyValue", name: "壁厚范围", value: p.thickness },
          { "@type": "PropertyValue", name: "交货状态", value: p.state }
        ]
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首页", item: `${site.domain}/` },
          { "@type": "ListItem", position: 2, name: "产品中心", item: `${site.domain}/products/index.html` },
          { "@type": "ListItem", position: 3, name: p.name, item: productUrl(p) }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: p.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
      }
    ]
  };

  const specRows = p.specs
    .map((s) => `                <tr><th scope="row">${esc(s.k)}</th><td>${esc(s.v)}</td></tr>`)
    .join("\n");

  const compositionRows = (p.composition || []).map((c) => [
    c.material,
    c.c,
    c.si,
    c.mn,
    c.cr,
    c.mo
  ]);
  const composition = compositionRows.length
    ? `
          <h2>化学成分（典型值，以质保书为准）</h2>
          <div class="table-wrap">
            <table>
              <thead><tr>${["材质", "C", "Si", "Mn", "Cr", "Mo"].map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
              <tbody>
${compositionRows.map((r) => `                <tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("\n")}
              </tbody>
            </table>
          </div>
          <p class="small-note">注：以上为演示用典型值，实际化学成分和力学性能以钢厂质保书及执行标准为准。</p>`
    : "";

  const faq = p.faq
    .map(
      (f, i) => `            <details${i === 0 ? " open" : ""}>
              <summary>${esc(f.q)}</summary>
              <p>${esc(f.a)}</p>
            </details>`
    )
    .join("\n");

  const related = p.related
    .map((slug) => data.products.find((x) => x.slug === slug))
    .filter(Boolean)
    .map((x) => `            <a href="../products/${x.slug}.html">${esc(x.name)}</a>`)
    .join("\n");

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../index.html">首页</a> / <a href="../products/index.html">产品中心</a> / ${esc(p.name)}
      </nav>
      <div class="page-head">
        <span class="kicker">产品参数 / ${esc(p.standard)}</span>
        <h1>${esc(p.name)}</h1>
        <div class="badges">
          <span class="badge">执行标准：${esc(p.standard)}</span>
          <span class="badge">材质：${esc(p.materials)}</span>
          <span class="badge">外径 ${esc(p.size)}</span>
          <span class="badge">壁厚 ${esc(p.thickness)}</span>
        </div>
      </div>
    </div>

    <section class="section section-compact">
      <div class="container two-col">
        <div>
          <div class="quick-answer">
            <b>选型要点：</b>${esc(p.answer)}
          </div>

${p.intro.map((t) => `          <p style="color:#334155">${esc(t)}</p>`).join("\n")}

          <h2>规格参数</h2>
          <div class="table-wrap">
            <table>
              <tbody>
${specRows}
              </tbody>
            </table>
          </div>
${composition}
          <h2>适用工况</h2>
          <ul>
            <li>${esc(p.applications)}</li>
            <li>询价时提供：材质、外径×壁厚、数量、执行标准、交货状态和交期要求。</li>
            <li>到货核对：材质单、质保书、炉批号、外观、壁厚和长度。</li>
          </ul>
          <p class="small-note">本站参数用于页面演示，实际库存、价格和供货范围需另行确认。</p>

          <h2>常见问题</h2>
          <div class="faq">
${faq}
          </div>

          <h2>相关产品</h2>
          <div class="related">
${related}
            <a href="../products/index.html">全部产品</a>
          </div>
        </div>

${contactAside()}
      </div>
    </section>`;

  return layout({
    title: `${p.title}-${site.brand}`,
    description: p.description,
    canonicalPath,
    ogType: "product",
    schema,
    body,
    prefix: "../"
  });
}

function renderArticle(a) {
  const canonicalPath = `/guides/${a.slug}.html`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: a.h1,
        description: a.description,
        inLanguage: "zh-CN",
        mainEntityOfPage: articleUrl(a),
        author: { "@type": "Organization", name: site.brand },
        publisher: { "@type": "Organization", name: site.brand },
        datePublished: site.updated,
        dateModified: site.updated
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首页", item: `${site.domain}/` },
          { "@type": "ListItem", position: 2, name: "技术指南", item: `${site.domain}/guides/index.html` },
          { "@type": "ListItem", position: 3, name: a.h1, item: articleUrl(a) }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: a.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
      }
    ]
  };

  const blocks = a.blocks
    .map((b) => {
      let out = `          <h2>${esc(b.h2)}</h2>`;
      if (b.p) out += "\n" + b.p.map((t) => `          <p>${esc(t)}</p>`).join("\n");
      if (b.ul) out += "\n          <ul>\n" + b.ul.map((t) => `            <li>${esc(t)}</li>`).join("\n") + "\n          </ul>";
      if (b.table) {
        out += `
          <div class="table-wrap">
            <table>
            <thead><tr>${b.table.headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
              <tbody>
${b.table.rows
  .map((r) => {
    const cells = b.table.headers.length > 2 ? [r.c1, r.c2, r.c3 || ""] : [r.c1, r.c2];
    return `                <tr>${cells.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`;
  })
  .join("\n")}
              </tbody>
            </table>
          </div>`;
      }
      return out;
    })
    .join("\n\n");

  const faq = a.faq
    .map(
      (f, i) => `            <details${i === 0 ? " open" : ""}>
              <summary>${esc(f.q)}</summary>
              <p>${esc(f.a)}</p>
            </details>`
    )
    .join("\n");

  const related = a.related
    .map((slug) => data.articles.find((x) => x.slug === slug))
    .filter(Boolean)
    .map((x) => `            <a href="../guides/${x.slug}.html">${esc(x.h1)}</a>`)
    .join("\n");

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../index.html">首页</a> / <a href="../guides/index.html">技术指南</a> / ${esc(a.h1)}
      </nav>
      <div class="page-head">
        <span class="kicker">技术指南 / 选型参考</span>
        <h1>${esc(a.h1)}</h1>
        <div class="badges">
${a.badges.map((b) => `          <span class="badge">${esc(b)}</span>`).join("\n")}
        </div>
      </div>
    </div>

    <section class="section section-compact">
      <div class="container two-col">
        <article class="article">
          <div class="quick-answer">
            <b>先给结论：</b>${esc(a.answer)}
          </div>

${blocks}

          <h2>常见问题</h2>
          <div class="faq">
${faq}
          </div>

          <h2>相关阅读</h2>
          <div class="related">
${related}
            <a href="../guides/index.html">全部技术指南</a>
          </div>
        </article>

${contactAside()}
      </div>
    </section>`;

  return layout({
    title: `${a.title}-${site.brand}`,
    description: a.description,
    canonicalPath,
    ogType: "article",
    schema,
    body,
    prefix: "../"
  });
}

function renderProductsIndex() {
  const cards = data.products
    .map(
      (p, index) => `          <article class="card">
            <span class="catalog-no">${String(index + 1).padStart(2, "0")} / ${esc(p.standard)}</span>
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.description)}</p>
            <a class="more" href="${p.slug}.html">查看参数与选型</a>
          </article>`
    )
    .join("\n");

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../index.html">首页</a> / 产品中心
      </nav>
      <div class="page-head">
        <span class="kicker">01 / 产品目录</span>
        <h1>产品中心</h1>
        <p>按工况和标准划分产品线，先查执行标准与规格范围，再核对材质和交货状态。</p>
      </div>
    </div>

    <section class="section section-compact">
      <div class="container">
        <div class="product-catalog">
${cards}
        </div>
      </div>
    </section>`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "产品中心",
    url: `${site.domain}/products/index.html`,
    isPartOf: { "@type": "WebSite", name: site.brand, url: `${site.domain}/` }
  };

  return layout({
    title: `产品中心_钢管品类与执行标准-${site.brand}`,
    description: "鲁恒钢管演示站产品中心：高压锅炉管、合金管、管线管、结构管、流体管、不锈钢管的执行标准、规格范围与选型说明。",
    canonicalPath: "/products/index.html",
    ogType: "website",
    schema,
    body,
    prefix: "../"
  });
}

function renderGuidesIndex() {
  const cards = data.articles
    .map(
      (a, index) => `          <article class="card">
            <span class="catalog-no">${String(index + 1).padStart(2, "0")} / 选型参考</span>
            <h3>${esc(a.h1)}</h3>
            <p>${esc(a.description)}</p>
            <a class="more" href="${a.slug}.html">阅读全文</a>
          </article>`
    )
    .join("\n");

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../index.html">首页</a> / 技术指南
      </nav>
      <div class="page-head">
        <span class="kicker">02 / 技术资料</span>
        <h1>技术指南</h1>
        <p>围绕材质、执行标准、规格和验收整理的短答案，先看结论，再核对适用边界。</p>
      </div>
    </div>

    <section class="section section-compact">
      <div class="container">
        <div class="editorial-grid">
${cards}
        </div>
      </div>
    </section>`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "技术指南",
    url: `${site.domain}/guides/index.html`,
    isPartOf: { "@type": "WebSite", name: site.brand, url: `${site.domain}/` }
  };

  return layout({
    title: `技术指南_钢管选型与标准解释-${site.brand}`,
    description: "钢管选型、标准解释、采购验收与计价方法的问答型技术指南。",
    canonicalPath: "/guides/index.html",
    ogType: "website",
    schema,
    body,
    prefix: "../"
  });
}

function renderNewsIndex() {
  const categorySections = ["公司动态", "行业新闻"]
    .map((category) => {
      const items = data.news.filter((n) => n.category === category);
      if (!items.length) return "";
      const cards = items
        .map(
          (n) => `          <article class="card">
            <p class="kicker">${esc(category)} · ${esc(n.date)}</p>
            <h3>${esc(n.title)}</h3>
            <p>${esc(n.summary)}</p>
            <a class="more" href="${n.slug}.html">阅读全文</a>
          </article>`
        )
        .join("\n");
      return `        <div class="section-head" style="margin-top:36px">
          <h2>${esc(category)}</h2>
        </div>
        <div class="editorial-grid">
${cards}
        </div>`;
    })
    .join("\n");

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../index.html">首页</a> / 新闻
      </nav>
      <div class="page-head">
        <span class="kicker">03 / 行业资讯</span>
        <h1>新闻与行业资讯</h1>
        <p>公司动态、标准变化与采购常见问题。演示站内容用于展示栏目结构。</p>
      </div>
    </div>

    <section class="section section-compact">
      <div class="container">
${categorySections}
      </div>
    </section>`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "新闻与动态",
    url: `${site.domain}/news/index.html`,
    isPartOf: { "@type": "WebSite", name: site.brand, url: `${site.domain}/` },
    hasPart: data.news.map((n) => ({ "@type": "NewsArticle", headline: n.title, url: newsUrl(n) }))
  };

  return layout({
    title: `新闻与动态-${site.brand}`,
    description: "鲁恒钢管演示站的公司动态与行业新闻，包含建站进展、内容整理与钢管选型知识。",
    canonicalPath: "/news/index.html",
    ogType: "website",
    schema,
    body,
    prefix: "../"
  });
}

function renderNewsItem(n) {
  const canonicalPath = `/news/${n.slug}.html`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        headline: n.title,
        description: n.summary,
        articleSection: n.category,
        datePublished: n.date,
        dateModified: n.date,
        inLanguage: "zh-CN",
        mainEntityOfPage: newsUrl(n),
        author: { "@type": "Organization", name: site.brand },
        publisher: { "@type": "Organization", name: site.brand }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首页", item: `${site.domain}/` },
          { "@type": "ListItem", position: 2, name: "新闻", item: `${site.domain}/news/index.html` },
          { "@type": "ListItem", position: 3, name: n.title, item: newsUrl(n) }
        ]
      }
    ]
  };

  const paragraphs = n.body.map((p) => `          <p>${esc(p)}</p>`).join("\n");
  const related = data.news
    .filter((x) => x.slug !== n.slug)
    .slice(0, 2)
    .map((x) => `            <a href="../news/${x.slug}.html">${esc(x.title)}</a>`)
    .join("\n");

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../index.html">首页</a> / <a href="../news/index.html">新闻</a> / ${esc(n.title)}
      </nav>
      <div class="page-head">
        <span class="kicker">行业资讯 / ${esc(n.category)}</span>
        <h1>${esc(n.title)}</h1>
        <div class="badges">
          <span class="badge">${esc(n.category)}</span>
          <span class="badge">${esc(n.date)}</span>
        </div>
      </div>
    </div>

    <section class="section section-compact">
      <div class="container two-col">
        <article class="article">
          <div class="quick-answer">
            <b>摘要：</b>${esc(n.summary)}
          </div>
${paragraphs}

          <h2>相关阅读</h2>
          <div class="related">
${related}
            <a href="../news/index.html">全部新闻</a>
          </div>
        </article>

${contactAside()}
      </div>
    </section>`;

  return layout({
    title: `${n.title}-${site.brand}`,
    description: n.summary,
    canonicalPath,
    ogType: "article",
    schema,
    body,
    prefix: "../"
  });
}

function renderAbout() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "关于我们",
    url: `${site.domain}/about.html`,
    isPartOf: { "@type": "WebSite", name: site.brand, url: `${site.domain}/` }
  };

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="index.html">首页</a> / 关于我们
      </nav>
      <div class="page-head">
        <span class="kicker">04 / 关于鲁恒</span>
        <h1>关于我们</h1>
        <p>钢管产品资料、执行标准与采购选型内容的展示页面。</p>
      </div>
    </div>

    <section class="section section-compact">
      <div class="container two-col">
        <article class="article">
          <div class="quick-answer">
            <b>说明：</b>本站为钢管行业演示项目，非真实经营主体。品牌、电话、地址和库存信息均为演示数据。
          </div>
          <h2>资料怎么组织</h2>
          <p>站点以采购人员查找产品的顺序组织内容：先按用途找到品类，再核对执行标准、材质、外径和壁厚，最后查看常见问题与验收要点。</p>
          <p>关键参数放在正文表格里，避免只印在图片上。不同牌号、不同标准之间存在适用范围差异，页面只提供选型线索，最终仍需以设计文件和质保书为准。</p>
          <h2>内容原则</h2>
          <ul>
            <li>先写适用场景，再列规格与执行标准</li>
            <li>不把演示参数写成现货或成交承诺</li>
            <li>材质、性能和验收要求注明以质保书为准</li>
            <li>采购需求尽量用可核对的字段描述</li>
          </ul>
          <h2>适合查阅的场景</h2>
          <p>需要快速确认 GB/T 5310 高压锅炉管、GB/T 3087 低中压锅炉管、12Cr1MoVG 合金管等资料的采购、技术和内容人员，可以先从产品中心或技术指南进入。</p>
          <div class="related">
            <a href="products/index.html">产品中心</a>
            <a href="guides/index.html">技术指南</a>
            <a href="news/index.html">行业资讯</a>
            <a href="contact.html">联系我们</a>
          </div>
        </article>

${contactAside()}
      </div>
    </section>`;

  return layout({
    title: `关于我们-${site.brand}`,
    description: "鲁恒钢管演示站的资料结构与内容说明。本站为建站演示，非真实经营主体。",
    canonicalPath: "/about.html",
    ogType: "website",
    schema,
    body,
    prefix: ""
  });
}

function renderContact() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "联系我们",
    url: `${site.domain}/contact.html`,
    isPartOf: { "@type": "WebSite", name: site.brand, url: `${site.domain}/` }
  };

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="index.html">首页</a> / 联系我们
      </nav>
      <div class="page-head">
        <span class="kicker">05 / 联系与询价</span>
        <h1>把采购规格说明白</h1>
        <p>材质、外径×壁厚、数量、执行标准和交期越完整，越容易核对需求。</p>
      </div>
    </div>

    <section class="section section-compact">
      <div class="container two-col">
        <div class="panel">
          <h2 style="margin-top:0">联系方式</h2>
          <p><strong>电话：</strong>${esc(site.phone)}</p>
          <p><strong>邮箱：</strong>${esc(site.email)}</p>
          <p><strong>地址：</strong>${esc(site.address)}</p>
          <p class="small-note">以上均为演示信息，不对应真实业务。正式上线前需替换。</p>
          <form class="form inquiry-form" action="#" method="get" style="max-width:620px">
            <div class="form-row">
              <label>称呼
                <input type="text" name="name" data-label="称呼" placeholder="怎么称呼">
              </label>
              <label>联系电话
                <input type="tel" name="phone" data-label="联系电话" placeholder="便于后续联系">
              </label>
            </div>
            <label>公司名称
              <input type="text" name="company" data-label="公司名称" placeholder="选填">
            </label>
            <label>采购需求
              <textarea name="message" data-label="采购需求" rows="4" placeholder="例如：20G，Φ133×10，GB/T 5310，20 吨"></textarea>
            </label>
            <button class="btn btn-primary" type="submit">生成询价摘要</button>
            <p class="form-note">当前演示站仅在本页生成摘要，不会发送或保存资料。</p>
            <div class="inquiry-result" aria-live="polite">
              <strong>询价摘要</strong>
              <pre></pre>
            </div>
          </form>
        </div>
        <aside class="contact-box">
          <h3 style="margin-top:0">询价前请准备</h3>
          <p>1. 材质牌号与执行标准<br>2. 外径×壁厚、定尺长度<br>3. 数量、交货状态与交期<br>4. 特殊检验或资料要求</p>
          <p>如果有设计温度、介质或用途，也建议一并说明。</p>
          <a class="btn btn-ghost" style="margin-top:8px" href="guides/pipe-inspection.html">查看验收清单</a>
        </aside>
      </div>
    </section>`;

  return layout({
    title: `联系我们-${site.brand}`,
    description: "鲁恒钢管演示站的联系页面，展示电话、邮箱、地址与询价表单结构。所有联系方式均为演示信息。",
    canonicalPath: "/contact.html",
    ogType: "website",
    schema,
    body,
    prefix: ""
  });
}

function renderSitemap() {
  const urls = [
    { loc: `${site.domain}/`, priority: "1.0", freq: "weekly" },
    { loc: `${site.domain}/products/index.html`, priority: "0.9", freq: "weekly" },
    ...data.products.map((p) => ({ loc: productUrl(p), priority: "0.9", freq: "monthly" })),
    { loc: `${site.domain}/guides/index.html`, priority: "0.8", freq: "weekly" },
    ...data.articles.map((a) => ({ loc: articleUrl(a), priority: "0.8", freq: "monthly" })),
    { loc: `${site.domain}/news/index.html`, priority: "0.8", freq: "weekly" },
    ...data.news.map((n) => ({ loc: newsUrl(n), priority: "0.7", freq: "monthly" })),
    { loc: `${site.domain}/about.html`, priority: "0.5", freq: "monthly" },
    { loc: `${site.domain}/contact.html`, priority: "0.6", freq: "monthly" }
  ];
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${site.updated}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

write("products/index.html", renderProductsIndex());
write("guides/index.html", renderGuidesIndex());
write("news/index.html", renderNewsIndex());
write("about.html", renderAbout());
write("contact.html", renderContact());
for (const p of data.products) write(`products/${p.slug}.html`, renderProduct(p));
for (const a of data.articles) write(`guides/${a.slug}.html`, renderArticle(a));
for (const n of data.news) write(`news/${n.slug}.html`, renderNewsItem(n));
write("sitemap.xml", renderSitemap());
console.log("\ndone.");
