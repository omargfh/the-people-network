export function createLazyValue<T>(initializer: () => T): Lazy<T> {
  let evaluated: T | null = null;
  return (reset: boolean = false) => {
    if (reset) {
      evaluated = null;
    }
    if (evaluated === null) {
      evaluated = initializer();
    }
    return evaluated;
  };
}
