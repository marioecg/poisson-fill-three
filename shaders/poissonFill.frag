uniform sampler2D unf;
uniform sampler2D fil;
uniform int w;
uniform int h;
uniform bool isup;

#include "lygia/morphological/poissonFill.glsl"

varying vec2 vUv;

void main() {
  vec2 pixel = 1.0 / vec2(float(w), float(h));

  gl_FragColor = poissonFill(unf, fil, vUv, pixel, isup);
}