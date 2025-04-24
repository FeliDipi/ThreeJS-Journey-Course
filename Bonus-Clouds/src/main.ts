import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import fragment from "./shaders/fragment.glsl?raw";
import vertex from "./shaders/vertex.glsl?raw";

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
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

const uniforms = {
  uTime: { value: 0 },
  uTimeScale: { value: 2.0 },
  uScale: { value: 10 },
  uAlphaClipping: { value: 0.75 },
  uElevationScale: { value: 0.4 },
};

const material = new THREE.RawShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  side: THREE.DoubleSide,
});

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100);

const clouds = new THREE.Mesh(geometry, material);
clouds.rotation.x = -Math.PI / 2;

scene.add(clouds);

gui
  .add(material.uniforms.uTimeScale, "value")
  .min(0)
  .max(100)
  .step(0.1)
  .name("Time Scale");
gui
  .add(material.uniforms.uScale, "value")
  .min(0)
  .max(100)
  .step(0.1)
  .name("Scale");
gui
  .add(material.uniforms.uAlphaClipping, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Alpha Clipping");
gui
  .add(material.uniforms.uElevationScale, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Elevation Scale");

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
