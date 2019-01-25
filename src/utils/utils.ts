/**
 * 将import对象转成数组
 * @param importObject
 */
export function importToArray<Key extends string, PropType>(importObject: Record<Key, PropType>): PropType[] {
  const keys = Object.getOwnPropertyNames(importObject);
  return keys.filter(key => key.indexOf('__') !== 0).map(key => importObject[key]);
}
