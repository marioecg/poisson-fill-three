attribute vec4 position;

attribute vec3 modelMatrix;

varying vec2 vWorldPos;
  
void main() {
    gl_Position = position;
}