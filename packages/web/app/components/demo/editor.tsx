export function Editor({ heading, color, name }: { heading: string; color: string; name: string }) {
	return (
		<div className="flex flex-col gap-[0.3cqw] p-[1cqw] font-mono text-[#100F0F] text-[1cqw] leading-snug">
			<span>
				<span className="text-[#A02F6F]">export function</span>{" "}
				<span className="text-[#205EA6]">App</span>() {"{"}
			</span>
			<span className="pl-[1.6cqw]">
				<span className="text-[#A02F6F]">return</span>{" "}
				<span className="text-[#6F6E69]">{"<h1>"}</span>
				<span className="relative">
					{heading}
					<span
						className="absolute -right-[0.15cqw] top-0 h-full w-[0.15cqw]"
						style={{ backgroundColor: color }}
					>
						<span
							className="absolute bottom-full left-0 whitespace-nowrap rounded-[0.25cqw] px-[0.35cqw] font-sans text-[0.75cqw] text-white"
							style={{ backgroundColor: color }}
						>
							{name}
						</span>
					</span>
				</span>
				<span className="text-[#6F6E69]">{"</h1>"}</span>
			</span>
			<span>{"}"}</span>
		</div>
	);
}
