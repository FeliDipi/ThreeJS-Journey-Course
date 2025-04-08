import * as THREE from "three";
import GUI from "lil-gui";
import {
  DRACOLoader,
  GLTFLoader,
  OrbitControls,
} from "three/examples/jsm/Addons.js";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";
import fragment from "./shaders/grass/fragment.glsl?raw";
import vertex from "./shaders/grass/vertex.glsl?raw";
import gpgpuParticlesShader from "./shaders/gpgpu/particles.glsl?raw";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const gui = new GUI({ width: 360 });

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

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

const modelPath = "models/test.glb";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
);

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

const model = await gltfLoader.loadAsync(modelPath);

const baseGeometry: any = {};
baseGeometry.instance = model.scene.children[0].geometry;
baseGeometry.count = baseGeometry.instance.attributes.position.count;

const gpgpu: any = {};
gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count));
gpgpu.computation = new GPUComputationRenderer(
  gpgpu.size,
  gpgpu.size,
  renderer
);

const baseParticlesTexture = gpgpu.computation.createTexture();

for (let i = 0; i < baseGeometry.count; i++) {
  const i3 = i * 3;
  const i4 = i * 4;

  baseParticlesTexture.image.data[i4 + 0] =
    baseGeometry.instance.attributes.position.array[i3 + 0];
  baseParticlesTexture.image.data[i4 + 1] =
    baseGeometry.instance.attributes.position.array[i3 + 1];
  baseParticlesTexture.image.data[i4 + 2] =
    baseGeometry.instance.attributes.position.array[i3 + 2];
  baseParticlesTexture.image.data[i4 + 3] = 0;
}

gpgpu.particlesVariable = gpgpu.computation.addVariable(
  "uParticles",
  gpgpuParticlesShader,
  baseParticlesTexture
);
gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
  gpgpu.particlesVariable,
]);

gpgpu.computation.init();

gpgpu.debug = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 3),
  new THREE.MeshBasicMaterial({
    map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable)
      .texture,
  })
);
gpgpu.debug.position.set(0, 0, -1);

scene.add(gpgpu.debug);

const particles: any = {};

const particlesUvArray = new Float32Array(baseGeometry.count * 2);
const sizesArray = new Float32Array(baseGeometry.count);

for (let y = 0; y < gpgpu.size; y++) {
  for (let x = 0; x < gpgpu.size; x++) {
    const i = y * gpgpu.size + x;
    const i2 = i * 2;

    const uvX = (x + 0.5) / gpgpu.size;
    const uvY = (y + 0.5) / gpgpu.size;

    particlesUvArray[i2 + 0] = uvX;
    particlesUvArray[i2 + 1] = uvY;

    sizesArray[i] = Math.random() + 1.0 * 0.5;
  }
}

particles.geometry = new THREE.BufferGeometry();
particles.geometry.setDrawRange(0, baseGeometry.count);
particles.geometry.setAttribute(
  "aParticlesUv",
  new THREE.BufferAttribute(particlesUvArray, 2)
);
particles.geometry.setAttribute(
  "aSize",
  new THREE.BufferAttribute(sizesArray, 1)
);

particles.uniforms = {
  uSize: new THREE.Uniform(0.05),
  uResolution: new THREE.Uniform(
    new THREE.Vector2(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    )
  ),
  uParticlesTexture: new THREE.Uniform(),
};

particles.material = new THREE.RawShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: particles.uniforms,
});

particles.point = new THREE.Points(particles.geometry, particles.material);

scene.add(particles.point);

gui.add(particles.uniforms.uSize, "value", 0.01, 0.5, 0.001).name("size");
gui
  .add(
    particles.uniforms.uResolution.value,
    "x",
    0,
    sizes.width * sizes.pixelRatio,
    0.001
  )
  .name("resX");
gui
  .add(
    particles.uniforms.uResolution.value,
    "y",
    0,
    sizes.height * sizes.pixelRatio,
    0.001
  )
  .name("resY");

function tick() {
  controls.update();

  gpgpu.computation.compute();

  particles.material.uniforms.uParticlesTexture.value =
    gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture;

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
}

tick();
