const route = (exhibitId: string, itemId?: string) =>
  `/detail?id=${encodeURIComponent(exhibitId)}${itemId ? `&itemId=${encodeURIComponent(itemId)}` : ""}`;
export default { detail: route, playDetail: route };
