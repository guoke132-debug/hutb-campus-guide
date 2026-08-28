/* ====================================================================
 * article.js - 文章详情页逻辑
 * ==================================================================== */

(function () {
  'use strict';

  const SECTION_CONFIG = {
    food:     { name: '美食地图', color: '#ee6c4d', icon: '🍱', backUrl: 'food.html' },
    travel:   { name: '周边游玩', color: '#52a6b8', icon: '🌊', backUrl: 'travel.html' },
    study:    { name: '学习攻略', color: '#1e6091', icon: '📚', backUrl: 'study.html' },
    freshman: { name: '新生事项', color: '#7cb518', icon: '🎒', backUrl: 'freshman.html' },
  };

  function init() {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    const id = params.get('id');

    if (!SECTION_CONFIG[type] || !id) {
      renderNotFound();
      return;
    }

    const item = HUTBData.get(type, id);
    if (!item || item.published === false) {
      renderNotFound();
      return;
    }
    renderArticle(type, item);
    renderPrevNext(type, id);
  }

  function renderNotFound() {
    document.getElementById('articleTitle').textContent = '内容不存在或已被删除';
    document.getElementById('articleBody').innerHTML = `
      <div class="empty">
        <div class="empty-icon">🔍</div>
        <p>该内容可能已被移除,或链接错误。</p>
        <a href="index.html" class="btn btn-secondary" style="margin-top: var(--sp-3);">← 回到首页</a>
      </div>
    `;
  }

  function renderArticle(type, item) {
    const cfg = SECTION_CONFIG[type];
    document.title = `${item.title} · ${cfg.name} · 湖工商生活指南`;

    const category = document.getElementById('articleCategory');
    category.innerHTML = `<span class="badge" style="background:${cfg.color};">${cfg.icon} ${cfg.name} · ${HUTB.escape(item.category || '')}</span>`;

    document.getElementById('articleTitle').textContent = item.title;

    const meta = document.getElementById('articleMeta');
    const metaParts = [];
    if (item.author) metaParts.push(`👤 ${HUTB.escape(item.author)}`);
    if (item.readTime) metaParts.push(`⏱️ ${HUTB.escape(item.readTime)}`);
    metaParts.push(`📅 ${HUTB.escape(HUTB.formatDate(item.updatedAt || item.createdAt))}`);
    metaParts.push(`👀 ${Math.floor(Math.random()*1500 + 500)} 次阅读`);
    meta.innerHTML = metaParts.join('  ·  ');

    const cover = document.getElementById('articleCover');
    if (item.cover) {
      cover.innerHTML = `<img src="${HUTB.escape(item.cover)}" alt="">`;
    } else {
      cover.style.background = `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}cc 100%)`;
      cover.style.color = '#fff';
      cover.innerHTML = `<span>${cfg.icon}</span>`;
    }

    const body = document.getElementById('articleBody');
    body.innerHTML = item.content || `<p>${HUTB.escape(item.excerpt || '')}</p>`;

    // 渲染特定板块的元信息卡
    body.insertAdjacentHTML('afterbegin', renderMetaCard(type, item, cfg));

    const tagsWrap = document.createElement('div');
    tagsWrap.style.cssText = 'margin-top: var(--sp-5); padding-top: var(--sp-4); border-top: 1px dashed var(--c-border); display:flex; gap: var(--sp-2); flex-wrap: wrap; align-items:center;';
    const tagsHtml = (item.tags || []).map((t) => `<span class="tag tag-pri">${HUTB.escape(t)}</span>`).join('');
    tagsWrap.innerHTML = `<span style="font-size:0.875rem; color:var(--c-text-muted); margin-right: var(--sp-2);">标签:</span>${tagsHtml}`;
    body.appendChild(tagsWrap);
  }

  function renderMetaCard(type, item, cfg) {
    // 生成地图导航按钮（location 字段）
    const mapBtn = item.location ? `
      <div style="margin-top: var(--sp-4); padding-top: var(--sp-3); border-top: 1px solid rgba(255,255,255,0.3); display:flex; gap:var(--sp-3); flex-wrap:wrap;">
        <a href="https://map.qq.com/?search=${encodeURIComponent(item.location)}" target="_blank" class="btn" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.4); font-size:0.85rem;">📍 腾讯地图</a>
        <a href="https://uri.amap.com/search?keyword=${encodeURIComponent(item.location)}" target="_blank" class="btn" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.4); font-size:0.85rem;">🗺️ 高德导航</a>
      </div>` : '';

    if (type === 'food') {
      const dishes = (item.recommendedDishes || []).map((d) => `<span class="tag tag-acc" style="margin: 2px;">${HUTB.escape(d)}</span>`).join(' ');
      return `
        <div class="card" style="margin-bottom: var(--sp-5); padding: var(--sp-4); background: linear-gradient(135deg, #ff9671 0%, #ee6c4d 100%); color:#fff; border:none;">
          <div style="display:flex; flex-wrap: wrap; gap: var(--sp-5); font-size: 0.9rem;">
            <div>📍 <b>位置</b>: ${HUTB.escape(item.location || '—')}</div>
            <div>💰 <b>价位</b>: ${HUTB.escape(item.priceRange || '—')}</div>
            ${item.rating ? `<div>⭐ <b>评分</b>: ${item.rating.toFixed(1)} / 5.0</div>` : ''}
          </div>
          ${dishes ? `<div style="margin-top: var(--sp-3);"><b>推荐菜品:</b> ${dishes}</div>` : ''}
          ${mapBtn}
        </div>`;
    }
    if (type === 'travel') {
      return `
        <div class="card" style="margin-bottom: var(--sp-5); padding: var(--sp-4); background: linear-gradient(135deg, #52a6b8 0%, #2989b8 100%); color:#fff; border:none;">
          <div style="display:flex; flex-wrap: wrap; gap: var(--sp-5); font-size: 0.9rem;">
            <div>📍 <b>位置</b>: ${HUTB.escape(item.location || '—')}</div>
            <div>⏱️ <b>建议时长</b>: ${HUTB.escape(item.duration || '—')}</div>
            <div>🌤️ <b>最佳季节</b>: ${HUTB.escape(item.bestSeason || '—')}</div>
            <div>💰 <b>费用</b>: ${HUTB.escape(item.cost || '免费')}</div>
          </div>
          ${item.transport ? `<div style="margin-top: var(--sp-3);">🚆 <b>交通</b>: ${HUTB.escape(item.transport)}</div>` : ''}
          ${mapBtn}
        </div>`;
    }
    return '';
  }

  function renderPrevNext(type, id) {
    const items = HUTBData.list(type);
    const idx = items.findIndex((x) => x.id === id);
    const nav = document.getElementById('prevNextNav');
    if (idx < 0) {
      nav.style.display = 'none';
      return;
    }

    const prev = idx > 0 ? items[idx - 1] : null;
    const next = idx < items.length - 1 ? items[idx + 1] : null;
    const cfg = SECTION_CONFIG[type];

    nav.innerHTML = `
      ${prev ? `
        <a href="article.html?type=${type}&id=${encodeURIComponent(prev.id)}" class="card" style="padding: var(--sp-4); display:block; border: 1px solid var(--c-border);">
          <div style="font-size: 0.825rem; color:var(--c-text-muted); margin-bottom: 6px;">← 上一篇</div>
          <div style="font-weight: 600; color: var(--c-text);">${HUTB.escape(prev.title)}</div>
        </a>
      ` : '<div></div>'}
      ${next ? `
        <a href="article.html?type=${type}&id=${encodeURIComponent(next.id)}" class="card" style="padding: var(--sp-4); display:block; border: 1px solid var(--c-border); text-align: right;">
          <div style="font-size: 0.825rem; color:var(--c-text-muted); margin-bottom: 6px;">下一篇 →</div>
          <div style="font-weight: 600; color: var(--c-text);">${HUTB.escape(next.title)}</div>
        </a>
      ` : '<div></div>'}
    `;

    // 更新 "返回上一页" 的链接指向板块页
    const back = document.querySelector('.article-back');
    if (back) back.href = cfg.backUrl;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
