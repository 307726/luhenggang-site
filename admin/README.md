# 内容管理（Decap CMS）

后台地址：`/admin/`
内容文件：`content/products/*.json`、`content/guides/*.json`、`content/site.json`

---

## 一、本地先跑起来（不需要 GitHub）

Decap 支持本地后端，配置里已经打开 `local_backend: true`。

1. 启动本地代理（默认 8081 端口）：

```powershell
npx decap-server
```

2. 另开一个终端，启动网站（8080 端口）：

```powershell
npx serve . -l 8080
```

3. 浏览器打开 `http://localhost:8080/admin/`

这时不需要登录 GitHub，直接就能看到"站点设置 / 产品 / 技术指南"三个栏目。保存后会写入 `content/`，但**不会自动生成页面**，需要再跑一次：

```powershell
npm run build
```

---

## 二、上线后的登录方式

`admin/config.yml` 现在用 Netlify 的 Git Gateway 后端：

```yaml
backend:
  name: git-gateway
  branch: main
```

上线前在 Netlify 后台做三件事：

1. **Identity → Enable Identity**
2. **Identity → Services → Git Gateway → Enable Git Gateway**
3. **Identity → Users → Invite users**，填你的邮箱，角色选 Admin 或 Editor；收到邮件后设置密码

然后部署最新代码，打开 `/admin/`，用刚邀请的邮箱登录。

> 说明：Git Gateway 已被 Netlify 标记为 deprecated，但当前仍可用，适合练手。
> 如果以后不可用，再换 GitHub OAuth 代理（见下）。

### 备选：GitHub OAuth 代理（部署在 Cloudflare Pages 时用）

1. 在 GitHub 创建 OAuth App，回调地址指向你的代理
2. 部署一个小 Worker 做 code 换 token
3. 在 `config.yml` 里填：

```yaml
backend:
  name: github
  repo: 你的用户名/luhenggang-site
  branch: main
  base_url: https://你的代理域名
  auth_endpoint: auth
```

---

## 三、发布流程

```
后台保存 → 生成一次 Git commit
→ 托管平台检测到仓库变化
→ 自动执行 npm run build
→ 生成静态 HTML 并发布
```

所以托管平台要设置：

- 构建命令：`npm run build`
- 发布目录：`.`（站点根目录）

---

## 四、注意事项

- `slug` 决定 URL，发布后不要改；改了会生成新页面，旧链接会 404。
- 图片上传到 `assets/uploads/`，建议先压缩到 200KB 以内。
- 后台路径 `/admin/` 已在 `robots.txt` 里禁止抓取。
- 后台登录不要用弱密码；GitHub 账号务必开双重验证。
- 每次大改前先在 Git 里提交一次，改坏了可以回滚。
