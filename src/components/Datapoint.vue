<template>
  <div ref="container" id="container">
    <!-- <input type="file" accept="text/plain" @click="readFile" /> -->
    <input type="file" accept="text/plain" @change="loadTextFromFile" />
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
      pointX:null,
      pointY:null,
      pointZ:null,
      Testresult:[],
      x1arr:[],
      y1arr:[],
      z1arr:[],
    };
  },
  methods: {
    // 读取文件不报错方法
    loadTextFromFile: function (e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.$emit("load", this.dealNum(e.target.result));
      reader.readAsText(file);
    },
    dealNum(item) {
      return item.replace(/\r\n/g, " ").split(" ");
    },

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

      matrix.setPosition(offset - 1, offset - 1, offset - 1);
      this.mesh.setMatrixAt(1, matrix);
      this.mesh.setColorAt(1, color);

      // for (let x = 0; x < this.x1arr.length; x++) {
      //   for (let y = 0; y < this.y1arr.length; y++) {
      //     for (let z = 0; z < this.z1arr.length; z++) {
      //       matrix.setPosition(this.pointX, this.pointY, this.pointZ);
      //       this.mesh.setMatrixAt(i, matrix);
      //       this.mesh.setColorAt(i, color);
      //       i++;
      //     }
      //   }
      // }
      // new THREE.Vector3(this.pointX,this.pointY,this.pointZ)

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
    test() {
      const Data = `2535 2574 2230 2269 0 39
2535 2574 2230 2269 40 79
2535 2574 2230 2269 80 119
2535 2574 2230 2269 120 159
2535 2574 2230 2269 160 199`;
      this.Testresult = this.dealNum(Data);

      for (let m = 0; m < this.Testresult.length; m += 6) {
        for (let n = 2; n < this.Testresult.length; n += 6) {
          for (let k = 4; k < this.Testresult.length; k += 6) {
            this.z1arr.push(this.Testresult[k]);
          }
          this.y1arr.push(this.Testresult[n]);
        }
        this.x1arr.push(this.Testresult[m]);
      }
      this.pointX = this.x1arr[0]
      this.pointY = this.y1arr[0]
      this.pointZ = this.z1arr[0]

    },
  },
  mounted() {
    this.init();
    this.animate();
    this.initControls();
    this.test();
  },
};
</script>

<style>
#container {
  width: 100%;
  height: 100vh;
}
</style>