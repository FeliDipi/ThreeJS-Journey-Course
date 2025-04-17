precision mediump float;

varying vec2 vUv;

uniform float uStep;

void main() {
    // float repeat = 10.0;

    // float barX = step(uStep, mod(vUv.x * repeat, 1.0));
    // barX *= step(uStep * 2.0, mod(vUv.y * repeat + uStep * 0.5, 1.0));

    // float barY = step(uStep * 2.0, mod(vUv.x * repeat + uStep * 0.5, 1.0));
    // barY *= step(uStep, mod(vUv.y * repeat, 1.0));

    // float strength = barX + barY;

    float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
    strength = step(uStep, strength);

    vec3 color = vec3(strength, strength, strength);

    gl_FragColor = vec4(color, 1.0);
}