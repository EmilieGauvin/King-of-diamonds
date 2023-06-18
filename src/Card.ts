import * as BABYLON from "@babylonjs/core";

//// Shader constants for both front and back of card
// Background color of the card
const mainColor = new BABYLON.Vector3(1, 0.9882352941176471, 0.9529411764705882);
// Color of the first voronoi holographic effect
const voronoiColor1 = new BABYLON.Vector3(0.44, 0.16, 0.0);
// Color of the second voronoi holographic effect
const voronoiColor2 = new BABYLON.Vector3(0.51, 0.34, 0.0);
// Radius of the card round corners
const cornerRadius: number = 0.05;
// Thickness of the red border
const thicknessBorder: number = 0.005; // must be < to cornerRadius

export default class Card {
    constructor(scene: BABYLON.Scene) {

        this.setUpShaders();
        this.buildFrontCard(scene);
        this.buildBackCard(scene);
    }

    buildFrontCard(scene: BABYLON.Scene) {

        var frontCardShaderMaterial = new BABYLON.ShaderMaterial("frontCardShaderMaterial", scene,
            {
                vertex: "custom",
                fragment: "custom"
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "cameraPosition"]
            }
        );
        frontCardShaderMaterial.alpha = 0.99999;

        // 3 Layers of parallax texture, the 2b and 3b textures are stencils of the textures 
        // to reset the color informations of the textures layers bolow before adding one on top.
        // For the front card, we use a place holder as stencils because there is no need for it.
        var cardTexture1 = new BABYLON.Texture("./cardTexture1.png", scene);
        var cardTexture2 = new BABYLON.Texture("./cardTexture2.png", scene);
        var cardTexture3 = new BABYLON.Texture("./cardTexture3.png", scene);
        var placeHolderTexture = new BABYLON.Texture("./placeHolderTexture.png", scene);
        frontCardShaderMaterial.setTexture("cardTexture1", cardTexture1);
        frontCardShaderMaterial.setTexture("cardTexture2", cardTexture2);
        frontCardShaderMaterial.setTexture("cardTexture2b", placeHolderTexture);
        frontCardShaderMaterial.setTexture("cardTexture3", cardTexture3);
        frontCardShaderMaterial.setTexture("cardTexture3b", placeHolderTexture);

        // Strength and direction of the texture parallax effect
        frontCardShaderMaterial.setVector2("u_parallaxVector1", new BABYLON.Vector2(0.05, 0.05));
        frontCardShaderMaterial.setVector2("u_parallaxVector2", new BABYLON.Vector2(0.15, 0.15));

        // Strength of the voronoi holographic effect
        frontCardShaderMaterial.setFloat("u_holographicFactor", 0.9);

        // Constants
        frontCardShaderMaterial.setVector3("u_color", mainColor);
        frontCardShaderMaterial.setVector3("u_voronoiColor1", voronoiColor1);
        frontCardShaderMaterial.setVector3("u_voronoiColor2", voronoiColor2);
        frontCardShaderMaterial.setFloat("u_cornerRadius", cornerRadius);
        frontCardShaderMaterial.setFloat("u_thicknessBorder", thicknessBorder);

        const frontCard = BABYLON.MeshBuilder.CreatePlane("frontCard", { width: 3.5, height: 5 }, scene);
        frontCard.rotation.y = Math.PI;
        frontCard.material = frontCardShaderMaterial;
    }

    buildBackCard(scene: BABYLON.Scene) {

        var backCardShaderMaterial: BABYLON.ShaderMaterial = new BABYLON.ShaderMaterial("frontCardShaderMaterial", scene,
            {
                vertex: "custom",
                fragment: "custom"
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldViewProjection", "cameraPosition"]
            }
        );
        backCardShaderMaterial.alpha = 0.99999;

        // 3 Layers of parallax texture, the 2b and 3b textures are stencils of the textures 
        // to reset the color informations of the textures layers bolow before adding one on top.
        var layerTexture1 = new BABYLON.Texture("./layer1.png", scene);
        var layerTexture2 = new BABYLON.Texture("./layer2.png", scene);
        var layerTexture2b = new BABYLON.Texture("./layer2b.png", scene);
        var layerTexture3 = new BABYLON.Texture("./layer3.png", scene);
        var layerTexture3b = new BABYLON.Texture("./layer3b.png", scene);
        backCardShaderMaterial.setTexture("cardTexture1", layerTexture1);
        backCardShaderMaterial.setTexture("cardTexture2", layerTexture2);
        backCardShaderMaterial.setTexture("cardTexture2b", layerTexture2b);
        backCardShaderMaterial.setTexture("cardTexture3", layerTexture3);
        backCardShaderMaterial.setTexture("cardTexture3b", layerTexture3b);

        // Strength and direction of the texture parallax effect
        backCardShaderMaterial.setVector2("u_parallaxVector1", new BABYLON.Vector2(0.2, 0));
        backCardShaderMaterial.setVector2("u_parallaxVector2", new BABYLON.Vector2(0.45, 0));

        // Strength of the voronoi holographic effect
        backCardShaderMaterial.setFloat("u_holographicFactor", 0.5);

        // Constants
        backCardShaderMaterial.setVector3("u_color", mainColor);
        backCardShaderMaterial.setFloat("u_cornerRadius", cornerRadius);
        backCardShaderMaterial.setFloat("u_thicknessBorder", thicknessBorder);
        backCardShaderMaterial.setVector3("u_voronoiColor1", voronoiColor1);
        backCardShaderMaterial.setVector3("u_voronoiColor2", voronoiColor2);

        const backCard = BABYLON.MeshBuilder.CreatePlane("frontCard", { width: 3.5, height: 5 }, scene);
        backCard.position.z = -0.01;
        backCard.material = backCardShaderMaterial;
    }

    setUpShaders() {

        BABYLON.Effect.ShadersStore["customVertexShader"] = `   
            precision highp float;

            //Attributes
            attribute vec3 position;
            attribute vec2 uv;

            //Uniforms
            uniform mat4 world;
            uniform mat4 worldViewProjection;
            uniform vec3 cameraPosition;
            uniform vec2 u_parallaxVector1;
            uniform vec2 u_parallaxVector2;

            //Varyings
            varying vec2 v_uv;
            varying vec2 v_parallaxUv1;
            varying vec2 v_parallaxUv2;
            varying vec3 v_viewDirection;

            void main(void) {

                //World position
                gl_Position = worldViewProjection * vec4(position, 1.0);

                //Parallax uv transformations
                vec4 output1 = world * vec4(position, 1.0);
                vec3 viewDirection = normalize(cameraPosition - output1.xyz);
                vec2 parallaxUv1 = uv + viewDirection.xy * u_parallaxVector1;
                vec2 parallaxUv2 = uv + viewDirection.xy * u_parallaxVector2;

                //Varyings
                v_viewDirection = viewDirection;
                v_parallaxUv1 = parallaxUv1;
                v_parallaxUv2 = parallaxUv2;
                v_uv = uv;
            }`
            ;

        BABYLON.Effect.ShadersStore["customFragmentShader"] = `
            precision highp float;

            //Samplers
            uniform sampler2D cardTexture1;
            uniform sampler2D cardTexture2;
            uniform sampler2D cardTexture2b;
            uniform sampler2D cardTexture3;
            uniform sampler2D cardTexture3b;

            //Uniforms
            uniform vec3 u_color;
            uniform float u_cornerRadius;
            uniform float u_thicknessBorder;
            uniform vec3 u_voronoiColor1;
            uniform vec3 u_voronoiColor2;
            uniform float u_holographicFactor;

            //Varyings
            varying vec2 v_uv;
            varying vec2 v_parallaxUv1;
            varying vec2 v_parallaxUv2;
            varying vec3 v_viewDirection;

            // Voronoi random generator
            vec2 voronoiRandom(vec2 seed, float offset){
                mat2 m = mat2(15.27, 47.63, 99.41, 89.98);
                vec2 uv = fract(sin(m * seed) * 46839.32);
                return vec2(sin(uv.y * offset) * 0.5 + 0.5, cos(uv.x * offset) * 0.5 + 0.5);
            }
                    
            // Voronoi
            void voronoi(vec2 seed, float offset, float density, out float outValue, out float cells){
                vec2 g = floor(seed * density);
                vec2 f = fract(seed * density);
                float t = 8.0;
                vec3 res = vec3(8.0, 0.0, 0.0);

                for(int y=-1; y<=1; y++)
                {
                    for(int x=-1; x<=1; x++)
                    {
                        vec2 lattice = vec2(x,y);
                        vec2 randomOffset = voronoiRandom(lattice + g, offset);
                        float d = distance(lattice + randomOffset, f);
                        if(d < res.x)
                        {
                            res = vec3(d, randomOffset.x, randomOffset.y);
                            outValue = res.x;
                            cells = res.y;
                        }
                    }
                }
            }

            void main(void) {

                //VoronoiNoise1x
                float tempOutput = 0.0;
                float tempCells = 0.0;
                voronoi(v_uv, 2.6, 12.4, tempOutput, tempCells);
                float cells = tempCells;

                //VoronoiNoise1y
                float tempOutput1 = 0.0;
                float tempCells1 = 0.0;
                voronoi(v_uv, 6.4, 14.6, tempOutput1, tempCells1);
                float cells1 = tempCells1;

                //VoronoiNoise1z
                float tempOutput2 = 0.0;
                float tempCells2 = 0.0;
                voronoi(v_uv, 4.0, 9.0, tempOutput2, tempCells2);
                float cells2 = tempCells2;

                //Voronoi1 color
                float dotViewDirVoronoi1 = dot(v_viewDirection, vec3(cells, cells1, cells2).xyz);
                vec3 voronoiColor1 = u_voronoiColor1 * dotViewDirVoronoi1 * u_holographicFactor;

                //VoronoiNoise2x
                float tempOutput3 = 0.0;
                float tempCells3 = 0.0;
                voronoi(v_uv, 11.6, 13.2, tempOutput3, tempCells3);
                float cells3 = tempCells3;

                //VoronoiNoise2y
                float tempOutput4 = 0.0;
                float tempCells4 = 0.0;
                voronoi(v_uv, 9.4, 16.4, tempOutput4, tempCells4);
                float cells4 = tempCells4;

                //VoronoiNoise2z
                float tempOutput5 = 0.0;
                float tempCells5 = 0.0;
                voronoi(v_uv, 17.2, 15.8, tempOutput5, tempCells5);
                float cells5 = tempCells5;

                //Voronoi2 color
                float dotViewDirVoronoi2 = dot(v_viewDirection, vec3(cells3, cells4, cells5).xyz);
                vec3 voronoiColor2 = -1.0 * u_voronoiColor2 * dotViewDirVoronoi2 * u_holographicFactor;

                //Add voronoi1, voronoi2 and u_color
                vec3 voronoiEffect = u_color + voronoiColor1 + voronoiColor2;

                //Outside frame
                float outsideCircle1 = -1.0 * step(u_cornerRadius, length(v_uv - vec2(u_cornerRadius, u_cornerRadius))) + 1.0;
                float outsideCircle2 = -1.0 * step(u_cornerRadius, length(v_uv - vec2(1.0 - u_cornerRadius, u_cornerRadius))) + 1.0;
                float outsideCircle3 = -1.0 * step(u_cornerRadius, length(v_uv - vec2(u_cornerRadius, 1.0 - u_cornerRadius))) + 1.0;
                float outsideCircle4 = -1.0 * step(u_cornerRadius, length(v_uv - vec2(1.0 - u_cornerRadius, 1.0 - u_cornerRadius))) + 1.0;
                float outsideCircles = outsideCircle1 + outsideCircle2 + outsideCircle3 + outsideCircle4;
                float outsideRectangles = (-1.0 * step(0.5 - u_cornerRadius, abs(v_uv.x - 0.5)) + 1.0) + (-1.0 * step(0.5 - u_cornerRadius, abs(v_uv.y - 0.5)) + 1.0);
                float outsideFrame = clamp(outsideRectangles + outsideCircles, 0.0, 1.0);

                //Inside frame
                float insideCircle1 = -1.0 * step(u_cornerRadius - u_thicknessBorder, length(v_uv - vec2(u_cornerRadius + u_thicknessBorder, u_cornerRadius + u_thicknessBorder))) + 1.0;
                float insideCircle2 = -1.0 * step(u_cornerRadius - u_thicknessBorder, length(v_uv - vec2(1.0 - u_cornerRadius - u_thicknessBorder, u_cornerRadius + u_thicknessBorder))) + 1.0;
                float insideCircle3 = -1.0 * step(u_cornerRadius - u_thicknessBorder, length(v_uv - vec2(1.0 - u_cornerRadius - u_thicknessBorder, 1.0 - u_cornerRadius - u_thicknessBorder))) + 1.0;
                float insideCircle4 = -1.0 * step(u_cornerRadius - u_thicknessBorder, length(v_uv - vec2(u_cornerRadius + u_thicknessBorder, 1.0 - u_cornerRadius - u_thicknessBorder))) + 1.0;
                float insideCircles = insideCircle1 + insideCircle2 + insideCircle3 + insideCircle4;
                float insideRectangle1 = -1.0 * step(0.5 - u_cornerRadius + u_thicknessBorder, abs(v_uv.x - 0.5)) + 1.0;
                float insideRectangle2 = -1.0 * step(0.5 - u_cornerRadius + u_thicknessBorder, abs(v_uv.y - 0.5)) + 1.0;
                float insideRectangles = insideRectangle1 + insideRectangle2 - step(0.5 - u_thicknessBorder * 2.0, max(abs(v_uv.x - 0.5), abs(v_uv.y - 0.5)));
                float insideFrame = clamp(insideCircles + insideRectangles, 0.0, 1.0);

                //Frame
                float frame = outsideFrame - insideFrame;

                //Parallax textures
                vec4 layerTextures1 = clamp((texture2D(cardTexture1, v_uv) - (texture2D(cardTexture2b, v_parallaxUv1) + texture2D(cardTexture3b, v_parallaxUv2))), 0.0, 1.0) ;
                vec4 layerTextures2 = clamp((texture2D(cardTexture2, v_parallaxUv1) - texture2D(cardTexture3b, v_parallaxUv2)), 0.0, 1.0);
                vec4 layerTextures3 = clamp((texture2D(cardTexture3, v_parallaxUv2)), 0.0, 1.0);
                vec4 addTextures = clamp(layerTextures1 + layerTextures2 + layerTextures3, 0.0, 1.0);

                //Result
                gl_FragColor = vec4(
                    voronoiEffect.r + frame + 0.1, 
                    voronoiEffect.g - addTextures.r - frame, 
                    voronoiEffect.b - addTextures.r - frame + 0.1, 
                    outsideFrame
                    );
                }`;
    }
}