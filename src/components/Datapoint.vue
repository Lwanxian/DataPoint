<template>
  <div ref="container" id="container">
    <input type="file" accept="text/plain" @click="readFile" />
  </div>
</template>

<script>
import * as THREE from "three/build/three.module";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default {
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      stats: null,
      mesh: null,
      amount: null,
      raycaster: null,
      mouse: null,
      light1: null,
      light2: null,
      geometry: null,
      material: null,
      axisHelper: null,
      controls: null,
    };
  },
  methods: {
    init: function () {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf0f0f0);
      // 相机
      this.camera = new THREE.PerspectiveCamera(
        60, //视角
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      this.amount = 10;
      let count = Math.pow(this.amount, 3);
      this.camera.position.set(this.amount, this.amount, this.amount);
      // 灯光
      this.light1 = new THREE.HemisphereLight(0xffffff, 0x111188);
      this.light1.position.set(-1, 1, 1);

      this.light2 = new THREE.HemisphereLight(0xbb2233, 0x080820, 0.5);
      this.light2.position.set(-1, -1.5, -1);
      this.scene.add(this.light1, this.light2);
      // 几何体创建,二十面以上的多面体，当第二个参数大于1时为球体
      this.geometry = new THREE.IcosahedronGeometry(0.1, 4);
      // 材质对象
      this.material = new THREE.MeshPhongMaterial();
      let i = 0;

      this.mesh = new THREE.InstancedMesh(this.geometry, this.material, count);
      let offset = (this.amount - 1) / 2;
      let matrix = new THREE.Matrix4();
      let color = new THREE.Color();

      // matrix.setPosition(offset - 10, offset - 1, offset - 1);
      // this.mesh.setMatrixAt(0, matrix);
      // this.mesh.setColorAt(0, color);

      for (let x = 0; x < this.amount; x++) {
        for (let y = 0; y < this.amount; y++) {
          for (let z = 0; z < this.amount; z++) {
            matrix.setPosition(offset - 1, offset - 1, offset - 1);
            this.mesh.setMatrixAt(i, matrix);
            this.mesh.setColorAt(i, color);
            i++;
          }
        }
      }
      this.scene.add(this.mesh);

      let gui = new GUI();
      gui.add(this.mesh, "count", 0, count);

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.$refs.container.appendChild(this.renderer.domElement);
      this.stats = new Stats();
      this.$refs.container.appendChild(this.stats.dom);

      window.addEventListener("resize", this.onWindowResize);
      this.$refs.container.addEventListener("mousemove", this.onMouseMove);
    },
    onWindowResize: function () {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    onMouseMove: function (event) {
      event.preventDefault();
      this.mouse = new THREE.Vector2(1, 1);
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    },

    readFile: function (e) {
      var input = e.target;
      var reader = new FileReader();
      reader.readAsText(input.files[0]);
      reader.onload = function () {
        // console.log( reader.result );
        let dataArr = reader.result.split(" ");
        console.log(dataArr);
        for (let m = 0; m < dataArr.length; m += 6) {
          let x1 = dataArr[m];
          console.log(x1);
        }
        for (let n = 1; n < dataArr.length; n += 6) {
          let x2 = dataArr[n];
          console.log(x2);
        }
        for (let h = 2; h < dataArr.length; h += 6) {
          let y1 = dataArr[h];
          console.log(y1);
        }
        for (let j = 3; j < dataArr.length; j += 6) {
          let y2 = dataArr[j];
          console.log(y2);
        }
        for (let s = 4; s < dataArr.length; s += 6) {
          let z1 = dataArr[s];
          console.log(z1);
        }
        for (let k = 5; k < dataArr.length;k += 6) {
          let z2 = dataArr[k];
          console.log(z2);
        }
      };
    },

    initControls: function () {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement); //创建控件对象（鼠标控制）
      this.controls.enableDamping = true; // 使动画循环使用时阻尼或自转 意思是否有惯性
      this.controls.enableZoom = true; //是否可以缩放
      this.controls.enablePan = true; //是否开启右键拖拽
    },

    render() {
      this.raycaster = new THREE.Raycaster();
      let intersection = this.raycaster.intersectObject(this.mesh);
      if (intersection.length > 0) {
        const instanceId = intersection[0].instanceId;
        this.mesh.setColorAt(
          instanceId,
          color.setHex(Math.random() * 0xffffff)
        );
        this.mesh.instanceColor.needsUpdate = true;
      }
      this.renderer.render(this.scene, this.camera); //执行渲染操作
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.stats.update();
      this.render();
    },
  },
  mounted() {
    this.init();
    this.animate();
    this.initControls();
  },
};
</script>

<style>
#container {
  width: 100%;
  height: 100vh;
}
</style>