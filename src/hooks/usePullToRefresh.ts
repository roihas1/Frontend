import { useCallback, useEffect, useRef, useState } from "react";

const PULL_THRESHOLD_PX = 56;
const MAX_PULL_PX = 120;

interface UsePullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  enabled?: boolean;
}

const getScrollTop = () => {
  const scrollingElement =
    document.scrollingElement ?? document.documentElement;
  return Math.max(
    window.scrollY || 0,
    scrollingElement.scrollTop || 0,
    document.body.scrollTop || 0,
  );
};

export const usePullToRefresh = ({
  onRefresh,
  enabled = true,
}: UsePullToRefreshOptions) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const reset = useCallback(() => {
    startYRef.current = null;
    pullDistanceRef.current = 0;
    setPullDistance(0);
  }, []);

  useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }

    const previousOverscroll = document.documentElement.style.overscrollBehaviorY;
    document.documentElement.style.overscrollBehaviorY = "contain";

    const handleTouchStart = (event: TouchEvent) => {
      if (isRefreshingRef.current) {
        return;
      }
      // Allow a tiny tolerance for iOS rubber-banding noise.
      if (getScrollTop() > 2) {
        startYRef.current = null;
        return;
      }
      startYRef.current = event.touches[0]?.clientY ?? null;
      pullDistanceRef.current = 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isRefreshingRef.current || startYRef.current == null) {
        return;
      }
      if (getScrollTop() > 2) {
        reset();
        return;
      }

      const currentY = event.touches[0]?.clientY ?? startYRef.current;
      const delta = currentY - startYRef.current;
      if (delta <= 0) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }

      const dampened = Math.min(delta * 0.55, MAX_PULL_PX);
      pullDistanceRef.current = dampened;
      setPullDistance(dampened);

      // Take over the gesture once the user is clearly pulling.
      if (event.cancelable && dampened > 6) {
        event.preventDefault();
      }
    };

    const finishRefresh = () => {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
      reset();
    };

    const handleTouchEnd = () => {
      if (isRefreshingRef.current) {
        return;
      }

      const distance = pullDistanceRef.current;
      if (distance < PULL_THRESHOLD_PX) {
        reset();
        return;
      }

      isRefreshingRef.current = true;
      setIsRefreshing(true);
      setPullDistance(Math.min(distance, PULL_THRESHOLD_PX));

      void Promise.resolve(onRefreshRef.current())
        .catch(() => undefined)
        .finally(finishRefresh);
    };

    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchend", handleTouchEnd, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchcancel", reset, {
      passive: true,
      capture: true,
    });

    return () => {
      document.documentElement.style.overscrollBehaviorY = previousOverscroll;
      window.removeEventListener("touchstart", handleTouchStart, true);
      window.removeEventListener("touchmove", handleTouchMove, true);
      window.removeEventListener("touchend", handleTouchEnd, true);
      window.removeEventListener("touchcancel", reset, true);
    };
  }, [enabled, reset]);

  return {
    pullDistance,
    isRefreshing,
    progress: Math.min(pullDistance / PULL_THRESHOLD_PX, 1),
  };
};
