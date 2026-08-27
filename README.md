# 湖工商生活指南 · HUTB Campus Guide

> 湖南工商大学 ACM 协会 出品 · 给湖工商学子的全景攻略网站

## 📦 包含内容

8 个 HTML 页面 + 完整 CMS 后台 + 设计系统 + 数据层。

### 前台页面

| 页面 | 文件 | 说明 |
|------|------|------|
| 首页 | `index.html` | Hero、四大板块入口、精选内容、招新 CTA |
| 美食地图 | `food.html` | 校内食堂 + 周边餐饮，按分类/搜索筛选 |
| 周边游玩 | `travel.html` | 橘子洲、岳麓山、后湖等路线，含交通与时长 |
| 学习攻略 | `study.html` | 选课、图书馆、自习攻略 |
| 新生事项 | `freshman.html` | 入学、宿舍、军训、清单、防骗 |
| 文章详情 | `article.html?type=&id=` | 通用富文本阅读页 + 上下篇导航 |
| 管理员登录 | `login.html` | 后台登录页 |
| CMS 后台 | `admin.html` | 完整内容管理后台 |

### 资源与样式

```
assets/acm-logo.png       — ACM 协会 Logo
css/main.css              — 共享设计系统（导航/卡片/按钮/响应式）
css/admin.css             — CMS 后台样式
js/data.js                — localStorage 数据层（默认演示数据 + CRUD）
js/shared.js              — 公共工具、招新报名弹窗、移动端菜单
js/{food,travel,study,freshman}.js  — 板块页渲染逻辑
js/main.js                — 首页逻辑
js/article.js             — 详情页逻辑
js/admin.js               — 后台逻辑（CRUD、富文本、图片上传、导入导出）
```

## 🚀 本地预览

```bash
cd HUTB-campus-guide
python -m http.server 8765
# 浏览器访问 http://localhost:8765/
```

> 必须通过 HTTP 服务访问（不能直接 file:// 打开），否则 localStorage 不可用。

## 🔑 CMS 登录

- 账号：`admin`
- 密码：`hutb@2026`

> 演示账号位于 `js/data.js` 顶部 `ADMIN_ACCOUNTS`，实际部署请改为后端 + JWT。

## 🎨 设计规范

**配色系统**
- 主色 `#1e6091` 海蓝 · 辅色 `#52a6b8` 青绿
- 强调 `#ee6c4d` 珊瑚橙（呼应 ACM Logo）
- 背景 `#fff8f0` 米白暖色

**响应式**
- 移动端 < 720px：汉堡菜单 + 单列布局
- 平板 720-960px
- 桌面 > 960px

## ✨ CMS 功能清单

四大板块均支持：
- ✅ 新增 / 编辑 / 删除 / 排序（上/下移）
- ✅ 置顶 / 取消置顶（按 sortOrder + pinned 排序）
- ✅ 发布 / 草稿切换
- ✅ 图片上传（转 base64 内嵌到 localStorage）
- ✅ 简易富文本编辑器（B/I/U/H3/H4/列表/引用/链接/横线）
- ✅ 字段差异化：food 含评分/菜品/价格；travel 含交通/时长；study 含作者

系统功能：
- ✅ 分类管理（每个板块独立管理）
- ✅ 招新报名列表 + CSV 导出
- ✅ 站点设置（站点名/欢迎语/招新链接/ACM 介绍）
- ✅ 数据 JSON 导入 / 导出 / 重置

## 📬 招新报名两种方式

1. **站内表单**（默认）：首页 + 各页底部 + 后台 redirect 触发，打开内嵌表单
2. **外链跳转**：在 CMS 「站点设置」填入完整 https URL，自动新窗口跳转

## ⚠️ 已知局限

- localStorage 上限 5-10MB，超大量图片可能溢出；大数据建议切换 IndexedDB
- 单设备单浏览器数据隔离；多管理员协作需改造为后端
- 演示用本地账号无加密，生产环境必须后端鉴权
- "地图交互浏览" 当前以卡片+位置标注呈现；如需真实交互地图，可接入高德/百度地图 API

## 🛠️ 替换部署

只需把 `HUTB-campus-guide/` 整个目录上传到任意静态服务器（Nginx、GitHub Pages、Vercel、Netlify 等），改一下 `js/data.js` 的 `ADMIN_ACCOUNTS` 和站点设置即可上线。
