/* ====================================================================
 * food.js - 美食地图页逻辑
 * ==================================================================== */

(function () {
  'use strict';

  const SECTION = 'food';
  let currentCategory = 'all';
  let searchText = '';

  async function init() {
    await HUTBData.ensureSeed();
    buildCategories();
    bindSearch();
    render();
  }

  async function buildCategories() {
    const cats = await HUTBData.listCategories(SECTION);
    const tabs = [{ id: 'all', name: '全部', icon: '🍽️' }].concat(cats);
    const c = document.getElementById('filterTabs');
    c.innerHTML = tabs.map((cat) =>
      `<button class="filter-tab" data-id="${HUTB.escape(cat.id)}">${cat.icon || '·'} ${HUTB.escape(cat.name)}</button>`
    ).join('');
    c.querySelector('[data-id="all"]').classList.add('active');
    c.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;
      c.querySelectorAll('.filter-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.id;
      render();
    });
  }

  function bindSearch() {
    const i = document.getElementById('searchInput');
    i.addEventListener('input', (e) => {
      searchText = e.target.value.trim().toLowerCase();
      render();
    });
  }

  async function getItems() {
    const all = await HUTBData.list(SECTION);
    return all.filter((it) => {
      if (currentCategory !== 'all' && it.category !== currentCategory) return false;
      if (searchText) {
        const blob = [
          it.title, it.excerpt, it.location, it.category,
          (it.recommendedDishes || []).join(' '),
          (it.tags || []).join(' '),
        ].join(' ').toLowerCase();
        if (!blob.includes(searchText)) return false;
      }
      return true;
    });
  }

  async function render() {
    const grid = document.getElementById('cardGrid');
    const total = document.getElementById('totalCount');
    const items = await getItems();
    total.textContent = items.length;

    if (!items.length) {
      grid.innerHTML = `
        <div class="empty" style="grid-column: 1/-1;">
          <div class="empty-icon">🍜</div>
          <p>暂无符合条件的店家。</p>
          <p style="font-size:0.825rem; color: var(--c-text-light);">试试切换分类,或在后台添加新条目。</p>
        </div>`;
      return;
    }

    grid.innerHTML = items.map((it) => {
      const articleUrl = `article.html?type=${SECTION}&id=${encodeURIComponent(it.id)}`;
      const tags = (it.tags || []).slice(0, 3).map((t) => `<span class="tag tag-acc">${HUTB.escape(t)}</span>`).join(' ');
      const dishes = (it.recommendedDishes || []).slice(0, 3).map((d) => `<span class="tag tag-pri">${HUTB.escape(d)}</span>`).join(' ');
      return `
        <article class="card fade-up" onclick="location.href='${articleUrl}'" style="cursor:pointer;">
          <div class="card-cover" style="background: linear-gradient(135deg, #ff9671 0%, #ee6c4d 100%); color:#fff;">
            ${it.cover ? `<img src="${HUTB.escape(it.cover)}" alt="">` : `<span style="font-size:4rem;">🍱</span>`}
            ${it.pinned ? `<span class="card-cover-pin">📌 热门</span>` : ''}
            <span class="card-cover-tag">${HUTB.escape(it.category || '美食')}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${HUTB.escape(it.title)}</h3>
            <p class="card-excerpt">${HUTB.escape(it.excerpt || '')}</p>
            <div style="display:flex; gap: var(--sp-2); flex-wrap: wrap; margin-bottom: var(--sp-3);">${dishes}</div>
            ${tags ? `<div style="display:flex; gap: var(--sp-2); flex-wrap: wrap;">${tags}</div>` : ''}
            <div class="card-meta">
              <span class="card-meta-row">📍 ${HUTB.escape(it.location || '')}</span>
              <span style="margin-left:auto; color:var(--c-text-muted);">${HUTB.escape(it.priceRange || '')}</span>
              ${it.rating ? `<span style="color:#f5a623;">★ ${it.rating.toFixed(1)}</span>` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
