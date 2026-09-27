import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "../..");
const LOGOS = resolve(import.meta.dir, "logos");
const W = 1920;
const H = 1080;

const C = {
	ink: "#100F0F",
	paper: "#FFFCF0",
	shade: "#F2F0E5",
	shade2: "#E6E4D9",
	line: "#B7B5AC",
	muted: "#9F9D96",
	text2: "#6F6E69",
	accent: "#205EA6",
	accentFill: "#E1ECEB",
	accentShade: "#C6DDE8",
	agent: "#BC5215",
	agentFill: "#FFE7CE",
	green: "#66800B",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type Font = "mono" | "sans";
const EM = { mono: 0.6, sans: 0.54 };
const measure = (s: string, size: number, font: Font) => s.length * size * EM[font];

const overflow: string[] = [];

function text(
	x: number,
	y: number,
	s: string,
	o: {
		size?: number;
		font?: Font;
		weight?: number;
		fill?: string;
		anchor?: "start" | "middle" | "end";
		spacing?: number;
		max?: number;
	} = {},
) {
	const size = o.size ?? 16;
	const font = o.font ?? "mono";
	if (o.max && measure(s, size, font) > o.max) overflow.push(`${s} (${Math.round(measure(s, size, font))} > ${o.max})`);
	const family = font === "mono" ? "Berkeley Mono, ui-monospace, monospace" : "Geist, system-ui, sans-serif";
	return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${o.weight ?? 400}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}"${o.spacing ? ` letter-spacing="${o.spacing}"` : ""}>${rich(s)}</text>`;
}

function rich(s: string) {
	return esc(s)
		.replace(/\[\[(.+?)\]\]/g, `<tspan fill="${C.accent}">$1</tspan>`)
		.replace(/\{\{(.+?)\}\}/g, `<tspan fill="${C.agent}">$1</tspan>`)
		.replace(/~~(.+?)~~/g, `<tspan fill="${C.text2}">$1</tspan>`);
}

const plain = (s: string) => s.replace(/\[\[|\]\]|\{\{|\}\}|~~/g, "");

function lines(
	x: number,
	y: number,
	rows: string[],
	o: { size?: number; lh?: number; font?: Font; fill?: string; max?: number; weight?: number } = {},
) {
	const lh = o.lh ?? 24;
	return rows
		.map((r, i) => {
			const size = o.size ?? 16;
			const font = o.font ?? "mono";
			if (o.max && measure(plain(r), size, font) > o.max) overflow.push(`${plain(r)} (${Math.round(measure(plain(r), size, font))} > ${o.max})`);
			return text(x, y + i * lh, r, { ...o, max: undefined });
		})
		.join("");
}

function card(
	x: number,
	y: number,
	w: number,
	h: number,
	o: {
		title?: string;
		sub?: string;
		body?: string[];
		tone?: "ink" | "accent" | "agent" | "muted";
		depth?: number;
		size?: number;
		lh?: number;
		logos?: string[];
		titleSize?: number;
		dash?: boolean;
	} = {},
) {
	const d = o.depth ?? 8;
	const tone = o.tone ?? "ink";
	const stroke = tone === "accent" ? C.accent : tone === "agent" ? C.agent : tone === "muted" ? C.line : C.ink;
	const face = tone === "accent" ? C.accentFill : tone === "agent" ? C.agentFill : C.paper;
	const side = tone === "accent" ? C.accentShade : tone === "agent" ? "#FED3AF" : C.shade2;
	const dash = o.dash ? ` stroke-dasharray="6 5"` : "";
	let s = `<g>`;
	if (d > 0) {
		s += `<polygon points="${x + w},${y} ${x + w + d},${y + d} ${x + w + d},${y + h + d} ${x + w},${y + h}" fill="${side}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;
		s += `<polygon points="${x},${y + h} ${x + w},${y + h} ${x + w + d},${y + h + d} ${x + d},${y + h + d}" fill="${side}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;
	}
	s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${face}" stroke="${stroke}" stroke-width="1.5"${dash}/>`;
	let ty = y;
	const logoW = (o.logos?.length ?? 0) * 34;
	if (o.title) {
		const ts = o.titleSize ?? 23;
		ty = y + 16 + ts;
		s += text(x + 18, ty, o.title, { size: ts, font: "sans", weight: 560, max: w - 36 - logoW });
		o.logos?.forEach((name, i) => {
			s += logo(name, x + w - 16 - (o.logos!.length - i) * 34, y + 14, 26);
		});
	}
	if (o.sub) {
		ty += 26;
		s += text(x + 18, ty, o.sub, { size: 15, fill: C.text2, max: w - 36 });
	}
	if (o.body) {
		const lh = o.lh ?? 24;
		ty += o.title || o.sub ? lh + 6 : 16 + (o.size ?? 16);
		s += lines(x + 18, ty, o.body, { size: o.size ?? 16, lh, max: w - 36 });
	}
	return `${s}</g>`;
}

function frame(
	x: number,
	y: number,
	w: number,
	h: number,
	label: string,
	o: { dash?: string; stroke?: string; logos?: string[]; fill?: string; size?: number } = {},
) {
	const size = o.size ?? 17;
	const lw = measure(label, size, "mono") + label.length * 0.4 + 40 + (o.logos?.length ?? 0) * 30;
	let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? C.ink}" stroke-width="1.5"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""} rx="2"/>`;
	s += `<rect x="${x + 20}" y="${y - 14}" width="${lw}" height="28" fill="${C.paper}"/>`;
	let lx = x + 32;
	o.logos?.forEach((name) => {
		s += logo(name, lx, y - 11, 22);
		lx += 30;
	});
	s += text(lx, y + 6, label, { size, fill: o.stroke === C.line ? C.text2 : C.ink, spacing: 0.4 });
	return s;
}

type Kind = "rest" | "ws" | "exec" | "disk" | "agent";
type Pt = [number, number];

function wire(pts: Pt[], kind: Kind, o: { both?: boolean; label?: string; at?: Pt; anchor?: "start" | "middle" | "end" } = {}) {
	const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
	let s = `<path d="${d}" class="w w-${kind}" marker-end="url(#m-${kind})"${o.both ? ` marker-start="url(#m-${kind})"` : ""}/>`;
	if (o.label && o.at) s += pill(o.at[0], o.at[1], o.label, kind, o.anchor);
	return s;
}

function pill(x: number, y: number, label: string, kind: Kind, anchor: "start" | "middle" | "end" = "middle") {
	const size = 14;
	const w = measure(label, size, "mono") + 16;
	const left = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
	const color = kind === "ws" ? C.accent : kind === "agent" ? C.agent : kind === "disk" ? C.text2 : C.ink;
	return `<g><rect x="${left}" y="${y - 12}" width="${w}" height="22" rx="11" fill="${C.paper}" stroke="${color}" stroke-width="1"/>${text(left + 8, y + 4, label, { size, fill: color })}</g>`;
}

const logoCache = new Map<string, { vb: string; inner: string }>();
let logoSeq = 0;

function logo(name: string, x: number, y: number, size: number) {
	let entry = logoCache.get(name);
	if (!entry) {
		const raw = readFileSync(resolve(LOGOS, `${name}.svg`), "utf8").replace(/<\?xml[^>]*>/, "");
		const open = /<svg([^>]*)>/.exec(raw);
		if (!open) throw new Error(name);
		const vb = /viewBox="([^"]+)"/.exec(open[1])?.[1] ?? "0 0 24 24";
		const rootFill = /\sfill="([^"]+)"/.exec(open[1])?.[1];
		let inner = raw.slice(open.index + open[0].length, raw.lastIndexOf("</svg>"));
		if (rootFill) inner = `<g fill="${rootFill}">${inner}</g>`;
		entry = { vb, inner };
		logoCache.set(name, entry);
	}
	const p = `L${logoSeq++}${name.replace(/[^a-z]/g, "")}_`;
	const inner = entry.inner
		.replace(/id="([^"]+)"/g, `id="${p}$1"`)
		.replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
		.replace(/href="#([^"]+)"/g, `href="#${p}$1"`)
		.replace(/\.cls-1/g, `.${p}cls-1`)
		.replace(/class="cls-1"/g, `class="${p}cls-1"`)
		.replace(/currentColor/g, C.ink);
	return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${entry.vb}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

type V3 = readonly [number, number, number];
const IX = 10 * Math.cos(Math.PI / 6);
const proj = ([x, y, z]: V3) => [(x - y) * IX, (x + y) * 5 - z * 10] as const;
const pts = (vs: readonly V3[]) => vs.map((v) => proj(v).map((n) => n.toFixed(2)).join(",")).join(" ");
const tones = { line: C.ink, muted: C.line, accent: C.accent, agent: C.agent };
const fills = { none: "none", paper: C.paper, shade: C.shade, accent: C.accentFill, accentShade: C.accentShade, agent: C.agentFill, agentShade: "#FED3AF" };
type Tone = keyof typeof tones;
type Fill = keyof typeof fills;

const shape = (vs: readonly V3[], tone: Tone = "line", fill: Fill = "paper", dash?: string) =>
	`<polygon points="${pts(vs)}" stroke="${tones[tone]}" fill="${fills[fill]}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
const iline = (vs: readonly V3[], tone: Tone = "line", cls = "", dash?: string) =>
	`<polyline points="${pts(vs)}" stroke="${tones[tone]}" fill="none"${cls ? ` class="${cls}"` : ""}${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;

function ibox([x, y, z]: V3, [w, d, h]: V3, tone: Tone = "line", accent: Fill | false = false) {
	const face: Fill = accent === "agent" ? "agent" : accent ? "accent" : "paper";
	const side: Fill = accent === "agent" ? "agentShade" : accent ? "accentShade" : "shade";
	return (
		shape(
			[
				[x, y, z + h],
				[x + w, y, z + h],
				[x + w, y + d, z + h],
				[x, y + d, z + h],
			],
			tone,
			face,
		) +
		shape(
			[
				[x, y + d, z],
				[x + w, y + d, z],
				[x + w, y + d, z + h],
				[x, y + d, z + h],
			],
			tone,
			face,
		) +
		shape(
			[
				[x + w, y, z],
				[x + w, y + d, z],
				[x + w, y + d, z + h],
				[x + w, y, z + h],
			],
			tone,
			side,
		)
	);
}

function ilaptop([x, y]: readonly [number, number], active = true) {
	const Wd = 3;
	const D = 2.2;
	const T = 0.3;
	const Hh = 2.3;
	const L = 0.6;
	const tone: Tone = active ? "line" : "muted";
	return (
		shape(
			[
				[x, y, T],
				[x + Wd, y, T],
				[x + Wd, y - L, T + Hh],
				[x, y - L, T + Hh],
			],
			tone,
		) +
		`<g class="${active ? "screen" : ""}">${shape(
			[
				[x + 0.3, y - 0.07, T + 0.3],
				[x + Wd - 0.3, y - 0.07, T + 0.3],
				[x + Wd - 0.3, y - L + 0.07, T + Hh - 0.3],
				[x + 0.3, y - L + 0.07, T + Hh - 0.3],
			],
			active ? "accent" : "muted",
			active ? "accent" : "none",
		)}</g>` +
		ibox([x, y, 0], [Wd, D, T], tone)
	);
}

function iserver([x, y, z]: V3, [w, d, h]: V3, accent: Fill | false = false) {
	const tone: Tone = accent === "agent" ? "agent" : accent ? "accent" : "line";
	let s = ibox([x, y, z], [w, d, h], tone, accent);
	for (let i = 0; i < Math.floor((h - 0.5) / 1.5); i++) {
		const row = z + 1 + i * 1.5;
		s += iline(
			[
				[x + w, y + 0.5, row],
				[x + w, y + d - 1.4, row],
			],
			tone,
		);
		s += iline(
			[
				[x + w, y + d - 0.9, row],
				[x + w, y + d - 0.5, row],
			],
			accent === "agent" ? "agent" : "accent",
			"blink",
		);
	}
	return s;
}

function iso(cx: number, cy: number, scale: number, body: string) {
	return `<g transform="translate(${cx},${cy}) scale(${scale})" stroke-width="${(1.5 / scale).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
}

const out: string[] = [];
const add = (s: string) => out.push(s);

add(`<rect width="${W}" height="${H}" fill="${C.paper}"/>`);
add(`<g opacity="0.6">${Array.from({ length: Math.floor(W / 32) + 1 }, (_, i) => Array.from({ length: Math.floor(H / 32) + 1 }, (_, j) => `<circle cx="${i * 32}" cy="${j * 32}" r="1" fill="${C.shade2}"/>`).join("")).join("")}</g>`);

add(`<g transform="translate(64,52) scale(4) translate(-2.5,-1.5)" fill="none" stroke="${C.ink}" stroke-width=".75" stroke-linecap="round" stroke-linejoin="round"><path fill="${C.paper}" d="M5.86641 13.8775C5.58241 13.5185 5.23741 12.7845 4.62341 11.8935C4.27541 11.3895 3.41241 10.4405 3.15541 9.95849C2.93241 9.53249 2.95641 9.34149 3.00941 8.98849C3.10341 8.36049 3.74741 7.87149 4.43441 7.93749C4.95341 7.98649 5.39341 8.32949 5.78941 8.65349C6.02841 8.84849 6.32241 9.22749 6.49941 9.44149C6.66241 9.63749 6.70241 9.71849 6.87641 9.95049C7.10641 10.2575 7.17841 10.4095 7.09041 10.0715C7.01941 9.57549 6.90341 8.72849 6.73541 7.97949C6.60741 7.41149 6.57641 7.32249 6.45441 6.88649C6.32541 6.42249 6.25941 6.09749 6.13841 5.60549C6.05441 5.25749 5.90341 4.54649 5.86241 4.14649C5.80541 3.59949 5.77541 2.70749 6.12641 2.29749C6.40141 1.97649 7.03241 1.87949 7.42341 2.07749C7.93541 2.33649 8.22641 3.08049 8.35941 3.37749C8.59841 3.91149 8.74641 4.52849 8.87541 5.33849C9.03941 6.36949 9.34141 7.80049 9.35141 8.10149C9.37541 7.73249 9.28341 6.95549 9.34741 6.60149C9.40541 6.28049 9.67541 5.90749 10.0134 5.80649C10.2994 5.72149 10.6344 5.69049 10.9294 5.75149C11.2424 5.81549 11.5724 6.03949 11.6954 6.25049C12.0574 6.87449 12.0644 8.14949 12.0794 8.08149C12.1654 7.70549 12.1504 6.85249 12.3634 6.49749C12.5034 6.26349 12.8604 6.05249 13.0504 6.01849C13.3444 5.96649 13.7054 5.95049 14.0144 6.01049C14.2634 6.05949 14.6004 6.35549 14.6914 6.49749C14.9094 6.84149 15.0334 7.81449 15.0704 8.15549C15.0854 8.29649 15.1444 7.76349 15.3634 7.41949C15.7694 6.78049 17.2064 6.65649 17.2614 8.05849C17.2864 8.71249 17.2814 8.68249 17.2814 9.12249C17.2814 9.63949 17.2694 9.95049 17.2414 10.3245C17.2104 10.7245 17.1244 11.6285 16.9994 12.0665C16.9134 12.3675 16.6284 13.0445 16.3474 13.4505C16.3474 13.4505 15.2734 14.7005 15.1564 15.2635C15.0384 15.8255 15.0774 15.8295 15.0544 16.2285C15.0314 16.6265 15.1754 17.1505 15.1754 17.1505C15.1754 17.1505 14.3734 17.2545 13.9414 17.1855C13.5504 17.1225 13.0664 16.3445 12.9414 16.1065C12.7694 15.7785 12.4024 15.8415 12.2594 16.0835C12.0344 16.4665 11.5504 17.1535 11.2084 17.1965C10.5404 17.2805 9.15441 17.2275 8.06941 17.2165C8.06941 17.2165 8.25441 16.2055 7.84241 15.8585C7.53741 15.5995 7.01241 15.0745 6.69841 14.7985L5.86641 13.8775Z"/><path d="M14.1013 14.232V10.773M12.0857 14.2437L12.0697 10.7707M10.0896 10.8023L10.1106 14.2283"/></g>`);
add(text(136, 96, "how tomo works", { size: 44, font: "sans", weight: 520 }));
add(text(138, 128, "one computer for your team and its agents", { size: 17, fill: C.text2 }));

add(
	iso(
		250,
		560,
		2.3,
		[ilaptop([-9, 1]), ilaptop([-5, -3]), ilaptop([-1, -7])].join(""),
	),
);
[62, 220, 380].forEach((x) => add(`<path d="M${x},532 L${x},620 L480,620" fill="none" stroke="${C.accent}" stroke-width="2" class="flow"/>`));
add(`<path d="M480,620 L480,545" fill="none" stroke="${C.accent}" stroke-width="2" class="flow"/>`);
add(text(110, 740, "your team", { size: 26, font: "sans", weight: 560 }));
add(text(110, 770, "in any browser", { size: 17, fill: C.text2 }));
add(logo("react", 110, 790, 30));
add(logo("react-router", 150, 790, 30));
add(logo("vite", 190, 790, 30));
add(logo("tailwind", 230, 790, 30));

add(frame(560, 200, 1300, 780, "Google Cloud VM", { logos: ["google-cloud"], size: 20 }));

add(card(610, 500, 190, 120, { title: "Caddy", sub: "HTTPS · TLS", titleSize: 28 }));

add(card(900, 330, 380, 360, { title: "API server", logos: ["node-js", "hono"], titleSize: 30 }));
const chipsAt = (x: number, y: number, items: [string, "accent" | "ink"][]) =>
	items.forEach(([label, tone], i) => {
		add(card(x, y + i * 70, 320, 52, { depth: 5, tone }));
		add(text(x + 20, y + i * 70 + 34, label, { size: 20, font: "sans", weight: 500, fill: tone === "accent" ? C.accent : C.ink }));
	});
chipsAt(930, 400, [
	["accounts & workspaces", "ink"],
	["live cursors", "accent"],
	["shared terminals", "accent"],
	["co-editing (Yjs)", "accent"],
]);

add(card(940, 800, 300, 110, { title: "SQLite", sub: "users · workspaces", titleSize: 26 }));

add(frame(1380, 260, 440, 680, "one container per workspace", { logos: ["docker"], dash: "8 6", size: 18 }));
add(
	iso(
		1600,
		420,
		1.25,
		[
			ibox([-8, -2, 0], [4, 4, 1]),
			`<g class="float1">${iserver([-7.1, -1.1, 1], [2.2, 2.2, 3])}</g>`,
			ibox([-2, -2, 0], [4, 4, 1], "accent", "accent"),
			`<g class="float2">${iserver([-1.1, -1.1, 1], [2.2, 2.2, 3], "accent")}</g>`,
			ibox([4, -2, 0], [4, 4, 1]),
			`<g class="float3">${iserver([4.9, -1.1, 1], [2.2, 2.2, 3])}</g>`,
		].join(""),
	),
);
const box = [
	["shell", "ink"],
	["shared files", "ink"],
	["codex agent", "agent"],
	["dev servers", "ink"],
] as const;
box.forEach(([label, tone], i) => {
	const y = 560 + i * 86;
	add(card(1430, y, 340, 62, { depth: 5, tone }));
	add(text(1452, y + 40, label, { size: 22, font: "sans", weight: 500, fill: tone === "agent" ? C.agent : C.ink }));
});
add(logo("bash", 1726, 574, 30));
add(logo("openai", 1726, 746, 30));

add(card(1560, 70, 260, 100, { title: "OpenAI", sub: "the agent's brain", tone: "agent", logos: ["openai"], titleSize: 28 }));

add(wire([[480, 545], [610, 545]], "rest", { both: true }));
add(wire([[480, 585], [610, 585]], "ws", { both: true }));
add(pill(545, 520, "HTTPS", "rest"));
add(pill(545, 612, "WebSocket", "ws"));

add(wire([[808, 545], [900, 545]], "rest", { both: true }));
add(wire([[808, 585], [900, 585]], "ws", { both: true }));

add(wire([[1090, 698], [1090, 800]], "rest", { both: true }));

add(wire([[1288, 620], [1430, 620]], "exec", { both: true }));
add(wire([[1288, 660], [1430, 660]], "ws", { both: true }));
add(pill(1334, 596, "docker", "exec"));

add(wire([[1778, 763], [1840, 763], [1840, 220], [1690, 220], [1690, 178]], "agent"));

{
	const lx = 110;
	const ly = 900;
	const items: [Kind, string][] = [
		["rest", "request"],
		["ws", "live stream"],
		["exec", "runs inside"],
		["agent", "agent"],
	];
	items.forEach(([k, label], i) => {
		const y = ly + i * 30;
		add(`<path d="M${lx},${y} L${lx + 60},${y}" class="w w-${k}" marker-end="url(#m-${k})"/>`);
		add(text(lx + 76, y + 5, label, { size: 15, fill: C.text2 }));
	});
}

const style = `
@font-face{font-family:"Geist";src:url(data:font/woff2;base64,${readFileSync(resolve(ROOT, "packages/web/node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2")).toString("base64")}) format("woff2");font-weight:100 900}
@font-face{font-family:"Berkeley Mono";src:url(data:font/woff2;base64,${readFileSync(resolve(ROOT, "packages/web/public/fonts/berkeley-mono-variable.woff2")).toString("base64")}) format("woff2");font-weight:100 900}
.w{fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.w-rest{stroke:${C.ink}}
.w-ws{stroke:${C.accent};stroke-width:2.5;stroke-dasharray:8 6;animation:flow 1s linear infinite}
.w-exec{stroke:${C.ink};stroke-dasharray:1 6;stroke-width:2.6}
.w-disk{stroke:${C.muted};stroke-dasharray:10 6}
.w-agent{stroke:${C.agent};stroke-width:2.5;stroke-dasharray:8 6;animation:flow 1s linear infinite}
.flow{stroke-dasharray:4 4;animation:flowi 1.2s linear infinite}
@keyframes flow{to{stroke-dashoffset:-28}}
@keyframes flowi{to{stroke-dashoffset:-16}}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.4s ease-out infinite}
@keyframes ping{from{transform:scale(1);opacity:.9}to{transform:scale(1.9);opacity:0}}
.pulse{animation:pulse 2s ease-in-out infinite}
@keyframes pulse{50%{opacity:.5}}
.blink{animation:blink 1.6s steps(2) infinite}
@keyframes blink{50%{opacity:0}}
.blinkslow{animation:blink 3s steps(2) infinite}
.float1,.float2,.float3{animation:float 3s ease-in-out infinite}
.float2{animation-delay:.6s}.float3{animation-delay:1.2s}
@keyframes float{50%{transform:translateY(-5px)}}
.drift1{animation:drift1 5s ease-in-out infinite}
.drift2{animation:drift2 6s ease-in-out infinite}
@keyframes drift1{33%{transform:translate(-60px,20px)}66%{transform:translate(40px,-30px)}}
@keyframes drift2{50%{transform:translate(90px,-40px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

const marker = (k: Kind, color: string) =>
	`<marker id="m-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`;

const defs = `<defs>${marker("rest", C.ink)}${marker("ws", C.accent)}${marker("exec", C.ink)}${marker("disk", C.muted)}${marker("agent", C.agent)}</defs>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="tomo architecture"><style>${style}</style>${defs}${out.join("\n")}</svg>`;

writeFileSync(resolve(import.meta.dir, "architecture.svg"), svg);
if (overflow.length) console.warn(`overflow:\n${overflow.join("\n")}`);
console.log(`wrote architecture.svg (${(svg.length / 1024).toFixed(0)} KB)`);
