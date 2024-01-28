export {}

declare global {
  interface Array<T> {
    findLastIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): number
  }

  interface Array<T> {
    findLast(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): T
  }
}
