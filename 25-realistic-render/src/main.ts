import * as THREE from "three";
import GUI from "lil-gui";
import {
  GLTFLoader,
  OrbitControls,
  RGBELoader,
} from "three/examples/jsm/Addons.js";

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

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

const environmentHDRIPath = "textures/environment.jpg";
const environmentLoader = new THREE.TextureLoader();
environmentLoader.load(environmentHDRIPath, function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.backgroundIntensity = 0.5;
  scene.environmentIntensity = 0.5;
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.target.set(0, 0, 0);

const parameters = {};

const modelPath = "model/DamagedHelmet.glb";

const gltfLoader = new GLTFLoader();
gltfLoader.load(modelPath, (gltf) => {
  const model = gltf.scene;

  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(model);
});

const donutMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color(10, 20, 20),
});

const donut0 = new THREE.Mesh(new THREE.TorusGeometry(2, 0.1), donutMaterial);
const donut1 = new THREE.Mesh(
  new THREE.TorusGeometry(1.5, 0.05),
  donutMaterial
);

donut0.castShadow = true;
donut1.castShadow = true;

scene.add(donut0);
scene.add(donut1);

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  type: THREE.HalfFloatType,
});

scene.environment = cubeRenderTarget.texture;

const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);

const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(0, 10, 0);

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;

directionalLight.target.position.set(0, 0, 0);
directionalLight.target.updateMatrixWorld();

scene.add(directionalLight);

//HELPER
// const directionalLightHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera
// );
// scene.add(directionalLightHelper);

gui.add(scene, "environmentIntensity").min(0).max(50).step(0.001);
gui.add(scene, "backgroundIntensity").min(0).max(10).step(0.001);
gui.add(scene, "backgroundBlurriness").min(0).max(1).step(0.001);
gui.add(renderer, "toneMapping", {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
});
gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);
gui
  .add(directionalLight.position, "x")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("lightX");
gui
  .add(directionalLight.position, "y")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("lightY");
gui
  .add(directionalLight.position, "z")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("lightZ");
gui.add(directionalLight.shadow, "normalBias").min(-0.05).max(0.05).step(0.001);
gui.add(directionalLight.shadow, "bias").min(-0.05).max(0.05).step(0.001);

function tick() {
  controls.update();
  cubeCamera.update(renderer, scene);
  renderer.render(scene, camera);

  donut0.rotation.x += 0.01;
  donut0.rotation.y += 0.01;
  donut1.rotation.x -= 0.01;
  donut1.rotation.y -= 0.01;

  window.requestAnimationFrame(tick);
}

tick();
