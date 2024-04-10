<template>
    <div id="viewer" style="width: 100%; height: 100%;"></div>
</template>

<script>
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import Stats from "three/addons/libs/stats.module";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

export default {
    name: 'FbxViewer',
    mounted() {
        this.initViewer()
    },
    data() {
        return {
            animationActions: [],
            activeAction: THREE.AnimationAction,
            lastAction: THREE.AnimationAction,
            mixer: THREE.AnimationMixer,
            loader: new FBXLoader(),
            modelReady: false,
            animationSpeed: 1.0,
            hemiLightIntensity: 3,
            dirLightIntensity: 3,
            hemiLight: new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 ),
            dirLight: new THREE.DirectionalLight( 0xffffff, 3 ),
        }
    },
    methods: {
        initViewer() {
            const scene = new THREE.Scene()
            scene.background = new THREE.Color( 0xa0a0a0 );

            this.hemiLight.position.set( 0, 20, 0 );
            scene.add( this.hemiLight );

            this.dirLight.position.set( 3, 10, 10 );
            this.dirLight.castShadow = true;
            this.dirLight.shadow.camera.top = 2;
            this.dirLight.shadow.camera.bottom = - 2;
            this.dirLight.shadow.camera.left = - 2;
            this.dirLight.shadow.camera.right = 2;
            this.dirLight.shadow.camera.near = 0.1;
            this.dirLight.shadow.camera.far = 40;

            scene.add( this.dirLight );

            const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
            mesh.rotation.x = - Math.PI / 2;
            mesh.receiveShadow = true;
            scene.add( mesh );

            const renderer = new THREE.WebGLRenderer( { antialias: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            renderer.shadowMap.enabled = true;
            document.getElementById('viewer').appendChild(renderer.domElement)

            const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 100 );
            camera.position.set( 0, 15, 10 );

            const controls = new OrbitControls(camera, renderer.domElement)
            controls.enableDamping = true
            controls.target.set(0, 1, 0)

            const stats = new Stats();
            document.getElementById('viewer').appendChild( stats.dom );

            this.loader.load('Model2_T.fbx', (object) => {
                object.scale.set(0.01, 0.01, 0.01);
                scene.add(object);
                this.mixer = new THREE.AnimationMixer(object);

                // Assume there's at least one animation and we play the first one.
                if (object.animations.length > 0) {
                    let animationAction = this.mixer.clipAction(object.animations[0]);
                    this.animationActions.push(animationAction);
                    // Play the first animation immediately.
                    this.activeAction = animationAction;
                    this.activeAction.play();
                }

                // Now the model is ready to be animated
                this.modelReady = true; // Ensure this is set so the animation updates run

                this.loader.load('Model2_D.fbx', (animObject) => {
                    const additionalAnimationAction = this.mixer.clipAction(animObject.animations[0]);
                    this.animationActions.push(additionalAnimationAction);

                    // Update GUI here if necessary, or set up GUI after all loads are complete
                    this.setupGUI();
                });
            });



            const clock = new THREE.Clock()
            const animate = () => {
                requestAnimationFrame(animate);
                const delta = clock.getDelta(); // Only call getDelta once per frame!

                if (this.modelReady && this.mixer) {
                    this.mixer.update(delta);
                }

                renderer.render(scene, camera);
                stats.update();
            };

            animate()

            //this.loadModel('Model1_T.fbx', scene)
        },
        loadModel(path, scene) {
            this.loader.load(path, (object) => {
                this.currentModel = object;
                object.scale.x = 0.1;
                object.scale.y = 0.1;
                object.scale.z = 0.1;
                scene.add(object);
            }, undefined, function (error) {
                console.error(error);

            });
        },
        setupGUI(){
            const gui = new GUI();

            // Assuming names for your animations
            const animationNames = ['Default', 'Dancing'];
            const animationControl = { current: 'Default' };

            gui.add(animationControl, 'current', animationNames).onChange((selectedAnimationName) => {
                // Stop all animations
                this.animationActions.forEach(action => action.stop());

                // Find and play the selected animation
                const index = animationNames.indexOf(selectedAnimationName);
                const selectedAction = this.animationActions[index];
                if (selectedAction) {
                    selectedAction.play();
                }
            });

            gui.add(this, 'animationSpeed', 0.1, 2.0, 0.1).name('Animation Speed').onChange(speed => {
                this.animationActions.forEach(action => {
                    action.setEffectiveTimeScale(speed);
                });
            });

            gui.add(this, 'hemiLightIntensity', 0, 10).name('Hemi Light Intensity').onChange(value => {
                this.hemiLight.intensity = value;
            });
            gui.add(this, 'hemiLightIntensity', 0, 10).name('Dir Light Intensity ').onChange(value => {
                this.dirLight.intensity = value;
            });
        }
    }
}
</script>
