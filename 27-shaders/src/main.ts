import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import fragment from "./shaders/rigging_sea/fragment.glsl?raw";
import vertex from "./shaders/rigging_sea/vertex.glsl?raw";

const gui = new GUI({ width: 360 });

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 2);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

const uniformsWave = {
  uTime: { value: 0 },
  uFrecuency: { value: 5.0 },
  uAmplitude: { value: 0.05 },
  uDepthColor: { value: new THREE.Color("#66b0ff") },
  uSurfaceColor: { value: new THREE.Color("#FFFFFF") },
};

const material = new THREE.RawShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: uniformsWave,
  side: THREE.DoubleSide,
});

const geometry = new THREE.PlaneGeometry(2, 2, 512, 512);
const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
  randoms[i] = Math.random();
}

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;

scene.add(plane);

gui.add(material.uniforms.uFrecuency, "value", 0, 100, 0.1).name("uFrecuency");
gui.add(material.uniforms.uAmplitude, "value", 0, 1, 0.01).name("uAmplitude");
gui
  .addColor(material.uniforms.uDepthColor, "value")
  .name("uDepthColor")
  .onChange(() => {
    material.uniforms.uDepthColor.value.set(
      material.uniforms.uDepthColor.value
    );
  });
gui
  .addColor(material.uniforms.uSurfaceColor, "value")
  .name("uSurfaceColor")
  .onChange(() => {
    material.uniforms.uSurfaceColor.value.set(
      material.uniforms.uSurfaceColor.value
    );
  });

const clock = new THREE.Clock();

function tick() {
  controls.update();
  renderer.render(scene, camera);

  const elapsedTime = clock.getElapsedTime();

  if (material.uniforms.uTime) {
    material.uniforms.uTime.value = elapsedTime;
  }

  window.requestAnimationFrame(tick);
}

tick();
