import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

export interface LoaderOption<T = any> {
  type: 'obj' | 'gltf' | 'glb' | 'json' | 'fbx'
  url: string
  dracoUrl?: string
  mtlUrl?: string
  onLoad: (data: T) => void
  onProgress?: (event: ProgressEvent, ...arg: any) => void
  onError?: (event: ErrorEvent) => void
}

/**
 * 封装Threejs初始化基本参数和设置
 */
class FzThree {
  /** 画布id，DomId */
  id: string
  /** 画布DOM */
  canvas: HTMLElement
  originCameraPosition: THREE.Vector3 = new THREE.Vector3(-615, 40, 840)
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  axesHelper: THREE.AxesHelper
  controls: OrbitControls
  textureLoader: THREE.TextureLoader

  /** 当前帧id */
  frameId: number
  objLoader: OBJLoader
  mtILoader: MTLLoader
  gltfLoader: GLTFLoader
  fileLoader: THREE.FileLoader
  fbxLoader: FBXLoader

  constructor(container: string | HTMLElement) {
    if (container instanceof HTMLElement) {
      if (container.tagName !== 'CANVAS') {
        throw new Error(`Element must be canvas`)
      }
      this.canvas = container
      if (container.id) {
        this.id = container.id
      } else {
        this.id = `${Math.random()}`
        this.canvas.id = this.id
      }
    } else {
      this.id = container
      const el = document.getElementById(container)
      if (!el) {
        throw new Error(`Element "${container}" Not Found`)
      }
      if (el.tagName !== 'CANVAS') {
        throw new Error(`Element must be canvas`)
      }
      this.canvas = el
    }
  }

  /**
   * 销毁，释放资源，调用 dispose 方法
   * https://threejs.org/manual/#en/cleanup
   */
  destroy() {
    // TODO: 释放资源
  }

  /**
   * 初始化
   */
  initThree() {
    if (!this.canvas) {
      throw new Error(`Canvas Element not found`)
    }
    // 添加场景
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(this.scene.background, 1, 5000)
    this.scene.name = 'FzThreeScene'
    // this.scene.background = new THREE.Color().setHSL(0.6, 0, 1)
    this.scene.background = new THREE.Color(0x444444)
    // 相机
    this.camera = new THREE.PerspectiveCamera(50, 2, 0.1, 3000)
    this.camera.name = 'FzThreeCamera'
    this.camera.position.set(this.originCameraPosition.x, this.originCameraPosition.y, this.originCameraPosition.z)
    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas
    })
    // 纹理加载器
    this.textureLoader = new THREE.TextureLoader()
  }

  // 初始化helper
  initHelper() {
    this.axesHelper = new THREE.AxesHelper(1000)
    this.scene.add(this.axesHelper)
  }

  // 初始化控制器
  initOrbitControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    this.controls = controls
  }

  initLight() {
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    // directionalLight.position.set(30, 30, 30).normalize()
    // this.scene.add(directionalLight)
    // const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
    // this.scene.add(hemisphereLight)

    // const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2)
    // hemiLight.position.set(600, 600, 0)
    // this.scene.add(hemiLight)

    // const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10)
    // this.scene.add(hemiLightHelper)

    //
    const ambientLight = new THREE.AmbientLight(0xffffff)
    this.scene.add(ambientLight)

    // const dirLight = new THREE.DirectionalLight(0xffffff, 3)
    // dirLight.position.set(-20, 20, 20)
    // dirLight.position.multiplyScalar(30)
    // this.scene.add(dirLight)

    // dirLight.castShadow = true

    // dirLight.shadow.mapSize.width = 2048
    // dirLight.shadow.mapSize.height = 2048

    // const d = 50

    // dirLight.shadow.camera.left = -d
    // dirLight.shadow.camera.right = d
    // dirLight.shadow.camera.top = d
    // dirLight.shadow.camera.bottom = -d

    // dirLight.shadow.camera.far = 3500
    // dirLight.shadow.bias = -0.0001

    // const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10)
    // this.scene.add(dirLightHelper)
  }

  loaderModel(option: LoaderOption) {
    // 使用fileLoader建议开启缓存
    THREE.Cache.enabled = true
    switch (option.type) {
      case 'obj':
        if (!this.objLoader) {
          this.objLoader = new OBJLoader()
        }
        if (!this.mtILoader) {
          this.mtILoader = new MTLLoader()
        }
        this.mtILoader.load(option.mtlUrl || '', (materials: any) => {
          materials.preload()
          this.objLoader.setMaterials(materials).load(option.url, option.onLoad, option.onProgress, option.onError)
        })
        break
      case 'gltf':
      case 'glb':
        if (this.gltfLoader) {
          this.gltfLoader = new GLTFLoader()
          const dracoLoader = new DRACOLoader()
          dracoLoader.setDecoderPath(option.dracoUrl || 'draco/')
          this.gltfLoader.setDRACOLoader(dracoLoader)
        }
        this.gltfLoader.load(option.url, option.onLoad, option.onProgress, option.onError)
        break
      case 'fbx':
        if (!this.fbxLoader) {
          this.fbxLoader = new FBXLoader()
        }
        this.fbxLoader.load(option.url, option.onLoad, option.onProgress, option.onError)
        break
      case 'json':
        if (!this.fileLoader) {
          this.fileLoader = new THREE.FileLoader().setResponseType('json')
        }
        this.fileLoader.load(option.url, option.onLoad, option.onProgress, option.onError)
        break
      default:
        console.error('[Loader Error]: 仅支持 obj、gltf、glb、json格式的文件解析')
        break
    }
  }

  interateLoad(objFileList: LoaderOption[], onProgress?: Function | null, onAllLoad?: Function | null) {
    const that = this
    let fileIndex = 0
    const loads: any[] = []

    function interateLoadForIt() {
      const currObjFile = objFileList[fileIndex]
      that.loaderModel({
        type: currObjFile.type,
        url: currObjFile.url,
        dracoUrl: currObjFile.dracoUrl,
        mtlUrl: currObjFile.mtlUrl,
        onLoad: function (obj: any) {
          loads.push(obj)
          if (currObjFile.onLoad) {
            currObjFile.onLoad(obj)
          }
          fileIndex += 1
          if (fileIndex < objFileList.length) {
            interateLoadForIt()
          } else {
            if (onAllLoad) {
              onAllLoad(loads)
            }
          }
        },
        onProgress: function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
          if (currObjFile.onProgress) {
            currObjFile.onProgress(xhr, fileIndex)
          }
          if (onProgress) {
            onProgress(xhr, fileIndex)
          }
        },
        onError: function (err) {
          console.error('An error happened', err)
        }
      })
    }

    interateLoadForIt()
  }

  resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement
    const pixelRatio = window.devicePixelRatio
    const width = (canvas.clientWidth * pixelRatio) | 0
    const height = (canvas.clientHeight * pixelRatio) | 0
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      this.renderer.setSize(width, height, false)
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight
      this.camera.updateProjectionMatrix()
    }
    return needResize
  }

  render(callback: Function, time?: number) {
    this.resizeRendererToDisplaySize()
    callback && callback(time)
    this.frameId = requestAnimationFrame(time => this.render(callback, time))
  }
}

export default FzThree
