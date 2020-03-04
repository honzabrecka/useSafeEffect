import { useEffect } from "react";

/**
 * A hook designed to perform an async effect in a safe way, thus prevent
 * possible and undesired race condition.
 */
const useSafeEffect = (effect, deps) => {
  useEffect(() => {
    let valid = true;

    const invalidEffectError = new Error("Effect is no more valid.");

    const checkEffectValidity = value => {
      if (!valid) {
        throw invalidEffectError;
      }
      return value;
    };

    const isInvalidEffectError = error => error === invalidEffectError;

    const handleEffectError = handler => error => {
      if (!isInvalidEffectError(error) && handler) {
        handler(error);
      }
    };

    effect({
      checkEffectValidity,
      isInvalidEffectError,
      handleEffectError
    });
    return () => {
      valid = false;
    };
  }, deps);
};

export default useSafeEffect;
