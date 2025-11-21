import * as THREE from "three";
import ScreenRenderEngine from "./renderEngine";
import ScreenTextEngine from "./textEngine";
import { Assists } from "../loader";
import Terminal from "../../terminal";

function valMap(x: number, from: [number, number], to: [number, number]) {
  const y = ((x - from[0]) / (from[1] - from[0])) * (to[1] - to[0]) + to[0];

  if (to[0] < to[1]) {
    if (y < to[0]) return to[0];
    if (y > to[1]) return to[1];
  } else {
    if (y > to[0]) return to[0];
    if (y < to[1]) return to[1];
  }

  return y;
}

function clamp(val: number, min: number, max: number){
   return Math.min(Math.max(val, min), max);
}


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

    
    // Video plane behind text but in front of background
    const smilePlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1, 1 ),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    sceneRTT.add(smilePlane);
    smilePlane.scale.set(1.1,1.1,1.1)
    smilePlane.position.set(0.7, -0.5, 0);
    //1.496+0.4)/2
  
  // Load video texture
    const smileElement = document.createElement('video');
    smileElement.src = '/videos/smiley_01_mask.mp4';
    smileElement.crossOrigin = 'anonymous';
    smileElement.loop = true;
    smileElement.muted = true;
    smileElement.playsInline = true;
  
    smileElement.addEventListener('loadeddata', () => {
      const smileTexture = new THREE.VideoTexture(smileElement);
      smileTexture.minFilter = THREE.LinearFilter;
      smileTexture.magFilter = THREE.LinearFilter;
      smileTexture.format = THREE.RGBAFormat;

      smilePlane.material = new THREE.MeshBasicMaterial({ color: 0xf99021 , map: smileTexture, alphaMap:smileTexture,transparent:true, opacity:0.0 });
  
      smileElement.play().catch(() => {
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

  const tick = (deltaTime: number, elapsedTime: number, scroll: number, blend:number, screenScale: number) => {
    const invBlend = 1-blend;
    //videoPlane.scale.set(1,1,1)
    screenRenderEngine.cameraRTT.left = -0.1 * screenScale - .5 * invBlend;
    screenRenderEngine.cameraRTT.right = 1.496 * screenScale - .5 * invBlend;
    // screenRenderEngine.cameraRTT.top = 0.1 * screenScale;
    // screenRenderEngine.cameraRTT.bottom = -1.1 * screenScale;
    screenRenderEngine.cameraRTT.zoom = 1;
    screenRenderEngine.cameraRTT.updateProjectionMatrix();

    //smile fade in
    console.log(scroll)
    smilePlane.material.opacity = clamp(valMap(scroll, [0.5, 1], [0, 1]),0,1)
    
    screenTextEngine.pla

    screenRenderEngine.tick(deltaTime, elapsedTime, scroll);
    screenTextEngine.tick(deltaTime, elapsedTime);

  };

  return { tick, screenRenderEngine, screenTextEngine };
}
