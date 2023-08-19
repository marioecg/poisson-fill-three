import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { PoissonFill } from './PoissonFill';

import baseVert from './shaders/base.vert';
import copyFrag from './shaders/copy.frag';

class Sketch {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer();
    this.pixelDensity = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(this.pixelDensity);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.z = 5;

    this.scene = new THREE.Scene();

    this.canvas = null;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    this.addCanvas();
    this.addEvents();
    this.addElements();
    this.addPost();
  }

  addCanvas() {
    this.canvas = this.renderer.domElement;
    this.canvas.classList.add('webgl');
    document.body.appendChild(this.canvas);
  }

  addEvents() {
    this.renderer.setAnimationLoop(this.render.bind(this))
    window.addEventListener('resize', this.resize.bind(this));
  }

  addElements() {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshNormalMaterial();

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.set(Math.PI * 0.25, Math.PI * 0.25, 0);
    this.scene.add(this.mesh)

    // Set up poisson fill
    this.pf = new PoissonFill(this.renderer);

    let width = window.innerWidth;
    let height = window.innerHeight;
    this.pf.init(width, height);
  }

  addPost() {
    this.ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.framebuffer = new THREE.WebGLRenderTarget(window.innerWidth * this.pixelDensity, window.innerHeight * this.pixelDensity, {
      samples: 8
    });
    
    let geometry = new THREE.PlaneGeometry(2, 2);
    let material = new THREE.ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: copyFrag,
      uniforms: {
        tDiffuse: { value: null },
      },
    });

    this.quad = new THREE.Mesh(geometry, material);
  }

  resize() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    this.camera.aspect = width / height;
    this.renderer.setSize(width, height);

    this.camera.updateProjectionMatrix();
  }

  render() {
    let t = this.clock.getElapsedTime();

    // this.mesh.rotation.set(t, t, t);

    this.renderer.setRenderTarget(this.framebuffer);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    this.pf.process(this.framebuffer.texture);
    this.quad.material.uniforms.tDiffuse.value = this.pf.getTexture();
    
    this.renderer.render(this.quad, this.ortho);
  }
}

new Sketch();