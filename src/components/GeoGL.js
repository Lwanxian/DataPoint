import * as THREE from "three/build/three.module";

let GeoGL = function () {

}

GeoGL.prototype = {
    init: function (dom) {
        this._initScene();
        this._initCamera();
        this._initControls()
        this._initLight()
        this._initGUI()
    },
    _initScene: function() {

    }
}

export default GeoGL;