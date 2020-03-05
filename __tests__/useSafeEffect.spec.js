import { renderHook } from "@testing-library/react-hooks";
import delay from "lodash/delay";
import useSafeEffect from "../index";

jest.useFakeTimers();

const delayedCallback = cb => delay(cb, 5000);

test("effect should be valid when async function is resolved before hook is rerun or unmounted", () => {
  const initialId = 1;
  const done = jest.fn();
  const fail = jest.fn();

  renderHook(
    ({ id }) => {
      useSafeEffect(
        ({ checkEffectValidity }) => {
          delayedCallback(() => {
            try {
              checkEffectValidity();
              done(id);
            } catch (error) {
              fail();
            }
          });
        },
        [id]
      );
    },
    { initialProps: { id: initialId } }
  );

  jest.runAllTimers();
  expect(done).toHaveBeenCalledWith(initialId);
  expect(fail).toHaveBeenCalledTimes(0);
});

test("effect should be invalid when async function is resolved after hook has been rerun", () => {
  const initialId = 1;
  const someOtherId = 2;
  const done = jest.fn();
  const fail = jest.fn();

  const { rerender } = renderHook(
    ({ id }) => {
      useSafeEffect(
        ({ checkEffectValidity }) => {
          delayedCallback(() => {
            try {
              checkEffectValidity();
              done(id);
            } catch (error) {
              fail();
            }
          });
        },
        [id]
      );
    },
    { initialProps: { id: initialId } }
  );

  rerender({ id: someOtherId });

  jest.runAllTimers();
  expect(done).toHaveBeenCalledWith(someOtherId);
  expect(fail).toHaveBeenCalledTimes(1);
});

test("effect should be invalid when async function is resolved after hook has been unmounted", () => {
  const done = jest.fn();
  const fail = jest.fn();

  const { unmount } = renderHook(
    ({ id }) => {
      useSafeEffect(
        ({ checkEffectValidity }) => {
          delayedCallback(() => {
            try {
              checkEffectValidity();
              done(id);
            } catch (error) {
              fail();
            }
          });
        },
        [id]
      );
    },
    { initialProps: { id: 1 } }
  );

  unmount();

  jest.runAllTimers();
  expect(done).toHaveBeenCalledTimes(0);
  expect(fail).toHaveBeenCalledTimes(1);
});

test("invalid effect error is ignored by injected handleEffectError function", () => {
  const handler = jest.fn();

  const { unmount } = renderHook(
    ({ id }) => {
      useSafeEffect(
        ({ checkEffectValidity, handleEffectError }) => {
          delayedCallback(() => {
            try {
              checkEffectValidity();
            } catch (error) {
              handleEffectError(handler)(error);
            }
          });
        },
        [id]
      );
    },
    { initialProps: { id: 1 } }
  );

  unmount();

  jest.runAllTimers();
  expect(handler).toHaveBeenCalledTimes(0);
});

test("any other error is not ignored by injected handleEffectError function", () => {
  const handler = jest.fn();

  renderHook(
    ({ id }) => {
      useSafeEffect(
        ({ checkEffectValidity, handleEffectError }) => {
          delayedCallback(() => {
            try {
              throw new Error("whatever");
            } catch (error) {
              handleEffectError(handler)(error);
            }
          });
        },
        [id]
      );
    },
    { initialProps: { id: 1 } }
  );

  jest.runAllTimers();
  expect(handler).toHaveBeenCalledTimes(1);
});

test("checkEffectValidity acts as an identity when effect is valid", () => {
  const initialId = 1;
  const done = jest.fn();

  renderHook(
    ({ id }) => {
      useSafeEffect(
        ({ checkEffectValidity }) => {
          delayedCallback(() => {
            done(checkEffectValidity(id));
          });
        },
        [id]
      );
    },
    { initialProps: { id: initialId } }
  );

  jest.runAllTimers();
  expect(done).toHaveBeenCalledWith(initialId);
});

test("should invoke cleanup function", () => {
  const clean = jest.fn();

  const { unmount } = renderHook(
    ({ id }) => {
      useSafeEffect(() => {
        return clean;
      }, []);
    },
    { initialProps: {} }
  );

  unmount();
  expect(clean).toHaveBeenCalledTimes(1);
});
