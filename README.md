# 鲁恒钢管演示站

用于练习「企业建站 + GEO（生成式引擎优化）」的静态站样板。所有公司信息、电话、地址、库存与参数均为演示数据。

## 文件结构

```
index.html                       首页（手写维护）
content/site.json                站点设置（后台可改）
content/products/*.json          每个产品一个文件（后台可改）
content/guides/*.json            每篇指南一个文件（后台可改）
admin/                           Decap CMS 后台（/admin/）
scripts/build_pages.js           构建脚本（生成页面与 sitemap）
scripts/validate_site.js         技术自检脚本
products/index.html              产品中心
products/*.html                  6 个产品页（生成）
guides/index.html                技术指南
guides/*.html                    5 篇问答页（生成）
assets/style.css                 全站样式（无外部依赖）
assets/uploads/                  后台上传图片目录
robots.txt                       放行主流搜索与 AI 爬虫
sitemap.xml                      站点地图（生成）
llms.txt                         给 AI 阅读的站点摘要（新兴约定）
data/site-data.json              旧版数据快照（已迁移到 content/，保留作备份）
```

## 改内容的工作流

方式一：后台编辑（推荐）

```powershell
# 终端 1：本地后台代理（8081）
npx decap-server

# 终端 2：网站（8080）
npm run serve
```

打开 `http://localhost:8080/admin/`，点"登录"即可（本地模式不需要 GitHub）。保存后运行：

```powershell
npm run build
```

方式二：直接改 `content/*.json`，然后：

```powershell
npm run build
npm run check
```

生成脚本只覆盖 `products/`、`guides/` 和 `sitemap.xml`，不会改首页和 `assets/`。

## 本地预览

最简单的方式：直接双击 `index.html`，相对链接和样式都能正常加载。

需要模拟线上环境（测试 robots / sitemap / 绝对路径）时，在 `output/luhenggang-site` 目录下运行任意静态服务器，例如：

```powershell
npx serve .
```

然后打开终端提示的 `http://localhost:3000/`（端口以实际输出为准）。

## 上线前必须替换

1. 当前域名已设为 `https://luhenggang.space`；换域名时涉及 canonical、schema、sitemap、robots、llms.txt
2. 品牌名、电话、邮箱、地址 → 真实信息（或保持演示声明）
3. 产品参数、化学成分、库存 → 真实数据，并注明「以质保书为准」
4. 页脚备案号 → 走国内空间时替换为真实备案号并链接工信部
5. 删除或保留「演示站」声明：正式上线时必须删除

## 上线后的抓取动作

1. 提交百度搜索资源平台、必应 Webmaster、头条搜索站长平台、神马/夸克、搜狗站长平台
2. 必应额外用 IndexNow 主动推送
3. 服务器日志按 UA 统计 `Bytespider`、`Baiduspider`、`YisouSpider`、`Sogou web spider`
4. 用 `tools/geo-monitor/questions.json` 每月做引用采样，至少 3 次取比例

## 部署到 Netlify（推荐先跑通）

1. 在 GitHub 建一个空仓库，把本站推上去
2. Netlify → Add new site → Import an existing project → 选这个仓库
3. 构建命令 `npm run build`，发布目录 `.`（`netlify.toml` 已写好）
4. 部署完成后打开 `https://你的站点.netlify.app/admin/`，用 GitHub 登录
5. 把 `admin/config.yml` 里的 `repo` 改成 `你的用户名/luhenggang-site`

## 部署到 Cloudflare Pages

1. Pages → Connect to Git → 选仓库
2. 构建命令 `npm run build`，输出目录 `.`
3. 额外部署一个 OAuth Worker（Decap 文档里的 Cloudflare Worker 模板）
4. 在 `admin/config.yml` 填 `base_url` 和 `auth_endpoint`

## 注意

- 本站没有任何 JS 依赖，关掉 JS 也能看到全部正文，这是为了抓取。
- `llms.txt` 是新兴约定，不要把它当成收录保证。
- 演示数据不要用于真实报价或选型。
