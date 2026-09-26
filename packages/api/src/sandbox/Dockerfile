FROM mcr.microsoft.com/playwright:v1.63.0-noble

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 python3-pip python3-venv git curl jq ripgrep \
	&& rm -rf /var/lib/apt/lists/*

RUN npm install -g playwright@1.63.0 pnpm \
	&& npm cache clean --force

ENV NODE_PATH=/usr/lib/node_modules \
	PIP_BREAK_SYSTEM_PACKAGES=1 \
	HOME=/workspace

WORKDIR /workspace
USER 1000:1000
CMD ["sleep", "infinity"]
