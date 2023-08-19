uniform bool upscale;

uniform vec2 resolution;

uniform sampler2D unf;
uniform sampler2D fil;

#include "lygia/morphological/poissonFill.glsl"

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 pixel = 1.0 / resolution;

  gl_FragColor = poissonFill(unf, fil, uv, pixel, upscale);
}