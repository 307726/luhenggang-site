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
        <a href="${prefix}news/index.html">新闻</a>
        <a href="${prefix}about.html">关于我们</a>
        <a href="${prefix}contact.html">联系我们</a>
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
          <p><a href="${prefix}news/index.html">新闻</a></p>
          <p><a href="${prefix}about.html">关于我们</a></p>
          <p><a href="${prefix}contact.html">联系我们</a></p>
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
            <a class="more" href="${n.slug}.html">阅读全文 →</a>
          </article>`
        )
        .join("\n");
      return `        <div class="section-head" style="margin-top:36px">
          <h2>${esc(category)}</h2>
        </div>
        <div class="grid">
${cards}
        </div>`;
    })
    .join("\n");

  const body = `    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../index.html">首页</a> / 新闻
      </nav>
      <div class="page-head">
        <span class="kicker">News</span>
        <h1>新闻与动态</h1>
        <p style="color:#64748b;max-width:720px">公司动态与行业新闻。内容以演示为主，用来练习企业站的信息发布与搜索收录。</p>
      </div>
    </div>

    <section class="section" style="padding-top:20px">
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
        <span class="kicker">News</span>
        <h1>${esc(n.title)}</h1>
        <div class="badges">
          <span class="badge">${esc(n.category)}</span>
          <span class="badge">${esc(n.date)}</span>
        </div>
      </div>
    </div>

    <section class="section" style="padding-top:28px">
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
        <span class="kicker">About</span>
        <h1>关于我们</h1>
        <p style="color:#64748b;max-width:720px">一个用于练习企业建站与 GEO 的钢管行业演示站。</p>
      </div>
    </div>

    <section class="section" style="padding-top:28px">
      <div class="container two-col">
        <article class="article">
          <div class="quick-answer">
            <b>说明：</b>本站为建站案例演示，非真实经营主体。品牌、电话、地址和库存信息均为演示数据。
          </div>
          <h2>我们在做什么</h2>
          <p>这个站点用钢管行业作为案例，练习从域名、托管、后台内容管理到搜索收录和 GEO 优化的完整流程。页面里的产品分类、参数表、执行标准和常见问题，都是按照真实企业站的阅读与检索习惯组织的。</p>
          <h2>内容原则</h2>
          <ul>
            <li>产品参数用表格呈现，不把关键信息印在图片里</li>
            <li>先给结论，再给对比和适用边界</li>
            <li>公司名称、电话、地址保持全站一致</li>
            <li>重要页面提供结构化数据，方便搜索和 AI 理解</li>
          </ul>
          <h2>技术栈</h2>
          <p>静态 HTML + 内容 JSON + 构建脚本，后台使用 Decap CMS，托管在 Netlify。每次在后台发布内容，都会提交到 Git 并自动重新部署。</p>
          <div class="related">
            <a href="products/index.html">产品中心</a>
            <a href="news/index.html">新闻与动态</a>
            <a href="contact.html">联系我们</a>
          </div>
        </article>

${contactAside()}
      </div>
    </section>`;

  return layout({
    title: `关于我们-${site.brand}`,
    description: "鲁恒钢管演示站的项目说明、内容原则与技术栈。本站为建站与 GEO 案例演示，非真实经营主体。",
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
        <span class="kicker">Contact</span>
        <h1>联系我们</h1>
        <p style="color:#64748b;max-width:720px">演示联系方式，仅用于页面结构展示；表单不会发送真实数据。</p>
      </div>
    </div>

    <section class="section" style="padding-top:28px">
      <div class="container two-col">
        <div class="panel">
          <h2 style="margin-top:0">演示联系方式</h2>
          <p><strong>电话：</strong>${esc(site.phone)}</p>
          <p><strong>邮箱：</strong>${esc(site.email)}</p>
          <p><strong>地址：</strong>${esc(site.address)}</p>
          <p style="color:#64748b">以上均为演示信息，不对应真实业务。真实项目上线前需替换为实际联系方式。</p>
          <form class="form" action="#" method="get" style="max-width:520px">
            <input type="text" name="name" placeholder="称呼（演示，不会发送）" aria-label="称呼">
            <input type="tel" name="phone" placeholder="手机号（演示，不会发送）" aria-label="手机号">
            <input type="text" name="company" placeholder="公司名称（演示，不会发送）" aria-label="公司名称">
            <textarea name="message" rows="4" placeholder="采购需求：材质、规格、数量（演示，不会发送）" aria-label="采购需求"></textarea>
            <button class="btn btn-primary" type="button">提交（演示按钮）</button>
          </form>
        </div>
        <aside class="contact-box">
          <h3 style="margin-top:0">询价前请准备</h3>
          <p>材质牌号、外径×壁厚、数量、执行标准和交货状态。信息越完整，供应商越容易给出准确报价。</p>
          <p>本站为建站案例演示，非真实经营主体。</p>
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
