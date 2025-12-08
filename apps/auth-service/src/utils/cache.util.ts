export const createCacheKey = (pattern: string, ...args: string[]): string => {
  let key = pattern;
  args.forEach((arg) => {
    key = key.replace('%s', arg);
  });
  return key;
};
