import { useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * Hook để xử lý click outside element
 * @param callback - Function được gọi khi click outside
 * @param enabled - Có enable hook này không (mặc định true)
 * @returns ref để gắn vào element cần theo dõi
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled: boolean = true
) {
  const ref = useRef<T>(null);

  // Memoize callback để tránh re-render không cần thiết
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        memoizedCallback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [memoizedCallback, enabled]);

  return ref;
}

/**
 * Hook để xử lý click outside cho multiple elements
 * @param callback - Function được gọi khi click outside
 * @param enabled - Có enable hook này không (mặc định true)
 * @param count - Số lượng refs cần tạo (mặc định 2)
 * @returns array các ref để gắn vào các element cần theo dõi
 */
export function useMultipleOutsideClick<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled: boolean = true,
  count: number = 2
) {
  // Tạo array refs một cách đúng đắn
  const refs = useMemo(() => 
    Array.from({ length: count }, () => useRef<T>(null)),
    [count]
  );

  // Memoize callback để tránh re-render không cần thiết
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every(ref => 
        !ref.current || !ref.current.contains(event.target as Node)
      );
      
      if (isOutside) {
        memoizedCallback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, memoizedCallback, enabled]);

  return refs;
}