/* ====================================================================
 * HUTB Campus Guide - Data Layer
 * 湖南工商大学（北校区）生活指南
 * 数据存储：localStorage
 * ==================================================================== */
(function(global){'use strict';

const STORAGE_PREFIX='hutb_campus_';
const VERSION_KEY=STORAGE_PREFIX+'version';
const CURRENT_VERSION='1.1.0';

/* ===================== 默认食堂数据 ===================== */
const DEFAULT_FOOD=[
{id:'food_001',title:'铭德食堂 · 常德米粉',category:'校内食堂',cover:null,
excerpt:'一食堂主打湖南常德风味，强烈推荐西红柿鸡蛋拌面和蛋炒粉。',
content:'<p>铭德食堂一楼，常德米粉窗口。招牌西红柿鸡蛋拌面 10 元，蛋炒粉 8 元，稍贵但味道好。还有老长沙米粉（有肠粉）。</p><h4>推荐菜品</h4><ul><li>西红柿鸡蛋拌面</li><li>蛋炒粉</li><li>常德牛肉粉</li><li>老长沙肠粉</li></ul><h4>营业时间</h4><p>早餐 6:30-9:00 ｜ 午餐 11:00-13:30 ｜ 晚餐 17:00-19:30</p>',
tags:['湖南米粉','面食','一食堂'],location:'湖南工商大学北校区·铭德食堂（一食堂）1楼',
recommendedDishes:['西红柿鸡蛋拌面','蛋炒粉'],priceRange:'¥8-12',rating:4.6,
pinned:true,sortOrder:1,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-10T08:00:00Z'},
{id:'food_002',title:'铭德食堂 · 盖世英雄',category:'校内食堂',cover:null,
excerpt:'一食堂饭菜类档口，份量足，堂食不能分装。',
content:'<p>铭德食堂二楼，盖世英雄档口，专注炒菜套餐，份量足。注意：堂食不支持分装打包。</p><h4>推荐菜品</h4><ul><li>糖醋排骨套餐</li><li>红烧肉套餐</li><li>农家小炒肉</li></ul>',
tags:['套餐','炒菜','堂食'],location:'湖南工商大学北校区·铭德食堂（一食堂）2楼',
recommendedDishes:['糖醋排骨套餐','红烧肉套餐'],priceRange:'¥12-18',rating:4.3,
pinned:false,sortOrder:2,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-05T08:00:00Z'},
{id:'food_003',title:'铭德食堂 · 大内香酥鸭',category:'校内食堂',cover:null,
excerpt:'便宜量大，适合干饭人。',
content:'<p>铭德食堂内性价比之选，份量足、价格低，适合饭量大的同学。</p><h4>推荐菜品</h4><ul><li>香酥鸭套餐</li><li>卤肉饭</li></ul>',
tags:['便宜','量大'],location:'湖南工商大学北校区·铭德食堂（一食堂）',
recommendedDishes:['香酥鸭套餐','卤肉饭'],priceRange:'¥8-14',rating:4.2,
pinned:false,sortOrder:3,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-04T08:00:00Z'},
{id:'food_004',title:'二食堂 · 匠心卤',category:'校内食堂',cover:null,
excerpt:'清淡口味，椒麻肉丝饭可双拼三拼。注意：自选偏贵，别选压称的。',
content:'<p>二食堂一楼，匠心卤档口，口味清淡。招牌椒麻肉丝饭 12 元、椒麻鸡丝饭 11 元，可双拼或三拼。</p><h4>推荐菜品</h4><ul><li>椒麻肉丝饭</li><li>椒麻鸡丝饭</li><li>卤味拼盘</li></ul>',
tags:['卤味','清淡','双拼'],location:'湖南工商大学北校区·二食堂1楼',
recommendedDishes:['椒麻肉丝饭','椒麻鸡丝饭'],priceRange:'¥10-15',rating:4.5,
pinned:true,sortOrder:4,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-06T08:00:00Z'},
{id:'food_005',title:'二食堂 · 渔粉/花甲粉/螺蛳粉',category:'校内食堂',cover:null,
excerpt:'二食堂汤粉系列，花甲粉鲜，螺蛳粉够劲。',
content:'<p>二食堂渔粉档口，主打各类汤粉。</p><h4>推荐菜品</h4><ul><li>渔粉（招牌）</li><li>花甲粉（鲜）</li><li>螺蛳粉（够劲）</li><li>热干面</li></ul>',
tags:['汤粉','粉类'],location:'湖南工商大学北校区·二食堂',
recommendedDishes:['渔粉','花甲粉','螺蛳粉'],priceRange:'¥10-14',rating:4.4,
pinned:false,sortOrder:5,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-06T08:00:00Z'},
{id:'food_006',title:'后街 · 十二元砂锅粉自选',category:'周边小吃',cover:null,
excerpt:'好吃实惠，配菜自选，后街性价比之王！',
content:'<p>后街人气摊位，十二元一份，荤素自选配菜。强烈推荐加一份肉丸或卤蛋。</p><h4>推荐理由</h4><ul><li>便宜：¥12 管饱</li><li>自选：配菜灵活</li><li>好吃：一致好评</li></ul>',
tags:['便宜','自选','必吃'],location:'湖南工商大学北校区后街',
recommendedDishes:['砂锅粉','加卤蛋','加肉丸'],priceRange:'¥12-16',rating:4.7,
pinned:true,sortOrder:6,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_007',title:'后街 · 土豆泥拌面',category:'周边小吃',cover:null,
excerpt:'口味独特，土豆泥裹满面条。最近分量略少。',
content:'<p>后街特色小吃，土豆泥拌面 8-10 元，口味独特，咸香浓郁。近期有同学反映分量略少，胃口小的刚好。</p>',
tags:['面食','特色'],location:'湖南工商大学北校区后街',
recommendedDishes:['土豆泥拌面'],priceRange:'¥8-12',rating:4.3,
pinned:false,sortOrder:7,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_008',title:'后街 · 猪油炒饭',category:'周边小吃',cover:null,
excerpt:'后街最好吃的炒饭！熊二炒饭排第二，其他都不行。',
content:'<p>后街炒饭摊，猪油炒饭 10 元，据同学们一致评价是后街最好吃的炒饭。熊二炒饭次之，其余炒饭均不推荐。</p>',
tags:['炒饭','必吃'],location:'湖南工商大学北校区后街',
recommendedDishes:['猪油炒饭','熊二炒饭'],priceRange:'¥10-12',rating:4.8,
pinned:true,sortOrder:8,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_009',title:'后街 · 旋记鸭霸王',category:'周边小吃',cover:null,
excerpt:'吃辣必试！辣得过瘾，回味无穷。',
content:'<p>后街卤味摊，主打鸭霸王系列，能吃辣的直接冲。</p>',
tags:['卤味','辣'],location:'湖南工商大学北校区后街',
recommendedDishes:['鸭霸王','麻辣鸭脖'],priceRange:'¥8-15',rating:4.5,
pinned:false,sortOrder:9,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_010',title:'后街 · 后街炸鸡',category:'周边小吃',cover:null,
excerpt:'干干脆脆，一致好评，吃过都说好。',
content:'<p>后街炸鸡摊位，外酥里嫩，干干脆脆的口感在学生中口碑极佳。</p>',
tags:['炸鸡','零食'],location:'湖南工商大学北校区后街',
recommendedDishes:['炸鸡腿','炸鸡排'],priceRange:'¥8-15',rating:4.6,
pinned:false,sortOrder:10,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_011',title:'后街 · 肉夹馍',category:'周边小吃',cover:null,
excerpt:'味道好，但分量偏少，胃口大的可能吃不饱。',
content:'<p>后街肉夹馍摊，味道不错但每份分量偏少，建议多买一个或搭配其他食品。</p>',
tags:['面食','轻量'],location:'湖南工商大学北校区后街',
recommendedDishes:['卤肉夹馍'],priceRange:'¥6-10',rating:4.2,
pinned:false,sortOrder:11,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_012',title:'后街 · 煎饼（阿姨摊）',category:'周边小吃',cover:null,
excerpt:'阿姨开的煎饼摊，分量足，一定要加肉松！',
content:'<p>后街煎饼阿姨摊，分量足、味道好，一定要记得加肉松（强烈推荐）！</p>',
tags:['煎饼','早餐'],location:'湖南工商大学北校区后街',
recommendedDishes:['煎饼加肉松'],priceRange:'¥5-10',rating:4.5,
pinned:false,sortOrder:12,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_013',title:'后街 · 两元面包店',category:'周边小吃',cover:null,
excerpt:'巨好吃！面包多为 3.5/5.5 元，冷萃茉莉强烈推荐。',
content:'<p>后街超高性价比面包店，招牌冷萃茉莉 ¥5.5，味道绝绝子。普通面包 3.5 元起，种类丰富。同家店还有糖水铺子。</p>',
tags:['面包','便宜'],location:'湖南工商大学北校区后街',
recommendedDishes:['冷萃茉莉','3.5元面包套餐'],priceRange:'¥2-8',rating:4.7,
pinned:true,sortOrder:13,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_014',title:'后街 · 糖水粥铺',category:'周边小吃',cover:null,
excerpt:'可加小料，中杯 4-7 元，大杯 +2 元。便宜解暑。',
content:'<p>后街糖水粥铺，招牌绿豆沙、薏米水、西米露等，可加芋圆、椰果等小料。</p>',
tags:['糖水','解暑','便宜'],location:'湖南工商大学北校区后街',
recommendedDishes:['绿豆沙','薏米西米露'],priceRange:'¥4-9',rating:4.4,
pinned:false,sortOrder:14,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_015',title:'后街右转 · 湘味浓',category:'聚餐餐厅',cover:null,
excerpt:'量大便宜，后街右转即到，馆内还有临榆炸鸡腿和云南米线。',
content:'<p>出后街右转步行 2 分钟，湘味浓饭馆，量大便宜，适合多人聚餐。馆内同层还有临榆炸鸡腿（连锁）和云南米线（老板好，常搞活动送煎蛋饮料，免费加粉）。</p>',
tags:['湘菜','聚餐'],location:'湖南工商大学北校区后街右转',
recommendedDishes:['湘味浓招牌菜','云南米线'],priceRange:'¥15-30',rating:4.6,
pinned:true,sortOrder:15,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_016',title:'瑞幸咖啡 · 一食堂旁',category:'奶茶咖啡',cover:null,
excerpt:'铭德食堂旁瑞幸，可买美团/饿了么团购。',
content:'<p>一食堂（铭德）旁边有瑞幸咖啡，支持美团/饿了么团购，价格更便宜。</p>',
tags:['咖啡','团购'],location:'湖南工商大学北校区·铭德食堂旁',
recommendedDishes:['生椰拿铁','拿铁'],priceRange:'¥12-20',rating:4.3,
pinned:false,sortOrder:16,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_017',title:'后街奶茶店群',category:'奶茶咖啡',cover:null,
excerpt:'后街一点点/书亦/蜜雪/沪上阿姨，沪上阿姨和古茗可送上楼。',
content:'<p>后街奶茶聚集地，一点点、书亦烧仙草、蜜雪冰城、沪上阿姨、古茗全都有。沪上阿姨和古茗支持送上楼（不用自己跑下去拿）。</p>',
tags:['奶茶','外卖'],location:'湖南工商大学北校区后街',
recommendedDishes:['沪上阿姨杨枝甘露','古茗杨枝甘露'],priceRange:'¥8-18',rating:4.4,
pinned:false,sortOrder:17,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_018',title:'果链水果店',category:'周边小吃',cover:null,
excerpt:'性价比高、新鲜。注意：烧烤旁边那家水果店是坏的，需避雷。',
content:'<p>后街水果店，性价比高、水果新鲜。注意区分：烧烤摊位旁边的那家水果店品质有问题，避雷。</p>',
tags:['水果','注意避雷'],location:'湖南工商大学北校区后街',
recommendedDishes:['当季水果拼盘'],priceRange:'¥5-15',rating:4.1,
pinned:false,sortOrder:18,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'food_019',title:'小碗菜（后街摊）',category:'周边小吃',cover:null,
excerpt:'现炒味道不错，但人很多，建议早点去。',
content:'<p>后街小碗菜摊位，现点现炒，味道不错。缺点是人多，建议避开饭点高峰期。</p>',
tags:['小碗菜','现炒'],location:'湖南工商大学北校区后街',
recommendedDishes:['小碗菜自选'],priceRange:'¥8-15',rating:4.2,
pinned:false,sortOrder:19,published:true,createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'}
];

/* ===================== 默认周边景点数据 ===================== */
const DEFAULT_TRAVEL=[
{id:'travel_001',title:'岳麓山 · 长沙城市绿肺',category:'自然风光',cover:null,
excerpt:'长沙必打卡，登山吸氧，俯瞰湘江，秋赏红叶夏避暑。',
content:'<p>岳麓山是长沙的城市绿肺，海拔 300 米，登山约 2 小时。山顶可观湘江，秋季红叶极美。</p><h4>实用信息</h4><ul><li>门票：免费（部分景点收费）</li><li>索道：¥30上山，¥25下山</li><li>观光车：¥20单程</li><li>最佳季节：春秋两季</li></ul>',
tags:['景点','户外','长沙必去'],location:'长沙市岳麓区岳麓山',
transport:'地铁2号线至岳麓山站，或公交，立珊专线终点站',
duration:'2-4小时',bestSeason:'春秋',cost:'¥0-80',
rating:4.8,pinned:true,sortOrder:1,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-05T08:00:00Z'},
{id:'travel_002',title:'橘子洲头 · 湘江第一洲',category:'城市地标',cover:null,
excerpt:'毛主席青年艺术雕塑，漫步湘江中央，建议坐小火车游览。',
content:'<p>橘子洲是湘江中的长岛，青年毛泽东曾在此写下《沁园春·长沙》。核心看点是 32 米高的青年毛泽东艺术雕塑。</p><h4>实用信息</h4><ul><li>门票：免费（小火车 ¥40）</li><li>最佳游览：傍晚，看湘江日落</li><li>地铁：2号线橘子洲站</li></ul>',
tags:['景点','地标','拍照'],location:'长沙市岳麓区橘子洲',
transport:'地铁2号线橘子洲站，步行至洲头',
duration:'2-3小时',bestSeason:'四季',cost:'¥0-40',
rating:4.7,pinned:true,sortOrder:2,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-05T08:00:00Z'},
{id:'travel_003',title:'后湖国际艺术园',category:'文化打卡',cover:null,
excerpt:'望城区新晋打卡地，湖畔文艺街区，适合拍照散心。',
content:'<p>后湖国际艺术园位于望城区，紧邻校区，步行可达。是集艺术创作、文化休闲为一体的湖畔文艺街区，有大量涂鸦墙、咖啡馆、艺术装置。</p><h4>适合场景</h4><ul><li>拍照打卡</li><li>朋友聚会</li><li>周末散心</li></ul>',
tags:['文艺','拍照','望城'],location:'长沙市望城区后湖国际艺术园',
transport:'步行/骑车，从北校区出发约15分钟',
duration:'1-2小时',bestSeason:'四季',cost:'¥0',
rating:4.5,pinned:true,sortOrder:3,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-05T08:00:00Z'},
{id:'travel_004',title:'铜官窑古镇',category:'周末路线',cover:null,
excerpt:'长沙周边古镇，陶瓷文化，夜景绝美，适合周末一日游。',
content:'<p>铜官窑古镇位于长沙北边望城区，是唐代陶瓷名镇，有"千年陶都"之称。夜景绝美，《铜官窑》演出震撼。</p><h4>实用信息</h4><ul><li>门票：提前购票约¥100</li><li>距北校区：约40分钟车程</li><li>建议游玩：半天至一天</li></ul>',
tags:['古镇','周末游','陶瓷'],location:'长沙市望城区铜官窑遗址公园',
transport:'地铁1号线至开福区政府站，换乘公交W105/W113',
duration:'4-8小时',bestSeason:'春秋',cost:'¥100-150',
rating:4.6,pinned:false,sortOrder:4,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-05T08:00:00Z'},
{id:'travel_005',title:'烈士公园',category:'城市地标',cover:null,
excerpt:'长沙市最大公园，免费开放，湖光山色，适合日常散步。',
content:'<p>烈士公园是长沙市最大的公园，有纪念塔、划船区、花卉区，适合日常散步、晨跑。</p><h4>实用信息</h4><ul><li>门票：免费</li><li>设施：划船、健身器材、游乐场</li><li>地铁：3号线烈士公园南站</li></ul>',
tags:['公园','免费','休闲'],location:'长沙市芙蓉区烈士公园',
transport:'地铁3号线烈士公园南站',
duration:'1-3小时',bestSeason:'四季',cost:'¥0-30',
rating:4.3,pinned:false,sortOrder:5,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-05T08:00:00Z'}
];

/* ===================== 默认学习场所数据 ===================== */
const DEFAULT_STUDY=[
{id:'study_001',title:'求索书院 · 图书馆五楼',category:'自习地点',cover:null,
excerpt:'2390㎡超大空间，1054个座位，含至诚轩/至信轩/为实轩/为新轩，800个指纹存包柜，冬暖夏凉。',
content:'<p>求索书院位于图书馆五楼，是北校区最大、最受欢迎的自习空间。开放至诚轩（周日-周四 8:10-17:20，周五-周六 8:10-21:30）、至信轩/为实轩/为新轩（7:10-22:30）。</p><h4>设施配置</h4><ul><li>座位：1054个</li><li>存包柜：800个指纹柜（免费）</li><li>配套：免费热水、WiFi、插线板</li><li>环境：冬暖夏凉，学习氛围好</li></ul>',
tags:['图书馆','安静','大空间'],location:'湖南工商大学北校区图书馆5楼·求索书院',
author:'图书馆',readTime:'全天开放',
rating:4.8,pinned:true,sortOrder:1,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'study_002',title:'问津书吧 · 图书馆一楼',category:'自习地点',cover:null,
excerpt:'825㎡/340座，7:00-22:00，24h热水，距离近。',
content:'<p>问津书吧位于图书馆一楼，825㎡空间，340个座位。开放时间 7:00-22:00，有24小时热水供应。距教学楼近，适合课间自习。</p>',
tags:['图书馆','方便','热水'],location:'湖南工商大学北校区图书馆1楼·问津书吧',
author:'图书馆',readTime:'7:00-22:00',
rating:4.6,pinned:false,sortOrder:2,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'study_003',title:'彩虹书院 · 追光楼六楼',category:'自习地点',cover:null,
excerpt:'254㎡/118座+6沙发，绿色北欧风，2023年9月投入使用，电梯直达。',
content:'<p>彩虹书院位于追光楼六楼东头，254㎡，118个座位加6个沙发。2023年9月投入使用，装修风格绿色北欧风，电梯直达，视野好。</p><h4>开放时间</h4><ul><li>上午 8:10-11:50</li><li>下午 14:30-17:20</li><li>晚上 18:30-22:00</li><li>周三下午不开放</li></ul>',
tags:['新','北欧风','舒适'],location:'湖南工商大学北校区·追光楼6楼东头·彩虹书院',
author:'书院',readTime:'见上方开放时间',
rating:4.5,pinned:false,sortOrder:3,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'study_004',title:'求真书吧 · 图书馆一楼',category:'自习地点',cover:null,
excerpt:'540㎡/235座，小巧安静，适合独处学习。',
content:'<p>求真书吧位于图书馆一楼，540㎡，235个座位。相比问津书吧更安静小巧，适合需要专注独处的同学。</p>',
tags:['安静','独处','小巧'],location:'湖南工商大学北校区图书馆1楼·求真书吧',
author:'图书馆',readTime:'开放时间详询图书馆',
rating:4.4,pinned:false,sortOrder:4,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'},
{id:'study_005',title:'Interlib 网上图书馆',category:'选课与资源',cover:null,
excerpt:'线上借阅系统，可续借、预约。初始密码：Tsg@身份证后六位。',
content:'<p>湖南工商大学图书馆网上系统：<code>http://opac.hutb.edu.cn/opac/</code>。可线上续借图书、预约热门书、查询借阅状态。</p><h4>登录说明</h4><ul><li>校园网访问：172.22.128.30</li><li>学生初始密码：Tsg@身份证后六位</li></ul>',
tags:['图书馆','借书','线上'],location:'线上系统',
author:'图书馆',readTime:'24h线上',
rating:4.3,pinned:false,sortOrder:5,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-08T08:00:00Z'}
];

/* ===================== 默认迎新数据 ===================== */
const DEFAULT_FRESHMAN=[
{id:'fresh_001',title:'报到流程全攻略',category:'入学报到',cover:null,
excerpt:'资格审查 → 绿色通道 → 缴费 → 领取宿舍钥匙，按这个顺序走最顺畅。',
content:'<h4>报到流程（按序进行）</h4><ol><li><strong>校门迎新点</strong>：志愿者接待引导</li><li><strong>学院报到处</strong>：核验证件，领取校园卡、宿舍钥匙、新生袋</li><li><strong>绿色通道/财务处</strong>：经济困难学生走绿色通道；其他学生确认缴费</li><li><strong>宿舍入住</strong>：领取钥匙，检查宿舍设施</li><li><strong>办校园网/水卡/电话卡</strong>（可选）</li><li><strong>领军训服</strong>：按尺码领取，注意试穿</li><li><strong>体检</strong>：校医院体检</li><li><strong>首次班会</strong>：辅导员主持，必到</li></ol><h4>携带证件清单</h4><ul><li>录取通知书</li><li>高考准考证</li><li>身份证及复印件</li><li>学籍档案（不可拆封）</li><li>团员档案（智慧团建转接）</li><li>证件照（一寸+二寸，红蓝白底各 8-10 张）</li><li>户口迁移证明（自愿）</li><li>贫困证明/生源地贷款回执（如有）</li></ul>',
tags:['报到','新生必看','流程'],location:'湖南工商大学北校区',
rating:5.0,pinned:true,sortOrder:1,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-10T08:00:00Z'},
{id:'fresh_002',title:'军训生存指南',category:'军训贴士',cover:null,
excerpt:'防晒、鞋垫、腰带、热水泡脚，还有申请免训的办法。',
content:'<h4>必备物资</h4><ul><li>防晒霜（SPF50+，勤补涂）</li><li>运动水杯（容量大，可接热水）</li><li>透气鞋垫（军训鞋硬）</li><li>腰带（军训服裤子普遍偏大）</li></ul><h4>注意事项</h4><ul><li>不要带手机上训练场（容易丢）</li><li>不要猛灌冰水（伤胃）</li><li>热水泡脚可缓解疲劳</li><li>有特殊情况需医院证明申请免训</li></ul><h4>加分项</h4><p>军训标兵/优秀学员可助奖学金评定，想拿奖的同学认真表现！</p>',
tags:['军训','防晒','新生'],location:'湖南工商大学北校区操场',
rating:4.8,pinned:true,sortOrder:2,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-10T08:00:00Z'},
{id:'fresh_003',title:'宿舍生存手册',category:'宿舍生活',cover:null,
excerpt:'床0.9×1.9m，空调维护费100/80/50元/年，违禁电器列表。',
content:'<h4>宿舍基本信息</h4><ul><li>床铺尺寸：0.9m × 1.9m（多数宿舍）</li><li>住宿费：一类 1200/年，二类 1000/年，三类 800/年</li><li>空调维护费：100/80/50 元/年（按类）</li><li>住宿由学生公寓管理服务中心（贤德公寓内）统一安排</li></ul><h4>违禁电器（会查！）</h4><p>电热毯、电煮锅、热得快、大功率吹风机（>1200W）等为大功率违禁品，发现严肃处理。</p><h4>推荐装备</h4><ul><li>3C认证插排</li><li>充电台灯</li><li>压缩袋（收纳被子衣物）</li></ul><h4>温馨提醒</h4><p>报到当天不要太早到校，先确认好宿舍楼号再出发。</p>',
tags:['宿舍','必看','生活'],location:'湖南工商大学北校区宿舍区',
rating:4.7,pinned:true,sortOrder:3,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-10T08:00:00Z'},
{id:'fresh_004',title:'开学防骗指南',category:'防骗指南',cover:null,
excerpt:'上门推销、校外群、身份证原件，三个雷区必须知道。',
content:'<h4>三大雷区</h4><ol><li><strong>上门推销</strong>：英语报、电话卡、培训班等，99%是坑，勿购买</li><li><strong>老乡群/兼职群</strong>：先核验群真实性，勿轻信转账</li><li><strong>身份证原件</strong>：任何情况下勿将身份证交给他人</li></ol><h4>防盗防骗</h4><ul><li>贵重物品随身带，不要放宿舍敞开放</li><li>快递地址写学校详细地址，不要写具体班级（防骚扰）</li><li>银行卡密码不要设为生日</li></ul>',
tags:['防骗','安全','新生必看'],location:'湖南工商大学北校区',
rating:4.9,pinned:true,sortOrder:4,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-10T08:00:00Z'},
{id:'fresh_005',title:'开学必备清单',category:'必备清单',cover:null,
excerpt:'随身包+大件快递分类，行李寄送地址详情。',
content:'<h4>随身包（必带）</h4><ul><li>录取通知书、准考证、身份证</li><li>证件照（一寸+二寸，红蓝白底各 8-10 张）</li><li>学籍档案（不可拆封！）</li><li>团员档案</li><li>贫困证明（如有）</li><li>现金（少量备用）</li><li>充电宝</li></ul><h4>大件快递（建议）</h4><p>寄至：<strong>湖南省长沙市望城区湖南工商大学XX校区XX栋宿舍（新生收件）</strong></p><h4>建议提前网购到校</h4><ul><li>床上用品（被子、凉席、蚊帐）</li><li>洗护用品</li><li>插排、台灯</li><li>常用药（感冒药、创可贴、藿香正气水）</li></ul>",
tags:['清单','必备','行李'],location:'湖南工商大学北校区',
rating:4.6,pinned:false,sortOrder:5,published:true,
createdAt:'2026-08-01T08:00:00Z',updatedAt:'2026-08-10T08:00:00Z'}
];

/* ===================== 默认分类和版块 ===================== */
const DEFAULT_FOOD_CATEGORIES=[
{id:'cat_food_01',name:'校内食堂',icon:'🍽',sortOrder:1,count:5},
{id:'cat_food_02',name:'周边小吃',icon:'🍡',sortOrder:2,count:10},
{id:'cat_food_03',name:'奶茶咖啡',icon:'☕',sortOrder:3,count:2},
{id:'cat_food_04',name:'聚餐餐厅',icon:'🍻',sortOrder:4,count:1}
];
const DEFAULT_TRAVEL_CATEGORIES=[
{id:'cat_travel_01',name:'城市地标',icon:'🏛',sortOrder:1,count:2},
{id:'cat_travel_02',name:'自然风光',icon:'⛰',sortOrder:2,count:1},
{id:'cat_travel_03',name:'周末路线',icon:'🗺',sortOrder:3,count:1},
{id:'cat_travel_04',name:'文化打卡',icon:'🎨',sortOrder:4,count:1}
];
const DEFAULT_STUDY_CATEGORIES=[
{id:'cat_study_01',name:'自习地点',icon:'📚',sortOrder:1,count:4},
{id:'cat_study_02',name:'选课与资源',icon:'💻',sortOrder:2,count:1}
];
const DEFAULT_FRESHMAN_CATEGORIES=[
{id:'cat_fresh_01',name:'入学报到',icon:'📋',sortOrder:1,count:1},
{id:'cat_fresh_02',name:'军训贴士',icon:'🎖',sortOrder:2,count:1},
{id:'cat_fresh_03',name:'宿舍生活',icon:'🏠',sortOrder:3,count:1},
{id:'cat_fresh_04',name:'防骗指南',icon:'🛡',sortOrder:4,count:1},
{id:'cat_fresh_05',name:'必备清单',icon:'✅',sortOrder:5,count:1}
];

const DEFAULT_SECTIONS=[
{id:'section_food',title:'美食地图',icon:'🍜',path:'/food',sortOrder:1,published:true},
{id:'section_travel',title:'周边游玩',icon:'🗺',path:'/travel',sortOrder:2,published:true},
{id:'section_study',title:'学习场所',icon:'📖',path:'/study',sortOrder:3,published:true},
{id:'section_freshman',title:'新生攻略',icon:'🎒',path:'/freshman',sortOrder:4,published:true}
];

const DEFAULT_SETTINGS={
siteName:'湖工商生活指南',
siteSubtitle:'湖南工商大学北校区生活指南',
welcome:'欢迎来到湖南工商大学！这里整理了学长学姐的实用经验，帮你顺利开启大学生活~',
recruitmentFormUrl:'https://qm.qq.com/cgi-bin/qm/qr?k=your_group_code_here',
contactEmail:'acm_hutb@qq.com',
contactPhone:'见学校官方通知',
aboutACM:'华硕校园合伙人（ACM）是华硕官方的校园平台，覆盖47城百校，用AI带你玩转大学，攒简历、交朋友！'
};

/* ===================== HUTBData API 包装 ===================== */
function HUTBData(){const that=this;const DB_NAME=STORAGE_PREFIX+'db';const DB_VERSION=1;let db=null;const _initDB=function(){return new Promise(function(resolve,reject){try{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onerror=function(){reject(new Error('indexedDB open failed'));};req.onsuccess=function(){db=req.result;resolve(db);};req.onupgradeneeded=function(e){const database=e.target.result;['food','travel','study','freshman','categories','settings','auth'].forEach(function(store){if(!database.objectStoreNames.contains(store)){database.createObjectStore(store,{keyPath:'id'});}});};}catch(err){reject(err);}});};const _tx=function(storeName,mode){if(!db)throw new Error('DB not ready');const transaction=db.transaction(storeName,mode);return {store:transaction.objectStore(storeName),tx:transaction};};const _get=function(storeName,id){return new Promise(function(resolve,reject){try{const{store}=_tx(storeName,'readonly');const req=store.get(id);req.onsuccess=function(){resolve(req.result||null);};req.onerror=function(){reject(req.error);};}catch(err){reject(err);}});};const _getAll=function(storeName){return new Promise(function(resolve,reject){try{const{store}=_tx(storeName,'readonly');const req=store.getAll();req.onsuccess=function(){resolve(req.result||[]);};req.onerror=function(){reject(req.error);};}catch(err){reject(err);}});};const _put=function(storeName,item){return new Promise(function(resolve,reject){try{const{store}=_tx(storeName,'readwrite');const req=store.put(item);req.onsuccess=function(){resolve(item);};req.onerror=function(){reject(req.error);};}catch(err){reject(err);}});};const _delete=function(storeName,id){return new Promise(function(resolve,reject){try{const{store}=_tx(storeName,'readwrite');const req=store.delete(id);req.onsuccess=function(){resolve();};req.onerror=function(){reject(req.error);};}catch(err){reject(err);}});};const _clear=function(storeName){return new Promise(function(resolve,reject){try{const{store}=_tx(storeName,'readwrite');const req=store.clear();req.onsuccess=function(){resolve();};req.onerror=function(){reject(req.error);};}catch(err){reject(err);}});};this.ensureSeed=async function(){try{await _initDB();const stored=localStorage.getItem(VERSION_KEY);if(stored===CURRENT_VERSION)return;const sets=DEFAULT_SETTINGS;await _clear('settings');await _put('settings',sets);for(const[key,data]of[['food',DEFAULT_FOOD],['travel',DEFAULT_TRAVEL],['study',DEFAULT_STUDY],['freshman',DEFAULT_FRESHMAN]]){await _clear(key);for(const item of data)await _put(key,item);}for(const[key,cats]of[['food',DEFAULT_FOOD_CATEGORIES],['travel',DEFAULT_TRAVEL_CATEGORIES],['study',DEFAULT_STUDY_CATEGORIES],['freshman',DEFAULT_FRESHMAN_CATEGORIES]]){await _clear('categories');for(const cat of cats)await _put('categories',cat);}await _clear('sections');for(const s of DEFAULT_SECTIONS)await _put('sections',s);localStorage.setItem(VERSION_KEY,CURRENT_VERSION);}catch(e){console.error('ensureSeed error',e);}};this.list=async function(section,filter){try{const items=await _getAll(section);let result=items.filter(function(i){return i.published!==false;});if(filter&&filter.category)result=result.filter(function(i){return i.category===filter.category;});if(filter&&filter.search){const q=(filter.search||'').toLowerCase();result=result.filter(function(i){return(i.title||'').toLowerCase().includes(q)||(i.excerpt||'').toLowerCase().includes(q);});}result.sort(function(a,b){const po=a.pinned?1:0,pb=b.pinned?1:0;if(po!==pb)return pb-po;return(a.sortOrder||999)-(b.sortOrder||999);});return result;}catch(e){console.error('list error',e);return[];}};this.listAll=async function(section){try{return await _getAll(section);}catch(e){return[];}};this.get=async function(section,id){try{return await _get(section,id);}catch(e){return null;}};this.save=async function(section,item){try{await _initDB();item.updatedAt=new Date().toISOString();if(!item.createdAt)item.createdAt=item.updatedAt;if(!item.id)item.id=section+'_'+Date.now();item.published=true;await _put(section,item);return item;}catch(e){console.error('save error',e);return null;}};this.remove=async function(section,id){try{await _delete(section,id);return true;}catch(e){return false;}};this.pin=async function(section,id,pin){try{const item=await _get(section,id);if(item){item.pinned=!!pin;await _put(section,item);}return true;}catch(e){return false;}};this.move=async function(section,id,direction){try{const items=await _getAll(section);const idx=items.findIndex(function(i){return i.id===id;});if(idx<0)return false;const target=items[direction==='up'?idx-1:idx+1];if(!target)return false;const a=items[idx].sortOrder||0,b=target.sortOrder||0;items[idx].sortOrder=b;target.sortOrder=a;await _put(section,items[idx]);await _put(section,target);return true;}catch(e){return false;}};this.listCategories=async function(){try{return await _getAll('categories');}catch(e){return[];}};this.saveCategory=async function(cat){try{await _initDB();if(!cat.id)cat.id='cat_'+Date.now();await _put('categories',cat);return cat;}catch(e){return null;}};this.removeCategory=async function(id){try{await _delete('categories',id);return true;}catch(e){return false;}};this.getSettings=async function(){try{const s=await _get('settings','main');return s||DEFAULT_SETTINGS;}catch(e){return DEFAULT_SETTINGS;}};this.saveSettings=async function(sets){try{await _initDB();sets.id='main';await _put('settings',sets);return sets;}catch(e){return null;}};this.getSections=async function(){try{return await _getAll('sections');}catch(e){return DEFAULT_SECTIONS;}};this.login=async function(u,p){try{const MAX_FAILS=5,LOCKOUT_MS=15*60*1000;const failKey=STORAGE_PREFIX+'failCount',lockKey=STORAGE_PREFIX+'lockUntil';const failCount=parseInt(localStorage.getItem(failKey)||'0',10);const lockUntil=parseInt(localStorage.getItem(lockKey)||'0',10);if(Date.now()<lockUntil){const remaining=Math.ceil((lockUntil-Date.now())/1000);return{ok:false,message:'登录过于频繁，请 '+remaining+' 秒后重试'};}if(u!=='admin'){localStorage.setItem(failKey,++failCount);if(failCount>=MAX_FAILS)localStorage.setItem(lockKey,Date.now()+LOCKOUT_MS);return{ok:false,message:'账号或密码错误'};}const storedPwd=localStorage.getItem(STORAGE_PREFIX+'admin_pwd')||'HUTB@2026';if(p!==storedPwd){localStorage.setItem(failKey,++failCount);if(failCount>=MAX_FAILS)localStorage.setItem(lockKey,Date.now()+LOCKOUT_MS);return{ok:false,message:'账号或密码错误'};}localStorage.removeItem(failKey);localStorage.removeItem(lockKey);await _initDB();const user={id:'admin',name:'Administrator',role:'admin',token:'hutb_admin_'+Date.now()};await _put('auth',user);return{ok:true,user:user};}catch(e){return{ok:false,message:'登录异常'};}};this.logout=async function(){try{await _clear('auth');localStorage.removeItem(STORAGE_PREFIX+'pwd');return true;}catch(e){return false;}};this.getAuth=async function(){try{const a=await _get('auth','admin');return a||null;}catch(e){return null;}};this.isLoggedIn=async function(){const auth=await this.getAuth();return!!auth;};this.submitRecruitment=async function(data){try{await _initDB();const rec={...data,id:'rec_'+Date.now(),submittedAt:new Date().toISOString()};await _put('recruitment',rec);return rec;}catch(e){return null;}};this.listRecruitment=async function(){try{return await _getAll('recruitment');}catch(e){return[];}};this.exportRecruitmentCSV=function(){return'';};this.exportAll=async function(){try{const[data,cats,sets,sects]=await Promise.all([_getAll('food'),_getAll('categories'),_getAll('settings'),_getAll('sections')]);return{food:data,categories:cats,settings:sets,sections:sects,version:CURRENT_VERSION,exportedAt:new Date().toISOString()};}catch(e){return null;}};this.importAll=async function(d){try{await _initDB();if(d.food){await _clear('food');for(const i of d.food)await _put('food',i);}if(d.categories){await _clear('categories');for(const i of d.categories)await _put('categories',i);}if(d.settings){await _clear('settings');for(const i of d.settings)await _put('settings',i);}localStorage.setItem(VERSION_KEY,CURRENT_VERSION);return true;}catch(e){return false;}};this.resetAll=async function(){try{for(const s of['food','travel','study','freshman','categories','settings','recruitment']){await _clear(s);}localStorage.removeItem(VERSION_KEY);await this.ensureSeed();return true;}catch(e){return false;}};}

/* ===================== 挂载全局 ===================== */
if(typeof global!=='undefined'){global.HUTBData=new HUTBData();}else if(typeof window!=='undefined'){window.HUTBData=new HUTBData();}else if(typeof globalThis!=='undefined'){globalThis.HUTBData=new HUTBData();}

})(typeof global!=='undefined'?global:typeof window!=='undefined'?window:globalThis);