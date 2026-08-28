/* ====================================================================
 * study.js - 学习攻略页逻辑
 * ==================================================================== */

(function () {
  'use strict';

  const SECTION = 'study';
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
    const tabs = [{ id: 'all', name: '全部', icon: '📖' }].concat(cats);
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
          it.title, it.excerpt, it.category, it.author,
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
          <div class="empty-icon">📚</div>
          <p>暂无符合条件的攻略。</p>
        </div>`;
      return;
    }

    grid.innerHTML = items.map((it) => {
      const articleUrl = `article.html?type=${SECTION}&id=${encodeURIComponent(it.id)}`;
      const tags = (it.tags || []).slice(0, 3).map((t) => `<span class="tag tag-pri">${HUTB.escape(t)}</span>`).join(' ');
      return `
        <article class="card fade-up" onclick="location.href='${articleUrl}'" style="cursor:pointer;">
          <div class="card-cover" style="background: linear-gradient(135deg, #2989b8 0%, #1e6091 100%); color:#fff;">
            ${it.cover ? `<img src="${HUTB.escape(it.cover)}" alt="">` : `<span style="font-size:4rem;">📖</span>`}
            ${it.pinned ? `<span class="card-cover-pin">📌 编辑推荐</span>` : ''}
            <span class="card-cover-tag">${HUTB.escape(it.category || '攻略')}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${HUTB.escape(it.title)}</h3>
            <p class="card-excerpt">${HUTB.escape(it.excerpt || '')}</p>
            ${tags ? `<div style="display:flex; gap: var(--sp-2); flex-wrap: wrap; margin-bottom: var(--sp-3);">${tags}</div>` : ''}
            <div class="card-meta">
              ${it.author ? `<span class="card-meta-row">👤 ${HUTB.escape(it.author)}</span>` : ''}
              ${it.readTime ? `<span class="card-meta-row">⏱️ ${HUTB.escape(it.readTime)}</span>` : ''}
              <span style="margin-left:auto; color:var(--c-text-light);">${HUTB.relativeTime(it.updatedAt)}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
