import type { LocationQuery } from 'vue-router';

/** Preserve old shared links while using one canonical detail route. */
export function canonicalDetailLocation(query: LocationQuery, hash = '') {
  const { subID, ...rest } = query;
  if (!rest.itemId && subID) rest.itemId = subID;
  return { path: '/detail', query: rest, hash, replace: true };
}
