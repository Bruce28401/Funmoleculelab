
import { MoleculeData } from "../types";

export const downloadMoleculeAsHtml = (data: MoleculeData) => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - 趣味分子实验室报告</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+SC:wght@300;400;700&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #f3f4f6;
            --card-bg: rgba(255, 255, 255, 0.8);
            --info-panel-bg: rgba(0, 0, 0, 0.45);
        }
        body { 
            font-family: 'LXGW WenKai SC', sans-serif; 
            background-color: var(--bg-color); 
            color: #1e293b; 
            margin: 0;
            overflow-x: hidden;
        }
        .font-happy { font-family: 'ZCOOL KuaiLe', cursive; }
        
        #viewer-container { 
            position: relative;
            width: 100%; 
            height: 70vh; 
            min-height: 450px;
            background: #0f172a; 
            border-radius: 2rem; 
            overflow: hidden; 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        #info-panel {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            width: 320px;
            max-width: calc(100% - 3rem);
            max-height: calc(100% - 3rem);
            background: var(--info-panel-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 1.5rem;
            padding: 1.5rem;
            color: white;
            z-index: 100;
            overflow-y: auto;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }

        #info-panel.hidden-panel {
            transform: translateX(120%);
            opacity: 0;
            pointer-events: none;
        }

        .toggle-btn {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            z-index: 110;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .toggle-btn:hover { background: rgba(255,255,255,0.3); scale: 1.05; }

        .stat-badge {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 1rem;
            padding: 0.75rem;
            text-align: center;
        }

        @media (max-width: 640px) {
            #info-panel { width: calc(100% - 2rem); right: 1rem; top: 4rem; height: auto; }
            #viewer-container { height: 60vh; border-radius: 1.25rem; }
        }
    </style>
</head>
<body class="p-4 md:p-12">
    <div class="max-w-6xl mx-auto">
        <header class="mb-8 flex flex-col items-center">
            <div class="flex items-center gap-4 mb-4">
               <div class="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border-2 border-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white transform -rotate-12"><path d="M10 2v8"/><path d="M14 2v8"/><path d="M8.5 10a4.5 4.5 0 1 0 7 0h-7z"/><path d="M16 11l4.5 9a2 2 0 0 1-1.7 3H5.2a2 2 0 0 1-1.7-3L8 11"/><path d="M12 18v2"/></svg>
               </div>
               <h1 class="text-3xl md:text-4xl font-happy text-slate-800 tracking-wider">趣味分子实验室</h1>
            </div>
            <div class="h-1 w-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
        </header>

        <main class="space-y-8">
            <!-- 3D 主画幅 -->
            <div id="viewer-container">
                <div id="three-canvas" class="w-full h-full"></div>
                
                <!-- 浮动控制按钮 -->
                <button id="panel-toggle" class="toggle-btn" title="显示/隐藏详情">
                    <svg id="icon-open" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </button>

                <!-- 浮动信息面板 -->
                <div id="info-panel">
                    <div class="flex items-center gap-3 mb-4">
                        <h2 class="text-2xl font-bold pt-1">${data.name}</h2>
                        <span class="px-2 py-0.5 bg-white/20 rounded-md font-mono font-bold text-sm">${data.formula}</span>
                    </div>
                    
                    <p class="text-slate-200 text-sm leading-relaxed mb-6">
                        ${data.description}
                    </p>

                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <div class="stat-badge">
                            <p class="text-[10px] text-orange-400 font-bold uppercase mb-1">状态</p>
                            <p class="text-base font-bold">${data.properties.state}</p>
                        </div>
                        <div class="stat-badge">
                            <p class="text-[10px] text-blue-400 font-bold uppercase mb-1">熔点</p>
                            <p class="text-base font-bold">${data.properties.meltingPoint}</p>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-blue-900/40 to-sky-800/40 border border-blue-400/30 p-4 rounded-xl">
                        <h3 class="text-xs font-bold text-yellow-300 flex items-center gap-2 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                            趣味冷知识
                        </h3>
                        <p class="text-xs text-blue-100 leading-normal">${data.funFact}</p>
                    </div>
                </div>
                
                <!-- 底部提示 -->
                <div class="absolute bottom-4 left-6 z-10 text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2 select-none">
                    <span class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    拖拽旋转 滚轮缩放查看结构
                </div>
            </div>

            <!-- 说明卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                    <h3 class="text-lg font-bold mb-3 flex items-center gap-2 text-slate-700">
                        🧪 实验数据
                    </h3>
                    <ul class="space-y-2 text-sm text-slate-500">
                        <li class="flex justify-between"><span>化学名称</span> <span class="font-bold text-slate-800">${data.name}</span></li>
                        <li class="flex justify-between"><span>化学式</span> <span class="font-mono font-bold text-slate-800">${data.formula}</span></li>
                        <li class="flex justify-between"><span>原子总数</span> <span class="font-bold text-slate-800">${data.atoms.length}</span></li>
                    </ul>
                </div>
                <div class="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-center">
                    <p class="text-slate-400 italic text-sm text-center italic">“在微观世界里，每一个分子都是一件精美的艺术品。”</p>
                </div>
            </div>
        </main>

        <footer class="mt-12 py-8 border-t border-stone-200 text-center text-stone-400 text-xs">
            <p>© 趣味分子实验室 · 探索微观世界的奥秘</p>
            <p class="mt-2 opacity-50 uppercase tracking-widest">Lab Report Generated by Gemini AI</p>
        </footer>
    </div>

    <script>
        const moleculeData = ${JSON.stringify(data)};
        
        // --- 详情面板切换逻辑 ---
        const toggleBtn = document.getElementById('panel-toggle');
        const infoPanel = document.getElementById('info-panel');
        toggleBtn.addEventListener('click', () => {
            infoPanel.classList.toggle('hidden-panel');
        });

        // --- Three.js 逻辑 ---
        const container = document.getElementById('three-canvas');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);

        // 灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1.2);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);
        const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
        pointLight2.position.set(-10, -5, -10);
        scene.add(pointLight2);

        // 创建原子标签纹理
        function createLabel(text) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 128;
            ctx.fillStyle = 'rgba(255, 255, 255, 0)';
            ctx.fillRect(0, 0, 128, 128);
            ctx.font = 'bold 64px sans-serif';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 4;
            ctx.strokeText(text, 64, 64);
            ctx.fillText(text, 64, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const sprite = new THREE.Sprite(spriteMaterial);
            return sprite;
        }

        const atomVectors = [];
        moleculeData.atoms.forEach(atom => {
            // 原子球体
            const geometry = new THREE.SphereGeometry(atom.radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color: atom.color, 
                shininess: 100,
                specular: 0x555555
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(atom.x, atom.y, atom.z);
            group.add(mesh);
            
            // 元素名字图层 (Sprite)
            const label = createLabel(atom.element);
            label.position.set(atom.x, atom.y, atom.z + atom.radius + 0.1);
            label.scale.set(atom.radius * 1.5, atom.radius * 1.5, 1);
            group.add(label);
            
            atomVectors.push(new THREE.Vector3(atom.x, atom.y, atom.z));
        });

        // 键
        moleculeData.bonds.forEach(bond => {
            const start = atomVectors[bond.source];
            const end = atomVectors[bond.target];
            if (!start || !end) return;
            
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            const geometry = new THREE.CylinderGeometry(0.12, 0.12, length, 12);
            const material = new THREE.MeshPhongMaterial({ color: 0x94a3b8 });
            const mesh = new THREE.Mesh(geometry, material);
            
            const pos = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            mesh.position.copy(pos);
            mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
            group.add(mesh);
        });

        camera.position.z = 8;

        // 画幅伸缩响应
        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });

        // 交互
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        container.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mousemove', e => {
            if (isDragging) {
                const deltaMove = { x: e.movementX, y: e.movementY };
                group.rotation.y += deltaMove.x * 0.01;
                group.rotation.x += deltaMove.y * 0.01;
            }
        });

        // 缩放支持
        container.addEventListener('wheel', e => {
            e.preventDefault();
            camera.position.z += e.deltaY * 0.005;
            camera.position.z = Math.max(3, Math.min(20, camera.position.z));
        }, { passive: false });

        function animate() {
            requestAnimationFrame(animate);
            if (!isDragging) group.rotation.y += 0.003;
            renderer.render(scene, camera);
        }
        animate();
    </script>
</body>
</html>
  `;

  // 创建下载
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.name}_实验报告.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
