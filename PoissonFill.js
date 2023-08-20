// Reference:
// Convolution Pyramids, Farbman et al., 2011 
//   (https://www.cse.huji.ac.il/labs/cglab/projects/convpyr/data/convpyr-small.pdf)
// Rendu (https://github.com/kosua20/Rendu)

import * as twgl from 'twgl.js';

import pfVert from './shaders/pf.vert';
import pfFrag from './shaders/pf.frag';

let PoissonFill = function (w, h, depth) {
    if (!depth) {
        depth = Math.floor(Math.log2(Math.min(w, h))) - 1;
    }

    let that = this;

    const gl = document.createElement("canvas").getContext("webgl");
    gl.canvas.width = w;
    gl.canvas.height = h;
    gl.canvas.style.visibility = "hidden";
    gl.canvas.style.zIndex = "-1000";
    gl.canvas.style.pointerEvents = "none";
    gl.canvas.style.position = "absolute";

    const canv = document.createElement("canvas");
    canv.width = w;
    canv.height = h;
    let ctx = canv.getContext('2d');
    // document.body.appendChild(canv);

    document.body.appendChild(gl.canvas);
    const programInfo = twgl.createProgramInfo(gl, [pfVert, pfFrag]);
    const arrays = {
        position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    };
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    function newPass() {
        return twgl.createTexture(gl, {
            src: gl.canvas,
            flipY: true,
            min: gl.NEAREST,
            mag: gl.NEAREST,
        });
    }

    function pass(p, tex1, tex2, it) {
        it = it ? it : 0;
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        const uniforms = {
            w: w,
            h: h,
            unf: tex1,
            fil: tex2 ? tex2 : tex1,
            pw: Math.floor((w - w / Math.pow(2, it)) / 2),
            ph: Math.floor((h - h / Math.pow(2, it)) / 2),
            pw1: Math.floor((w - w / Math.pow(2, it - 1)) / 2),
            ph1: Math.floor((h - h / Math.pow(2, it - 1)) / 2),
            isup: !!tex2,
        };
        gl.useProgram(programInfo.program);
        gl.disable(gl.DEPTH_TEST);
        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

        twgl.setUniforms(programInfo, uniforms);
        twgl.drawBufferInfo(gl, bufferInfo);
        // gl.canvas.width=Math.pow(2,Math.ceil(Math.random()*10));
        gl.bindTexture(gl.TEXTURE_2D, p);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.canvas);
    }

    let ps = [];
    for (let i = 0;i < depth;i++) {
        ps.push(newPass());
    }
    let qs = [];
    for (let i = 0;i < 3;i++) {
        qs.push(newPass());
    }

    that.process = function (inp) {
        gl.bindTexture(gl.TEXTURE_2D, ps[0]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inp.image);

        for (let i = 0;i < depth - 1;i++) {
            pass(ps[i + 1], ps[i], null, i + 1);
        }

        pass(qs[0], ps[depth - 2], ps[depth - 1], 0);
        for (let i = 0;i < depth - 2;i++) {
            pass(qs[(i + 1) % 3], ps[depth - 3 - i], qs[i % 3], depth - i - 2);
        }

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(gl.canvas, 0, 0);

    };

    that.getDom = function () { return canv; };
};

export { PoissonFill };