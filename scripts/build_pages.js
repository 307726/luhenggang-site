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
const data = { site, products, articles };

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
    <div class="container header-inner">
      <a class="brand" href="${prefix}index.html">
        <span class="brand-mark">鲁恒</span>
        <span>${esc(site.shortBrand)}<small>LUHENG STEEL · 演示站</small></span>
      </a>
      <nav class="nav" aria-label="主导航">
        <a href="${prefix}products/index.html">产品中心</a>
        <a href="${prefix}guides/index.html">技术指南</a>
        <a href="${prefix}index.html#faq">常见问题</a>
        <a href="${prefix}index.html#contact">联系我们</a>
      </nav>
    </div>
  </header>

  <main>
${body}
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>${esc(site.brand)}</h4>
          <p>钢管行业企业站样板：参数表 + 执行标准 + 选型问答。</p>
          <p>用于建站与 GEO 案例演示，不构成任何供货或价格承诺。</p>
        </div>
        <div>
          <h4>页面</h4>
          <p><a href="${prefix}index.html">首页</a></p>
          <p><a href="${prefix}products/index.html">产品中心</a></p>
          <p><a href="${prefix}guides/index.html">技术指南</a></p>
        </div>
        <div>
          <h4>说明</h4>
          <p>本站为建站案例演示，非真实经营主体。</p>
          <p>电话、地址、库存均为演示信息。</p>
        </div>
      </div>
      <p class="demo-note">© 2026 ${esc(site.brand)} · 建站与 GEO 练习项目 · 备案号：演示站未备案</p>
    </div>
  </footer>
</body>
</html>
`;
}

function contactAside() {
  return `        <aside class="contact-box">
          <h3 style="margin-top:0">演示联系方式</h3>
          <p>电话：${esc(site.phone)}<br>邮箱：${esc(site.email)}<br>地址：${esc(site.address)}</p>
          <form class="form" action="#" method="get">
            <input type="text" name="name" placeholder="称呼（演示，不会发送）" aria-label="称呼">
            <input type="tel" name="phone" placeholder="手机号（演示，不会发送）" aria-label="手机号">
            <textarea name="message" rows="3" placeholder="规格与数量（演示，不会发送）" aria-label="采购需求"></textarea>
            <button class="btn btn-primary" type="button">提交（演示按钮）</button>
          </form>
        </aside>`;
}

function productUrl(p) {
  return `${site.domain}/products/${p.slug}.html`;
}

function articleUrl(a) {
  return `${site.domain}/guides/${a.slug}.html`;
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
          <p style="color:#64748b;font-size:13px">注：以上为演示用典型值，实际化学成分和力学性能以钢厂质保书及执行标准为准。</p>`
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
        <span class="kicker">Product</span>
        <h1>${esc(p.name)}</h1>
        <div class="badges">
          <span class="badge">执行标准：${esc(p.standard)}</span>
          <span class="badge">材质：${esc(p.materials)}</span>
          <span class="badge">外径 ${esc(p.size)}</span>
          <span class="badge">壁厚 ${esc(p.thickness)}</span>
        </div>
      </div>
    </div>

    <section class="section" style="padding-top:32px">
      <div class="container two-col">
        <div>
          <div class="quick-answer">
            <b>直接回答：</b>${esc(p.answer)}
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
            <li>本站为演示站，不提供真实库存、报价或发货服务。</li>
          </ul>

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
        <span class="kicker">Guide</span>
        <h1>${esc(a.h1)}</h1>
        <div class="badges">
${a.badges.map((b) => `          <span class="badge">${esc(b)}</span>`).join("\n")}
        </div>
      </div>
    </div>

    <section class="section" style="padding-top:28px">
      <div class="container two-col">
        <article class="article">
          <div class="quick-answer">
            <b>直接回答：</b>${esc(a.answer)}
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
      (p) => `          <article class="card">
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.description)}</p>
            <a class="more" href="${p.slug}.html">查看参数与选型 →</a>
          </article>`
    )
    .join("\n");

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../index.html">首页</a> / 产品中心
      </nav>
      <div class="page-head">
        <span class="kicker">Products</span>
        <h1>产品中心</h1>
        <p style="color:#64748b;max-width:720px">按工况和标准划分产品线。每个页面都给出执行标准、规格范围、材质说明和常见问题，方便采购与搜索。</p>
      </div>
    </div>

    <section class="section" style="padding-top:28px">
      <div class="container">
        <div class="grid">
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
      (a) => `          <article class="card">
            <h3>${esc(a.h1)}</h3>
            <p>${esc(a.description)}</p>
            <a class="more" href="${a.slug}.html">阅读全文 →</a>
          </article>`
    )
    .join("\n");

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../index.html">首页</a> / 技术指南
      </nav>
      <div class="page-head">
        <span class="kicker">Knowledge</span>
        <h1>技术指南</h1>
        <p style="color:#64748b;max-width:720px">把采购最常问的问题写成可直接引用的短答案：先给结论，再给对比表和选型边界。</p>
      </div>
    </div>

    <section class="section" style="padding-top:28px">
      <div class="container">
        <div class="grid">
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

function renderSitemap() {
  const urls = [
    { loc: `${site.domain}/`, priority: "1.0", freq: "weekly" },
    { loc: `${site.domain}/products/index.html`, priority: "0.9", freq: "weekly" },
    ...data.products.map((p) => ({ loc: productUrl(p), priority: "0.9", freq: "monthly" })),
    { loc: `${site.domain}/guides/index.html`, priority: "0.8", freq: "weekly" },
    ...data.articles.map((a) => ({ loc: articleUrl(a), priority: "0.8", freq: "monthly" }))
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
for (const p of data.products) write(`products/${p.slug}.html`, renderProduct(p));
for (const a of data.articles) write(`guides/${a.slug}.html`, renderArticle(a));
write("sitemap.xml", renderSitemap());
console.log("\ndone.");
