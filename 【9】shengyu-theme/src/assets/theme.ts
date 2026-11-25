import musicSvg from './design/d5b81.svg?raw';
import podcastSvg from './design/cd2c2.svg?raw';
import moreArrowSvg from './design/0327b.svg?raw';
import miniPlaySvg from './design/c396a.svg?raw';
import coverPlaySvg from './design/0217c.svg?raw';
import coverPlayHoverSvg from './design/7c521.svg?raw';
import cardMoreSvg from './design/32a15.svg?raw';
import cardMoreHoverSvg from './design/f302a.svg?raw';
import episodeMoreSvg from './design/1c963.svg?raw';
import lockSvg from './design/76ee8.svg?raw';
import searchSvg from './design/8e83d.svg?raw';
import listPlaySvg from './design/a8af2.svg?raw';
import playSvg from './design/bb967.svg?raw';
import listPlayHoverSvg from './design/9edb0.svg?raw';
import listQueueSvg from './design/be00b.svg?raw';
import queueSvg from './design/2fa2f.svg?raw';
import listQueueHoverSvg from './design/860df.svg?raw';
import listCollectSvg from './design/fe191.svg?raw';
import collectSvg from './design/3e5be.svg?raw';
import listCollectHoverSvg from './design/fe46d.svg?raw';
import listShareSvg from './design/91b21.svg?raw';
import shareSvg from './design/b36f0.svg?raw';
import listShareHoverSvg from './design/50891.svg?raw';
import defaultCoverSvg from './images/default-cover.svg?raw';
import record from './design/03e3a.png';
import defaultBanner from './images/pc-default-banner.webp';

const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
// Imported raster assets use root-relative URLs in Vite development. Resolve
// them against the theme server, not the node hosting this micro-app.
const rasterUrl = (url: string) => {
  const base = import.meta.env.DEV ? import.meta.url : typeof window !== 'undefined' &&
    (window as Window & { __MICRO_APP_PUBLIC_PATH__?: string }).__MICRO_APP_PUBLIC_PATH__;
  return base ? new URL(url, base).href : url;
};

export const themeAssets = {
  record: rasterUrl(record),
  defaultBanner: rasterUrl(defaultBanner),
  defaultCover: svgUrl(defaultCoverSvg),
  music: svgUrl(musicSvg),
  podcast: svgUrl(podcastSvg),
  moreArrow: svgUrl(moreArrowSvg),
  miniPlay: svgUrl(miniPlaySvg),
  coverPlay: svgUrl(coverPlaySvg),
  coverPlayHover: svgUrl(coverPlayHoverSvg),
  cardMore: svgUrl(cardMoreSvg),
  cardMoreHover: svgUrl(cardMoreHoverSvg),
  episodeMore: svgUrl(episodeMoreSvg),
  lock: svgUrl(lockSvg),
  search: svgUrl(searchSvg),
  listPlay: svgUrl(listPlaySvg),
  play: svgUrl(playSvg),
  listPlayHover: svgUrl(listPlayHoverSvg),
  listQueue: svgUrl(listQueueSvg),
  queue: svgUrl(queueSvg),
  listQueueHover: svgUrl(listQueueHoverSvg),
  listCollect: svgUrl(listCollectSvg),
  collect: svgUrl(collectSvg),
  listCollectHover: svgUrl(listCollectHoverSvg),
  listShare: svgUrl(listShareSvg),
  share: svgUrl(shareSvg),
  listShareHover: svgUrl(listShareHoverSvg),
} as const;
