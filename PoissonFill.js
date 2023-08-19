import * as THREE from 'three';

import baseVert from './shaders/base.vert';
import poissonFillFrag from './shaders/poissonFill.frag';

let geometry = new THREE.PlaneGeometry(2, 2);
let camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const PYRAMID_MAX_LAYERS = 12;

class PoissonFill {
    constructor(renderer) {
        this.renderer = renderer;

        this.width = null;
        this.height = null;
        this.depth = null;

        this.downs = [];
        this.ups = [];

        this.shader1 = this.createShader();
        this.shader2 = this.createShader();

        this.mesh = new THREE.Mesh(geometry, this.shader1);
    }

    init(width, height) {
        this.width = width;
        this.height = height;
        this.depth = Math.log2(Math.min(width, height)) - 1;
        this.depth = Math.min(PYRAMID_MAX_LAYERS, this.depth); 

        let w = width;
        let h = height;

        for (let i = 0; i < this.depth; i++) {
            w *= 0.5;
            h *= 0.5;

            let downTexture = new THREE.WebGLRenderTarget(w, h, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat,
            });

            this.downs[i] = downTexture;
        }

        for (let i = 0; i < this.depth; i++) {
            w *= 2.0;
            h *= 2.0;
            
            let upTexture = new THREE.WebGLRenderTarget(w, h, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat,
            });

            this.ups[i] = upTexture;
        }        
    }

    process(texture) {
        this.pass(this.shader1, this.downs[0], texture, null);

        for (let i = 1;i < this.depth;i++)
            this.pass(this.shader1, this.downs[i], this.downs[i - 1].texture, null);

        this.pass(this.shader2, this.ups[0], this.downs[this.depth - 2].texture, this.downs[this.depth - 1].texture);

        for (let i = 1;i < this.depth - 1;i++)
            this.pass(this.shader2, this.ups[i], this.downs[this.depth - i - 2].texture, this.ups[i - 1].texture);

        this.pass(this.shader2, this.ups[this.depth - 1], texture, this.ups[this.depth - 2].texture);
    }

    pass(shader, target, texture1, texture2) {
        this.renderer.setRenderTarget(target);

        shader.uniforms.unf.value = texture1;
        if (texture2 !== null) {
            shader.uniforms.fil.value = texture2;
        }
        shader.uniforms.upscale.value = texture2 !== null;
        shader.uniforms.resolution.value.x = target.width;
        shader.uniforms.resolution.value.y = target.height;

        this.mesh.material = shader;

        this.renderer.clear();
        this.renderer.setClearColor(0xffffff);
        this.renderer.setClearAlpha(0);
        this.renderer.render(this.mesh, camera);
        this.renderer.setRenderTarget(null);
    }

    getTexture() {
        return this.ups[this.depth - 1].texture;
    }    

    createShader() {
        let shader = new THREE.ShaderMaterial({
            vertexShader: baseVert,
            fragmentShader: poissonFillFrag,
            uniforms: {
                unf: { value: null },
                fil: { value: null },
                upscale: { value: false },
                resolution: { value: new THREE.Vector2() },
            },
        });

        return shader;
    }
}

export { PoissonFill };