
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
            --info-panel-bg: rgba(0, 0, 0, 0.55);
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
            height: 75vh; 
            min-height: 550px;
            background: #0f172a; 
            border-radius: 2.5rem; 
            overflow: hidden; 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        #info-panel {
            position: absolute;
            top: 1.5rem;
            left: 1.5rem;
            width: 340px;
            max-width: calc(100% - 3rem);
            max-height: calc(100% - 3rem);
            background: var(--info-panel-bg);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 2rem;
            padding: 1.75rem;
            color: white;
            z-index: 100;
            overflow-y: auto;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
        }

        #info-panel.hidden-panel {
            transform: translateX(-125%);
            opacity: 0;
            pointer-events: none;
        }

        .toggle-btn {
            position: absolute;
            top: 1.5rem;
            left: 1.5rem;
            z-index: 110;
            background: rgba(255,255,255,0.25);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.4);
            color: white;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .toggle-btn:hover { background: rgba(255,255,255,0.35); transform: scale(1.1) rotate(5deg); }

        .stat-badge {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 1.25rem;
            padding: 0.85rem;
            text-align: center;
            backdrop-filter: blur(4px);
        }

        @media (max-width: 640px) {
            #info-panel { width: calc(100% - 2rem); left: 1rem; top: 4.5rem; height: auto; padding: 1.25rem; }
            #viewer-container { height: 65vh; border-radius: 1.5rem; }
            .toggle-btn { top: 1rem; left: 1rem; width: 42px; height: 42px; }
        }
    </style>
</head>
<body class="p-4 md:p-12">
    <div class="max-w-6xl mx-auto">
        <header class="mb-10 flex flex-col items-center text-center">
            <div class="flex items-center gap-4 mb-2">
               <div class="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border-2 border-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white transform -rotate-12"><path d="M10 2v8"/><path d="M14 2v8"/><path d="M8.5 10a4.5 4.5 0 1 0 7 0h-7z"/><path d="M16 11l4.5 9a2 2 0 0 1-1.7 3H5.2a2 2 0 0 1-1.7-3L8 11"/><path d="M12 18v2"/></svg>
               </div>
               <h1 class="text-3xl md:text-5xl font-happy text-slate-800 tracking-wider">趣味分子实验室</h1>
            </div>
            <p class="text-slate-500 italic text-sm md:text-lg mb-4 font-medium opacity-90 tracking-wide">“在微观世界里，每一个分子都是一件精美的艺术品。”</p>
            <div class="h-1.5 w-40 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
        </header>

        <main>
            <!-- 3D 主画幅 -->
            <div id="viewer-container">
                <div id="three-canvas" class="w-full h-full"></div>
                
                <!-- 浮动控制按钮 -->
                <button id="panel-toggle" class="toggle-btn" title="显示/隐藏详情">
                    <svg id="icon-open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </button>

                <!-- 浮动信息面板 -->
                <div id="info-panel">
                    <div class="flex items-center gap-3 mb-5">
                        <h2 class="text-2xl md:text-3xl font-bold pt-1 tracking-tight">${data.name}</h2>
                        <span class="px-2.5 py-0.5 bg-white/20 rounded-lg font-mono font-bold text-base border border-white/20 shadow-sm">${data.formula}</span>
                    </div>
                    
                    <p class="text-slate-100 text-sm md:text-base leading-relaxed mb-8 opacity-95">
                        ${data.description}
                    </p>

                    <div class="grid grid-cols-2 gap-4 mb-8">
                        <div class="stat-badge">
                            <p class="text-[10px] text-orange-300 font-bold uppercase mb-1 tracking-widest">物理状态</p>
                            <p class="text-lg font-bold text-white">${data.properties.state}</p>
                        </div>
                        <div class="stat-badge">
                            <p class="text-[10px] text-blue-300 font-bold uppercase mb-1 tracking-widest">熔点参考</p>
                            <p class="text-lg font-bold text-white">${data.properties.meltingPoint}</p>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-blue-600/30 to-indigo-700/40 border border-white/20 p-5 rounded-2xl shadow-xl">
                        <h3 class="text-xs font-bold text-yellow-300 flex items-center gap-2 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                            探索小贴士
                        </h3>
                        <p class="text-xs md:text-sm text-blue-50 leading-relaxed italic opacity-90">
                            ${data.funFact}
                        </p>
                    </div>
                </div>
                
                <!-- 底部提示 -->
                <div class="absolute bottom-6 right-8 z-10 text-[10px] md:text-xs text-white/50 uppercase tracking-[0.25em] flex items-center gap-3 select-none">
                    <span class="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.9)]"></span>
                    Interactive 3D Structure Model
                </div>
            </div>
        </main>

        <footer class="mt-16 py-12 border-t border-stone-200 text-center text-stone-400 text-xs tracking-widest">
            <p>© 趣味分子实验室 · 探索永无止境</p>
            <p class="mt-3 opacity-30 uppercase font-bold text-[9px]">Scientific Visualization Engine Generated by Gemini AI</p>
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

        // --- Three.js 渲染引擎 ---
        const container = document.getElementById('three-canvas');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);

        // 灯光配置
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const pointLight1 = new THREE.PointLight(0xffffff, 1.8, 100);
        pointLight1.position.set(10, 15, 20);
        scene.add(pointLight1);
        const pointLight2 = new THREE.PointLight(0x44aaff, 0.8, 100);
        pointLight2.position.set(-20, -10, 0);
        scene.add(pointLight2);

        // 创建原子标签纹理函数
        function createLabel(text) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 128;
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(0, 0, 128, 128);
            ctx.font = 'bold 76px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 12;
            ctx.strokeText(text, 64, 64);
            
            ctx.fillStyle = '#1e293b';
            ctx.fillText(text, 64, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture, 
                transparent: true,
                depthTest: true,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            return sprite;
        }

        const atomVectors = [];
        moleculeData.atoms.forEach(atom => {
            // 原子球体
            const geometry = new THREE.SphereGeometry(atom.radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color: atom.color, 
                shininess: 150,
                specular: 0x888888
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(atom.x, atom.y, atom.z);
            group.add(mesh);
            
            // 元素名字标签
            const label = createLabel(atom.element);
            label.position.set(atom.x, atom.y, atom.z);
            label.scale.set(atom.radius * 1.65, atom.radius * 1.65, 1);
            group.add(label);
            
            atomVectors.push(new THREE.Vector3(atom.x, atom.y, atom.z));
        });

        // 化学键
        moleculeData.bonds.forEach(bond => {
            const start = atomVectors[bond.source];
            const end = atomVectors[bond.target];
            if (!start || !end) return;
            
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            const geometry = new THREE.CylinderGeometry(0.12, 0.12, length, 16);
            const material = new THREE.MeshPhongMaterial({ color: 0xe2e8f0 });
            const mesh = new THREE.Mesh(geometry, material);
            
            const pos = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            mesh.position.copy(pos);
            mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
            group.add(mesh);
        });

        camera.position.z = 10;

        // 响应式画幅
        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });

        // 交互手势
        let isDragging = false;
        container.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mousemove', e => {
            if (isDragging) {
                group.rotation.y += e.movementX * 0.007;
                group.rotation.x += e.movementY * 0.007;
            }
        });

        // 滚轮缩放控制
        container.addEventListener('wheel', e => {
            e.preventDefault();
            camera.position.z += e.deltaY * 0.008;
            camera.position.z = Math.max(4.5, Math.min(25, camera.position.z));
        }, { passive: false });

        function animate() {
            requestAnimationFrame(animate);
            if (!isDragging) {
                group.rotation.y += 0.0045;
                group.rotation.x += 0.0015;
            }
            renderer.render(scene, camera);
        }
        animate();
    </script>
</body>
</html>
  `;

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
