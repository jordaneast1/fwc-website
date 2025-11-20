import * as THREE from "three";
import ScreenRenderEngine from "./renderEngine";
import ScreenTextEngine from "./textEngine";
import { Assists } from "../loader";
import Terminal from "../../terminal";

export default function Screen(
  assists: Assists,
  renderer: THREE.WebGLRenderer
) {
  const sceneRTT = new THREE.Scene();

  // // Geometry
  // const backGround = new THREE.Mesh(
  //   new THREE.PlaneGeometry(1, 1, 1, 1),
  //   new THREE.MeshBasicMaterial({ color: "red" })
  // );
  // backGround.position.set(0.5, -0.5, -0.01);

    // Video plane behind text but in front of background
    const videoPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2, 2/(16/9) ),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    sceneRTT.add(videoPlane);
    videoPlane.scale.set(1.1,1.1,1.1)
    videoPlane.position.set(0.9, -0.5, -0.05);
    //1.496+0.4)/2
  
  // Load video texture
    const videoElement = document.createElement('video');
    videoElement.src = '/videos/testVid_HD_LONG.mp4';
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
  
    videoElement.addEventListener('loadeddata', () => {
      const videoTexture = new THREE.VideoTexture(videoElement);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoPlane.material = new THREE.MeshBasicMaterial({ map: videoTexture });
  
      videoElement.play().catch(() => {
        document.addEventListener('click', () => {
          videoElement.play();
        }, { once: true });
      });
    });
  
  const screenTextEngine = ScreenTextEngine(
    assists,
    sceneRTT,
  );

  const screenRenderEngine = ScreenRenderEngine(assists, renderer, sceneRTT);

  Terminal(screenTextEngine);

  const tick = (deltaTime: number, elapsedTime: number, scroll: number, screenScale: number) => {
    const invBlend = 1-scroll;
    //videoPlane.scale.set(1,1,1)
    screenRenderEngine.cameraRTT.left = -0.1 * screenScale - .5 * invBlend;
    screenRenderEngine.cameraRTT.right = 1.496 * screenScale - .5 * invBlend;
    // screenRenderEngine.cameraRTT.top = 0.1 * screenScale;
    // screenRenderEngine.cameraRTT.bottom = -1.1 * screenScale;
    screenRenderEngine.cameraRTT.zoom = 1;
    screenRenderEngine.cameraRTT.updateProjectionMatrix();

    screenRenderEngine.tick(deltaTime, elapsedTime, scroll);
    screenTextEngine.tick(deltaTime, elapsedTime);

  };

  return { tick, screenRenderEngine, screenTextEngine };
}
