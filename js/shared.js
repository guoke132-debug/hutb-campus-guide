/* ====================================================================
 * shared.js - 公共工具（导航高亮、footer年份、escape HTML、toast等）
 * ==================================================================== */

window.HUTB = window.HUTB || {};

HUTB.escape = function (s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

HUTB.nl2br = function (s) {
  return HUTB.escape(s).replace(/\n/g, '<br>');
};

HUTB.formatDate = function (iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

HUTB.formatDateTime = function (iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

HUTB.relativeTime = function (iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return Math.floor(diff / 60_000) + ' 分钟前';
  if (diff < 86_400_000) return Math.floor(diff / 3_600_000) + ' 小时前';
  if (diff < 7 * 86_400_000) return Math.floor(diff / 86_400_000) + ' 天前';
  return HUTB.formatDate(iso);
};

HUTB.toast = function (msg, ms = 2200) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .25s'; setTimeout(() => t.remove(), 250); }, ms);
};

HUTB.confirm = function (msg, title = '确认操作') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:420px;">
        <div class="modal-head"><h3>${HUTB.escape(title)}</h3></div>
        <div class="modal-body"><p style="margin:0;">${HUTB.escape(msg)}</p></div>
        <div class="modal-foot">
          <button class="btn btn-secondary" data-act="cancel">取消</button>
          <button class="btn" style="background:#dc3545;" data-act="ok">确认</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.dataset.act === 'cancel') {
        overlay.remove();
        resolve(false);
      } else if (e.target.dataset.act === 'ok') {
        overlay.remove();
        resolve(true);
      }
    });
  });
};

HUTB.prompt = function (title, fields) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const inputs = fields.map((f) => `
      <div class="field">
        <label>${HUTB.escape(f.label)}${f.required ? ' <span style="color:#dc3545;">*</span>' : ''}</label>
        ${f.type === 'textarea'
          ? `<textarea name="${f.name}" placeholder="${HUTB.escape(f.placeholder || '')}"></textarea>`
          : `<input type="${f.type || 'text'}" name="${f.name}" placeholder="${HUTB.escape(f.placeholder || '')}">`}
      </div>`).join('');
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-head"><h3>${HUTB.escape(title)}</h3></div>
        <div class="modal-body"><form>${inputs}</form></div>
        <div class="modal-foot">
          <button class="btn btn-secondary" data-act="cancel">取消</button>
          <button class="btn" data-act="ok">确认</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.dataset.act === 'cancel') {
        overlay.remove();
        resolve(null);
      } else if (e.target.dataset.act === 'ok') {
        const data = {};
        overlay.querySelectorAll('input, textarea').forEach((el) => { data[el.name] = el.value.trim(); });
        const missing = fields.filter((f) => f.required && !data[f.name]);
        if (missing.length) {
          HUTB.toast('请填写：' + missing.map((m) => m.label).join('、'));
          return;
        }
        overlay.remove();
        resolve(data);
      }
    });
  });
};

/* ----- 招新报名 Modal ----- */
HUTB.openRecruitModal = function () {
  const settings = HUTBData.getSettings();
  if (settings.recruitmentFormUrl && /^https?:\/\//i.test(settings.recruitmentFormUrl)) {
    window.open(settings.recruitmentFormUrl, '_blank', 'noopener');
    return;
  }
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:520px;">
      <div class="modal-head">
        <h3>📬 华硕校园合伙人 招新报名</h3>
        <button class="modal-close" data-act="close">×</button>
      </div>
      <div class="modal-body">
        <p style="color:var(--c-text-muted); font-size:0.875rem; margin-bottom: var(--sp-4);">
          填写下方信息,我们会在 3 个工作日内联系你。带 <span style="color:#dc3545;">*</span> 为必填。
        </p>
        <form class="recruit-form" id="recForm">
          <div>
            <label>姓名 *</label>
            <input type="text" name="name" required placeholder="你的真实姓名">
          </div>
          <div class="field-row">
            <div>
              <label>学院 *</label>
              <input type="text" name="college" required placeholder="如：计算机科学学院">
            </div>
            <div>
              <label>年级 *</label>
              <select name="grade" required>
                <option value="">请选择</option>
                <option>2026 级（大一）</option>
                <option>2025 级（大二）</option>
                <option>其他</option>
              </select>
            </div>
          </div>
          <div>
            <label>联系方式 *</label>
            <input type="tel" name="contact" required placeholder="手机号或微信号">
          </div>
          <div>
            <label>感兴趣的方向</label>
            <select name="direction">
              <option value="">未决定</option>
              <option>算法竞赛</option>
              <option>项目开发</option>
              <option>Web 前端</option>
              <option>AI / 数据挖掘</option>
              <option>嵌入式 / 物联网</option>
              <option>设计 / 视频</option>
            </select>
          </div>
          <div>
            <label>自我介绍（可选）</label>
            <textarea name="intro" placeholder="一句话介绍下自己,或过往做过的小项目...（最多 300 字）" maxlength="300" rows="3"></textarea>
          </div>
        </form>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-act="close">取消</button>
        <button class="btn btn-accent" data-act="submit">提交报名</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.dataset.act === 'close') {
      overlay.remove();
    } else if (e.target.dataset.act === 'submit') {
      const form = overlay.querySelector('#recForm');
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      const missing = ['name', 'college', 'grade', 'contact'].filter((k) => !data[k]);
      if (missing.length) {
        HUTB.toast('请把必填项填完整哦～');
        return;
      }
      HUTBData.submitRecruitment(data);
      overlay.remove();
      HUTB.toast('报名成功！等你入群～');
    }
  });
};

/* ----- 移动端导航开关 ----- */
HUTB.bindNav = function () {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });
  // 点击链接自动关闭
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
};

/* ----- 自动高亮导航 ----- */
HUTB.highlightNav = function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach((a) => {
    if (a.dataset.page === path) a.classList.add('active');
  });
};

/* ----- 渲染页脚年份 ----- */
HUTB.fillYear = function () {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
};

/* ----- 滚动揭示（IntersectionObserver 编排） ----- */
HUTB.initReveal = function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window) || targets.length === 0) {
    document.body.classList.add('reveal-ready');
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  document.body.classList.add('reveal-ready');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  targets.forEach((el, i) => {
    el.style.transitionDelay = (Math.min(i, 6) * 0.06) + 's';
    io.observe(el);
  });
  // 捕获动态注入的内容（CMS 渲染的卡片）
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add('is-visible');
    });
  }, 400);
  // 终极兜底：若 IO 因任何原因未触发，1.5s 后强制显示全部内容，避免下半屏永久空白
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => el.classList.add('is-visible'));
  }, 1500);
};

/* ----- 导航滚动阴影 ----- */
HUTB.initNavScroll = function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
};

/* ----- 初始化入口 ----- */
document.addEventListener('DOMContentLoaded', () => {
  HUTB.bindNav();
  HUTB.highlightNav();
  HUTB.fillYear();
  HUTB.initNavScroll();
  HUTB.initReveal();
});
