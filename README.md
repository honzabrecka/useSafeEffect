# useSafeEffect

A hook designed to perform an async effect in a safe way, thus prevent possible and undesired race condition.

## Installation

```console
yarn add use-safe-effect-hook
```

## Usage

```js
useSafeEffect(
  ({ checkEffectValidity, handleEffectError }) => {
    anAsyncAction(id)
      .then(checkEffectValidity)
      // state is updated only if effect is still valid
      .then(updateState)
      // error is shown only if effect is still valid
      .catch(handleEffectError(showError))
  },
  [id]
)
```
