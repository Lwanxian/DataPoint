<template>
  <div>
    <div ref="container" id="container"></div>
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
      //
      pointX: null,
      pointY: null,
      pointZ: null,
      Testresult: [],
      x1arr: [],
      y1arr: [],
      z1arr: [],
    };
  },
  methods: {
    // 读取文件方法
    loadTextFromFile: function (e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.$emit("load", this.dealNum(e.target.result));
      reader.readAsText(file);
    },
    dealNum(item) {
      // 将文档读取到的数组转换为数组
      let resultArr = item.replace(/\r\n/g, " ").split(" ");
      console.log(resultArr);

      this.Testresult = resultArr;
      // 遍历出x1arr，y1arr，z1arr
      for (
        let m = 0, n = 2, k = 4;
        m < this.Testresult.length,
          n < this.Testresult.length,
          k < this.Testresult.length;
        m += 6, n += 6, k += 6
      ) {
        this.z1arr.push(this.Testresult[k]);
        this.y1arr.push(this.Testresult[n]);
        this.x1arr.push(this.Testresult[m]);
      }

      this.pointX = this.x1arr[0];
      this.pointY = this.y1arr[0];
      this.pointZ = this.z1arr[0];
    },
    //
    init: function () {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf0f0f0);
      // 相机
      this.camera = new THREE.PerspectiveCamera(
        60, //视角即可以看到的角度范围，人的视场大约是180度，一般游戏的视场为60度到90度，推荐默认值45
        window.innerWidth / window.innerHeight,//长宽比决定了水平视角和垂直视角之间的比例关系
        0.1,//基于相机位置，表示从这里开始渲染场景；一般会设置一个很小的值，推荐默认值0.1
        100//基于相机位置，表示停止渲染的位置；要注意设置合适的距离，如果设置太小，部分场景可能渲染不到，但如果设置的太大，会影响渲染的效率，默认值1000
      );
      this.amount = parseInt(window.location.search.substr(1)) || 10;
      let count = Math.pow(this.amount, 3);
      this.camera.position.set(this.amount, this.amount, this.amount);
      // 灯光 半球光：光照颜色从天空光线颜色渐变到地面光线颜色
      this.light1 = new THREE.HemisphereLight(0xffffff, 0x111188);
      // 假如这个值设置等于 Object3D.DefaultUp (0, 1, 0),那么光线将会从上往下照射
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
      //渲染的物体、材质、数量
      // 创建四维矩阵  把矩阵应用到三维向量
      let matrix = new THREE.Matrix4();
      let color = new THREE.Color();

      matrix.setPosition(
        this.pointX / window.innerWidth,
        this.pointY / window.innerHeight,
        this.pointZ
      );
      this.mesh.setMatrixAt(0, matrix);
      this.mesh.setColorAt(0, color);

      // for (let x = 0; x < this.amount; x++) {
      //   for (let y = 0; y < this.amount; y++) {
      //     for (let z = 0; z < this.amount; z++) {
      //       matrix.setPosition(1, 0, 0);
      //       // matrix.setPosition(offset - x, offset - y, offset - z);
      //       this.mesh.setMatrixAt(i, matrix);
      //       this.mesh.setColorAt(i, color);
      //       i++;
      //     }
      //   }
      // }

      // for (let z = 0; z < this.x1arr.length; z++) {
      //   matrix.setPosition(
      //     this.x1arr[z] / window.innerWidth,
      //     this.y1arr[z] / window.innerHeight,
      //     this.z1arr[z]
      //   );
      //   this.mesh.setMatrixAt(i, matrix);
      //   this.mesh.setColorAt(i, color);
      //   i++;
      // }

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