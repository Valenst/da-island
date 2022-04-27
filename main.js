import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import {OrbitControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import * as dat from "https://cdn.skypack.dev/dat.gui"

let scene, camera, renderer, raycaster
let cube, light


const mouse = {
  x: undefined,
  y: undefined
}

function initialize() {
  scene = new THREE.Scene()
  raycaster = new THREE.Raycaster()

  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
  camera.fov = 20
  // Kamera Isometric
  // var aspect = window.innerWidth / window.innerHeight;
  // var d = 20;
  // camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 0.1, 1000 );
  camera.position.set( 15, 15, 15 ); // all components equal
  camera.lookAt( scene.position ); // or the origin
  camera.zoom = 0.35
  camera.updateProjectionMatrix();

  renderer = new THREE.WebGLRenderer({ antialias: true })
  
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(devicePixelRatio)
  document.body.appendChild(renderer.domElement)
  renderer.setClearColor(0xC9FFFE)
  
  let orbitControl = new OrbitControls(camera, renderer.domElement)
  // orbitControl.enableRotate = false
  // orbitControl.enablePan = false
  // orbitControl.enableZoom = false
  orbitControl.minPolarAngle = 1;
  orbitControl.maxPolarAngle = 1;

  // Create stuff
  // Untuk assign image texture
  const textureLoader = new THREE.TextureLoader()
  const tx_grass = textureLoader.load("./textures/grass.png", function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.offset.set( 0, 0 )
    texture.repeat.set( 5, 5 )
  })
  const tx_dirt = textureLoader.load("./textures/dirt.png")
  const tx_stone = textureLoader.load("./textures/stone.png")

  const tx_nr_grass = textureLoader.load("./textures/grass_normal.png")
  const tx_ds_grass = textureLoader.load("./textures/grass_displacement.png")

  // Bikin pixel texture ga nge-blur
  function nearestFilter (texture) {
    texture.minFilter = texture.magFilter = THREE.NearestFilter;
  }
  nearestFilter(tx_grass)
  nearestFilter(tx_dirt)
  nearestFilter(tx_stone)
  nearestFilter(tx_nr_grass)
  nearestFilter(tx_ds_grass)

  // Masukin texture ke material
  // 1. Semua sisi sama
  // 2. Sisi beda-beda
  const mt_all_grass = new THREE.MeshStandardMaterial({ map: tx_grass })
  const mt_proper_grass = [
    new THREE.MeshStandardMaterial({ map: tx_dirt }), // x positive
    new THREE.MeshStandardMaterial({ map: tx_dirt }), // x negative
    new THREE.MeshStandardMaterial({
      map: tx_grass,
      // normalMap: tx_nr_grass,
      // displacementMap: tx_ds_grass,
      // displacementScale: 0.05,
    }), // y positive
    new THREE.MeshStandardMaterial({ map: tx_dirt }), // y negative
    new THREE.MeshStandardMaterial({ map: tx_dirt }), // z positive
    new THREE.MeshStandardMaterial({ map: tx_dirt }), // z negative
  ]

  const seg = 1
  const ge_box = new THREE.BoxGeometry(20, 1, 15, seg, seg, seg)

  cube = new THREE.Mesh(
    ge_box,
    mt_proper_grass
  )
  scene.add(cube)

  // Bikin outline
  const edges = new THREE.EdgesGeometry( ge_box );
  const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial({ color: 0x112233 }) );
  scene.add( line );
    
  // Light
  // light = new THREE.PointLight(0xFFFFFF, 1.5)
  light = new THREE.AmbientLight(0xFFFFFF)
  // light = new THREE.HemisphereLight( 0xfdfbd3, 0xffffff, 0.6 )
  light.position.set(0, 100, 0)
  scene.add(light)
}



function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  
  cube.geometry.attributes.position.needsUpdate = true

  const intersects = raycaster.intersectObject(cube)
  raycaster.setFromCamera(mouse, camera)
  if (intersects.length > 0) {
    // console.log("intersect")
      // let Offset = new THREE.Vector3(0,0,2)
      let cameraPosition = new THREE.Vector3().copy(camera.position) 
      let Offset = (cameraPosition.sub(intersects[0].point)).multiplyScalar(0.1)
      
      let newPosition = new THREE.Vector3().addVectors(intersects[0].point,Offset)
      light.position.copy(newPosition)
  }
}


addEventListener('mousemove', (event) => {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
})

window.onload = () => {
  initialize()
  console.log("Initialize done")
  animate()
}

window.onresize = () => {
  console.log("Resized")
  CorrectAspectRatio();
}

function CorrectAspectRatio(){
  let width = window.innerWidth
  let height = window.innerHeight
  renderer.setSize(width, height)
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
}
