FROM mcr.microsoft.com/playwright:v1.63.0-noble

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 python3-pip python3-venv git curl jq ripgrep \
	&& rm -rf /var/lib/apt/lists/*

RUN npm install -g playwright@1.63.0 pnpm @openai/codex@0.157.1 \
	&& npm cache clean --force

COPY codex.toml /opt/codex/config.toml
RUN chown -R 1000:1000 /opt/codex

ENV NODE_PATH=/usr/lib/node_modules \
	PIP_BREAK_SYSTEM_PACKAGES=1 \
	HOME=/workspace \
	CODEX_HOME=/opt/codex

WORKDIR /workspace
USER 1000:1000
CMD ["sleep", "infinity"]
