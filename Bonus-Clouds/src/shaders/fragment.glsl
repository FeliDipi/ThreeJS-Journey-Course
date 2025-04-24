precision mediump float;

uniform float uAlphaClipping;

varying float vElevation;

void main() {
    if(vElevation < uAlphaClipping) {
        discard;
    }

    gl_FragColor = vec4(vElevation);
}
