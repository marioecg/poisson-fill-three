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

  // create a group with 20 circle geometry meshes and different color materials that rotate over time
  let group = new THREE.Group();

  let count = 20;
  let radius = 2.5;
  for (let i = 0;i < count;i++) {
    let geometry = new THREE.CircleGeometry(0.25, 32);
    let material = new THREE.MeshBasicMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) });
    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = Math.cos(i / (count - 1) * Math.PI * 2) * radius;
    mesh.position.y = Math.sin(i / (count - 1) * Math.PI * 2) * radius;

    group.add(mesh);
  }
  scene.add(group);

  camera.position.z = 5;

  renderer.render(scene, camera);

  sceneUpdater = function (t) {
    // animate the group rotation

    group.children.forEach((mesh, i) => {
      mesh.position.x = Math.cos(i / (count - 1) * Math.PI * 2 -t * 0.005) * radius;
      mesh.position.y = Math.sin(i / (count - 1) * Math.PI * 2 -t * 0.005) * radius * 0.0;      
    });

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