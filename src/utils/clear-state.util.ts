import { Dispatch, SetStateAction } from 'react';

export function clearStates(
  settersWithDefaults: Array<[Dispatch<any>, any]>
) {
  settersWithDefaults.forEach(([setter, defaultValue]) => setter(defaultValue));
}

export function resetFormStates<T extends object>(
  setter: Dispatch<SetStateAction<T>>,
  defaultState: T
) {
  setter(defaultState);
}
