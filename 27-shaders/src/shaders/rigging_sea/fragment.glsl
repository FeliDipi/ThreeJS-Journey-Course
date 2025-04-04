precision mediump float;

varying float vElevation;

uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;

void main() {
    vec3 color = mix(uDepthColor, uSurfaceColor, vElevation * 5.0 + 0.5);

    gl_FragColor = vec4(color, 1.0);
}