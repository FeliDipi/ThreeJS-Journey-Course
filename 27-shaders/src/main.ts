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
camera.position.set(0, 4, 3);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

const parameters = {};

const material = new THREE.RawShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTime: {
      value: 0,
    },
  },
});

const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
  randoms[i] = Math.random();
}

geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

const plane = new THREE.Mesh(geometry, material);

scene.add(plane);

const clock = new THREE.Clock();

function tick() {
  controls.update();
  renderer.render(scene, camera);

  const elapsedTime = clock.getElapsedTime();

  material.uniforms.uTime.value = elapsedTime;

  window.requestAnimationFrame(tick);
}

tick();
