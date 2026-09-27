#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

play_success() { afplay /System/Library/Sounds/Glass.aiff 2>/dev/null || true; }
play_failure() { afplay /System/Library/Sounds/Sosumi.aiff 2>/dev/null || true; }
trap 'play_failure' ERR

if [ ! -f .env.production ]; then
	echo "✗ missing .env.production — copy .env.example and fill in production values"
	exit 1
fi

git fetch origin
git rebase origin/main

CURRENT=$(node -p "require('./package.json').version")
if git rev-parse -q --verify "refs/tags/v$CURRENT" >/dev/null; then
	IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
	NEXT="$MAJOR.$MINOR.$((PATCH + 1))"
else
	NEXT="$CURRENT"
fi

rollback_local() {
	play_failure
	echo "ship failed before deploy — rolling back local v$NEXT"
	git tag -d "v$NEXT" 2>/dev/null || true
	if [ "$(git log -1 --pretty=%s)" = "$NEXT" ]; then
		git reset --hard HEAD~1
	else
		git checkout -- package.json
	fi
}
trap rollback_local ERR

if [ "$NEXT" != "$CURRENT" ]; then
	node -e "
	  const fs = require('fs');
	  const pkg = JSON.parse(fs.readFileSync('package.json'));
	  pkg.version = '$NEXT';
	  fs.writeFileSync('package.json', JSON.stringify(pkg, null, '\t') + '\n');
	"
	git add package.json
	git -c core.hooksPath=/dev/null commit -m "$NEXT"
fi
git tag -a "v$NEXT" -m "v$NEXT"

if [ "${1:-}" = "--check" ]; then
	pnpm exec turbo typecheck lint test
fi

SANDBOX=$(git show "v$NEXT:packages/api/src/sandbox/Dockerfile" "v$NEXT:packages/api/src/sandbox/codex.toml" | shasum | cut -c1-12)
CADDY=$(git show "v$NEXT:infra/Caddyfile" | shasum | cut -c1-12)

REMOTE="set -e
sudo install -d -o 1000 -g 1000 /data/tomo
sudo rm -rf /opt/tomo/src
sudo mkdir -p /opt/tomo/src
sudo tar -x -C /opt/tomo/src
sudo install -m 600 -o root -g root /opt/tomo/src/.env.production /opt/tomo/.env
sudo rm /opt/tomo/src/.env.production
sudo docker image inspect tomo-sandbox:$SANDBOX >/dev/null 2>&1 || sudo docker build -t tomo-sandbox:$SANDBOX /opt/tomo/src/packages/api/src/sandbox
sudo docker tag tomo-sandbox:$SANDBOX tomo-sandbox:latest
cd /opt/tomo/src/infra
sudo VERSION=$NEXT docker compose up -d --build --remove-orphans
grep -qx $CADDY /opt/tomo/caddy.sha 2>/dev/null || { sudo docker compose restart caddy; echo $CADDY | sudo tee /opt/tomo/caddy.sha >/dev/null; }
{
	sudo docker image prune -f >/dev/null
	sudo docker images tomo-api --format '{{.Tag}}' | sort -V | head -n -2 | xargs -r -I{} sudo docker image rm tomo-api:{} >/dev/null
	sudo docker images tomo-sandbox --format '{{.Tag}}' | grep -v -e latest -e $SANDBOX | xargs -r -I{} sudo docker image rm tomo-sandbox:{} >/dev/null
	sudo docker builder prune -f --keep-storage 3gb >/dev/null
	df -h / | tail -1
} || echo '⚠ server cleanup failed (deploy is fine)'"

git archive --format=tar --add-file=.env.production "v$NEXT" \
	| gcloud compute ssh tomo --tunnel-through-iap --quiet --command "$REMOTE"

trap - ERR

if ! git push --atomic --follow-tags; then
	play_failure
	echo
	echo "✗ deploy succeeded at v$NEXT but git push failed"
	echo "  retry with: git push --atomic --follow-tags"
	exit 1
fi

play_success
echo "✓ v$NEXT is live at https://tomo.computer"
