import { Button as UiButton } from "~/components/ui/button";

export function Button() {
	return (
		<>
			<UiButton disabled size="lg">
				Sign up
			</UiButton>
			<UiButton disabled size="lg" variant="secondary">
				Log in
			</UiButton>
		</>
	);
}
