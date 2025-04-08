uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform float uSize;
uniform vec2 uResolution;
uniform sampler2D uParticlesTexture;

attribute vec2 aParticlesUv;
attribute float aSize;

varying vec3 vColor;
varying vec2 vUv;

void main() {
    vec4 particle = texture2D(uParticlesTexture, aParticlesUv);

    vec4 modelPosition = modelMatrix * vec4(particle.xyz, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / -viewPosition.z);

    vColor = vec3(0.5, 1.0, 0.5);
    vUv = aParticlesUv;
}
