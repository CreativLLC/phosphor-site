// One small WebGL2 CRT: a <video> goes through two passes.
//  1. phosphor pass (offscreen, flat): chromatic split + bloom from the video's own mipmaps, and
//     persistence: each pixel keeps max(new, previous * decay), so bright text leaves a short afterglow.
//  2. tube pass (to the canvas): barrel curvature, scanlines and an aperture mask in device pixels
//     (no moire at fractional DPR), vignette, a slow rolling band, grain, and the power-on squeeze.
// Written for this site (MIT); no shader code copied from elsewhere. Falls back to plain <video> + CSS
// when WebGL2 or any step fails (the caller keeps the video visible until ok === true).

const VS = `#version 300 es
in vec2 p; out vec2 uv;
void main(){ uv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

const FS_PHOSPHOR = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D vid, prev;
uniform vec2 res, vsize;
uniform float chroma, bloom, decay;
vec2 cover(vec2 u){
  float ra = res.x / res.y, va = vsize.x / vsize.y;
  vec2 s = ra > va ? vec2(1., va / ra) : vec2(ra / va, 1.);
  return (u - .5) * s + .5;
}
void main(){
  vec2 v = cover(vec2(uv.x, 1. - uv.y));
  float c = chroma / res.x;
  vec3 col = vec3(texture(vid, v + vec2(c, 0.)).r, texture(vid, v).g, texture(vid, v - vec2(c, 0.)).b);
  vec3 b1 = textureLod(vid, v, 2.5).rgb, b2 = textureLod(vid, v, 4.5).rgb;
  vec3 bl = b1 * .55 + b2 * .45;
  col += bl * bl * bloom;
  vec3 p = texture(prev, uv).rgb;
  o = vec4(max(col, p * decay), 1.);
}`;

const FS_TUBE = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D img;
uniform vec2 res;
uniform float t, curve, scan, mask, grain, power, flick, dpr;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main(){
  vec2 c = uv * 2. - 1.;
  c *= 1. + curve * vec2(c.y * c.y, c.x * c.x);
  // power-on: the picture opens from a bright horizontal line
  float sy = mix(.004, 1., smoothstep(.0, .55, power));
  float sx = mix(.2, 1., smoothstep(.0, .25, power));
  vec2 pc = c / vec2(sx, sy);
  vec2 u = pc * .5 + .5;
  if (u.x < 0. || u.x > 1. || u.y < 0. || u.y > 1.) { o = vec4(0., 0., 0., 1.); return; }
  vec3 col = texture(img, u).rgb;
  // scanlines: one dark gap every 3 device pixels
  float y = gl_FragCoord.y;
  float sl = .5 + .5 * cos(6.28318 * y / (3. * max(1., dpr * .75)));
  col *= 1. - scan * sl;
  // aperture grille: faint vertical RGB triads, kept amber-warm
  float m = mod(gl_FragCoord.x, 3.);
  vec3 tri = m < 1. ? vec3(1., .82, .78) : m < 2. ? vec3(.85, 1., .82) : vec3(.86, .84, 1.);
  col *= mix(vec3(1.), tri, mask);
  // vignette + rounded tube corners
  vec2 d = abs(c);
  float vig = smoothstep(1.35, .35, length(c * vec2(.92, 1.04)));
  float corner = 1. - smoothstep(.94, 1., max(d.x, d.y) + .06 * pow(min(d.x, d.y), 6.));
  col *= mix(.7, 1.12, vig) * corner;
  // slow rolling band
  float band = smoothstep(.0, .12, fract(u.y * .7 - t * .07)) * (1. - smoothstep(.12, .24, fract(u.y * .7 - t * .07)));
  col += vec3(1., .69, .2) * band * .025;
  // grain
  col += (hash(gl_FragCoord.xy + fract(t * 7.3) * 91.) - .5) * grain;
  // the power-on line flashes bright
  col += vec3(1., .85, .6) * (1. - smoothstep(.2, .6, power)) * step(abs(pc.y), 1.) * .6;
  o = vec4(col * flick, 1.);
}`;

function sh(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
  return s;
}
function prog(gl, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl, gl.VERTEX_SHADER, VS));
  gl.attachShader(p, sh(gl, gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, 'p');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
  return { p, u };
}
function tex(gl, mip) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

export function createCRT(canvas, video, opt = {}) {
  const o = { curve: 0.06, scan: 0.34, mask: 0.18, grain: 0.035, chroma: 1.4, bloom: 0.9, decay: 0.82, fps: 30, maxDpr: 1.5, ...opt };
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'default' });
  if (!gl) return null;
  let A, B;
  try { A = prog(gl, FS_PHOSPHOR); B = prog(gl, FS_TUBE); } catch (err) { console.warn('[crt] shader failed, using CSS fallback', err); return null; }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const vtex = tex(gl, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  const fb = [0, 1].map(() => ({ t: tex(gl, false), f: gl.createFramebuffer() }));
  let w = 0, h = 0, dpr = 1, cur = 0, raf = 0, last = 0, t0 = performance.now(), running = false, hasFrame = false, power = opt.power ?? 1, flick = 1;
  let dirty = true;

  function size() {
    dpr = Math.min(devicePixelRatio || 1, o.maxDpr);
    const r = canvas.getBoundingClientRect();
    const nw = Math.max(2, Math.round(r.width * dpr)), nh = Math.max(2, Math.round(r.height * dpr));
    if (nw === w && nh === h) return;
    w = canvas.width = nw; h = canvas.height = nh;
    for (const b of fb) {
      gl.bindTexture(gl.TEXTURE_2D, b.t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, b.f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, b.t, 0);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { size(); dirty = true; }) : null;
  ro?.observe(canvas);
  size();

  function upload() {
    if (video.readyState < 2) return;
    gl.bindTexture(gl.TEXTURE_2D, vtex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.generateMipmap(gl.TEXTURE_2D);
    hasFrame = true;
  }

  function draw(now) {
    const t = (now - t0) / 1000;
    if (!video.paused || dirty || !hasFrame) upload();
    dirty = false;
    const src = fb[cur], dst = fb[1 - cur];
    // pass 1: phosphor
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f);
    gl.viewport(0, 0, w, h);
    gl.useProgram(A.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, vtex); gl.uniform1i(A.u.vid, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, src.t); gl.uniform1i(A.u.prev, 1);
    gl.uniform2f(A.u.res, w, h);
    gl.uniform2f(A.u.vsize, video.videoWidth || 16, video.videoHeight || 9);
    gl.uniform1f(A.u.chroma, o.chroma * dpr);
    gl.uniform1f(A.u.bloom, o.bloom);
    gl.uniform1f(A.u.decay, video.paused ? 0 : o.decay);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // pass 2: tube
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(B.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, dst.t); gl.uniform1i(B.u.img, 0);
    gl.uniform2f(B.u.res, w, h);
    gl.uniform1f(B.u.t, t);
    gl.uniform1f(B.u.curve, o.curve);
    gl.uniform1f(B.u.scan, o.scan);
    gl.uniform1f(B.u.mask, o.mask);
    gl.uniform1f(B.u.grain, o.grain);
    gl.uniform1f(B.u.power, power);
    gl.uniform1f(B.u.flick, flick);
    gl.uniform1f(B.u.dpr, dpr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    cur = 1 - cur;
  }

  function loop(now) {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (now - last < 1000 / o.fps - 2) return;
    last = now;
    draw(now);
  }

  gl.canvas.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); api.lost = true; api.stop(); opt.onLost?.(); });

  const api = {
    ok: true,
    lost: false,
    get hasFrame() { return hasFrame; },
    start() { if (running || api.lost) return; running = true; raf = requestAnimationFrame(loop); },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
    once() { if (!api.lost) { dirty = true; draw(performance.now()); } },
    set(k, v) { o[k] = v; dirty = true; },
    power(v) { power = v; },
    flicker(v) { flick = v; },
    // power-on sweep over ms
    powerOn(ms = 700) {
      const s = performance.now();
      const step = (n) => { const p = Math.min(1, (n - s) / ms); power = p; if (!running) draw(n); if (p < 1) requestAnimationFrame(step); };
      power = 0; requestAnimationFrame(step);
    },
    destroy() { api.stop(); ro?.disconnect(); gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
  return api;
}

export function canGL() {
  try {
    const c = document.createElement('canvas');
    const g = c.getContext('webgl2');
    const ok = !!g;
    g?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch { return false; }
}
