/* ====================================================================
 * main.js - 首页内容渲染
 * ==================================================================== */

(function () {
  'use strict';

  async function init() {
    await HUTBData.ensureSeed();
    const settings = await HUTBData.getSettings();
    const sections = await HUTBData.getSections();

    // hero 副标题
    const heroSub = document.getElementById('heroSub');
    if (heroSub && settings.welcome) heroSub.textContent = settings.welcome;

    // ACM 介绍
    const about = document.getElementById('aboutAcmText');
    if (about && settings.aboutACM) about.textContent = settings.aboutACM;

    // 各渲染环节互不影响，单点失败不阻断其余
    try { renderEntryCards(sections); } catch (e) { console.error('[main] renderEntryCards 失败:', e); }
    try { await renderFeatured(); } catch (e) { console.error('[main] renderFeatured 失败:', e); }
    try { await renderHotCard(); } catch (e) { console.error('[main] renderHotCard 失败:', e); }
    try { initVideoChannelLightbox(); } catch (e) { console.error('[main] initVideoChannelLightbox 失败:', e); }
  }

  function renderEntryCards(sections) {
    const grid = document.getElementById('entryGrid');
    if (!grid) return;

    const list = [
      { key: 'food',     page: 'food.html',     intro: '校内食堂、周末小吃、咖啡地图,带价位标注', tag: '6+ 家校园店' },
      { key: 'travel',   page: 'travel.html',   intro: '城市景点、周末路线、从校区出发的交通方案规划', tag: '5+ 个景点路线' },
      { key: 'study',    page: 'study.html',    intro: '选课技巧、图书馆预约、自习圣地测评', tag: '5+ 篇攻略' },
      { key: 'freshman', page: 'freshman.html', intro: '入学流程、军训贴士、宿舍清单、防骗指南', tag: '5+ 篇必读' },
    ];

    const html = list.map((it) => {
      const s = sections[it.key] || {};
      const c = s.color || '#1e6091';
      return `
        <a href="${it.page}" class="section-card fade-up delay-${['1','2','3','4'][list.indexOf(it)]}" style="--accent: ${c};">
          <div class="section-card-icon" style="background: ${c};">${s.icon || '📌'}</div>
          <h3>${HUTB.escape(s.name || '板块')}</h3>
          <p class="section-card-desc">${HUTB.escape(s.description || it.intro)}</p>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="tag" style="background: ${c}20; color: ${c}; border-color: ${c}40;">${HUTB.escape(it.tag)}</span>
            <span class="section-card-link" style="color: ${c};">立即进入 →</span>
          </div>
        </a>`;
    }).join('');

    grid.innerHTML = html;
  }

  async function renderFeatured() {
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;

    const collected = [];
    for (const sec of ['food', 'travel', 'study', 'freshman']) {
      const items = (await HUTBData.listAll(sec)).slice(0, 2);
      items.forEach((it) => collected.push(Object.assign({}, it, { _section: sec })));
    }

    const sorted = collected.sort((a, b) => {
      const pa = a.pinned ? 1 : 0;
      const pb = b.pinned ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    }).slice(0, 6);

    if (!sorted.length) {
      grid.innerHTML = '<div class="empty">暂无推荐内容,管理员可在后台添加。</div>';
      return;
    }

    const sectionConfig = {
      food: { name: '美食地图', color: '#ee6c4d', icon: '🍱', page: 'food.html' },
      travel: { name: '周边游玩', color: '#52a6b8', icon: '🌊', page: 'travel.html' },
      study: { name: '学习攻略', color: '#1e6091', icon: '📚', page: 'study.html' },
      freshman: { name: '新生事项', color: '#7cb518', icon: '🎒', page: 'freshman.html' },
    };

    grid.innerHTML = sorted.map((it) => {
      const sc = sectionConfig[it._section];
      const articleUrl = `article.html?type=${encodeURIComponent(it._section)}&id=${encodeURIComponent(it.id)}`;
      const rating = it.rating ? `<span style="color:#f5a623;">★ ${it.rating.toFixed(1)}</span>` : '';
      return `
        <article class="card fade-up" onclick="location.href='${articleUrl}'" style="cursor:pointer;">
          <div class="card-cover" style="background: ${sc.color}24; color: ${sc.color};">
            ${it.cover ? `<img src="${HUTB.escape(it.cover)}" alt="">` : `<span>${sc.icon}</span>`}
            ${it.pinned ? `<span class="card-cover-pin">📌 置顶</span>` : ''}
            <span class="card-cover-tag" style="background:${sc.color};">${sc.name}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${HUTB.escape(it.title)}</h3>
            <p class="card-excerpt">${HUTB.escape(it.excerpt || '')}</p>
            <div class="card-meta">
              <span class="card-meta-row">${sc.icon} ${sc.name}</span>
              ${rating}
              <span style="margin-left:auto; color:var(--c-text-light);">${HUTB.relativeTime(it.updatedAt)}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  async function renderHotCard() {
    const sections = ['food', 'travel', 'study', 'freshman'];
    let hotItem = null;
    let hotSection = 'food';
    for (const sec of sections) {
      const found = (await HUTBData.listAll(sec)).find((x) => x.pinned);
      if (found) { hotItem = found; hotSection = sec; break; }
    }
    if (!hotItem) return;

    const titleEl = document.getElementById('hotCardTitle');
    const linkEl = document.getElementById('hotCardLink');
    if (titleEl) titleEl.textContent = hotItem.title;
    if (linkEl) linkEl.href = `article.html?type=${encodeURIComponent(hotSection)}&id=${encodeURIComponent(hotItem.id)}`;

    // 替换右侧热门列表为前 4 条置顶
    const listEl = document.getElementById('hotCardList');
    if (!listEl) return;
    const topPinned = [];
    for (const sec of sections) {
      const items = await HUTBData.listAll(sec);
      const pin = items.find((x) => x.pinned);
      if (pin) topPinned.push(Object.assign({}, pin, { _section: sec }));
    }
    if (!topPinned.length) return;
    const iconMap = {
      food: { ic: '🍱', color: '#ee6c4d' },
      travel: { ic: '🌊', color: '#52a6b8' },
      study: { ic: '📚', color: '#1e6091' },
      freshman: { ic: '🎒', color: '#7cb518' },
    };
    listEl.innerHTML = topPinned.slice(0, 4).map((it) => {
      const m = iconMap[it._section] || iconMap.food;
      return `
        <li>
          <span class="ic" style="background:${m.color};color:#fff;">${m.ic}</span>
          <span>${HUTB.escape(it.title)}</span>
        </li>`;
    }).join('');
  }

  /* ---------- 视频号二维码放大弹窗 ---------- */
  function initVideoChannelLightbox() {
    const wrap = document.querySelector('.video-channel-img-wrap');
    const btn = document.querySelector('.js-open-video-lightbox');
    const box = document.getElementById('videoChannelLightbox');
    if (!box) return;

    function open() {
      box.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      const closeBtn = box.querySelector('.lightbox-close');
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      box.style.display = 'none';
      document.body.style.overflow = '';
    }

    if (wrap) {
      wrap.addEventListener('click', open);
      wrap.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    }
    if (btn) btn.addEventListener('click', open);

    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    const closeBtn = box.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.addEventListener('click', close);

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && box.style.display === 'flex') close(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
