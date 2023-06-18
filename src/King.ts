import * as BABYLON from "@babylonjs/core";
import earcut from "earcut";

export default class King {
    constructor(scene: BABYLON.Scene, engine: BABYLON.Engine) {

        this.buildDiamond(scene, engine);
        this.loadKingModel(scene, engine);
    }

    buildDiamond(scene: BABYLON.Scene, engine: BABYLON.Engine) {

        // King frame diamond shape
        const kingFrameShape: BABYLON.Vector3[] = [];
        kingFrameShape.push(new BABYLON.Vector3(-2.5 / 2, 0, 0));
        kingFrameShape.push(new BABYLON.Vector3(0, 0, 3.5 / 2));
        kingFrameShape.push(new BABYLON.Vector3(2.5 / 2, 0, 0));
        kingFrameShape.push(new BABYLON.Vector3(0, 0, -3.5 / 2));
        const kingFrame = BABYLON.MeshBuilder.CreatePolygon("kingFrame", { shape: kingFrameShape, sideOrientation: BABYLON.Mesh.FRONTSIDE }, scene, earcut);
        kingFrame.rotation.x = Math.PI * 0.5;

        // King frame stencil material 
        const kingFrameMaterial = new BABYLON.StandardMaterial('kingFrameMaterial', scene);
        kingFrameMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        kingFrameMaterial.alpha = 0.7;
        kingFrame.material = kingFrameMaterial;

        kingFrame.onBeforeRenderObservable.add(function () {
            engine.setStencilBuffer(true);
            engine.setStencilFunctionReference(2);
        });
        kingFrame.onAfterRenderObservable.add(function () {
            engine.setStencilBuffer(false);
        });
    }

    loadKingModel(scene: BABYLON.Scene, engine: BABYLON.Engine) {

        BABYLON.SceneLoader.ImportMesh(
            undefined, "/", "king.glb", scene, function (meshes: BABYLON.Mesh[]): void {

                // King stencil material
                var previousStencilMask = engine.getStencilMask();
                var previousStencilFunction = engine.getStencilFunction();
                scene.setRenderingAutoClearDepthStencil(2, false);

                meshes.forEach((mesh: BABYLON.Mesh) => {
                    mesh.position.z = -1;
                    mesh.position.y = -1.55;
                    mesh.scaling.x = 0.75;
                    mesh.scaling.y = 0.75;
                    mesh.scaling.z = 0.75;

                    mesh.renderingGroupId = 2;

                    mesh.onBeforeRenderObservable.add(function () {
                        engine.setStencilMask(0x00);
                        engine.setStencilBuffer(true);
                        engine.setStencilFunctionReference(2);
                        engine.setStencilFunction(BABYLON.Engine.EQUAL);
                    });

                    mesh.onAfterRenderObservable.add(function () {
                        engine.setStencilBuffer(false);
                        engine.setStencilMask(previousStencilMask);
                        engine.setStencilFunction(previousStencilFunction);
                    });
                })
            }
        );
    }
}