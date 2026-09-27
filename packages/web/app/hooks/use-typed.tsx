import { useEffect, useState } from "react";

export function useTyped(
	text: string,
	active: boolean,
	options: { speed?: number; delay?: number; instant?: boolean } = {},
) {
	const { speed = 45, delay = 0, instant = false } = options;
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!active) return setCount(0);
		if (instant) return setCount(text.length);
		const start = performance.now() + delay;
		const timer = setInterval(() => {
			const next = Math.min(
				text.length,
				Math.max(0, Math.floor((performance.now() - start) / speed)),
			);
			setCount(next);
			if (next === text.length) clearInterval(timer);
		}, speed / 2);
		return () => clearInterval(timer);
	}, [text, active, speed, delay, instant]);

	return text.slice(0, count);
}
