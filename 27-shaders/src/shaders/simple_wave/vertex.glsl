uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform float uTime;
uniform float uTimeScale;
uniform float uFrecuency;
uniform float uAmplitude;
uniform vec2 uDirection;

attribute vec3 position;
attribute float aRandom;

varying float vRandom;

void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.z += sin(modelPosition.x * uFrecuency + uTime * uTimeScale) * uAmplitude * uDirection.x;
    modelPosition.x += sin(modelPosition.y * uFrecuency + uTime * uTimeScale) * uAmplitude * uDirection.y;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vRandom = modelPosition.z * uFrecuency * 0.5;
}
