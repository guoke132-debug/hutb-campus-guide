/**
 * community.js — 社区发帖 / 点赞 / 评论
 * 数据存储：localStorage（纯前端）
 * 帖子数据结构：
 * { id, author, title, content, tags[], likes: Set, comments: [], createdAt, updatedAt }
 */
(function () {
  'use strict';

  const PREFIX = 'hutb_campus_';
  const POSTS_KEY = PREFIX + 'posts';
  const LIKES_KEY = PREFIX + 'likes';  // { postId: Set<username> }

  /* ===================== 内部 helpers ===================== */

  function getPosts() {
    try { return JSON.parse(localStorage.getItem(POSTS_KEY)) || []; }
    catch { return []; }
  }

  function savePosts(posts) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }

  function getLikes() {
    try { return JSON.parse(localStorage.getItem(LIKES_KEY)) || {}; }
    catch { return {}; }
  }

  function saveLikes(likes) {
    // likes[postId] 是 Set，转成数组存
    const data = {};
    for (const [k, v] of Object.entries(likes)) {
      data[k] = Array.from(v);
    }
    localStorage.setItem(LIKES_KEY, JSON.stringify(data));
  }

  function loadLikes() {
    const data = getLikes();
    const likes = {};
    for (const [k, v] of Object.entries(data)) {
      likes[k] = new Set(v);
    }
    return likes;
  }

  function makeId() {
    return 'post_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  /* ===================== 公开 API ===================== */

  /**
   * 发帖
   * @param {object} data { title, content, tags }
   * @param {string} author - 当前登录用户名
   */
  window.Community = {
    createPost: function (data, author) {
      if (!author) return { ok: false, message: '请先登录' };
      const title = (data.title || '').trim();
      const content = (data.content || '').trim();
      if (!title) return { ok: false, message: '标题不能为空' };
      if (title.length > 60) return { ok: false, message: '标题不超过 60 字' };
      if (!content) return { ok: false, message: '内容不能为空' };
      if (content.length > 3000) return { ok: false, message: '内容不超过 3000 字' };

      const tags = Array.isArray(data.tags) ? data.tags.filter(Boolean) : [];
      const posts = getPosts();
      const post = {
        id: makeId(),
        author,
        title,
        content,
        tags,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        commentCount: 0,
      };
      posts.unshift(post);
      savePosts(posts);
      // 初始化赞空集合
      const likes = loadLikes();
      likes[post.id] = new Set();
      saveLikes(likes);
      return { ok: true, post };
    },

    /**
     * 获取全部帖子（按时间倒序）
     * @param {object} filter { tag?: string, search?: string, author?: string }
     */
    getPosts: function (filter) {
      let posts = getPosts();
      if (filter) {
        if (filter.tag) {
          posts = posts.filter(p => p.tags.includes(filter.tag));
        }
        if (filter.search) {
          const q = filter.search.toLowerCase();
          posts = posts.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q)
          );
        }
        if (filter.author) {
          posts = posts.filter(p => p.author === filter.author);
        }
      }
      return posts;
    },

    /**
     * 获取单帖
     */
    getPost: function (id) {
      const posts = getPosts();
      return posts.find(p => p.id === id) || null;
    },

    /**
     * 删除帖子（仅作者可删）
     */
    deletePost: function (id, author) {
      const posts = getPosts();
      const idx = posts.findIndex(p => p.id === id);
      if (idx < 0) return { ok: false, message: '帖子不存在' };
      if (posts[idx].author !== author) return { ok: false, message: '无权删除' };
      posts.splice(idx, 1);
      savePosts(posts);
      const likes = loadLikes();
      delete likes[id];
      saveLikes(likes);
      return { ok: true };
    },

    /**
     * 点赞 / 取消点赞
     * @returns {number} 当前赞数
     */
    toggleLike: function (postId, username) {
      if (!username) return -1;
      const posts = getPosts();
      const post = posts.find(p => p.id === postId);
      if (!post) return -1;

      const likes = loadLikes();
      if (!likes[postId]) likes[postId] = new Set();
      if (likes[postId].has(username)) {
        likes[postId].delete(username);
      } else {
        likes[postId].add(username);
      }
      saveLikes(likes);

      // 同步更新 posts 里赞数
      post.likes = Array.from(likes[postId]);
      savePosts(posts);
      return likes[postId].size;
    },

    /**
     * 获取某帖点赞数
     */
    getLikeCount: function (postId) {
      const likes = loadLikes();
      return likes[postId] ? likes[postId].size : 0;
    },

    /**
     * 当前用户是否点赞了某帖
     */
    hasLiked: function (postId, username) {
      if (!username) return false;
      const likes = loadLikes();
      return likes[postId] ? likes[postId].has(username) : false;
    },

    /* ---------- 评论 ---------- */

    /**
     * 发评论
     */
    addComment: function (postId, author, content) {
      if (!author) return { ok: false, message: '请先登录' };
      content = (content || '').trim();
      if (!content) return { ok: false, message: '评论不能为空' };
      if (content.length > 500) return { ok: false, message: '评论不超过 500 字' };

      const posts = getPosts();
      const post = posts.find(p => p.id === postId);
      if (!post) return { ok: false, message: '帖子不存在' };

      const comment = {
        id: 'cmt_' + Date.now(),
        author,
        content,
        createdAt: Date.now(),
      };
      if (!post.comments) post.comments = [];
      post.comments.push(comment);
      post.commentCount = post.comments.length;
      post.updatedAt = Date.now();
      savePosts(posts);
      return { ok: true, comment };
    },

    /**
     * 删除评论（仅作者可删）
     */
    deleteComment: function (postId, commentId, author) {
      const posts = getPosts();
      const post = posts.find(p => p.id === postId);
      if (!post) return { ok: false, message: '帖子不存在' };
      const idx = post.comments.findIndex(c => c.id === commentId);
      if (idx < 0) return { ok: false, message: '评论不存在' };
      if (post.comments[idx].author !== author) return { ok: false, message: '无权删除' };
      post.comments.splice(idx, 1);
      post.commentCount = post.comments.length;
      post.updatedAt = Date.now();
      savePosts(posts);
      return { ok: true };
    },

    /**
     * 获取所有话题标签
     */
    getAllTags: function () {
      const posts = getPosts();
      const tagSet = new Set();
      posts.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
      return Array.from(tagSet).sort();
    },

    /* ---------- 默认种子数据（首次使用） ---------- */
    seedIfEmpty: function () {
      if (getPosts().length > 0) return;
      const seeds = [
        {
          id: 'post_seed_1',
          author: 'admin',
          title: '🏫 新生必看！北校区宿舍入住指南',
          content: '床的尺寸是 0.9m × 1.9m，记得买床垫的时候按这个尺寸买！宿舍没有空调但有风扇，夏天其实还好。热水供应时间是17:30-23:00，冬天洗澡要算好时间。\n\n快递地址填：湖南省长沙市望城区月亮岛街道湖南工商大学北校区就好，收件地址写这个基本都能到。',
          tags: ['#迎新', '#宿舍'],
          createdAt: Date.now() - 7 * 24 * 3600 * 1000,
          updatedAt: Date.now() - 7 * 24 * 3600 * 1000,
          commentCount: 3,
          comments: [
            { id: 'cmt_s1_1', author: '路飞', content: '热水供应时间真的很重要！第一天不知道洗到一半变冷水了[捂脸]', createdAt: Date.now() - 6 * 24 * 3600 * 1000 },
            { id: 'cmt_s1_2', author: 'ACM小助手', content: '欢迎来到湖工商！有任何问题都可以在社区提问～', createdAt: Date.now() - 5 * 24 * 3600 * 1000 },
            { id: 'cmt_s1_3', author: '奶茶续命中', content: '快递地址亲测有效，韵达极兔都能到', createdAt: Date.now() - 3 * 24 * 3600 * 1000 },
          ],
        },
        {
          id: 'post_seed_2',
          author: '吃货本货',
          title: '🍜 后街必吃清单（亲测 20 家）',
          content: '后街真的是宝藏！总结一下我吃过觉得值得去的：\n\n🥘 正餐类\n- 后街卤肉饭（便宜大碗，打工人之光）\n- 麻辣烫（随便选都不会踩雷，推荐加豆皮）\n- 黄焖鸡米饭（米饭绝绝子）\n\n🍰 小食类\n- 两元面包店（每天下午3点新鲜出炉，超级香）\n- 糖水粥铺（绿豆沙4块，便宜好喝）\n\n🧋 奶茶\n- 古茗（推荐茉莉杨桃/芋泥茉莉）\n- 蜜雪冰城（柠檬水永远的神）\n- 瑞幸（每周一杯9.9）\n\n欢迎大家补充！',
          tags: ['#美食'],
          createdAt: Date.now() - 5 * 24 * 3600 * 1000,
          updatedAt: Date.now() - 5 * 24 * 3600 * 1000,
          commentCount: 2,
          comments: [
            { id: 'cmt_s2_1', author: '后街常客', content: '补充一个！煎饼果子家的脆皮肠绝绝子', createdAt: Date.now() - 4 * 24 * 3600 * 1000 },
            { id: 'cmt_s2_2', author: '省钱达人', content: '两元面包店下午去要排队，建议中午去人少', createdAt: Date.now() - 2 * 24 * 3600 * 1000 },
          ],
        },
        {
          id: 'post_seed_3',
          author: 'ACM小助手',
          title: '📚 图书馆选座避坑指南',
          content: '图书馆是湖工商最卷的地方，考试周一座难求。给大家几点建议：\n\n1. 问津书院（图书馆5楼）：位置最安静，有独立插座\n2. 求索书院（图书馆4楼）：开放时间长，但人也多\n3. 彩虹书院（图书馆3楼）：环境好，适合小组讨论，但说话要小声\n\n⚠️ 注意：考试周不允许占座，图书馆会清人，不要用书占座！\n\n推荐带个小风扇，图书馆空调开得很足……冷的那种。',
          tags: ['#学习'],
          createdAt: Date.now() - 3 * 24 * 3600 * 1000,
          updatedAt: Date.now() - 3 * 24 * 3600 * 1000,
          commentCount: 1,
          comments: [
            { id: 'cmt_s3_1', author: '卷王本人', content: '问津书院插座真的多，其他楼层抢不到的时候可以去那边碰碰运气', createdAt: Date.now() - 2 * 24 * 3600 * 1000 },
          ],
        },
        {
          id: 'post_seed_4',
          author: '旅游发烧友',
          title: '🚄 周末长沙一日游路线（省时版）',
          content: '从学校出发，长沙市区玩一天完全够用！\n\n📍 路线：\n上午：五一广场/黄兴路步行街 → 太平老街\n中午：超级文和友（拍照>吃饭）\n下午：橘子洲/岳麓山（选一个，季节适合走路）\n晚上：杜甫江阁看夜景/解放西感受夜生活\n\n🚇 交通：\n学校附近有地铁4号线，换乘方便。打车到五一广场大概30块。\n\n💰 预算：一天150-200可以玩得很好。\n\n有什么问题可以问我！',
          tags: ['#旅游'],
          createdAt: Date.now() - 1 * 24 * 3600 * 1000,
          updatedAt: Date.now() - 1 * 24 * 3600 * 1000,
          commentCount: 0,
          comments: [],
        },
      ];
      savePosts(seeds);
      const likes = {};
      seeds.forEach(p => { likes[p.id] = new Set(); });
      saveLikes(likes);
    },
  };

  // 首次使用植入种子数据
  window.Community.seedIfEmpty();

})();
