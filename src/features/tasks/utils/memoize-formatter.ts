/**
 * Constructing an `Intl` formatter costs tens of times what using one does, which is why MDN's
 * guidance is to keep them. Locale and time zone are parameters here, so "keep one" becomes
 * "keep one per distinct set of construction arguments".
 */
export const memoizeFormatter = <TArguments extends readonly (string | undefined)[], TFormatter>(
  create: (...formatterArguments: TArguments) => TFormatter,
) => {
  const cache = new Map<string, TFormatter>();
  return (...formatterArguments: TArguments): TFormatter => {
    // Serialised rather than joined, so an explicit "" locale cannot collide with `undefined`
    // and make the result depend on which call happened to populate the cache first.
    const key = JSON.stringify(formatterArguments);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    const formatter = create(...formatterArguments);
    cache.set(key, formatter);
    return formatter;
  };
};
