/* ====================================================================
 * admin.js - CMS 后台逻辑（dashboard / 4 板块 / 分类 / 招新 / 设置 / 数据）
 * ==================================================================== */

(function () {
  'use strict';

  const SECTION_CONFIG = {
    food:     { name: '美食地图', color: '#ee6c4d', icon: '🍱' },
    travel:   { name: '周边游玩', color: '#52a6b8', icon: '🌊' },
    study:    { name: '学习攻略', color: '#1e6091', icon: '📚' },
    freshman: { name: '新生事项', color: '#7cb518', icon: '🎒' },
  };

  let currentTab = 'dashboard';
  let currentSection = null; // 当前管理的板块

  function init() {
    if (!HUTBData.isLoggedIn()) {
      location.href = 'login.html';
      return;
    }

    const auth = HUTBData.getAuth();
    document.getElementById('userName').textContent = auth.user;
    document.getElementById('userAvatar').textContent = (auth.user || 'A').slice(0, 1).toUpperCase();
    document.getElementById('userRole').textContent = auth.role || '管理员';

    // tabs（顶部 - 大屏）
    buildTopTabs();

    // sidebar 跳转
    document.querySelectorAll('.admin-side-item').forEach((el) => {
      el.addEventListener('click', () => switchTab(el.dataset.tab));
    });

    // 默认 tab 从 hash 读
    const hash = location.hash.replace('#', '');
    if (hash && document.querySelector(`.admin-side-item[data-tab="${hash}"]`)) {
      switchTab(hash);
    } else {
      switchTab('dashboard');
    }
  }

  function buildTopTabs() {
    const tabs = [
      { id: 'dashboard', name: '概览', icon: '📊' },
      { id: 'food', name: '美食', icon: '🍱' },
      { id: 'travel', name: '游玩', icon: '🌊' },
      { id: 'study', name: '学习', icon: '📚' },
      { id: 'freshman', name: '新生', icon: '🎒' },
      { id: 'recruitment', name: '招新', icon: '📬' },
      { id: 'settings', name: '设置', icon: '⚙️' },
    ];
    const el = document.getElementById('adminTabs');
    el.innerHTML = tabs.map((t) =>
      `<li><button class="admin-tab" data-tab="${t.id}">${t.icon} ${t.name}</button></li>`
    ).join('');
    el.querySelectorAll('.admin-tab').forEach((b) => {
      b.addEventListener('click', () => switchTab(b.dataset.tab));
    });
  }

  function switchTab(tab) {
    currentTab = tab;
    location.hash = '#' + tab;
    document.querySelectorAll('.admin-side-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
    document.querySelectorAll('.admin-tab').forEach((el) => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
    refreshNavCounts();
    render();
  }

  function refreshNavCounts() {
    document.getElementById('navTotal').textContent =
      HUTBData.listAll('food').length +
      HUTBData.listAll('travel').length +
      HUTBData.listAll('study').length +
      HUTBData.listAll('freshman').length;
    document.getElementById('navFood').textContent = HUTBData.listAll('food').length;
    document.getElementById('navTravel').textContent = HUTBData.listAll('travel').length;
    document.getElementById('navStudy').textContent = HUTBData.listAll('study').length;
    document.getElementById('navFresh').textContent = HUTBData.listAll('freshman').length;
    document.getElementById('navRec').textContent = HUTBData.listRecruitment().length;
  }

  function render() {
    const c = document.getElementById('mainContent');
    if (currentTab === 'dashboard') return renderDashboard(c);
    if (SECTION_CONFIG[currentTab]) {
      currentSection = currentTab;
      return renderSectionList(c, currentTab);
    }
    if (currentTab === 'categories') return renderCategories(c);
    if (currentTab === 'recruitment') return renderRecruitment(c);
    if (currentTab === 'settings') return renderSettings(c);
    if (currentTab === 'data-tools') return renderDataTools(c);
  }

  /* ===================== 概览 ===================== */
  function renderDashboard(c) {
    const sections = ['food', 'travel', 'study', 'freshman'];
    const total = sections.reduce((m, s) => m + HUTBData.listAll(s).length, 0);
    const recCount = HUTBData.listRecruitment().length;
    const pinnedCount = sections.reduce((m, s) => m + HUTBData.listAll(s).filter((x) => x.pinned).length, 0);

    c.innerHTML = `
      <div class="admin-page-head">
        <h2 class="admin-page-title">📊 数据概览</h2>
        <div style="color:var(--c-text-muted); font-size: 0.875rem;">
          ${HUTB.formatDateTime(new Date().toISOString())}
        </div>
      </div>

      <div class="admin-stat-grid">
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:#1e6091;">📚</div>
          <div>
            <div class="admin-stat-value">${total}</div>
            <div class="admin-stat-label">内容条数</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:#ee6c4d;">📌</div>
          <div>
            <div class="admin-stat-value">${pinnedCount}</div>
            <div class="admin-stat-label">置顶条目</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:#52a6b8;">📬</div>
          <div>
            <div class="admin-stat-value">${recCount}</div>
            <div class="admin-stat-label">招新报名</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background:#7cb518;">🗂️</div>
          <div>
            <div class="admin-stat-value">${sections.reduce((m, s) => m + HUTBData.listCategories(s).length, 0)}</div>
            <div class="admin-stat-label">分类总数</div>
          </div>
        </div>
      </div>

      <div class="admin-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--sp-4);">
          <h3 style="margin:0;">⚡ 快捷操作</h3>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--sp-3);">
          ${sections.map((s) => `
            <button class="btn btn-secondary" style="justify-content:flex-start;" onclick="window.HUTBAdmin.goSection('${s}')">
              ${SECTION_CONFIG[s].icon} 管理 ${SECTION_CONFIG[s].name}
            </button>
          `).join('')}
          <button class="btn btn-secondary" style="justify-content:flex-start;" onclick="window.HUTBAdmin.goTab('recruitment')">
            📬 查看招新报名
          </button>
          <button class="btn btn-secondary" style="justify-content:flex-start;" onclick="window.HUTBAdmin.goTab('settings')">
            ⚙️ 站点设置
          </button>
          <button class="btn btn-secondary" style="justify-content:flex-start;" onclick="window.HUTBAdmin.goTab('data-tools')">
            💾 数据导出
          </button>
        </div>
      </div>

      <div class="admin-card">
        <h3 style="margin-top:0;">🔥 最近更新</h3>
        <div id="dashboardRecent"></div>
      </div>
    `;

    // 最近 5 条
    const recent = [];
    sections.forEach((s) => {
      HUTBData.listAll(s).slice(0, 5).forEach((it) => recent.push(Object.assign({}, it, { _section: s })));
    });
    recent.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    recent.slice(0, 6).forEach((it) => {
      const cfg = SECTION_CONFIG[it._section];
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; align-items:center; gap: var(--sp-3); padding: var(--sp-3); border-bottom: 1px solid #f0f2f7;';
      row.innerHTML = `
        <span style="width: 36px; height: 36px; border-radius: 8px; background: ${cfg.color}20; display: flex; align-items:center; justify-content:center; font-size:18px;">${cfg.icon}</span>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:600; color:var(--c-text);">${HUTB.escape(it.title)}</div>
          <div style="font-size: 0.825rem; color:var(--c-text-muted);">${cfg.name} · ${it.category || ''}</div>
        </div>
        <div style="color: var(--c-text-light); font-size: 0.825rem;">${HUTB.relativeTime(it.updatedAt)}</div>
      `;
      document.getElementById('dashboardRecent').appendChild(row);
    });
  }

  /* ===================== 板块管理（列表 + 编辑） ===================== */
  function renderSectionList(c, section) {
    const cfg = SECTION_CONFIG[section];
    const items = HUTBData.listAll(section);

    c.innerHTML = `
      <div class="admin-page-head">
        <h2 class="admin-page-title">${cfg.icon} ${cfg.name} · 内容管理</h2>
        <div style="display:flex; gap: var(--sp-2);">
          <button class="btn btn-secondary btn-sm" onclick="window.HUTBAdmin.gotoSections()">查看全部板块</button>
          <button class="btn btn-accent btn-sm" onclick="window.HUTBAdmin.openItemForm('${section}', null)">＋ 新增内容</button>
        </div>
      </div>
      <div class="admin-toolbar">
        <span class="badge" style="background:${cfg.color};">${cfg.icon} ${cfg.name}</span>
        <span style="color:var(--c-text-muted); font-size: 0.875rem;">共 <b>${items.length}</b> 条 · 置顶 <b>${items.filter((x)=>x.pinned).length}</b> 条</span>
      </div>
      <div class="admin-card" style="padding: 0; overflow: hidden;">
        <table class="admin-table" id="sectionTable">
          <thead>
            <tr>
              <th style="width:48px;"></th>
              <th>标题</th>
              <th class="col-updated">更新时间</th>
              <th>分类</th>
              <th>置顶</th>
              <th>状态</th>
              <th style="width: 220px;">操作</th>
            </tr>
          </thead>
          <tbody id="sectionTbody"></tbody>
        </table>
      </div>
    `;

    const tbody = document.getElementById('sectionTbody');
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">还没有内容,点击"新增内容"开始添加。</div></td></tr>`;
      return;
    }
    tbody.innerHTML = items.map((it, i) => `
      <tr data-id="${it.id}">
        <td>
          ${it.cover ? `<img src="${HUTB.escape(it.cover)}" class="admin-table-thumb" alt="">` : `<span style="display:inline-block; width:48px; height:36px; line-height:36px; text-align:center; background:${cfg.color}20; border-radius: 8px; font-size:18px;">${cfg.icon}</span>`}
        </td>
        <td>
          <div style="font-weight:600;">${HUTB.escape(it.title)}</div>
          <div style="font-size: 0.825rem; color:var(--c-text-muted); margin-top:2px;">${HUTB.escape((it.excerpt || '').slice(0, 40))}${(it.excerpt||'').length > 40 ? '…' : ''}</div>
        </td>
        <td class="col-updated" style="color:var(--c-text-muted); font-size: 0.825rem;">${HUTB.formatDate(it.updatedAt)}</td>
        <td>${it.category ? `<span class="tag">${HUTB.escape(it.category)}</span>` : '<span style="color:var(--c-text-light);">—</span>'}</td>
        <td>${it.pinned ? '<span class="status-pill on">已置顶</span>' : '<span style="color:var(--c-text-light); font-size:0.825rem;">—</span>'}</td>
        <td>${it.published !== false ? '<span class="status-pill on">已发布</span>' : '<span class="status-pill off">草稿</span>'}</td>
        <td>
          <div class="admin-actions">
            <button class="icon-btn" title="上移" onclick="window.HUTBAdmin.move('${section}','${it.id}','up')">↑</button>
            <button class="icon-btn" title="下移" onclick="window.HUTBAdmin.move('${section}','${it.id}','down')">↓</button>
            <button class="icon-btn ${it.pinned ? 'success' : ''}" title="${it.pinned ? '取消置顶' : '置顶'}" onclick="window.HUTBAdmin.togglePin('${section}','${it.id}')">📌</button>
            <button class="icon-btn warn" title="编辑" onclick="window.HUTBAdmin.openItemForm('${section}','${it.id}')">✎</button>
            <button class="icon-btn danger" title="删除" onclick="window.HUTBAdmin.deleteItem('${section}','${it.id}')">🗑</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openItemForm(section, id) {
    const cfg = SECTION_CONFIG[section];
    const editing = id ? HUTBData.get(section, id) : null;
    const cats = HUTBData.listCategories(section);
    const defaultCat = cats[0] ? cats[0].name : '';

    const e = editing || {};
    const title = editing ? '编辑内容' : '新增内容';
    const data = editing ? JSON.parse(JSON.stringify(editing)) : {
      title: '', category: defaultCat, excerpt: '', content: '',
      cover: null, published: true, pinned: false,
      tags: [],
      // food 字段
      location: '', recommendedDishes: [], priceRange: '', rating: 0,
      // travel 字段
      transport: '', duration: '', bestSeason: '', cost: '',
      // study 字段
      author: '', readTime: '',
    };

    // 根据板块定制字段
    let extraFields = '';
    if (section === 'food') {
      extraFields = `
        <div class="field-row">
          <div class="field"><label>📍 位置</label><input type="text" name="location" value="${HUTB.escape(data.location||'')}" placeholder="如：湖南工商大学中心校区铭德餐厅"></div>
          <div class="field"><label>💰 价位</label><input type="text" name="priceRange" value="${HUTB.escape(data.priceRange||'')}" placeholder="如：¥12-20"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>⭐ 评分(0-5)</label><input type="number" name="rating" min="0" max="5" step="0.1" value="${data.rating||0}"></div>
          <div class="field"><label>🍽️ 推荐菜品（用逗号分隔）</label><input type="text" name="recommendedDishes" value="${HUTB.escape((data.recommendedDishes||[]).join(', '))}" placeholder="麻辣香锅, 酸辣粉, ..."></div>
        </div>
      `;
    }
    if (section === 'travel') {
      extraFields = `
        <div class="field"><label>📍 位置</label><input type="text" name="location" value="${HUTB.escape(data.location||'')}" placeholder="如：望城区太平路 8 号"></div>
        <div class="field-row">
          <div class="field"><label>🚆 交通方案</label><input type="text" name="transport" value="${HUTB.escape(data.transport||'')}" placeholder="如：公交 2/5/6 路"></div>
          <div class="field"><label>⏱️ 建议时长</label><input type="text" name="duration" value="${HUTB.escape(data.duration||'')}" placeholder="如：2-3 小时"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>🌤️ 最佳季节</label><input type="text" name="bestSeason" value="${HUTB.escape(data.bestSeason||'')}" placeholder="如：4-10 月"></div>
          <div class="field"><label>💰 费用</label><input type="text" name="cost" value="${HUTB.escape(data.cost||'')}" placeholder="免费 / ¥60-120"></div>
        </div>
      `;
    }
    if (section === 'study') {
      extraFields = `
        <div class="field-row">
          <div class="field"><label>👤 作者</label><input type="text" name="author" value="${HUTB.escape(data.author||'')}" placeholder="如：2024 级 张学长"></div>
          <div class="field"><label>⏱️ 阅读时长</label><input type="text" name="readTime" value="${HUTB.escape(data.readTime||'')}" placeholder="如：5 分钟"></div>
        </div>
      `;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width: 760px;">
        <div class="modal-head">
          <h3>${cfg.icon} ${title}</h3>
          <button class="modal-close" data-act="close">×</button>
        </div>
        <div class="modal-body" style="max-height: 70vh;">
          <form id="itemForm" autocomplete="off">
            <div class="field-row">
              <div class="field">
                <label>📚 标题 *</label>
                <input type="text" name="title" required value="${HUTB.escape(data.title)}" placeholder="给这条内容起个名字">
              </div>
              <div class="field">
                <label>🏷️ 分类 *</label>
                <select name="category" required>
                  ${cats.map((c) => `<option ${c.name === data.category ? 'selected' : ''} value="${HUTB.escape(c.name)}">${HUTB.escape(c.name)}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="field">
              <label>🖼️ 封面图（可选，留空自动用 emoji 卡片）</label>
              <div style="display:flex; gap: var(--sp-3); align-items:flex-start;">
                <div id="coverPreview" style="width:120px; height:90px; border-radius:8px; background: var(--c-bg-alt); border: 1.5px dashed var(--c-border); display:flex; align-items:center; justify-content:center; color: var(--c-text-muted); font-size:12px; flex-shrink:0; overflow:hidden;">
                  ${data.cover ? `<img src="${HUTB.escape(data.cover)}" style="width:100%; height:100%; object-fit:cover;">` : '+ 上传'}
                </div>
                <div style="flex:1;">
                  <input type="file" id="coverFile" accept="image/*" style="font-size: 0.825rem;">
                  <p class="hint">建议尺寸 16:10,JPG/PNG,小于 800KB（自动转 base64 内嵌）</p>
                  ${data.cover ? `<button type="button" class="btn btn-secondary btn-sm" onclick="window.HUTBAdmin.clearCover(this)" style="margin-top: var(--sp-2);">移除图片</button>` : ''}
                </div>
              </div>
              <input type="hidden" name="cover" value="${HUTB.escape(data.cover || '')}">
            </div>

            <div class="field">
              <label>📝 摘要（一句话简介，在卡片上显示）</label>
              <textarea name="excerpt" rows="2" placeholder="如：湖工商铭德最受欢迎档口，自选食材称重计价">${HUTB.escape(data.excerpt)}</textarea>
            </div>

            ${extraFields}

            <div class="field">
              <label>🏷️ 标签（用逗号分隔）</label>
              <input type="text" name="tags" value="${HUTB.escape((data.tags||[]).join(', '))}" placeholder="如：辣, 便宜, 出校">
            </div>

            <div class="field">
              <label>📃 正文内容 *</label>
              <div class="editor" id="editorWrap">
                <div class="editor-bar">
                  <button type="button" data-cmd="bold"><b>B</b></button>
                  <button type="button" data-cmd="italic"><i>I</i></button>
                  <button type="button" data-cmd="underline"><u>U</u></button>
                  <button type="button" data-cmd="h3">H3</button>
                  <button type="button" data-cmd="h4">H4</button>
                  <button type="button" data-cmd="ul">• 列表</button>
                  <button type="button" data-cmd="ol">1. 列表</button>
                  <button type="button" data-cmd="quote">❝ 引用</button>
                  <button type="button" data-cmd="link">🔗 链接</button>
                  <button type="button" data-cmd="hr">━ 分割线</button>
                  <button type="button" data-cmd="clear">清除</button>
                </div>
                <div class="editor-content" contenteditable="true" id="editorContent">${data.content || ''}</div>
              </div>
              <p class="hint">支持简单 HTML · 后台编辑所见即所得</p>
            </div>

            <div class="field-row">
              <div class="field">
                <label class="checkbox-row">
                  <input type="checkbox" name="pinned" ${data.pinned ? 'checked' : ''}>
                  📌 置顶显示
                </label>
              </div>
              <div class="field">
                <label class="checkbox-row">
                  <input type="checkbox" name="published" ${data.published !== false ? 'checked' : ''}>
                  ✅ 立即发布
                </label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" data-act="close">取消</button>
          <button class="btn btn-accent" data-act="save">${editing ? '保存修改' : '创建内容'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // 上传图片
    const fileInput = overlay.querySelector('#coverFile');
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 1024 * 1024) {
        HUTB.toast('图片超过 1MB,可能被自动压缩');
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target.result;
        const preview = overlay.querySelector('#coverPreview');
        preview.innerHTML = `<img src="${b64}" style="width:100%; height:100%; object-fit:cover;">`;
        overlay.querySelector('input[name="cover"]').value = b64;
      };
      reader.readAsDataURL(file);
    });

    // 编辑器按钮
    overlay.querySelectorAll('.editor-bar button').forEach((btn) => {
      btn.addEventListener('click', () => execCmd(btn.dataset.cmd));
    });

    function execCmd(cmd) {
      const ed = overlay.querySelector('#editorContent');
      ed.focus();
      if (cmd === 'bold') document.execCommand('bold');
      else if (cmd === 'italic') document.execCommand('italic');
      else if (cmd === 'underline') document.execCommand('underline');
      else if (cmd === 'h3') document.execCommand('formatBlock', false, 'h3');
      else if (cmd === 'h4') document.execCommand('formatBlock', false, 'h4');
      else if (cmd === 'ul') document.execCommand('insertUnorderedList');
      else if (cmd === 'ol') document.execCommand('insertOrderedList');
      else if (cmd === 'quote') document.execCommand('formatBlock', false, 'blockquote');
      else if (cmd === 'link') {
        const url = prompt('链接地址：', 'https://');
        if (url) document.execCommand('createLink', false, url);
      }
      else if (cmd === 'hr') document.execCommand('insertHorizontalRule');
      else if (cmd === 'clear') {
        if (confirm('清空所有内容？')) ed.innerHTML = '';
      }
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.dataset.act === 'close') {
        overlay.remove();
      } else if (e.target.dataset.act === 'save') {
        const form = overlay.querySelector('#itemForm');
        const fd = new FormData(form);
        if (!form.title.value.trim()) { HUTB.toast('请输入标题'); return; }
        const item = {
          id: editing ? editing.id : undefined,
          title: form.title.value.trim(),
          category: form.category.value,
          cover: form.cover.value || null,
          excerpt: form.excerpt.value.trim(),
          published: form.published.checked,
          pinned: form.pinned.checked,
          tags: form.tags.value.split(/[,，、]/).map((t) => t.trim()).filter(Boolean),
          content: overlay.querySelector('#editorContent').innerHTML,
        };
        if (section === 'food') {
          item.location = form.location.value.trim();
          item.priceRange = form.priceRange.value.trim();
          item.rating = parseFloat(form.rating.value) || 0;
          item.recommendedDishes = form.recommendedDishes.value.split(/[,，、]/).map((t) => t.trim()).filter(Boolean);
        }
        if (section === 'travel') {
          item.location = form.location.value.trim();
          item.transport = form.transport.value.trim();
          item.duration = form.duration.value.trim();
          item.bestSeason = form.bestSeason.value.trim();
          item.cost = form.cost.value.trim();
        }
        if (section === 'study') {
          item.author = form.author.value.trim();
          item.readTime = form.readTime.value.trim();
        }
        HUTBData.save(section, item);
        overlay.remove();
        HUTB.toast(editing ? '已保存' : '已创建');
        switchTab(currentTab);
      }
    });
  }

  function clearCover(btn) {
    const form = btn.closest('form');
    form.querySelector('input[name="cover"]').value = '';
    form.querySelector('#coverPreview').innerHTML = '+ 上传';
    btn.remove();
  }

  function move(section, id, dir) {
    HUTBData.move(section, id, dir);
    render();
    HUTB.toast('已调整顺序');
  }

  function togglePin(section, id) {
    const it = HUTBData.get(section, id);
    HUTBData.pin(section, id, !it.pinned);
    HUTB.toast(it.pinned ? '已取消置顶' : '已置顶');
    render();
  }

  async function deleteItem(section, id) {
    const ok = await HUTB.confirm('确定要删除这条内容吗?此操作不可恢复。', '删除确认');
    if (!ok) return;
    HUTBData.remove(section, id);
    HUTB.toast('已删除');
    refreshNavCounts();
    render();
  }

  /* ===================== 分类管理 ===================== */
  function renderCategories(c) {
    c.innerHTML = `
      <div class="admin-page-head">
        <h2 class="admin-page-title">🗂️ 分类管理</h2>
      </div>
      <p style="color:var(--c-text-muted); margin-bottom: var(--sp-5);">在这里可管理四大板块的分类。</p>
      <div id="catPanels"></div>
    `;

    const wrap = document.getElementById('catPanels');
    const sections = ['food', 'travel', 'study', 'freshman'];
    sections.forEach((sec) => {
      const cfg = SECTION_CONFIG[sec];
      const cats = HUTBData.listCategories(sec);
      const panel = document.createElement('div');
      panel.className = 'admin-card';
      panel.innerHTML = `
        <h3 style="margin-top:0;">${cfg.icon} ${cfg.name} 分类（${cats.length}）</h3>
        <table class="admin-table">
          <thead><tr><th>图标</th><th>名称</th><th>排序</th><th style="width:140px;">操作</th></tr></thead>
          <tbody>
            ${cats.map((cat) => `
              <tr>
                <td style="font-size:20px;">${cat.icon || '·'}</td>
                <td><b>${HUTB.escape(cat.name)}</b></td>
                <td style="color:var(--c-text-muted);">${cat.sortOrder || 0}</td>
                <td>
                  <div class="admin-actions">
                    <button class="icon-btn warn" title="编辑" onclick="window.HUTBAdmin.editCat('${sec}','${cat.id}')">✎</button>
                    <button class="icon-btn danger" title="删除" onclick="window.HUTBAdmin.deleteCat('${sec}','${cat.id}')">🗑</button>
                  </div>
                </td>
              </tr>
            `).join('')}
            ${cats.length === 0 ? `<tr><td colspan="4"><div class="empty-state">暂无分类</div></td></tr>` : ''}
          </tbody>
        </table>
        <button class="btn btn-accent btn-sm" style="margin-top: var(--sp-3);" onclick="window.HUTBAdmin.editCat('${sec}', null)">＋ 新增分类</button>
      `;
      wrap.appendChild(panel);
    });
  }

  function editCat(section, id) {
    const editing = id ? HUTBData.listCategories(section).find((c) => c.id === id) : null;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:480px;">
        <div class="modal-head">
          <h3>${editing ? '编辑分类' : '新增分类'}</h3>
          <button class="modal-close" data-act="close">×</button>
        </div>
        <div class="modal-body">
          <form id="catForm">
            <div class="field">
              <label>名称 *</label>
              <input type="text" name="name" required value="${editing ? HUTB.escape(editing.name) : ''}" placeholder="如：校内食堂">
            </div>
            <div class="field">
              <label>图标（emoji）</label>
              <input type="text" name="icon" value="${editing ? HUTB.escape(editing.icon || '') : ''}" placeholder="如：🍱">
            </div>
          </form>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" data-act="close">取消</button>
          <button class="btn btn-accent" data-act="save">保存</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.dataset.act === 'close') {
        overlay.remove();
      } else if (e.target.dataset.act === 'save') {
        const f = overlay.querySelector('#catForm');
        if (!f.name.value.trim()) { HUTB.toast('请填分类名称'); return; }
        HUTBData.saveCategory(section, {
          id: editing ? editing.id : null,
          name: f.name.value.trim(),
          icon: f.icon.value.trim() || '·',
        });
        overlay.remove();
        HUTB.toast('已保存');
        render();
      }
    });
  }

  async function deleteCat(section, id) {
    const ok = await HUTB.confirm('确定要删除该分类吗?相关条目不会被删除。', '删除分类');
    if (!ok) return;
    HUTBData.removeCategory(section, id);
    HUTB.toast('已删除');
    render();
  }

  /* ===================== 招新报名 ===================== */
  function renderRecruitment(c) {
    const entries = HUTBData.listRecruitment();
    const sorted = entries.slice().sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));

    c.innerHTML = `
      <div class="admin-page-head">
        <h2 class="admin-page-title">📬 招新报名（${entries.length}）</h2>
        <div style="display:flex; gap: var(--sp-2);">
          <button class="btn btn-secondary btn-sm" onclick="window.HUTBAdmin.exportRecruit()">⬇️ 导出 CSV</button>
        </div>
      </div>
      ${entries.length === 0 ? `
        <div class="admin-card empty-state">
          <div style="font-size: 4rem; margin-bottom: var(--sp-3);">📬</div>
          <p style="font-size: 1.05rem;">还没有报名记录。</p>
          <p style="font-size: 0.875rem; color: var(--c-text-light); margin-top: var(--sp-3);">用户可在首页点击"立即报名"提交表单,数据自动保存在这里。</p>
        </div>
      ` : `
        <div id="recList">
          ${sorted.map((r, i) => `
            <div class="rec-entry">
              <div class="rec-entry-head">
                <div class="rec-entry-name">#${i + 1} ${HUTB.escape(r.name)}</div>
                <span class="status-pill on">${HUTB.escape(r.grade || '未知年级')}</span>
              </div>
              <div class="rec-entry-meta">
                <span>🎓 ${HUTB.escape(r.college || '')}</span>
                <span>📞 ${HUTB.escape(r.contact || '')}</span>
                <span>🎯 ${HUTB.escape(r.direction || '未填')}</span>
                <span>⏰ ${HUTB.formatDateTime(r.submittedAt)}</span>
              </div>
              ${r.intro ? `<div class="rec-entry-intro">${HUTB.nl2br(r.intro)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `}
    `;
  }

  function exportRecruit() {
    const csv = HUTBData.exportRecruitmentCSV();
    if (!csv) { HUTB.toast('暂无报名数据'); return; }
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `招新报名_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    HUTB.toast('已导出 CSV');
  }

  /* ===================== 站点设置 ===================== */
  function renderSettings(c) {
    const s = HUTBData.getSettings();
    c.innerHTML = `
      <div class="admin-page-head">
        <h2 class="admin-page-title">⚙️ 站点设置</h2>
      </div>
      <form id="settingsForm" class="admin-card">
        <div class="field">
          <label>站点名称</label>
          <input type="text" name="siteName" value="${HUTB.escape(s.siteName)}">
        </div>
        <div class="field">
          <label>站点副标题</label>
          <input type="text" name="siteSubtitle" value="${HUTB.escape(s.siteSubtitle)}">
        </div>
        <div class="field">
          <label>首页欢迎语</label>
          <textarea name="welcome" rows="3">${HUTB.escape(s.welcome)}</textarea>
        </div>
        <div class="field">
          <label>华硕校园合伙人介绍</label>
          <textarea name="aboutACM" rows="4">${HUTB.escape(s.aboutACM)}</textarea>
        </div>
        <hr style="margin: var(--sp-5) 0; border: none; border-top: 1px dashed var(--c-border);">
        <h3 style="margin-top:0;">📬 招新报名链接</h3>
        <p style="color: var(--c-text-muted); font-size: 0.875rem; margin-bottom: var(--sp-4);">
          留空使用站内表单;填写完整 URL(以 http/https 开头)则跳转到外部表单(如问卷网)。
        </p>
        <div class="field">
          <label>外部报名表 URL</label>
          <input type="text" name="recruitmentFormUrl" value="${HUTB.escape(s.recruitmentFormUrl || '')}" placeholder="如：https://wj.qq.com/s/xxxxxx（留空则站内表单）">
        </div>
        <div class="field-row">
          <div class="field">
            <label>📧 邮箱</label>
            <input type="email" name="contactEmail" value="${HUTB.escape(s.contactEmail || '')}">
          </div>
          <div class="field">
            <label>📱 QQ</label>
            <input type="text" name="contactQQ" value="${HUTB.escape(s.contactQQ || '')}">
          </div>
        </div>
        <div style="display:flex; gap: var(--sp-2); margin-top: var(--sp-4);">
          <button type="submit" class="btn btn-accent">💾 保存设置</button>
        </div>
      </form>
    `;
    document.getElementById('settingsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      HUTBData.saveSettings({
        siteName: f.siteName.value.trim(),
        siteSubtitle: f.siteSubtitle.value.trim(),
        welcome: f.welcome.value.trim(),
        aboutACM: f.aboutACM.value.trim(),
        recruitmentFormUrl: f.recruitmentFormUrl.value.trim(),
        contactEmail: f.contactEmail.value.trim(),
        contactQQ: f.contactQQ.value.trim(),
      });
      HUTB.toast('设置已保存');
    });
  }

  /* ===================== 数据导入/导出 ===================== */
  function renderDataTools(c) {
    const sections = ['food', 'travel', 'study', 'freshman'];
    const counts = sections.map((s) => `${SECTION_CONFIG[s].name} ${HUTBData.listAll(s).length}`).join(' · ');

    c.innerHTML = `
      <div class="admin-page-head">
        <h2 class="admin-page-title">💾 数据导入 / 导出</h2>
      </div>
      <div class="admin-card">
        <h3 style="margin-top:0;">📊 当前数据</h3>
        <p>${counts}</p>
        <p>总分类数:${sections.reduce((m, s) => m + HUTBData.listCategories(s).length, 0)}</p>
        <p>招新报名:${HUTBData.listRecruitment().length}</p>
      </div>

      <div class="admin-card">
        <h3 style="margin-top:0;">⬇️ 导出数据</h3>
        <p style="color: var(--c-text-muted); font-size: 0.875rem;">导出 JSON 文件,可备份或迁移数据。</p>
        <button class="btn btn-accent" onclick="window.HUTBAdmin.exportAll()">导出全部数据为 JSON</button>
      </div>

      <div class="admin-card">
        <h3 style="margin-top:0;">⬆️ 导入数据</h3>
        <p style="color: var(--c-text-muted); font-size: 0.875rem; color: #dc3545;">
          ⚠️ 导入将覆盖当前所有数据,请先备份!
        </p>
        <input type="file" id="importFile" accept=".json" style="margin-bottom: var(--sp-3);">
        <button class="btn btn-secondary" onclick="window.HUTBAdmin.importAll(this)">导入 JSON</button>
      </div>

      <div class="admin-card" style="background: #fff5f5; border-color: #f5c6cb;">
        <h3 style="margin-top:0; color: #721c24;">⚠️ 重置 / 清空</h3>
        <p style="color: #721c24; font-size: 0.875rem;">将清除当前所有数据,并恢复到初始演示数据。</p>
        <button class="btn" style="background: #dc3545;" onclick="window.HUTBAdmin.resetAll()">恢复演示数据</button>
      </div>
    `;
  }

  function exportAll() {
    const data = HUTBData.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HUTB-campus-guide-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    HUTB.toast('已导出 JSON');
  }

  async function importAll(btn) {
    const file = document.getElementById('importFile').files[0];
    if (!file) { HUTB.toast('请选择 JSON 文件'); return; }
    const ok = await HUTB.confirm('导入将覆盖当前数据,确认继续?', '导入确认');
    if (!ok) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        HUTBData.importAll(data);
        HUTB.toast('导入成功');
        location.reload();
      } catch (err) {
        HUTB.toast('JSON 文件格式错误');
      }
    };
    reader.readAsText(file);
  }

  async function resetAll() {
    const ok = await HUTB.confirm('将清除当前所有自定义数据,恢复到演示数据,确认?', '重置数据');
    if (!ok) return;
    HUTBData.resetAll();
    HUTB.toast('已恢复演示数据');
    location.reload();
  }

  /* ===================== 暴露全局 ===================== */
  window.HUTBAdmin = {
    goSection: (s) => switchTab(s),
    goTab: (t) => switchTab(t),
    gotoSections: () => switchTab('dashboard'),
    openItemForm,
    move,
    togglePin,
    deleteItem,
    clearCover,
    editCat,
    deleteCat,
    exportRecruit,
    exportAll,
    importAll,
    resetAll,
  };

  window.logout = () => {
    HUTBData.logout();
    location.href = 'login.html';
  };

  // 启动
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
