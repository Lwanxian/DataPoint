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
      count: null,
      X2arr: [],
      Y2arr: [],
      Z2arr: [],
    };
  },
  methods: {
    /*  读取文件方法 */
    loadTextFromFile: function (e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.$emit("load", this.dealNum(e.target.result));
      reader.readAsText(file);
    },
    dealNum(item) {
      /* 将文档读取到的数据转换为数组 
      遍历出x1arr，y1arr，z1arr*/
      let resultArr = item.replace(/\r\n/g, " ").split(" ");
      this.Testresult = resultArr;
      /* x1 y1 z1 x2 y2 z2*/
      for (
        let m = 0, n = 2, k = 4, q = 1, r = 3, f = 5;
        m < this.Testresult.length,
          n < this.Testresult.length,
          k < this.Testresult.length,
          q < this.Testresult.length,
          r < this.Testresult.length,
          f < this.Testresult.length;
        m += 6, n += 6, k += 6, q += 6, r += 6, f += 6
      ) {
        this.z1arr.push(this.Testresult[k]);
        this.y1arr.push(this.Testresult[n]);
        this.x1arr.push(this.Testresult[m]);
        this.X2arr.push(this.Testresult[f]);
        this.Y2arr.push(this.Testresult[r]);
        this.Z2arr.push(this.Testresult[q]);
      }
      this.initObject();
    },
    initObject() {
      /* IcosahedronGeometry二十面体
      几何体创建,二十面以上的多面体，当第二个参数大于1时为球体
      材质对象
      */
      this.geometry = new THREE.IcosahedronGeometry(0.2, 4);
      this.material = new THREE.MeshPhongMaterial();
      this.mesh = new THREE.InstancedMesh(this.geometry, this.material, 1800);
      // 创建四维矩阵  把矩阵应用到三维向量
      let matrix1 = new THREE.Matrix4();
      let matrix2 = new THREE.Matrix4();
      let color = new THREE.Color();
      for (let z = 0; z < this.x1arr.length; z++) {
        this.x1p = this.x1arr[z] / window.innerWidth + z;
        this.y1p = this.y1arr[z] / window.innerHeight + z;
        this.z1p = this.z1arr[z] / 1000;
        this.x2p = this.X2arr[z] / window.innerWidth + z ;
        this.y2p = this.Y2arr[z] / window.innerHeight + z;
        this.z2p = this.Z2arr[z] / 1000;
        matrix1.setPosition(
          this.x1p,
          this.y1p,
          this.z1p,
        );
        matrix2.setPosition(
          this.x2p,
          this.y2p,
          this.z2p
        );
        this.mesh.setMatrixAt(z, matrix1);
        this.mesh.setMatrixAt(z, matrix2);
        this.mesh.setColorAt(z, color);
      }

      this.scene.add(this.mesh);
    },


    // initCamera() {

    // },
    // initLight() {

    // },
    // initScene() {

    // },
    // initGUI() {

    // },
    // initControls() {

    // },
    // initThree() {
    //   this.initScene();
    //   this.initCamera();
    //   this.initControls()
    //   this.initLight()
    //   this.initGUI()
    // },
    //
    init: function () {
      /* 
      场景设置
      场景背景色设置
      */
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x00ff33);

      /* PerspectiveCamera透视相机
      param1 视角即可以看到的角度范围，人的视场大约是180度，一般游戏的视场为60度到90度，推荐默认值45
      param2 长宽比决定了水平视角和垂直视角之间的比例关系
      param3 基于相机位置，表示从这里开始渲染场景；一般会设置一个很小的值，推荐默认值0.1
      param4 基于相机位置，表示停止渲染的位置；要注意设置合适的距离，如果设置太小，部分场景可能渲染不到，但如果设置的太大，会影响渲染的效率，默认值1000
      */
      this.camera = new THREE.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.amount = 20;
      this.camera.position.set(this.amount, this.amount, this.amount);

      /*  灯光 
      HemisphereLight半球光：光照颜色从天空光线颜色渐变到地面光线颜色
      position.set假如这个值设置等于 Object3D.DefaultUp (0, 1, 0),那么光线将会从上往下照射
      */
      this.light1 = new THREE.HemisphereLight(0xffffff, 0x111188);
      this.light1.position.set(-1, 1, 1);
      this.light2 = new THREE.HemisphereLight(0xbb2233, 0x080820, 0.5);
      this.light2.position.set(-1, -1.5, -1);

      /* 
      将灯光添加至场景中
      */
      this.scene.add(this.light1, this.light2);

      /* WebGLRenderer渲染引擎
      antialias 是否开启锯齿 默认false
      setSize 将输出canvas的大小调整为(width, height)并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小
      setPixelRatio 设置设备像素比
      */
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(window.devicePixelRatio);

      /* 
      this.renderer.domElement显示成hcanvas画布输出在界面上
      stats 表示当前场景的渲染帧率和显存占用情况
      */
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

    /**
    创建控件对象（鼠标控制）
    使动画循环使用时阻尼或自转 意思是否有惯性
    是否可以缩放
    是否开启右键拖拽
    */
    initControls: function () {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.enableZoom = true;
      this.controls.enablePan = true;
    },

    render() {
      // this.raycaster = new THREE.Raycaster();
      // let intersection = this.raycaster.intersectObject(this.mesh);
      // if (intersection.length > 0) {
      //   const instanceId = intersection[0].instanceId;
      //   this.mesh.setColorAt(
      //     instanceId,
      //     color.setHex(Math.random() * 0xffffff)
      //   );
      //   this.mesh.instanceColor.needsUpdate = true;
      // }
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