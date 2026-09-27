#!/usr/bin/env bash
set -euo pipefail

REMOTE='
section() { printf "\n\033[1m== %s ==\033[0m\n" "$1"; }
section host
echo "$(hostname) · $(. /etc/os-release && echo "$PRETTY_NAME") · kernel $(uname -r)"
uptime
section cpu
echo "$(nproc) vCPU"
top -bn1 | sed -n "3p"
section memory
free -h
section disk
df -h -x tmpfs -x devtmpfs -x overlay -x squashfs -x efivarfs
section "disk io"
cat /proc/pressure/io 2>/dev/null || true
section "memory pressure"
cat /proc/pressure/memory 2>/dev/null || true
section containers
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
section "container usage"
sudo docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
section "docker disk"
sudo docker system df
section "/data/tomo"
sudo du -sh /data/tomo/* 2>/dev/null | sort -h | tail -10
section "top processes (mem)"
ps -eo pid,user,%cpu,%mem,rss,comm --sort=-%mem | head -8
section "failed units"
systemctl --failed --no-legend || true
section "recent oom kills"
OOM=$(sudo journalctl -k --since "7 days ago" --no-pager -q | grep -i "out of memory" | tail -5)
echo "${OOM:-none}"
'

gcloud compute ssh tomo --tunnel-through-iap --quiet --command "$REMOTE" </dev/null
