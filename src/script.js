import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({ 
    width: 250,
    title: 'Galaxy Controls'
})

// EXTRA: Debug folders

const generalFolder = gui.addFolder('General');
const colorsFolder = gui.addFolder('Colors');
const angleRandomnessFolder = gui.addFolder('Angle randomness');
const nebulaFolder = gui.addFolder('Nebula');
const twistFolder = gui.addFolder('Twist');
const curlFolder = gui.addFolder('Curl');

generalFolder.close();
colorsFolder.close();
angleRandomnessFolder.close();
nebulaFolder.close();
twistFolder.close();
curlFolder.close();



// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * EXTRA: Texture for particles
 */

const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('./textures/particles/1.png')

/**
 * Fog
 */
const fog = new THREE.Fog(0xcccccc, 5, 900);
scene.fog = fog;

/**
 * INFO: Create Galaxy
 */

const parameters = {
    count: 50000,
    size: 0.01,
    radius: 25,
    branches: 5,
    spin: 1,
    randomness: 0.4,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
    // EXTRA: Opacity, rotation, nebula, void, twist (closer to the center) and curl (further apart)
    opacity: 1,
    hasNebula: true,
    nebulaDensity: 0.1,
    nebulaColor: '#646264',
    voidSize: 2.5,
    twistFactor: -1.3, //3.84 
    twistAmount: 0.5, //0.8
    rotationSpeed: 0.1,
    curlFrequency: -1.8,
    curlAmplitude: -1.36,
}

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
    // console.log('generateGalaxy')

    // Dispose old geometry and material

    if(points !== null){
        geometry.dispose();
        material.dispose();
        scene.remove(points)
    }

    // Geometry

    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);
    const nebulaColor = new THREE.Color(parameters.nebulaColor)


    for ( let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        const radius = Math.random() * parameters.radius;
        let spinAngle = radius * parameters.spin
        let branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        // EXTRA: Twist
        branchAngle += Math.sin(spinAngle * parameters.twistFactor) * parameters.twistAmount;

        // EXTRA: Curl
        const curlFactor = Math.sin(branchAngle * parameters.curlFrequency) * parameters.curlAmplitude;
        branchAngle += curlFactor;

        // EXTRA: Void center
        if (radius < parameters.voidSize) {
            continue;
        }

        let x, y, z;
        
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        x = Math.cos(branchAngle + spinAngle) * radius + randomX;
        y = 0 + randomY;
        z = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
   
        // Color

        const mixedColor = insideColor.clone() //clone the color so it doesn't mix it when we lerp
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3 + 0] = mixedColor.r//1;
        colors[i3 + 1] = mixedColor.g//0;
        colors[i3 + 2] = mixedColor.b//0;

          // EXTRA: Nebula
        if (parameters.hasNebula && Math.random() < parameters.nebulaDensity) {
            const nebulaSize = Math.random() * parameters.radius;
            positions[i3] = Math.cos(branchAngle + spinAngle) * nebulaSize;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * nebulaSize;
            colors[i3] = nebulaColor.r;
            colors[i3 + 1] = nebulaColor.g;
            colors[i3 + 2] = nebulaColor.b;
        }      

    }
    // console.log(positions)

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))


    // Material

    material = new THREE.PointsMaterial ({
        size: parameters.size,
        sizeAttenuation: true,
        transparent: true,
        alphaMap: particleTexture,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        map: particleTexture,
        opacity: parameters.opacity
    })

    // Points

    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateGalaxy();



generalFolder.add(parameters, 'count').min(100).max(100000).step(100).name('Stars Count').onFinishChange(generateGalaxy)
generalFolder.add(parameters, 'size').min(0.001).max(0.1).step(0.001).name('Star Size').onFinishChange(generateGalaxy)
generalFolder.add(parameters, 'radius').min(0.01).max(30).step(0.01).name('Galaxy Radius').onFinishChange(generateGalaxy)
generalFolder.add(parameters, 'branches').min(2).max(20).step(1).name('Galaxy Branches').onFinishChange(generateGalaxy)
generalFolder.add(parameters, 'spin').min(-5).max(5).step(0.001).name('Branches Spin').onFinishChange(generateGalaxy)
generalFolder.add(parameters, 'rotationSpeed').min(-3).max(5).step(0.01).name('Rotation Speed').onFinishChange(generateGalaxy);
angleRandomnessFolder.add(parameters, 'randomness').min(0).max(2).step(0.001).name('Angle Randomness').onFinishChange(generateGalaxy)
angleRandomnessFolder.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).name('Angle Randomness Power').onFinishChange(generateGalaxy)
colorsFolder.addColor(parameters, 'insideColor').name('Inside Color').onFinishChange(generateGalaxy)
colorsFolder.addColor(parameters, 'outsideColor').name('Outside Color').onFinishChange(generateGalaxy)
colorsFolder.add(parameters, 'opacity').min(0.1).max(1).step(0.001).name('Opacity').onFinishChange(generateGalaxy);
nebulaFolder.add(parameters, 'hasNebula').name('Active').onFinishChange(generateGalaxy);
nebulaFolder.add(parameters, 'nebulaDensity').min(0).max(1).step(0.1).name('Density').onFinishChange(generateGalaxy);
nebulaFolder.addColor(parameters, 'nebulaColor').name('Color').onFinishChange(generateGalaxy);
twistFolder.add(parameters, 'twistFactor').min(-2).max(5).step(0.01).name('Twist Factor').onFinishChange(generateGalaxy);
twistFolder.add(parameters, 'twistAmount').min(-1).max(1).step(0.01).name('Twist Amount').onFinishChange(generateGalaxy);
curlFolder.add(parameters, 'curlFrequency').min(-3).max(5).step(0.01).name('Curl Frequency').onFinishChange(generateGalaxy);
curlFolder.add(parameters, 'curlAmplitude').min(-5).max(5).step(0.01).name('Curl Amplitude').onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // EXTRA: Rotation 
    if(points) {
        points.rotation.y = elapsedTime * parameters.rotationSpeed;
    }


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()