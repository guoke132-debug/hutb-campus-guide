/**
 * user.js — 用户注册 / 登录 / 会话管理
 * 数据存储：localStorage（纯前端，无需后端）
 * 密码：SHA-256 哈希后存储
 */
(function () {
  'use strict';

  const PREFIX = 'hutb_campus_';
  const USERS_KEY  = PREFIX + 'users';
  const SESSION_KEY = PREFIX + 'session';

  /* ---- SHA-256 ---- */
  async function sha256(str) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let h = 0x811c9dc5;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = (h * 0x01000193) >>> 0;
      }
      return h.toString(16).padStart(8, '0');
    }
  }

  function genToken() {
    return 'tok_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  }

  function genSalt() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
    catch { return {}; }
  }

  function saveUsers(u) {
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
  }

  /* ---- 注册 ---- */
  window.User.register = async function (username, password) {
    username = (username || '').trim().toLowerCase();
    password = password || '';
    if (username.length < 2 || username.length > 20) return { ok: false, message: '账号 2-20 个字符' };
    if (!/^[a-z0-9_]+$/.test(username)) return { ok: false, message: '账号仅限小写字母/数字/下划线' };
    if (password.length < 6) return { ok: false, message: '密码至少 6 位' };
    const users = getUsers();
    if (users[username]) return { ok: false, message: '账号已被注册' };
    const salt = genSalt();
    const hash = await sha256(password + salt);
    users[username] = { hash, salt, createdAt: Date.now() };
    saveUsers(users);
    return { ok: true, message: '注册成功，请登录' };
  };

  /* ---- 登录 ---- */
  window.User.login = async function (username, password) {
    username = (username || '').trim().toLowerCase();
    password = password || '';
    const users = getUsers();
    const u = users[username];
    if (!u) return { ok: false, message: '账号或密码错误' };
    const hash = await sha256(password + u.salt);
    if (hash !== u.hash) return { ok: false, message: '账号或密码错误' };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, token: genToken(), loginAt: Date.now() }));
    return { ok: true, message: '登录成功', user: { username } };
  };

  /* ---- 登出 ---- */
  window.User.logout = function () {
    localStorage.removeItem(SESSION_KEY);
  };

  /* ---- 当前会话 ---- */
  window.User.getSession = function () {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (!s || !s.token) return null;
      if (Date.now() - s.loginAt > 7 * 86400000) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch { return null; }
  };

  window.User.isLoggedIn = function () { return !!window.User.getSession(); };

  /* ---- 改密码 ---- */
  window.User.changePassword = async function (oldPwd, newPwd) {
    const sess = window.User.getSession();
    if (!sess) return { ok: false, message: '请先登录' };
    const users = getUsers();
    const u = users[sess.username];
    if (!u) return { ok: false, message: '用户不存在' };
    if ((await sha256(oldPwd + u.salt)) !== u.hash) return { ok: false, message: '原密码错误' };
    if (newPwd.length < 6) return { ok: false, message: '新密码至少 6 位' };
    const salt = genSalt();
    users[sess.username] = { hash: await sha256(newPwd + salt), salt, createdAt: u.createdAt, updatedAt: Date.now() };
    saveUsers(users);
    return { ok: true, message: '密码修改成功' };
  };

})();