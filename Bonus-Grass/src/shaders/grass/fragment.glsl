precision mediump float;

varying vec3 vColor;
varying vec2 vUv;

void main() {
    vec3 color = vec3(vUv.x) * vColor;
    gl_FragColor = vec4(color, 1.0);
}