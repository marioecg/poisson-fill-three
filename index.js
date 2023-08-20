import * as THREE from 'three';
import { PoissonFill } from './PoissonFill';

let WIDTH = 256;
let HEIGHT = 256;

let sceneUpdater = function (t) { };

function testScene() {
  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

  let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setClearColor(0xffffff, 0);
  document.body.appendChild(renderer.domElement);

  let boxGeometry = new THREE.BoxGeometry();
  let material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  let mesh1 = new THREE.Mesh(boxGeometry, material1);
  mesh1.scale.y = 2;
  scene.add(mesh1);

  let material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  let mesh2 = new THREE.Mesh(boxGeometry, material2);
  mesh2.position.x += 2;
  scene.add(mesh2);

  let sphereGeometry = new THREE.SphereGeometry();
  let material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  let mesh3 = new THREE.Mesh(sphereGeometry, material3);
  mesh3.position.y += 2.5;
  mesh3.position.x -= 2.5;
  mesh3.scale.x = 0.5;
  mesh3.scale.y = 0.5;
  mesh3.scale.z = 0.5;
  scene.add(mesh3);

  let material4 = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  let mesh4 = new THREE.Mesh(boxGeometry, material4);
  mesh4.position.x -= 1;
  scene.add(mesh4);

  camera.position.z = 5;

  renderer.render(scene, camera);

  sceneUpdater = function (t) {
    mesh4.position.y = Math.sin(t * 0.1) * 3;
    mesh2.position.x = 2 + Math.sin(t * 0.1) * 2.5;
    renderer.render(scene, camera);
  };

  return renderer.domElement;
}

let pf = new PoissonFill(WIDTH, HEIGHT);

let inp = testScene();
let tex = new THREE.CanvasTexture(inp);
tex.premultipliedAlpha = true;

let t = 0;
function run() {
  requestAnimationFrame(run);
  sceneUpdater(t);
  pf.process(tex);
  t++;
}

run();
document.body.appendChild(pf.getDom());