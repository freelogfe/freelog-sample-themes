const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

test('legacy detail links preserve their target and normalize subID without overriding itemId', async () => {
  const exports = {};
  const source = fs.readFileSync(path.join(root, 'src/utils/detail-route.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
  const { canonicalDetailLocation } = exports;
  const { createRouter, createMemoryHistory } = require('vue-router');
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/detail', component: {} },
    { path: '/play-detail', redirect: to => canonicalDetailLocation(to.query, to.hash) },
  ] });
  router.beforeEach(to => {
    if (to.path === '/detail' && Object.hasOwn(to.query, 'subID')) return canonicalDetailLocation(to.query, to.hash);
  });
  await router.push('/play-detail?id=album&subID=song%26one#comments');
  assert.equal(router.currentRoute.value.path, '/detail');
  assert.equal(router.currentRoute.value.query.itemId, 'song&one');
  assert.equal(router.currentRoute.value.query.id, 'album');
  assert.equal(router.currentRoute.value.hash, '#comments');
  assert.equal(router.currentRoute.value.query.subID, undefined);
  await router.push('/detail?id=podcast&subID=old&itemId=new');
  assert.equal(router.currentRoute.value.query.itemId, 'new');
  assert.equal(router.currentRoute.value.query.subID, undefined);
  await router.push('/play-detail?id=playlist');
  assert.equal(router.currentRoute.value.fullPath, '/detail?id=playlist');
});

test('playlist navigation can revisit a detail after returning home through RouterLink', () => {
  const source = fs.readFileSync(path.join(root, 'src/router/index.ts'), 'utf8');
  const method = source.match(/router\.myPush = \(location: Record<string, string>\) => \{[\s\S]*?\n\};/)[0];
  const destination = { path: '/detail', query: { id: 'podcast', subID: 'episode' } };
  const store = { locationHistory: [JSON.stringify(destination)], setData() {} };
  const calls = [];
  const router = {
    currentRoute: { value: { fullPath: '/home' } },
    resolve: location => ({ fullPath: `${location.path}?${new URLSearchParams(location.query)}` }),
    push: location => calls.push(location),
  };
  vm.runInNewContext(ts.transpileModule(method, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, { router, useGlobalStore: () => store });
  router.myPush(destination);
  assert.equal(calls.length, 1, 'stale custom history must not block navigation');
  router.currentRoute.value.fullPath = router.resolve(destination).fullPath;
  router.myPush(destination);
  assert.equal(calls.length, 1, 'clicking the actual current route remains a no-op');
});

function loadThemeAssets(assetBase, devModuleUrl) {
  const exports = {};
  const source = fs.readFileSync(path.join(root, 'src/assets/theme.ts'), 'utf8')
    .replaceAll('import.meta.env.DEV', String(Boolean(devModuleUrl)))
    .replaceAll('import.meta.url', JSON.stringify(devModuleUrl || ''));
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, { exports, encodeURIComponent, URL,
    window: { __MICRO_APP_PUBLIC_PATH__: assetBase }, require: name => {
    const filename = path.resolve(root, 'src/assets', name.replace(/\?raw$/, ''));
    assert.ok(fs.existsSync(filename), `Missing theme asset: ${name}`);
    return { default: name.endsWith('?raw') ? fs.readFileSync(filename, 'utf8') : assetBase || devModuleUrl ? '/src/assets/' + name.replace(/^\.\//, '') : filename };
  } });
  return exports;
}

test('theme asset imports exist and icons are embedded instead of public URLs', () => {
  const { themeAssets } = loadThemeAssets();
  assert.match(themeAssets.music, /^data:image\/svg\+xml/);
  assert.match(themeAssets.defaultCover, /^data:image\/svg\+xml/);
  assert.ok(fs.existsSync(themeAssets.defaultBanner));
  assert.ok(fs.existsSync(themeAssets.record));
  const hosted = loadThemeAssets('https://192.168.0.8:8109/').themeAssets;
  assert.equal(hosted.record, 'https://192.168.0.8:8109/src/assets/design/03e3a.png');
  assert.equal(hosted.defaultBanner, 'https://192.168.0.8:8109/src/assets/images/pc-default-banner.webp');
  const devUrl = 'https://192.168.0.8:8109/src/assets/theme.ts';
  assert.equal(loadThemeAssets(undefined, devUrl).themeAssets.record, hosted.record);
  assert.equal(loadThemeAssets('https://music.devfreelog.com/', devUrl).themeAssets.record, hosted.record);
});

function loadPodcastPlayback() {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, 'src/utils/podcast-playback.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports });
  return exports;
}
test('podcast rates apply all six speeds, reject invalid values and restore music speed', () => {
  const { applyPodcastRate, podcastRates } = loadPodcastPlayback();
  const audio = { playbackRate: 1, defaultPlaybackRate: 1 };
  assert.deepEqual(Array.from(podcastRates), [2, 1.5, 1.25, 1, .75, .5]);
  for (const rate of podcastRates) {
    applyPodcastRate(audio, true, rate);
    assert.equal(audio.playbackRate, rate);
    assert.equal(audio.defaultPlaybackRate, rate);
  }
  applyPodcastRate(audio, false, 2);
  assert.equal(audio.playbackRate, 1);
  applyPodcastRate(audio, true, 3);
  assert.equal(audio.playbackRate, 1);
});
test('podcast seek clamps 15 second jumps and preserves pause state', () => {
  const { seekPodcast } = loadPodcastPlayback();
  const audio = { readyState: 1, duration: 100, currentTime: 40, paused: true };
  assert.equal(seekPodcast(audio, -15), 25);
  assert.equal(seekPodcast(audio, 15), 40);
  assert.equal(audio.paused, true);
  audio.currentTime = 5;
  assert.equal(seekPodcast(audio, -15), 0);
  audio.currentTime = 95;
  assert.equal(seekPodcast(audio, 15), 100);
  audio.readyState = 0;
  assert.equal(seekPodcast(audio, -15), undefined);
  audio.readyState = 1;
  audio.duration = Infinity;
  assert.equal(seekPodcast(audio, -15), undefined);
  assert.equal(audio.currentTime, 100);
});

function loadDetailFields() {
  const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const common = {};
  vm.runInNewContext(compile(fs.readFileSync(path.join(root, 'src/utils/common.js'), 'utf8').replaceAll('import.meta.url', '"file:///test/"')), { exports: common, Date });
  const exports = {}, api = loadApi({}, true);
  vm.runInNewContext(compile(fs.readFileSync(path.join(root, 'src/utils/shengyu-detail.ts'), 'utf8')), {
    exports, Date, require: name => name === '@/api/shengyu' ? api : common,
  });
  return exports;
}

test('podcast details preserve real metadata, omit missing durations and format episode publication dates', () => {
  const { podcastDetailFields, podcastPublishedTime } = loadDetailFields();
  const item = { articleInfo: { articleType: 2, articleOwnerName: '播客作者', resourceType: ['音频', '连载播客'] }, updateDate: '2024-07-30T09:57:00', versionInfo: { exhibitProperty: {} } };
  assert.deepEqual(JSON.parse(JSON.stringify(podcastDetailFields(item))), [['艺人', '播客作者'], ['发行时间', '2024/07/30']]);
  item.versionInfo.exhibitProperty.collection_duration = 2451000;
  assert.equal(podcastDetailFields(item).at(-1)[1], '40:51');
  item.articleInfo.articleType = 3;
  assert.equal(podcastDetailFields(item)[0][0], '创建人');
  assert.equal(podcastPublishedTime(item), '2024/07/30 09:57');
  assert.equal(podcastPublishedTime({ updateDate: 'invalid' }), '');
  assert.equal(podcastPublishedTime({}), '');
});

test('podcast catalog hides abnormal authorization but retains signed and signable entries', () => {
  const api = loadApi({}, true);
  const podcast = { articleInfo: { resourceType: ['音频', '连载播客'] } };
  for (const status of [1, 2, 3, 5, undefined]) assert.equal(api.visibleInCatalog({ ...podcast, defaulterIdentityType: status }), false);
  for (const status of [0, 4]) assert.equal(api.visibleInCatalog({ ...podcast, defaulterIdentityType: status }), true);
  assert.equal(api.visibleInCatalog({ parentResourceType: ['音频', '播单'], itemId: 'child', defaulterIdentityType: 2 }), false);
  assert.equal(api.visibleInCatalog({ articleInfo: { resourceType: ['音频', '音乐'] }, defaulterIdentityType: 2 }), true);
});

test('collection cards keep album author only, without dates or playlist creator', () => {
  const { musicCardMetadata } = loadDetailFields();
  const album = { articleInfo: { articleType: 2, articleOwnerName: '资源作者', versions: [{ createDate: '2024-08-15' }] }, createDate: '2023-01-01', versionInfo: { exhibitProperty: { display_artist: '艺人' } } };
  assert.equal(musicCardMetadata(album).author, '资源作者');
  assert.equal('date' in musicCardMetadata(album), false);
  album.articleInfo.articleType = 3;
  assert.equal(musicCardMetadata(album).author, '');
});

test('podcast cards use single-episode labels and batch collection counts from podcast-theme fields', async () => {
  const rows = [
    { exhibitId: 'single', articleInfo: { articleType: 1, resourceType: ['音频', '播客节目'] } },
    { exhibitId: 'series', articleInfo: { articleType: 2, resourceType: ['音频', '连载播客'] } },
    { exhibitId: 'podlist', articleInfo: { articleType: 3, resourceType: ['音频', '播单'] } },
    { exhibitId: 'known', totalItem: 9, articleInfo: { articleType: 2, resourceType: ['音频', '连载播客'] } },
  ];
  const calls = [];
  const runtime = {
    getExhibitListByPage: async () => ({ data: { data: { dataList: structuredClone(rows), totalItem: rows.length } } }),
    getExhibitAuthStatus: async () => ({ data: { data: rows.map(item => ({ exhibitId: item.exhibitId, defaulterIdentityType: 0 })) } }),
    getCollectionsSubListByPage: async (ids, options) => {
      calls.push([ids, options]);
      return { data: { errCode: 0, data: [{ exhibitId: 'podlist', totalItem: 0 }, { exhibitId: 'series', totalItem: 145 }] } };
    },
  };
  const api = loadApi(runtime);
  const page = await api.listEntries(api.resourceTypes.podcasts);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'series,podlist');
  assert.equal(page.dataList.map(api.podcastSubtitle).join(','), '单集,145集,0集,9集');
  runtime.getCollectionsSubListByPage = async () => ({ data: { errCode: 0, data: { dataList: [{ exhibitId: 'series', totalItem: 21 }] } } });
  const paginated = await api.listEntries(api.resourceTypes.podcasts);
  assert.equal(api.podcastSubtitle(paginated.dataList[1]), '21集');
  runtime.getCollectionsSubListByPage = async () => { throw new Error('counts unavailable'); };
  const fallback = await api.listEntries(api.resourceTypes.podcasts);
  assert.equal(fallback.dataList.length, 4);
  assert.equal(api.podcastSubtitle(fallback.dataList[1]), '合集');
});

test('collection pages exclude mislabeled resources and abnormal authorization without losing pagination position', async () => {
  const rows = [
    { exhibitId: 'song-tagged-album', articleInfo: { articleType: 1, resourceType: ['音乐专辑'] } },
    { exhibitId: 'album', articleInfo: { articleType: 2, resourceType: ['音乐专辑'] } },
    { exhibitId: 'playlist', articleInfo: { articleType: 3, resourceType: ['歌单'] } },
    { exhibitId: 'abnormal', articleInfo: { articleType: 2, resourceType: ['音乐专辑'] } },
  ];
  const api = loadApi({
    getExhibitListByPage: async ({ skip, limit }) => ({ data: { data: { dataList: rows.slice(skip, skip + limit), totalItem: rows.length } } }),
    getExhibitAuthStatus: async ids => ({ data: { data: ids.split(',').map(exhibitId => ({ exhibitId, defaulterIdentityType: exhibitId === 'abnormal' ? 1 : 4 })) } }),
  });
  const empty = await api.listCollectionsPage('albums', 0, 1);
  assert.equal(empty.dataList.length, 0);
  assert.equal(empty.nextSkip, 1);
  assert.equal(empty.exhausted, false);
  const next = await api.listCollectionsPage('albums', empty.nextSkip, 3);
  assert.equal(next.dataList.map(item => item.exhibitId).join(','), 'album');
  assert.equal(next.nextSkip, 4);
  assert.equal(next.exhausted, true);
  const playlists = await api.listCollectionsPage('playlists', 0, 4);
  assert.equal(playlists.dataList.map(item => item.exhibitId).join(','), 'playlist');
  assert.equal(api.entryCategory(rows[0]), 'songs');
  assert.equal(api.searchCardMode(rows[0]), '');
});

test('album detail only shows music-theme album fields and uses collection duration', () => {
  const { musicDetailFields } = loadDetailFields();
  const item = { articleInfo: { articleType: 2, resourceType: ['音频', '音乐专辑'], versions: [{ createDate: '2024-08-15' }] }, versionInfo: { exhibitProperty: {
    display_artist: '飞轮海', label_name: 'freelog', lyric_language: '国语', music_genre: '2025-03-10 14:49:19', duration: 120000,
  } } };
  let fields = musicDetailFields(item);
  assert.equal(fields.map(([label]) => label).join(','), '艺人,发行时间');
  assert.equal(Object.fromEntries(fields)['发行时间'], '2024/08/15');
  item.versionInfo.exhibitProperty.collection_duration = 2451000;
  fields = musicDetailFields(item);
  assert.equal(Object.fromEntries(fields)['总时长'], '40:51');
});

test('playlist detail uses the node creator and omits album and song-only fields', () => {
  const { musicDetailFields } = loadDetailFields();
  const item = { articleInfo: { articleType: 3, resourceType: ['音频', '歌单'], articleOwnerName: '资源作者' }, versionInfo: { exhibitProperty: {
    display_artist: '艺人', release_date: '2024-08-15', label_name: '厂牌', collection_duration: 60000,
  } } };
  const fields = musicDetailFields(item, '节点创建人');
  assert.equal(fields.map(([label]) => label).join(','), '创建人,总时长');
  assert.equal(Object.fromEntries(fields)['创建人'], '节点创建人');
  assert.equal(Object.fromEntries(fields)['总时长'], '01:00');
});

test('song detail preserves music-theme field order, child release date fallback and intro precedence', () => {
  const { musicDetailFields, musicDetailIntro } = loadDetailFields();
  const item = { itemId: 'song', parentArticleType: 3, exhibitIntro: '展品简介', articleInfo: { articleType: 1, resourceType: ['音频', '音乐'], intro: '资源简介', firstVersionReleaseDate: '2024-08-15', articleProperty: {
    display_artist: '艺人', duration: 244000, label_name: '厂牌', lyric_language: '国语', music_genre: '流行', song_lyricist: '作词', song_composer: '作曲', song_arranger: '编曲',
  } } };
  const fields = musicDetailFields(item);
  assert.equal(fields.map(([label]) => label).join(','), '资源类型,艺人,时长,发行时间,厂牌,语种,风格');
  assert.equal(Object.fromEntries(fields)['时长'], '04:04');
  assert.equal(Object.fromEntries(fields)['发行时间'], '2024/08/15');
  assert.equal(musicDetailIntro(item), '资源简介');
  assert.equal(musicDetailIntro({ exhibitIntro: '展品简介' }), '展品简介');
  const standalone = musicDetailFields({ articleInfo: { articleType: 1, resourceType: ['音频','音乐'], articleOwnerName: '作者', versions: [{ createDate: '2024-08-15' }] }, versionInfo: { exhibitProperty: { artist: '备用艺人' } } });
  assert.equal(standalone.map(([label]) => label).join(','), '资源类型');
});

function loadLibrary(request, overrides = {}) {
  const source = fs.readFileSync(path.join(root, 'src/views/shengyu/index.vue'), 'utf8')
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1];
  const code = ts.transpileModule(source + '\nexport { load, selectCatalog, play, items, error, hasMore, retryReset, showLibrarySkeleton, showSongList, displayed, filter, categoryCounts };', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const exports = {}, callbacks = {}, observers = [];
  const scrollRoot = { scrollTop: 0, scrollTo: ({ top }) => { scrollRoot.scrollTop = top; } };
  vm.runInNewContext(code, {
    exports, clearTimeout, setTimeout, document: { getElementById: () => scrollRoot },
    IntersectionObserver: class {
      constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
      observe(element) { this.element = element; }
      disconnect() { this.disconnected = true; }
    },
    require: name => name === 'vue' ? {
      ref: value => ({ value }), computed: getter => ({ get value() { return getter(); } }),
      watch: (source, callback) => { if (typeof source !== 'function') { callbacks.watch = callback; callbacks.trigger = source; } },
      nextTick: () => Promise.resolve(),
      onActivated: callback => { callbacks.activate = callback; },
      onDeactivated: callback => { callbacks.deactivate = callback; },
      onMounted: callback => { callbacks.mount = callback; },
      onBeforeUnmount: callback => { callbacks.unmount = callback; }
    } : name === 'vue-router' ? { useRoute: () => ({ path: overrides.path || '/voice-list', query: {} }), useRouter: () => ({}), onBeforeRouteLeave: callback => { callbacks.leave = callback; } }
      : name === '@/store/global' ? { useGlobalStore: () => overrides.store || {} }
      : name === '@/api/shengyu' ? { visibleInCatalog: loadApi({}, true).visibleInCatalog, resourceTypes: { songs: '音频' }, listEntries: request, listSongsPage: (offset, limit, sort) => request('音频', offset, limit, sort), ...overrides.api }
      : name === '@/utils/hooks' ? overrides.hooks || {}
      : {}
  });
  return { ...exports, callbacks, observers, scrollRoot };
}

test('cached catalogs refresh on return and repeated tab clicks without hiding existing results', async () => {
  let calls = 0, finish;
  const request = () => { calls++; return new Promise(resolve => { finish = resolve; }); };
  const library = loadLibrary(request, { path: '/album-list', api: { listCollectionsPage: request } });
  const initial = library.load();
  await library.callbacks.activate();
  assert.equal(calls, 1, 'initial activation must not duplicate the mount request');
  finish({ dataList: [{ exhibitId: 'old' }], totalItem: 1 });
  await initial;
  library.scrollRoot.scrollTop = 200;
  library.callbacks.leave();
  library.callbacks.deactivate();
  await library.callbacks.activate();
  assert.equal(calls, 2);
  assert.equal(library.showLibrarySkeleton.value, false);
  assert.equal(library.items.value[0].exhibitId, 'old');
  assert.equal(library.scrollRoot.scrollTop, 200);
  finish({ dataList: [{ exhibitId: 'new' }, { exhibitId: 'old' }], totalItem: 2 });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(library.items.value[0].exhibitId, 'new');
  library.selectCatalog('/album-list');
  assert.equal(calls, 3);
  finish({ dataList: [{ exhibitId: 'newest' }], totalItem: 1 });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(library.items.value[0].exhibitId, 'newest');
});

test('music tabs show skeletons for initial and sort loads but retain rows during pagination and errors', async () => {
  for (const page of ['/voice-list', '/album-list', '/play-list', '/podcast-list']) {
    let resolve, reject;
    const request = () => new Promise((yes, no) => { resolve = yes; reject = no; });
    const library = loadLibrary(request, { path: page, api: { listCollectionsPage: request } });
    const initial = library.load();
    assert.equal(library.showLibrarySkeleton.value, true, page);
    resolve({ dataList: [{ exhibitId: 'first' }], totalItem: 3 });
    await initial;
    assert.equal(library.showLibrarySkeleton.value, false);
    const more = library.load(false);
    assert.equal(library.showLibrarySkeleton.value, false);
    assert.equal(library.items.value.length, 1);
    resolve({ dataList: [{ exhibitId: 'second' }], totalItem: 3 });
    await more;
    const sorted = library.load(true);
    assert.equal(library.showLibrarySkeleton.value, true);
    reject(new Error('retryable request failure'));
    await sorted;
    assert.equal(library.showLibrarySkeleton.value, false);
    assert.equal(library.items.value.length, 2);
    assert.ok(library.error.value);
  }
});

test('favorite songs use the music list while other categories and empty favorites retain their layouts', () => {
  const store = { collectionList: ['songs', 'albums', 'playlists', 'podcasts'].map(category => ({ exhibitId: category, category })) };
  const library = loadLibrary(() => {}, { path: '/collection-list', store, api: { entryCategory: item => item.category } });
  assert.equal(library.showSongList.value, true);
  assert.equal(library.displayed.value.length, 1);
  assert.equal(library.displayed.value[0].exhibitId, 'songs');
  for (const category of ['albums', 'playlists', 'podcasts']) {
    library.filter.value = category;
    assert.equal(library.showSongList.value, false);
    assert.equal(library.displayed.value[0].exhibitId, category);
  }
  library.filter.value = 'songs';
  store.collectionList = store.collectionList.filter(item => item.category !== 'songs');
  assert.equal(library.showSongList.value, false);
  assert.equal(library.displayed.value.length, 0);
  assert.equal(library.categoryCounts.value.songs, 0);
  const search = loadLibrary(() => {}, { path: '/search-list' });
  assert.equal(search.showSongList.value, false);
});

test('signed records load the account records instead of the public music catalog', async () => {
  const store = { userData: { isLogin: true }, signedList: [] };
  let requests = 0;
  const library = loadLibrary(() => { throw new Error('must not request catalog'); }, {
    path: '/signed-list', store,
    hooks: { useMyAuth: { async getSignedList() { requests++; store.signedList = [{ exhibitId: 'signed-album' }]; } } },
  });
  await library.load();
  assert.equal(requests, 1);
  assert.equal(library.items.value[0].exhibitId, 'signed-album');
  assert.equal(library.hasMore.value, false);
  store.userData.isLogin = false;
  await library.load();
  assert.equal(requests, 1);
  assert.equal(library.items.value.length, 0);
});

test('header account delegates login and logout, and opens the matching registration environment', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/shengyu-account.vue'), 'utf8').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1];
  const code = ts.transpileModule(source + '\nexport { login, register, logout, open };', { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const calls = [], exports = {}, api = { demoMode: false };
  const fakeWindow = { HOST_END: '.cn', open: (...args) => calls.push(args) };
  vm.runInNewContext(code, { exports, URL, window: fakeWindow, require: name =>
    name === 'vue' ? { ref: value => ({ value }), computed: fn => ({ get value() { return fn(); } }), watch() {}, onMounted() {}, onBeforeUnmount() {} }
      : name === 'vue-router' ? { useRoute: () => ({ fullPath: '/home' }) }
      : name === '@/store/global' ? { useGlobalStore: () => ({ userData: {} }) }
      : name === '@/api/shengyu' ? api
      : name === 'freelog-runtime' ? { freelogApp: { callLogin: () => calls.push('login'), callLoginOut: () => calls.push('logout'), getCurrentUrl: () => `https://demo.freelog${fakeWindow.HOST_END}/home` } }
      : { default: 'default-avatar.png' }
  });
  exports.login();
  exports.open.value = true;
  exports.logout();
  assert.equal(exports.open.value, false);
  assert.deepEqual(calls, ['login', 'logout']);
  exports.register();
  assert.deepEqual(calls.at(-1), ['https://user.freelog.cn/logon', '_blank', 'noopener,noreferrer']);
  fakeWindow.HOST_END = '.com';
  exports.register();
  assert.equal(calls.at(-1)[0], 'https://user.freelog.com/logon');
  api.demoMode = true;
  const count = calls.length;
  exports.login(); exports.logout(); exports.register();
  assert.equal(calls.length, count);
});

test('detail primary action starts or resumes without pausing; compact collection playback still toggles', async () => {
  const api = loadApi({}, false);
  const item = { exhibitId: 'album', articleInfo: { articleType: 2 }, defaulterIdentityType: 0 };
  const store = { playing: true, playingInfo: { exhibitId: 'album', itemId: 'track' }, setData({ key, value }) { this[key] = value; } };
  const library = loadLibrary(undefined, { api, store });
  await library.play(item, true);
  assert.equal(store.playing, true);
  store.playing = false;
  await library.play(item, true);
  assert.equal(store.playing, true);
  await library.play(item);
  assert.equal(store.playing, false);
  const song = { ...store.playingInfo, defaulterIdentityType: 0, articleInfo: { articleType: 1 }, versionInfo: { exhibitProperty: { mime: 'audio/mpeg' } } };
  await library.play(song, true);
  assert.equal(store.playing, true);
  await library.play(song, true);
  assert.equal(store.playing, true);
  // Detail data may not contain the stream URL already held by the player.
  await library.play(song);
  assert.equal(store.playing, false);
  await library.play(song);
  assert.equal(store.playing, true);
});

test('music navigation remembers the last category across unrelated routes and direct entry', () => {
  const source = fs.readFileSync(path.join(root, 'src/App.vue'), 'utf8').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1];
  const code = ts.transpileModule(source + '\nexport { musicPath, isActive };', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  for (const initial of ['/home', '/album-list', '/play-list']) {
    const exports = {}, route = { path: initial };
    let onRoute;
    vm.runInNewContext(code, { exports, require: name => name === 'vue' ? {
      ref: value => ({ value }), computed: getter => ({ get value() { return getter(); } }),
      watch: (source, callback, options) => { onRoute = callback; if (options.immediate) callback(source()); },
      onMounted() {}, onBeforeUnmount() {},
    } : name === 'vue-router' ? { useRoute: () => route }
      : name === '@/store/global' ? { useGlobalStore: () => ({ nodeInfo: {} }) } : {} });
    assert.equal(exports.musicPath.value, initial === '/home' ? '/voice-list' : initial);
    for (const category of ['/play-list', '/album-list', '/voice-list']) {
      route.path = category; onRoute(category);
      assert.equal(exports.isActive('/voice-list'), true);
      for (const destination of ['/detail', '/home', '/podcast-list', '/collection-list']) {
        route.path = destination; onRoute(destination);
        assert.equal(exports.musicPath.value, category);
        assert.equal(exports.isActive('/voice-list'), false);
      }
    }
  }
});

test('cached music categories retain data and scroll position while pagination pauses off-screen', async () => {
  for (const page of ['/voice-list', '/album-list', '/play-list']) {
  let requests = 0;
  const request = async () => {
    requests++;
    return { dataList: [{ exhibitId: 'retained-song' }], totalItem: 20 };
  };
  const library = loadLibrary(request, { path: page, api: { listCollectionsPage: request } });
  await library.callbacks.mount();
  const retained = library.items.value;
  library.callbacks.trigger.value = {};
  library.callbacks.watch(library.callbacks.trigger.value);
  const observer = library.observers[0];
  library.scrollRoot.scrollTop = 720;
  library.callbacks.leave();
  library.callbacks.deactivate();
  observer.callback([{ isIntersecting: true }]);
  assert.equal(requests, 1);
  assert.equal(observer.disconnected, true);
  library.scrollRoot.scrollTop = 0;
  await library.callbacks.activate();
  assert.equal(library.scrollRoot.scrollTop, 720);
  assert.equal(library.items.value, retained);
  assert.equal(requests, 1);
  assert.equal(library.observers.length, 2);
  library.callbacks.unmount();
  }
});

test('automatic pagination prevents concurrent loads, preserves rows on failure and retries the same offset', async () => {
  const calls = [];
  let rejectPage;
  const library = loadLibrary((_types, offset) => {
    calls.push(offset);
    if (calls.length === 1) return Promise.resolve({ dataList: Array.from({ length: 40 }, (_, id) => ({ exhibitId: String(id) })), totalItem: 80 });
    if (calls.length === 2) return new Promise((_resolve, reject) => { rejectPage = reject; });
    return Promise.resolve({ dataList: Array.from({ length: 40 }, (_, id) => ({ exhibitId: String(id + 40) })), totalItem: 80 });
  });
  await library.callbacks.mount();
  library.callbacks.watch({});
  const observer = library.observers[0];
  observer.callback([{ isIntersecting: false }]);
  assert.deepEqual(calls, [0]);
  observer.callback([{ isIntersecting: true }]);
  observer.callback([{ isIntersecting: true }]);
  assert.deepEqual(calls, [0, 40]);
  rejectPage(new Error('offline'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(library.items.value.length, 40);
  assert.ok(library.error.value);
  assert.equal(library.retryReset.value, false);
  observer.callback([{ isIntersecting: true }]);
  assert.equal(calls.length, 2);
  await library.load(library.retryReset.value);
  assert.deepEqual(calls, [0, 40, 40]);
  assert.equal(library.items.value.length, 80);
  assert.equal(library.hasMore.value, false);
  observer.callback([{ isIntersecting: true }]);
  assert.equal(calls.length, 3);
  library.callbacks.unmount();
  assert.equal(observer.disconnected, true);
});

test('an empty page stops automatic pagination even when the server total is stale; reset enables loading again', async () => {
  const calls = [];
  const library = loadLibrary((_types, offset) => {
    calls.push(offset);
    return Promise.resolve({ dataList: offset ? [] : [{ exhibitId: 'first' }], totalItem: 80 });
  });
  await library.load();
  await library.load(false);
  assert.equal(library.items.value.length, 1);
  assert.equal(library.hasMore.value, false);
  await library.load();
  assert.equal(library.hasMore.value, true);
  assert.deepEqual(calls, [0, 1, 0]);
  library.callbacks.watch({});
  library.callbacks.watch(null);
  assert.equal(library.observers[0].disconnected, true);
  library.callbacks.unmount();
  library.observers[0].callback([{ isIntersecting: true }]);
  assert.equal(calls.length, 3);
});

function loadTheme(embedded) {
  const source = fs.readFileSync(path.join(root, 'src/utils/theme-manager.ts'), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const exports = {}, appRoot = { dataset: {} }, hostRoot = { dataset: { theme: 'dark' } };
  const saved = new Map();
  vm.runInNewContext(code, {
    exports,
    require: () => ({ ref: value => ({ value }) }),
    window: { __MICRO_APP_ENVIRONMENT__: embedded, matchMedia: () => ({ matches: false }) },
    document: { documentElement: hostRoot, getElementById: id => id === 'app' ? appRoot : null },
    localStorage: { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) }
  });
  return { api: exports, appRoot, hostRoot, saved };
}

test('embedded theme changes the child CSS scope without changing the host theme', () => {
  const { api, appRoot, hostRoot, saved } = loadTheme(true);
  api.toggleTheme('light');
  assert.equal(api.currentTheme.value, 'light');
  assert.equal(appRoot.dataset.theme, 'light');
  assert.equal(hostRoot.dataset.theme, 'dark');
  assert.equal(saved.get('shengyu-theme'), 'light');
  api.applyTheme('dark');
  api.initTheme();
  assert.equal(appRoot.dataset.theme, 'light');
  api.toggleTheme('dark');
  assert.equal(appRoot.dataset.theme, 'dark');
});

test('standalone theme updates both document and application roots', () => {
  const { api, appRoot, hostRoot } = loadTheme(false);
  api.toggleTheme('light');
  assert.equal(appRoot.dataset.theme, 'light');
  assert.equal(hostRoot.dataset.theme, 'light');
});

function loadPlayer(preview = false) {
  const source = fs.readFileSync(path.join(root, 'src/components/player.mixin.js'), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const exports = {}, calls = [];
  vm.runInNewContext(code, {
    exports,
    require: name => name === '@/api/shengyu' ? { demoMode: preview }
      : name === '@/utils/hooks' ? {
        useMyPlay: {
          playOrPause: track => calls.push(['play', track]),
          preVoice: () => calls.push(['previous']),
          nextVoice: () => calls.push(['next'])
        },
        useMyCollection: { operateCollect: track => calls.push(['collect', track]) }
      } : {}
  });
  return { methods: exports.default.methods, calls };
}

test('empty player controls are safe before a track or queue is selected', async () => {
  const { methods, calls } = loadPlayer();
  for (const playList of [null, []]) {
    const state = { playingInfo: null, playList };
    methods.playOrPause.call(state);
    methods.preVoice.call(state);
    methods.nextVoice.call(state);
    await methods.operateCollect.call(state);
  }
  assert.deepEqual(calls, []);
});

test('real player delegates playback and preview controls never request audio', () => {
  const first = { exhibitId: 'first' }, current = { exhibitId: 'current' };
  const live = loadPlayer();
  live.methods.playOrPause.call({ playingInfo: null, playList: [first] });
  live.methods.playOrPause.call({ playingInfo: current, playList: [first] });
  assert.deepEqual(live.calls, [['play', first], ['play', current]]);
  const preview = loadPlayer(true);
  const state = { playingInfo: current, playList: [first, current] };
  preview.methods.playOrPause.call(state);
  preview.methods.preVoice.call(state);
  preview.methods.nextVoice.call(state);
  assert.deepEqual(preview.calls, []);
});

function loadApi(runtime, preview = false) {
  const source = fs.readFileSync(path.join(root, 'src/api/shengyu.ts'), 'utf8')
    .replaceAll('import.meta.env.BASE_URL', '"/"');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, URLSearchParams, location: { search: preview ? '?preview=1' : '' },
    require: name => name === 'freelog-runtime' ? { freelogApp: runtime }
      : JSON.parse(fs.readFileSync(path.join(root, 'src/api', name), 'utf8'))
  });
  return exports;
}

test('preview query no longer enables fixture content', async () => {
  let calls = 0;
  const api = loadApi({
    getExhibitListByPage: async () => {
      calls++;
      return { data: { data: { dataList: [], totalItem: 0 } } };
    },
  }, true);
  assert.equal(api.demoMode, false);
  const page = await api.listEntries(api.resourceTypes.songs);
  assert.equal(calls, 1);
  assert.equal(page.dataList.length, 0);
});

test('detail access notices distinguish offline, abnormal and signable entries', () => {
  const { detailAccessMessage } = loadApi({});
  for (const defaulterIdentityType of [0, 4, undefined]) {
    assert.equal(detailAccessMessage({ onlineStatus: 1, defaulterIdentityType }), '');
  }
  assert.equal(detailAccessMessage({ onlineStatus: 1, defaulterIdentityType: 1 }), '作品异常，无法访问');
  assert.equal(detailAccessMessage({ onlineStatus: 0, defaulterIdentityType: 1 }), '作品已下架，无法访问');
  assert.equal(detailAccessMessage({ articleInfo: { status: 2 } }), '此作品因违规无法访问');
});

test('collection pagination preserves parent, item identity and per-item authorization', async () => {
  const skips = [];
  const api = loadApi({
    getCollectionSubListByPage: async (id, options) => {
      skips.push(options.skip);
      assert.equal(id, 'album');
      return { data: { data: { totalItem: 2, dataList: [{ itemId: `track-${options.skip}`, itemTitle: 'Track', articleInfo: { articleProperty: { duration: 123 } } }] } } };
    },
    getCollectionSubAuthStatus: async (_id, { itemIds }) => ({ data: { data: [{ itemId: itemIds, defaulterIdentityType: itemIds === 'track-0' ? 0 : 4 }] } })
  });
  const tracks = await api.collectionEntries({ exhibitId: 'album', exhibitTitle: 'Album', coverImages: ['cover.png'], articleInfo: { articleType: 2 } });
  assert.deepEqual(skips, [0, 1]);
  assert.equal(tracks.length, 2);
  assert.equal(tracks[1].exhibitId, 'album');
  assert.equal(tracks[1].defaulterIdentityType, 4);
  assert.equal(tracks[1].coverImages[0], 'cover.png');
  assert.notEqual(api.entryKey(tracks[0]), api.entryKey(tracks[1]));
  assert.equal(api.isCollection(tracks[0]), false);
});

test('empty collection pages terminate even if upstream total is stale', async () => {
  let calls = 0;
  const api = loadApi({getCollectionSubListByPage: async () => {
    calls++; return {data:{data:{totalItem:20,dataList:[]}}};
  }});
  assert.equal((await api.collectionEntries({exhibitId:'empty'})).length, 0);
  assert.equal(calls, 1);
});

test('missing authorization is never silently treated as authorized', async () => {
  const api = loadApi({
    getExhibitListByPage: async () => ({data:{data:{totalItem:1,dataList:[{exhibitId:'unverified'}]}}}),
    getExhibitAuthStatus: async () => ({data:{data:[]}})
  });
  const result = await api.listEntries('音乐');
  assert.equal(result.dataList[0].defaulterIdentityType, undefined);
});

test('homepage recommendations sort singles and album songs before taking twelve', async () => {
  const singles = ['宝可梦', 'happy', 'Midnight Serenity', 'music2', 'music1'].map((exhibitTitle, i) => ({
    exhibitId: `single-${i}`, exhibitTitle, updateDate: `2026-11-${24-i}`, articleInfo: { articleType: 1 },
    versionInfo: { exhibitProperty: { mime: 'audio/mpeg' } },
  }));
  const tracks = Array.from({ length: 9 }, (_, i) => ({
    itemId: `track-${i}`, itemTitle: `歌曲${i}`, updateDate: '2026-12-01',
    articleInfo: { articleType: 1, latestVersionReleaseDate: `2026-10-${10+i}`, articleProperty: { mime: 'audio/mpeg' } },
  }));
  const api = loadApi({
    getExhibitListByPage: async options => {
      assert.equal(options.limit, 20);
      assert.equal(Object.hasOwn(options, 'sort'), false);
      return { data: { data: { totalItem: 6, dataList: [singles[0], { exhibitId: 'album', articleInfo: { articleType: 2 } }, ...singles.slice(1)] } } };
    },
    getExhibitAuthStatus: async ids => ({ data: { data: ids.split(',').map(exhibitId => ({ exhibitId, defaulterIdentityType: exhibitId === 'single-2' ? 4 : 0 })) } }),
    getCollectionSubListByPage: async (_id, options) => {
      assert.equal(options.limit, 1000);
      return { data: { data: { totalItem: tracks.length, dataList: tracks } } };
    },
    getCollectionSubAuthStatus: async () => ({ data: { data: tracks.map(track => ({ itemId: track.itemId, defaulterIdentityType: 0 })) } }),
  });
  const result = await api.recommendedSongs();
  assert.equal(result.map(item => item.exhibitTitle).join(','), '宝可梦,happy,Midnight Serenity,music2,music1,歌曲8,歌曲7,歌曲6,歌曲5,歌曲4,歌曲3,歌曲2');
  assert.equal(result[2].defaulterIdentityType, 4);
});

test('recommendations exclude unavailable songs before limiting but retain signable songs', async () => {
  const entries = [
    { exhibitId: 'unsupported', versionInfo: { exhibitProperty: { mime: 'text/plain' } } },
    { exhibitId: 'abnormal' },
    { exhibitId: 'frozen', articleInfo: { articleType: 1, status: 2 } },
    { exhibitId: 'offline', onlineStatus: 0 },
    { exhibitId: 'locked' },
    ...Array.from({ length: 12 }, (_, i) => ({ exhibitId: `song-${i}` })),
  ].map(item => ({ articleInfo: { articleType: 1 }, updateDate: '2026-11-24', versionInfo: { exhibitProperty: { mime: 'audio/mpeg' } }, ...item }));
  const api = loadApi({
    getExhibitListByPage: async () => ({ data: { data: { totalItem: entries.length, dataList: entries } } }),
    getExhibitAuthStatus: async () => ({ data: { data: entries.map(item => ({ exhibitId: item.exhibitId, defaulterIdentityType: item.exhibitId === 'abnormal' ? 1 : item.exhibitId === 'locked' ? 4 : 0 })) } }),
  });
  const result = await api.recommendedSongs();
  assert.equal(result.length, 12);
  assert.equal(result[0].exhibitId, 'locked');
  assert.equal(result.some(item => ['unsupported', 'abnormal', 'frozen', 'offline'].includes(item.exhibitId)), false);
  assert.equal(result[11].exhibitId, 'song-10');
});

test('song pages expand albums, exclude playlists and retain the upstream pagination cursor', async () => {
  const skips = [], expanded = [];
  const api = loadApi({
    getExhibitListByPage: async options => {
      skips.push(options.skip);
      assert.equal(options.articleResourceTypes, '音乐,音乐专辑');
      const dataList = options.skip === 0 ? [
        { exhibitId: 'album', articleInfo: { articleType: 2, resourceType: ['音乐专辑'] } },
        { exhibitId: 'playlist', articleInfo: { articleType: 3, resourceType: ['音乐'] } },
      ] : [{ exhibitId: 'single', articleInfo: { articleType: 1, resourceType: ['音乐'] } }];
      return { data: { data: { totalItem: 3, dataList } } };
    },
    getExhibitAuthStatus: async ids => ({ data: { data: ids.split(',').map(exhibitId => ({ exhibitId, defaulterIdentityType: 4 })) } }),
    getCollectionSubListByPage: async id => {
      expanded.push(id);
      return { data: { data: { totalItem: 3, dataList: ['a','b','c'].map(itemId => ({ itemId, itemTitle: itemId, articleInfo: { articleType: 1 } })) } } };
    },
    getCollectionSubAuthStatus: async () => ({ data: { data: [{ itemId: 'a', defaulterIdentityType: 0 }, { itemId: 'b', defaulterIdentityType: 4 }, { itemId: 'c', defaulterIdentityType: 1 }] } }),
  });
  const first = await api.listSongsPage(0, 2);
  assert.deepEqual(expanded, ['album']);
  assert.equal(first.dataList.map(item => item.itemId).join(','), 'a,b');
  assert.equal(first.nextSkip, 2);
  assert.equal(first.exhausted, false);
  const second = await api.listSongsPage(first.nextSkip, 2);
  assert.deepEqual(skips, [0, 2]);
  assert.equal(second.dataList[0].exhibitId, 'single');
  assert.equal(second.dataList[0].defaulterIdentityType, 4);
  assert.equal(second.exhausted, true);
  assert.equal(api.unplayable(second.dataList[0]), true);
  assert.equal(api.unplayable({ ...second.dataList[0], versionInfo: { exhibitProperty: { mime: 'audio/mpeg' } } }), false);
  assert.equal(api.unplayable({}), true);
  assert.equal(api.unplayable({ defaulterIdentityType: 0, onlineStatus: 0 }), true);
});

test('filtered song pages still advance the cursor and do not stop before later songs', async () => {
  const library = loadLibrary((_types, offset) => Promise.resolve(offset === 0
    ? { dataList: [], totalItem: 3, nextSkip: 2, exhausted: false }
    : { dataList: [{ exhibitId: 'song' }], totalItem: 3, nextSkip: 3, exhausted: true }));
  await library.load();
  assert.equal(library.hasMore.value, true);
  await library.load(false);
  assert.equal(library.items.value.length, 1);
  assert.equal(library.hasMore.value, false);
});

test('authorization refresh reads child states individually instead of unlocking an entire album', async () => {
  const api = loadApi({
    getExhibitAuthStatus: async () => ({ data: { data: [{ exhibitId: 'album', defaulterIdentityType: 0 }] } }),
    getCollectionSubAuthStatus: async () => ({ data: { data: [{ itemId: 'a', defaulterIdentityType: 0 }, { itemId: 'b', defaulterIdentityType: 4 }] } }),
  });
  const entries = [{ exhibitId: 'album', defaulterIdentityType: 4 }, ...['a', 'b', 'missing'].map(itemId => ({ exhibitId: 'album', itemId, defaulterIdentityType: 4 }))];
  await api.refreshEntryAuth(entries, ['album']);
  assert.deepEqual(entries.map(item => item.defaulterIdentityType), [0, 0, 4, undefined]);
});

test('audio format validation matches music-theme and does not treat a lock as an unsupported format', () => {
  const api = loadApi({}, true);
  for (const mime of ['audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/flac']) {
    const item = { defaulterIdentityType: 4, articleInfo: { articleType: 1, articleProperty: { mime } } };
    assert.equal(api.supportsAudio(item), true);
    assert.equal(api.unplayable(item), false);
  }
  for (const mime of [undefined, '', 'image/png', 'video/mp4']) {
    const item = { defaulterIdentityType: 0, versionInfo: { exhibitProperty: { mime } } };
    assert.equal(api.supportsAudio(item), false);
    assert.equal(api.unplayable(item), true);
  }
  assert.equal(api.supportsAudio({ articleInfo: { articleType: 2 } }), true);
  assert.equal(api.supportsAudio({ itemId: 'child', articleInfo: { articleType: 2 } }), false);
  assert.equal(api.artist({ articleInfo: { articleOwnerName: 'luojiutian' } }), 'luojiutian');
});

test('release sorting uses update dates across album tracks without mutating loaded pages', () => {
  const api = loadApi({}, true);
  const items = [
    { exhibitId: 'recent-update', createDate: '2020-01-01', updateDate: '2026-05-01' },
    { exhibitId: 'early-update', createDate: '2026-01-01', updateDate: '2025-01-01' },
    { exhibitId: 'album', itemId: 'track', articleInfo: { latestVersionReleaseDate: '2026-03-01' } },
  ];
  assert.equal(api.sortByRelease(items, 'updateDate:1').map(item => item.exhibitId).join(','), 'early-update,album,recent-update');
  assert.equal(api.sortByRelease(items, 'updateDate:-1').map(item => item.exhibitId).join(','), 'recent-update,album,early-update');
  assert.equal(items[0].exhibitId, 'recent-update');
});

test('unsupported audio shows a disabled cannot-play icon while collection and share actions remain usable', async () => {
  const vue = require('vue');
  const { parse, compileScript } = require('@vue/compiler-sfc');
  const { renderToString } = require('vue/server-renderer');
  const filename = path.join(root, 'src/components/shengyu-detail-actions.vue');
  const { descriptor } = parse(fs.readFileSync(filename, 'utf8'), { filename });
  const script = compileScript(descriptor, { id: 'unsupported-actions-test', inlineTemplate: true });
  const code = ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {}, api = loadApi({}, true);
  let queued = false;
  const store = { playing: false, playingInfo: null };
  vm.runInNewContext(code, { exports, require: name => name === 'vue' ? vue
    : name === '@/api/shengyu' ? api
    : name === '@/assets/theme' ? loadThemeAssets()
    : name === '@/store/global' ? { useGlobalStore: () => store }
    : { useMyCollection: { ifExist: () => false }, useMyPlay: { ifExist: () => queued } } });
  const item = { exhibitId: 'song', exhibitTitle: 'Unsupported', defaulterIdentityType: 4 };
  const render = (compact = true) => renderToString(vue.createSSRApp(exports.default, { item, compact }));
  const unsupported = await render();
  assert.match(unsupported, /fl-icon-wufabofang/);
  assert.match(unsupported, /disabled[^>]*title="无法播放"/);
  assert.match(unsupported, /aria-label="加入播放列表" disabled/);
  assert.doesNotMatch(unsupported, /<button[^>]*aria-label="(收藏|分享)"[^>]*disabled/);
  item.versionInfo = { exhibitProperty: { mime: 'audio/mpeg' } };
  assert.doesNotMatch(await render(), /disabled|fl-icon-wufabofang/);
  queued = true;
  assert.match(await render(), /title="已在播放列表"[^>]*disabled/);
  store.playing = true;
  store.playingInfo = item;
  assert.match(await render(), /fl-icon-zanting-daibiankuang/);
  assert.match(await render(false), /暂停/);
  assert.match(await render(false), /fl-icon-zanting-daibiankuang/);
  item.articleInfo = { articleType: 2 };
  assert.match(await render(false), /播放全部/);
  assert.doesNotMatch(await render(false), /暂停|fl-icon-zanting/);
});

test('song titles render an authorization button only for locked tracks and preserve status precedence', async () => {
  const vue = require('vue');
  const { parse, compileScript } = require('@vue/compiler-sfc');
  const { renderToString } = require('vue/server-renderer');
  const filename = path.join(root, 'src/components/shengyu-track-name.vue');
  const { descriptor } = parse(fs.readFileSync(filename, 'utf8'), { filename });
  const script = compileScript(descriptor, { id: 'track-auth-test', inlineTemplate: true });
  const code = ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {}, api = loadApi({}, true);
  vm.runInNewContext(code, { exports, require: name => name === 'vue' ? vue : name === '@/api/shengyu' ? api : name === '@/assets/theme' ? loadThemeAssets() : name });
  async function render(extra) {
    const app = vue.createSSRApp(exports.default, { item: { exhibitId: 'song', exhibitTitle: 'Locked song', ...extra } });
    app.component('RouterLink', { setup: (_props, { slots }) => () => vue.h('a', slots.default?.()) });
    return renderToString(app);
  }
  assert.match(await render({ defaulterIdentityType: 4 }), /aria-label="授权 Locked song"/);
  assert.doesNotMatch(await render({ defaulterIdentityType: 0 }), /sy-track-auth/);
  assert.match(await render({}), /alt="授权链异常"/);
  const offline = await render({ defaulterIdentityType: 4, onlineStatus: 0 });
  assert.match(offline, /已下架/);
  assert.doesNotMatch(offline, /sy-track-auth/);
});

test('audio durations use Freelog milliseconds and retain formatted preview durations', () => {
  const api = loadApi({}, true);
  assert.equal(api.duration({versionInfo:{exhibitProperty:{duration:224000}}}), '03:44');
  assert.equal(api.duration({articleInfo:{articleProperty:{duration:256000}}}), '04:16');
  assert.equal(api.duration({versionInfo:{exhibitProperty:{collection_duration:3661000}}}), '01:01:01');
  assert.equal(api.duration({duration:'03:45'}), '03:45');
  assert.equal(api.duration({duration:59999}), '01:00');
  assert.equal(api.duration({duration:'invalid'}), '--:--');
  assert.equal(api.duration({}), '--:--');
});

test('search scans later pages and collection episodes, retaining podcast identity', async () => {
  const skips = [];
  const api = loadApi({
    getExhibitListByPage: async options => {
      skips.push(options.skip);
      assert.ok(options.articleResourceTypes.includes('播单'));
      return { data: { data: { totalItem: 2, dataList: options.skip === 0
        ? [{ exhibitId: 'podcast', exhibitTitle: 'Show', articleInfo: { articleType: 2, resourceType: ['播单'] } }]
        : [{ exhibitId: 'song', exhibitTitle: 'NEEDLE song', articleInfo: { articleType: 1, resourceType: ['音乐'] } }] } } };
    },
    getExhibitAuthStatus: async () => ({ data: { data: [] } }),
    getCollectionSubListByPage: async () => ({ data: { data: { totalItem: 1, dataList: [{ itemId: 'ep', itemTitle: 'Needle episode', articleInfo: {} }] } } }),
    getCollectionSubAuthStatus: async () => ({ data: { data: [{ itemId: 'ep', defaulterIdentityType: 4 }] } })
  });
  const result = await api.searchEntries('  needle  ');
  assert.deepEqual(skips, [0, 1]);
  assert.equal(result.length, 2);
  const episode = result.find(x => x.itemId === 'ep');
  assert.equal(api.isPodcast(episode), true);
  assert.equal(episode.exhibitId, 'podcast');
  assert.equal(episode.defaulterIdentityType, 4);
  assert.equal(api.isPodcast(result.find(x => x.exhibitId === 'song')), false);
  assert.equal((await api.searchEntries(' ')).length, 0);
  assert.equal((await api.searchEntries('needle', undefined, () => false)).length, 0);
});

test('result categories separate songs, albums, playlists and podcasts, including collection children', () => {
  const api = loadApi({}, true);
  const entry = type => ({ articleInfo: { resourceType: [type] } });
  assert.equal(api.entryCategory(entry('音乐')), 'songs');
  assert.equal(api.entryCategory(entry('音乐专辑')), 'albums');
  assert.equal(api.entryCategory(entry('歌单')), 'playlists');
  for (const type of ['连载播客', '播单', '播客节目']) assert.equal(api.entryCategory(entry(type)), 'podcasts');
  assert.equal(api.entryCategory({ ...entry('音乐专辑'), itemId: 'song', parentResourceType: ['音乐专辑'] }), 'songs');
  assert.equal(api.entryCategory({ itemId: 'episode', parentResourceType: ['播单'] }), 'podcasts');
});

test('search history handles malformed storage, deduplication, limits and unavailable storage', () => {
  const source = fs.readFileSync(path.join(root, 'src/utils/search-history.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  let stored = '{bad json', blocked = false;
  vm.runInNewContext(code, { exports, localStorage: {
    getItem: () => { if (blocked) throw Error('blocked'); return stored; },
    setItem: (_key, value) => { if (blocked) throw Error('blocked'); stored = value; }
  } });
  assert.equal(exports.readSearchHistory().length, 0);
  stored = '[" Hello ","Hello",null,42,""]';
  assert.equal(exports.readSearchHistory().join(','), 'Hello');
  let history = ['Hello'];
  history = exports.addSearchHistory(history, ' hello ');
  assert.equal(history.join(','), 'hello');
  for (let i = 0; i < 12; i++) history = exports.addSearchHistory(history, 'word' + i);
  assert.equal(history.length, 10);
  assert.equal(history[0], 'word11');
  exports.saveSearchHistory(history);
  assert.equal(exports.readSearchHistory().length, 10);
  exports.saveSearchHistory([]);
  assert.equal(exports.readSearchHistory().length, 0);
  blocked = true;
  assert.equal(exports.readSearchHistory().length, 0);
  assert.doesNotThrow(() => exports.saveSearchHistory(['search']));
});

test('exhibit sharing mounts the configured plugin, replaces stale content and closes it', async () => {
  const vue = require('vue');
  const { parse, compileScript } = require('@vue/compiler-sfc');
  const filename = path.join(root, 'src/components/share.vue');
  const { descriptor } = parse(fs.readFileSync(filename, 'utf8'), { filename });
  const compiled = compileScript(descriptor, { id: 'share-widget-test' });
  const code = ts.transpileModule(compiled.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const store = { shareInfo: { show: false, exhibit: null }, setData({ value }) { this.shareInfo = value; } };
  let changed, themeChanged, cleanup, mountedHook, unmounts = 0, mountSuccess = true, finishMount;
  const theme = vue.ref('dark');
  const mounts = [], updates = [];
  const runtime = {
    getSelfDepForTheme: async () => [{ articleName: 'ZhuC/Freelog插件-展品分享', articleId: 'widget', parentNid: 'p', nid: 'n' }],
    getTopExhibitId: () => 'theme',
    mountArticleWidget: async options => {
      mounts.push(options);
      if (finishMount) await new Promise(resolve => { finishMount = resolve; });
      return { success: mountSuccess, setData: async data => updates.push(data), forceSetData: async data => updates.push(data), unmount: async () => { unmounts++; } };
    },
  };
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => name === 'vue' ? { ...vue,
    watch: (source, callback) => { if (source === theme) themeChanged = callback; else changed = callback; }, onBeforeUnmount: callback => { cleanup = callback; },
    onMounted: callback => { mountedHook = callback; },
  } : name === 'freelog-runtime' ? { freelogApp: runtime }
    : name === '@/store/global' ? { useGlobalStore: () => store }
    : name === '@/utils/theme-manager' ? { currentTheme: theme } : loadApi({}) });
  const instance = exports.default.setup({}, { expose() {} });
  instance.container.value = {};
  instance.dialog.value = { open: false, showModal() { this.open = true; }, close() { this.open = false; } };
  const flush = () => new Promise(resolve => setImmediate(resolve));
  mountedHook(); await flush();
  assert.equal(mounts.length, 1);
  assert.equal(mounts[0].renderWidgetOptions.data.show, false);
  assert.equal(instance.dialog.value.open, false);
  mounts.length = 0;
  finishMount = true;
  store.shareInfo = { show: true, exhibit: { exhibitId: 'parent', itemId: 'episode', itemTitle: 'Episode', exhibitTitle: 'Series', parentResourceType: ['连载播客'] } };
  changed(); await flush();
  assert.equal(instance.dialog.value.open, false);
  finishMount(); finishMount = undefined; await flush();
  assert.equal(instance.dialog.value.open, true);
  assert.equal(unmounts, 1);
  unmounts = 0;
  assert.equal(mounts.length, 1);
  assert.equal(mounts[0].renderWidgetOptions.data.exhibit.itemId, 'episode');
  assert.equal(mounts[0].renderWidgetOptions.data.exhibit.exhibitTitle, 'Episode');
  assert.equal(mounts[0].renderWidgetOptions.data.type, '播客');
  assert.equal(updates[0].show, true);
  assert.equal(updates[0].copyButtonColors.background, 'var(--sy-brand, #8fc914)');
  assert.equal(updates[0].copyButtonColors.text, '#111314');
  theme.value = 'light'; themeChanged(); await flush();
  assert.equal(updates[1].copyButtonColors.background, 'var(--sy-brand, #8fc914)');
  assert.equal(updates[1].copyButtonColors.text, '#fff');
  assert.equal(instance.dialog.value.open, true);
  store.shareInfo = { show: true, exhibit: { exhibitId: 'song', exhibitTitle: 'Song' } };
  changed(); await flush();
  assert.equal(unmounts, 1);
  assert.equal(mounts[1].renderWidgetOptions.data.type, '音乐');
  instance.close(); changed(); await flush();
  assert.equal(unmounts, 2);
  assert.equal(instance.dialog.value.open, false);
  mountSuccess = false;
  store.shareInfo = { show: true, exhibit: { exhibitId: 'song' } };
  changed(); await flush();
  assert.match(instance.error.value, /分享插件加载失败/);
  assert.equal(mounts.length, 3);
  cleanup();
});
