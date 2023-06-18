import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import * as BABYLON from "@babylonjs/core";
import '../style.css'
import Card from './Card'
import King from './King'

export default class App {
    constructor() {

        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);

        var engine = new BABYLON.Engine(canvas, true);
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0.5, 0.0, 0.1, 1.0);

        var camera: BABYLON.ArcRotateCamera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        var light: BABYLON.HemisphericLight = 
            new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(2, 1, 0), scene);
            light.diffuse = new BABYLON.Color3(1, 0.57, 0.5);
            light.specular = new BABYLON.Color3(1, 1, 1);
            light.groundColor = new BABYLON.Color3(0.29, 0, 0.55);
            light.intensity = 2;

        // Hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        // Resizing event
        window.addEventListener("resize", function(){ engine.resize(); });

        // Set up card and king stencil shader
        new Card(scene);
        new King(scene, engine);

        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();