export const money = (k: number) =>
  k >= 1000 ? '$' + (k / 1000).toFixed(2).replace(/0$/, '') + 'M' : '$' + k + 'K';
export const fmt = (n: number) => n.toLocaleString('en-US');
