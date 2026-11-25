import { artist, duration, entryCategory, isCollection, properties, type AudioEntry } from '@/api/shengyu';
import { absoluteTime, formatDate, secondsToHMS } from '@/utils/common';

export function podcastDetailFields(item: AudioEntry): [string, string][] {
  const p = properties(item);
  const fields: [string, string][] = [];
  const author = artist(item);
  if (author) fields.push([item.articleInfo?.articleType === 3 ? '创建人' : '艺人', author]);
  const date = absoluteTime(p.release_date || item.articleInfo?.firstVersionReleaseDate || item.updateDate);
  if (date) fields.push(['发行时间', date]);
  const length = duration(item);
  if (length !== '--:--') fields.push(['总时长', length]);
  return fields;
}

export function podcastPublishedTime(item: AudioEntry): string {
  const value = item.articleInfo?.firstVersionReleaseDate || item.updateDate;
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : formatDate(date, 'YYYY/MM/DD hh:mm');
}

// Match music-theme's song and playlist field sets, order and data sources.
export function musicDetailFields(item: AudioEntry, ownerUserName = ''): [string, string][] {
  const p = properties(item);
  const fields: [string, string][] = [];
  const add = (label: string, value: unknown, always = false) => {
    if (always || value) fields.push([label, value == null ? '' : String(value)]);
  };
  const time = (value: unknown) => String(value).includes(':') ? String(value) : secondsToHMS(value);
  if (isCollection(item)) {
    if (item.articleInfo?.articleType === 3 || entryCategory(item) === 'playlists') {
      add('创建人', ownerUserName, true);
    } else {
      add('艺人', p.display_artist);
      add('发行时间', absoluteTime(p.release_date || item.articleInfo?.versions?.[0]?.createDate), true);
    }
    if (p.collection_duration) add('总时长', time(p.collection_duration));
    return fields;
  }
  add('资源类型', item.articleInfo?.resourceType?.[1], true);
  add('艺人', p.display_artist);
  if (p.duration) add('时长', time(p.duration));
  const releaseDate = p.release_date || (item.itemId ? item.articleInfo?.firstVersionReleaseDate : undefined);
  if (releaseDate) add('发行时间', absoluteTime(releaseDate));
  add('厂牌', p.label_name);
  add('语种', p.lyric_language);
  add('风格', p.music_genre);
  return fields;
}

export const musicDetailIntro = (item: AudioEntry): string => item.articleInfo?.intro || item.exhibitIntro || '';

export function musicCardMetadata(item: AudioEntry) {
  return {
    author: entryCategory(item) === 'albums' ? item.articleInfo?.articleOwnerName || '' : '',
  };
}
