<template>
    <canvas class="three-container" id="refSoldierModel" ref="threeContainerRef" />
  
    <el-drawer v-model="drawer" title="I am the title" :with-header="false" @closed="handleDrawerClose">
      <div v-if="drawerType === routerKey">
        <h3>我的路由器</h3>
        <div>Wifi-名称：xxxxxxx</div>
        <div>Wifi-密码：xxxxxxx</div>
      </div>
      <div v-else-if="drawerType === characterKey">
        <h3>我的信息</h3>
        <div>用户姓名：桐人</div>
        <div>宽带号码：xxxxxx</div>
      </div>
    </el-drawer>
  </template>
  
  <script lang="ts" setup name="BasicGeoMetry">
  import { onMounted, ref } from 'vue'
  import FzThree from './FzThree'
  import * as THREE from 'three'
  import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
  import * as TWEEN from '@tweenjs/tween.js'
 
  const prefixKey = 'my-'
  const routerKey = prefixKey + 'router'
  const characterKey = prefixKey + 'character'
  const threeContainerRef = ref(null as unknown as HTMLElement)
  const drawer = ref(false)
  const drawerType = ref('')
  let app: FzThree
  let characterMixer: THREE.AnimationMixer | null = null
  const clock = new THREE.Clock()
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  
  const handleDrawerClose = () => {
    lookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(app.originCameraPosition.x, app.originCameraPosition.y, app.originCameraPosition.z))
  }
  
  const lookAt = (target: THREE.Vector3, position: THREE.Vector3) => {
    console.log('target', target, 'position', position)
    const isReset = target.x === 0 && target.y === 0 && target.z === 0
    if (!isReset) {
      app.controls.target = target
    }
    new TWEEN.Tween(app.camera.position)
      .to(position, 1500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(function () {
        app.controls.update()
      })
      .onComplete(function () {
        //error
        // app.controls.target = target
        if (isReset) {
          app.controls.target = target
          app.controls.update()
          return
        }
        drawer.value = true
      })
      .start()
  }
  
  const getMyModelName = (model: THREE.Object3D<THREE.Event> | null): undefined | THREE.Object3D<THREE.Event> => {
    if (!model) {
      return
    }
    if (model.name === 'FzThreeScene') {
      return
    }
    if (model.name.startsWith(prefixKey)) {
      return model
    }
    return getMyModelName(model.parent)
  }
  
  const handleClickModel = (model: THREE.Object3D<THREE.Event>) => {
    const myModel = getMyModelName(model)
    console.log('获取的当前模型信息:', myModel)
    // alert(myModel?.name || 'null')
    drawerType.value = myModel?.name || ''
  
    if (myModel?.name === characterKey) {
      myModel && lookAt(new THREE.Vector3(1, -50, 0), new THREE.Vector3(0, -100, 330))
      // error
    } else if (myModel?.name === routerKey) {
      const x = myModel?.position.x || 0
      const y = myModel?.position.y || 0
      const z = myModel?.position.z || 0
      const targetPos = new THREE.Vector3(x, y, z)
      myModel && lookAt(targetPos, new THREE.Vector3(100, 220, 100))
    }
  }
  
  const onClick = (event: MouseEvent) => {
    // 计算鼠标或触摸点的位置
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    // 更新射线   注意——> this.camera 是相机   定义到data里的
    raycaster.setFromCamera(mouse, app.camera)
    // 计算与所有对象的交点
    const intersects = raycaster.intersectObjects(app.scene.children, true)
    if (intersects.length > 0) {
      // 处理点击事件
      // intersects[0] 包含了第一个交点
      const clickedObject = intersects[0].object
      // 处理模型
      handleClickModel(clickedObject)
    }
  }
  
  onMounted(() => {
    window.addEventListener('dblclick', onClick, false)
    // window.addEventListener('click', onClick, false)
  })
  
  const init = () => {
    app = new FzThree(threeContainerRef.value)
    app.initThree()
    app.initLight()
    // app.initHelper()
    app.initOrbitControls()
    //@ts-ignore
    window.app = app
  
    // https://threejs.org/docs/#api/zh/helpers/GridHelper
    // const gridHelper = new THREE.GridHelper(1000, 12)
    // app.scene.add(gridHelper)
  
    // 3d model
    const loader = new GLTFLoader()
  
    loader.load(
      '/gltf/low_poly_isometric_baby_girl_room.glb',
      function (gltf: GLTF) {
        console.log(gltf)
        gltf.scene.name = 'basic-room'
        gltf.scene.scale.set(45, 45, 45)
        gltf.scene.position.set(0, -400, 0)
        gltf.scene.rotateY(-Math.PI / 2)
        app.scene.add(gltf.scene)
      },
      xhr => {
        // 模型加载期间的回调函数
        console.log(`${(xhr.loaded / xhr.total) * 100}% building model loaded`)
      },
      function (error: any) {
        console.error(error)
      }
    )
  
    loader.load(
      '/gltf/router.glb',
      function (gltf: GLTF) {
        console.log(gltf)
        gltf.scene.name = routerKey
        gltf.scene.scale.set(0.3, 0.3, 0.3)
        gltf.scene.position.set(400, -180, 320)
  
        app.scene.add(gltf.scene)
      },
      xhr => {
        // 模型加载期间的回调函数
        console.log(`${(xhr.loaded / xhr.total) * 100}% building model loaded`)
      },
      function (error: any) {
        console.error(error)
      }
    )
  
    const modelLoader = new GLTFLoader().setPath('/gltf/shibahu/')
    modelLoader.load(
      'scene.gltf',
      function (gltf: GLTF) {
        console.log(gltf)
        const model = gltf.scene
        model.name = characterKey
        model.scale.set(240, 240, 240)
        gltf.scene.position.set(0, -360, 100)
        app.scene.add(model)
  
        // 加载动画
        const animations = gltf.animations
        if (animations.length > 0) {
          characterMixer = new THREE.AnimationMixer(model)
          const action = characterMixer.clipAction(animations[0])
          action.play()
        }
      },
      xhr => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`)
      },
      error => {
        console.error(error)
      }
    )
  
    // renderer
    app.render(() => {
      // app.controls.update()
      const delta = clock.getDelta()
      if (characterMixer) {
        characterMixer.update(delta)
      }
  
      TWEEN.update()
      app.renderer.render(app.scene, app.camera)
    })
  }
  
  onMounted(() => {
    init()
  })
  </script>
  
  <style scoped>
  .three-container {
    width: 100%;
    height: 100%;
  }
  </style>
  