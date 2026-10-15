#!/usr/bin/env bash
# Re-encode the trailer and demo clips for the web. Sources stay where they are (read only).
# Run heavy: systemd-run --user --scope -q -p MemoryMax=6G -p MemorySwapMax=0 -- bash tools/encode.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=${SRC:-$HOME/phosphor-site/trailer}
C=$SRC/public/clips
O=public/media
mkdir -p "$O"
X="-c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -an -threads 6"
clip() { # name src vf crf [ss] [t]
  local n=$1 s=$2 vf=$3 crf=$4
  ffmpeg -v error -y -i "$C/$s.mp4" -vf "$vf" $X -crf "$crf" -g 60 "$O/$n.mp4"
  ffmpeg -v error -y -ss "${5:-1}" -i "$C/$s.mp4" -frames:v 1 -vf "$vf" -c:v libwebp -quality 72 "$O/$n.webp"
}
clip hero      hero2    "scale=1280:-2:flags=lanczos"                       23 6
clip saver     saver    "scale=1280:-2:flags=lanczos"                       28 2
clip launcher  launcher "crop=2310:1300:750:30,scale=960:-2:flags=lanczos"  27 2.5
clip calendar  calendar "crop=2200:1600:820:260,scale=960:-2:flags=lanczos" 27 2
clip sys       sys      "crop=1020:2130:2820:30,scale=480:-2:flags=lanczos" 27 3
clip phone     phone    "scale=480:-2:flags=lanczos"                        27 4.5
# Trailer: full 45 s, 1080p H.264 with audio (music licence allows use in video). VP9 WebM came out the same size
# (11.9 MB vs 11.7 MB) so it is off by default: WEBM=1 to build it anyway.
T=$SRC/out/phosphor-trailer.mp4
ffmpeg -v error -y -i "$T" -c:v libx264 -preset slow -crf ${TCRF:-27} -profile:v high -pix_fmt yuv420p -g 60 \
  -movflags +faststart -threads 6 -c:a aac -b:a 128k "$O/trailer.mp4"
ffmpeg -v error -y -ss 16.5 -i "$T" -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -quality 74 "$O/trailer.webp"
if [ "${WEBM:-0}" = 1 ]; then
  ffmpeg -v error -y -i "$T" -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -threads 6 \
    -c:a libopus -b:a 96k "$O/trailer.webm"
fi
ls -la "$O"
