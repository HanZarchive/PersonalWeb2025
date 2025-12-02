import * as THREE from 'three';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

// --- 全局变量 ---
let scene, camera, renderer, myselfObj;
let stressLevel = 0;
let currentPhase = 1;
let isExploded = false;

// AI 视觉相关变量
let faceLandmarker;
let video;
let lastVideoTime = -1;
let isGazing = false; // 是否正在注视

// 初始化
initThreeJS();
initAI();

// ==========================================
// Part 1: AI 视觉与摄像头设置 (MediaPipe)
// ==========================================
async function initAI() {
    // 1. 加载 MediaPipe 模型
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1
    });

    // 2. 开启摄像头
    video = document.getElementById("webcam");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    
    // 摄像头加载完成后，开始渲染循环
    video.addEventListener("loadeddata", () => {
        document.getElementById("loading").style.display = "none";
        
        // 设置预览画布 (右下角那个小框)
        const previewCanvas = document.getElementById("webcam-preview");
        previewCanvas.width = video.videoWidth;
        previewCanvas.height = video.videoHeight;
        
        animate(); // 开始整个动画循环
    });
}

function detectGaze() {
    if (!faceLandmarker || !video) return;

    // 只有当视频帧更新时才检测
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const result = faceLandmarker.detectForVideo(video, performance.now());
        
        // 在右下角画出摄像头画面 (可选)
        const canvasCtx = document.getElementById("webcam-preview").getContext("2d");
        canvasCtx.drawImage(video, 0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

        // --- 核心算法：判断是否在凝视 ---
        if (result.faceLandmarks.length > 0) {
            // 获取第一个检测到的人脸
            const landmarks = result.faceLandmarks[0];
            
            // 我们简单地通过“鼻子”的位置和“脸的宽度”来判断
            // 索引 1 是鼻尖，索引 454 是左脸边缘，234 是右脸边缘
            const nose = landmarks[1]; 
            const leftCheek = landmarks[454];
            const rightCheek = landmarks[234];

            // 1. 判断是否正对屏幕 (通过左右脸颊的 Z 轴深度差)
            // 如果差值很小，说明脸是正的。如果差值大，说明头转过去了。
            const yawDiff = Math.abs(leftCheek.z - rightCheek.z);
            
            // 2. 判断是否睁眼 (MediaPipe 提供 Blendshapes)
            // 这是一个 0-1 的数值，数值越大表示某种表情越明显
            const blendshapes = result.faceBlendshapes[0].categories;
            // 找到眨眼的数据
            const eyeBlinkLeft = blendshapes.find(s => s.categoryName === 'eyeBlinkLeft').score;
            const eyeBlinkRight = blendshapes.find(s => s.categoryName === 'eyeBlinkRight').score;
            
            // 逻辑：脸部大致摆正 (yawDiff < 0.1) 且 眼睛没有完全闭上 (blink < 0.6)
            if (yawDiff < 0.05 && eyeBlinkLeft < 0.6 && eyeBlinkRight < 0.6) {
                isGazing = true;
                document.getElementById('debug-info').innerText = "状态: 正在被凝视 (PANIC)";
                document.getElementById('debug-info').style.color = "red";
            } else {
                isGazing = false;
                document.getElementById('debug-info').innerText = "状态: 视线移开";
                document.getElementById('debug-info').style.color = "green";
            }
        } else {
            // 没检测到人脸
            isGazing = false;
            document.getElementById('debug-info').innerText = "状态: 无人";
            document.getElementById('debug-info').style.color = "gray";
        }
    }
}

// ==========================================
// Part 2: Three.js 视觉表现 (Output)
// ==========================================
function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505); // 更黑一点
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xffffff, 10);
    spotLight.position.set(0, 10, 5);
    scene.add(spotLight);

    // 物体 (未来替换为 Blender 模型)
    const geometry = new THREE.IcosahedronGeometry(1.5, 40); 
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xaa8888, 
        roughness: 0.4, 
        metalness: 0.1,
    });
    
    myselfObj = new THREE.Mesh(geometry, material);
    // 保存原始顶点用于变形
    myselfObj.geometry.userData = { 
        originalPositions: myselfObj.geometry.attributes.position.array.slice() 
    };
    scene.add(myselfObj);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==========================================
// Part 3: 主循环 (Logic)
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    // 1. 运行 AI 检测
    detectGaze();

    // 2. 根据 AI 结果调整压力值
    if (currentPhase === 1) {
        if (isGazing) {
            stressLevel += 0.5; // 被凝视，压力上升
        } else {
            stressLevel -= 0.3; // 视线移开，压力缓解
        }
        
        stressLevel = Math.max(0, Math.min(100, stressLevel));
        
        // 更新视觉效果
        updatePhase1Visuals();

        // 检查是否进入下一阶段
        if (stressLevel >= 100) {
            triggerPhase2();
        }
    } else if (currentPhase === 2) {
        handlePhase2Animation();
    }

    // 更新 UI
    document.getElementById('stress-fill').style.width = stressLevel + '%';
    
    // 渲染
    renderer.render(scene, camera);
}

function updatePhase1Visuals() {
    if (!myselfObj) return;

    // 简单的自转
    myselfObj.rotation.y += 0.005;

    // 变形逻辑 (颤抖/尖锐)
    const positions = myselfObj.geometry.attributes.position;
    const originals = myselfObj.geometry.userData.originalPositions;
    const count = positions.count;
    
    // 压力越大，噪点越大
    const intensity = (stressLevel / 100) * 0.4; 
    
    // 颜色变化：压力大时变红
    const redVal = 0.6 + (stressLevel / 100) * 0.4;
    myselfObj.material.color.setRGB(redVal, 0.5 - (stressLevel/200), 0.5 - (stressLevel/200));

    for (let i = 0; i < count; i++) {
        const x = originals[i * 3];
        const y = originals[i * 3 + 1];
        const z = originals[i * 3 + 2];
        
        // 简单的颤抖算法
        if (stressLevel > 0) {
            positions.setXYZ(
                i,
                x + (Math.random() - 0.5) * intensity,
                y + (Math.random() - 0.5) * intensity,
                z + (Math.random() - 0.5) * intensity
            );
        } else {
            // 如果没有压力，慢慢恢复原状
             positions.setXYZ(i, x, y, z);
        }
    }
    positions.needsUpdate = true;
}

function triggerPhase2() {
    currentPhase = 2;
    document.getElementById('status').innerText = "Phase 2: EXPLOSION";
    document.getElementById('status').style.color = "red";
}

function handlePhase2Animation() {
    if (isExploded || !myselfObj) return;

    // 爆炸动画：快速膨胀并透明
    myselfObj.scale.multiplyScalar(1.05);
    myselfObj.material.transparent = true;
    myselfObj.material.opacity -= 0.05;

    if (myselfObj.material.opacity <= 0) {
        scene.remove(myselfObj);
        isExploded = true;
        triggerPhase3();
    }
}

function triggerPhase3() {
    currentPhase = 3;
    document.getElementById('status').innerText = "Phase 3: FREEDOM";
    document.getElementById('ui').style.color = "#333";
    
    // 瞬间切换到温暖的背景
    scene.background = new THREE.Color(0xf0f8ff); // 天蓝色
    scene.fog = new THREE.FogExp2(0xffffff, 0.005);
    
    // 移除旧灯光，添加温暖阳光
    scene.clear(); 
    const sunLight = new THREE.DirectionalLight(0xffddaa, 1.5);
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);
    
    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);
    
    // 这里未来可以添加花草模型...
}