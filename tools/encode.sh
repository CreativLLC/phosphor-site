#!/usr/bin/env bash
# Re-encode the trailer and demo clips for the web. Sources stay where they are (read only).
# Run heavy: systemd-run --user --scope -q -p MemoryMax=6G -p MemorySwapMax=0 -- bash tools/encode.sh [names...]
# All crops are in source pixels (the captures are 3840x2160 at deviceScaleFactor 2; the phone is 1170x2532).
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=${SRC:-$HOME/phosphor-site/trailer}
C=$SRC/public/clips
O=public/media
mkdir -p "$O"
X="-c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -an -threads 6"
want() { [ $# -eq 0 ] || [[ " $ONLY " == *" $1 "* ]]; }
ONLY="${*:-}"

# clip NAME SRC VF CRF POSTER_AT [HOLD] [XFADE] [END]
#   HOLD: seconds to rest on the last frame, so short UI clips stop looping every 3 to 5 s.
#   XFADE: the end dissolves back into the start, so the loop point is a soft fade, not a jump.
#   END: cut the source here first (the launcher stops while every result is still on screen).
clip() {
  local n=$1 s=$2 vf=$3 crf=$4 at=$5 hold=${6:-0} xf=${7:-0} end=${8:-}
  want "$n" || return 0
  local d f
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$C/$s.mp4")
  if [ -n "$end" ]; then d=$end; vf="trim=0:$end,setpts=PTS-STARTPTS,$vf"; fi
  if [ "$xf" != 0 ]; then
    # length after the hold, minus the head that is used for the crossfade
    local L off
    L=$(awk "BEGIN{print $d + $hold}")
    off=$(awk "BEGIN{print $L - 2 * $xf}")
    f="[0:v]$vf,tpad=stop_mode=clone:stop_duration=$hold,split[a][b];[a]trim=start=$xf,setpts=PTS-STARTPTS[m];[b]trim=0:$xf,setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=$xf:offset=$off,format=yuv420p"
    ffmpeg -v error -y -i "$C/$s.mp4" -filter_complex "$f" $X -crf "$crf" -g 60 "$O/$n.mp4"
  else
    ffmpeg -v error -y -i "$C/$s.mp4" -vf "$vf,tpad=stop_mode=clone:stop_duration=$hold" $X -crf "$crf" -g 60 "$O/$n.mp4"
  fi
  ffmpeg -v error -y -ss "$at" -i "$C/$s.mp4" -frames:v 1 -vf "$vf" -c:v libwebp -quality "${Q:-74}" "$O/$n.webp"
  echo "$n $(du -h "$O/$n.mp4" | cut -f1) $(du -h "$O/$n.webp" | cut -f1)"
}

# Hero monitor: the WHOLE app (tabs, crew, chat, mission panel; 16:9) at 2560 px, sharp enough for the scroll punch-in.
clip hero      hero2    "scale=2560:-2:flags=lanczos"                            25 6.2 1.6 0.5
# Phones get the whole app at 1280 px; a tap swaps in hero-zoom (the mission panel alone, 4:5) so it is readable.
clip hero-m    hero2    "scale=1280:-2:flags=lanczos"                            27 6.2 1.6 0.5
clip hero-zoom hero2    "crop=1004:1255:2836:96,scale=800:-2:flags=lanczos"      24 6.2 1.6 0.5
# Just ask, the real capture: the chat column where "make my clock 12-hour" is typed and done (1:1 pixels).
clip ask       ask      "crop=1360:720:850:120,scale=1360:-2:flags=lanczos"      24 4.8 2.6 0.4
# The whole OS reel.
clip saver     saver    "scale=1280:-2:flags=lanczos"                            28 2 1.5 0.5
clip launcher  launcher "crop=2310:1300:750:30,scale=1100:-2:flags=lanczos"      26 0.98 3.8 0.4 1.02
clip calendar  calendar "crop=2200:1600:820:260,scale=1000:-2:flags=lanczos"     26 2.4 2.2 0.4
clip sys       sys      "crop=1020:2130:2820:30,scale=480:-2:flags=lanczos"      27 3 1.5 0.4
clip docs      docs     "crop=2000:1125:1000:150,scale=1100:-2:flags=lanczos"     26 2.6 2.6 0.4
clip dictate   dictate  "crop=2000:700:836:1460,scale=1100:-2:flags=lanczos"     26 2.8 2.2 0.4
clip phone     phone    "scale=480:-2:flags=lanczos"                             27 4.5 1.2 0.4

# Trailer: full 45 s, 1080p H.264 with audio (music licence allows use in video). VP9 WebM came out the same size
# (11.9 MB vs 11.7 MB) so it is off by default: WEBM=1 to build it anyway.
if want trailer; then
  T=$SRC/out/phosphor-trailer.mp4
  ffmpeg -v error -y -i "$T" -c:v libx264 -preset slow -crf ${TCRF:-27} -profile:v high -pix_fmt yuv420p -g 60 \
    -movflags +faststart -threads 6 -c:a aac -b:a 128k "$O/trailer.mp4"
  ffmpeg -v error -y -ss 16.5 -i "$T" -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -quality 74 "$O/trailer.webp"
  if [ "${WEBM:-0}" = 1 ]; then
    ffmpeg -v error -y -i "$T" -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -threads 6 \
      -c:a libopus -b:a 96k "$O/trailer.webm"
  fi
fi
ls -la "$O"
