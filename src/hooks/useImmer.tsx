import { type Draft, freeze, produce } from "immer";
import { useCallback, useState } from "react";

export type DraftFunction<S> = (draft: Draft<S>) => void;
export type Updater<S> = (arg: S | DraftFunction<S>) => void;
export type ImmerHook<S> = [S, Updater<S>];
export function useImmer<S = unknown>(
	initialValue: S | (() => S),
): ImmerHook<S>;
export function useImmer<T>(initialValue: T) {
	const [value, updateValue] = useState(
		freeze(
			typeof initialValue === "function" ? initialValue() : initialValue,
			true,
		),
	);
	return [
		value,
		useCallback((updater: T | DraftFunction<T>) => {
			if (updater === "function") {
				updateValue(produce(updater as DraftFunction<T>));
			} else {
				updateValue(freeze(updater));
			}
		}, []),
	];
}
