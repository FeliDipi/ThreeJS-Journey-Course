uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform float uTime;
uniform float uSize;
uniform vec2 uResolution;
uniform sampler2D uParticlesTexture;

attribute vec2 aParticlesUv;
attribute float aSize;

float random(vec2 st, float minVal, float maxVal) {
    return minVal + (maxVal - minVal) * fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec4 particle = texture2D(uParticlesTexture, aParticlesUv);

    float rand = random(aParticlesUv, -0.01, 0.01);

    vec4 modelPosition = modelMatrix * vec4(particle.xyz, 1.0) + vec4(rand);
    modelPosition.x += sin(uTime + modelPosition.y * 0.1) * rand;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / -viewPosition.z);
}
