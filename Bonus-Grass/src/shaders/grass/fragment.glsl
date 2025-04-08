precision mediump float;

uniform sampler2D uTexture;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_PointCoord;

    float cellSize = 0.5;
    vec2 cellIndex = floor(uv / cellSize);
    vec2 localUV = mod(uv, cellSize) / cellSize;

    float offsetAmount = 0.05;
    vec2 offset = (random(cellIndex) - vec2(0.5)) * offsetAmount;

    vec2 rotatedUV = vec2(1.0 - localUV.x, 1.0 - localUV.y) + offset;

    if(rotatedUV.x < 0.0 || rotatedUV.x > 1.0 || rotatedUV.y < 0.0 || rotatedUV.y > 1.0)
        discard;

    vec4 texColor = texture2D(uTexture, rotatedUV);

    float strength = 1.0 - max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0;
    vec4 strengthColor = vec4(strength, strength, strength, strength);

    if(texColor.a < 0.1 || strengthColor.a < 0.1)
        discard;

    gl_FragColor = texColor * strengthColor;
}
