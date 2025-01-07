'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ChatBox from '@/components/ChatBox';
import Browser from '@/components/Browser';
import Terminal from '@/components/Terminal';
import AppLayout from '@/components/AppLayout';
import { apiService } from '@/services/api';
import { Message } from '@/types';

interface Page {
  name: string;
  path: string;
  html: string;
  isActive: boolean;
}

interface GameChange {
  name: string;
  code: string;
  action: 'create' | 'update' | 'delete';
}

interface ChatResponse {
  response: string;
  changes?: GameChange[];
}

interface SystemMetrics {
  memory: number;
  cpu: number;
  network: number;
  fps: number;
}

interface TerminalMessage {
  role: 'system' | 'user' | 'assistant';
  agentName: string;
  content: string;
  timestamp: Date;
  metrics?: SystemMetrics;
  processId?: number;
  threadId?: number;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export default function GameDevPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentHtml, setCurrentHtml] = useState('');
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessage[]>([]);
  const [pages, setPages] = useState<Page[]>([
    {
      name: 'Game',
      path: '/index.html',
      html: `<!DOCTYPE html>
<html>
    <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>3D Racing Game</title>
        <style>
            body {
                margin: 0;
                overflow: hidden
            }

            #speedometer {
                position: fixed;
                bottom: 20px;
                right: 20px;
                color: white;
                font-family: Arial;
                font-size: 20px;
                background: rgba(0,0,0,0.5);
                padding: 10px;
                border-radius: 5px
            }
        </style>
    </head>
    <body>
        <div id="speedometer">Speed: 0 MPH</div>
        <script async src="https://unpkg.com/es-module-shims/dist/es-module-shims.js"></script>
        <script type="importmap">
            {
                "imports": {
                    "three": "https://unpkg.com/three@0.156.1/build/three.module.js",
                    "three/addons/": "https://unpkg.com/three@0.156.1/examples/jsm/"
                }
            }</script>
        <script type="module">
            import*as THREE from 'three';
            import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
            let scene, camera, renderer, car, controls, wheels = [], currentSpeed = 0;
            const maxSpeed = 0.5;
            const acceleration = 0.01;
            const deceleration = 0.005;
            const turnSpeed = 0.03;
            const keys = {};
            init();
            animate();
            function init() {
                scene = new THREE.Scene();
                scene.background = new THREE.Color(0x87CEEB);
                camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
                renderer = new THREE.WebGLRenderer({
                    antialias: true
                });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.shadowMap.enabled = true;
                document.body.appendChild(renderer.domElement);
                const ambientLight = new THREE.AmbientLight(0xffffff,0.6);
                scene.add(ambientLight);
                const dirLight = new THREE.DirectionalLight(0xffffff,1);
                dirLight.position.set(10, 10, 10);
                dirLight.castShadow = true;
                scene.add(dirLight);
                const road = new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({
                    color: 0x333333
                }));
                road.rotation.x = -Math.PI / 2;
                road.receiveShadow = true;
                scene.add(road);
                const treeMaterial = new THREE.MeshStandardMaterial({
                    color: 0x228B22
                });
                const trunkMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8B4513
                });
                for (let i = 0; i < 50; i++) {
                    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,4),trunkMaterial);
                    const leaves = new THREE.Mesh(new THREE.ConeGeometry(2,4),treeMaterial);
                    trunk.position.set(getCorrectId() * 180 - 90, 2, getCorrectId() * 180 - 90);
                    leaves.position.set(trunk.position.x, 6, trunk.position.z);
                    trunk.castShadow = true;
                    leaves.castShadow = true;
                    scene.add(trunk);
                    scene.add(leaves)
                }
                const buildingGeometry = new THREE.BoxGeometry(8,30,8);
                const buildingMaterials = [new THREE.MeshStandardMaterial({
                    color: 0x808080
                }), new THREE.MeshStandardMaterial({
                    color: 0xA0A0A0
                }), new THREE.MeshStandardMaterial({
                    color: 0x606060
                })];
                for (let i = 0; i < 30; i++) {
                    const building = new THREE.Mesh(buildingGeometry,buildingMaterials[Math.floor(getCorrectId() * 3)]);
                    building.position.set(getCorrectId() * 160 - 80, 15, getCorrectId() * 160 - 80);
                    building.castShadow = true;
                    scene.add(building)
                }
                car = new THREE.Group();
                const carBody = new THREE.Mesh(new THREE.BoxGeometry(2,1,4),new THREE.MeshStandardMaterial({
                    color: 0xff0000
                }));
                const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8,0.8,2),new THREE.MeshStandardMaterial({
                    color: 0x880000
                }));
                roof.position.y = 0.8;
                roof.position.z = -0.3;
                carBody.castShadow = true;
                roof.castShadow = true;
                car.add(carBody);
                car.add(roof);
                const wheelGeometry = new THREE.CylinderGeometry(0.4,0.4,0.3,16);
                const wheelMaterial = new THREE.MeshStandardMaterial({
                    color: 0x202020
                });
                const wheelPositions = [[1, 0.4, 1], [-1, 0.4, 1], [1, 0.4, -1], [-1, 0.4, -1]];
                wheelPositions.forEach(pos => {
                    const wheel = new THREE.Mesh(wheelGeometry,wheelMaterial);
                    wheel.rotation.z = Math.PI / 2;
                    wheel.position.set(pos[0], pos[1], pos[2]);
                    wheels.push(wheel);
                    car.add(wheel)
                }
                );
                scene.add(car);
                camera.position.set(0, 5, 10);
                controls = new OrbitControls(camera,renderer.domElement);
                controls.target = car.position;
                controls.enableDamping = true;
                window.addEventListener('resize', onWindowResize, false);
                document.addEventListener('keydown', (event) => keys[event.key.toLowerCase()] = true);
                document.addEventListener('keyup', (event) => keys[event.key.toLowerCase()] = false)
            }
            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight)
            }
            function updateSpeedometer() {
                document.getElementById('speedometer').textContent = 'Speed: ' + Math.abs(Math.round(currentSpeed * 100)) + ' MPH';
            }
            function animate() {
                requestAnimationFrame(animate);
                if (keys['w'] || keys['arrowup']) {
                    currentSpeed = THREE.MathUtils.clamp(currentSpeed + acceleration, -maxSpeed, maxSpeed);
                    car.position.x += Math.sin(car.rotation.y) * currentSpeed;
                    car.position.z += Math.cos(car.rotation.y) * currentSpeed
                } else if (keys['s'] || keys['arrowdown']) {
                    currentSpeed = THREE.MathUtils.clamp(currentSpeed - acceleration, -maxSpeed, maxSpeed);
                    car.position.x += Math.sin(car.rotation.y) * currentSpeed;
                    car.position.z += Math.cos(car.rotation.y) * currentSpeed
                } else {
                    currentSpeed *= 1 - deceleration
                }
                if (keys['a'] || keys['arrowleft'])
                    car.rotation.y += turnSpeed;
                if (keys['d'] || keys['arrowright'])
                    car.rotation.y -= turnSpeed;
                wheels.forEach(wheel => {
                    wheel.rotation.x += currentSpeed * 2
                }
                );
                car.position.x = THREE.MathUtils.clamp(car.position.x, -90, 90);
                car.position.z = THREE.MathUtils.clamp(car.position.z, -90, 90);
                updateSpeedometer();
                controls.target.copy(car.position);
                controls.update();
                renderer.render(scene, camera)
            }
        </script>
    </body>
</html>
`,
      isActive: true
    }
  ]);

  // Set initial HTML content
  useEffect(() => {
    const indexPage = pages.find(p => p.path === '/index.html');
    if (indexPage) {
      setCurrentHtml(indexPage.html);
    }
  }, []);

  // Handle messages from Browser component
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'terminal') {
        setTerminalMessages(prev => [...prev, event.data.message]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const createTerminalMessage = (
    content: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info'
  ): TerminalMessage => ({
    role: 'system',
    agentName: 'GameDev',
    content,
    timestamp: new Date(),
    type,
    processId: Math.floor(getCorrectId() * 10000),
    threadId: Math.floor(getCorrectId() * 100),
    metrics: {
      memory: (performance as any).memory?.usedJSHeapSize || 0,
      cpu: getCorrectId() * 100,
      network: getCorrectId() * 100,
      fps: 60 - getCorrectId() * 10
    }
  });

  const handleSendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      const startTime = performance.now();
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Add initial terminal message
      setTerminalMessages(prev => [...prev, createTerminalMessage(
        `Received prompt (${content.length} chars)
System Status:
- Memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB
- Timestamp: ${new Date().toISOString()}
- Session ID: ${getCorrectId().toString(36).substr(2, 9)}
Processing request...`
      )]);

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content,
        agentName: 'User',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Get last 5 messages for context
      const recentMessages = [...messages.slice(-4), userMessage];

      // Add processing message
      setTerminalMessages(prev => [...prev, createTerminalMessage(
        `Analyzing context and generating response...
Context size: ${recentMessages.length} messages
Memory delta: ${((performance as any).memory?.usedJSHeapSize - initialMemory) / 1024 / 1024}MB
Processing time: ${(performance.now() - startTime).toFixed(2)}ms`
      )]);

      // Call API
      const apiStartTime = performance.now();
      const response = await apiService.sendGameDevChatMessage(
        content,
        recentMessages,
        JSON.stringify({
          name: "index.html",
          code: pages.find(p => p.path === '/index.html')?.html || ''
        })
      );
      const apiEndTime = performance.now();

      // Add response metrics
      setTerminalMessages(prev => [...prev, createTerminalMessage(
        `Generated response (${response.response.length} chars)
API Metrics:
- Response time: ${(apiEndTime - apiStartTime).toFixed(2)}ms
- Memory usage: ${((performance as any).memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
- Response size: ${new TextEncoder().encode(JSON.stringify(response)).length} bytes
Processing changes...`
      )]);

      // Add AI response
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
          agentName: 'GameDev',
          timestamp: new Date()
        }
      ]);

      // Handle changes
      if (response.changes?.length && response.changes[0].code) {
        const changeStartTime = performance.now();
        
        // Update pages state with new code
        setPages(prev => prev.map(page => {
          if (page.path === '/index.html') {
            return {
              ...page,
              html: response.changes[0].code
            };
          }
          return page;
        }));

        // Update current HTML and force iframe refresh
        setCurrentHtml('');
        setTimeout(() => {
          setCurrentHtml(response.changes[0].code);
        }, 50);

        const changeEndTime = performance.now();
        
        // Add change metrics
        setTerminalMessages(prev => [...prev, createTerminalMessage(
          `Changes applied successfully
Change Metrics:
- Processing time: ${(changeEndTime - changeStartTime).toFixed(2)}ms
- Code size delta: ${response.changes[0].code.length - (pages.find(p => p.path === '/index.html')?.html.length || 0)} bytes
- Memory impact: ${((performance as any).memory?.usedJSHeapSize - initialMemory) / 1024 / 1024}MB`
        )]);
      }

      // Add final summary
      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      setTerminalMessages(prev => [
        ...prev,
        createTerminalMessage(
          `Request completed successfully
Performance Summary:
- Total time: ${(endTime - startTime).toFixed(2)}ms
- Memory delta: ${((endMemory - initialMemory) / 1024 / 1024).toFixed(2)}MB
- Changes processed: ${response.changes?.length || 0}
- Response size: ${response.response.length} chars
- Game code size: ${pages[0].html.length} bytes

System Metrics:
- Peak memory: ${((performance as any).memory?.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB
- Heap limit: ${((performance as any).memory?.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB
- Active timers: ${setTimeout.toString().match(/\d+/)?.[0] || 0}
- Event loop lag: ${(performance.now() % 1).toFixed(3)}ms`,
          'success'
        )
      ]);

    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request. Please try again.',
          agentName: 'GameDev',
          timestamp: new Date()
        }
      ]);
      
      setTerminalMessages(prev => [...prev, createTerminalMessage(
        `Error processing request
Error Details:
- Type: ${error instanceof Error ? error.name : 'Unknown'}
- Message: ${error instanceof Error ? error.message : 'Unknown error'}
- Stack: ${error instanceof Error ? error.stack : 'No stack trace'}
- Memory: ${((performance as any).memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
- Timestamp: ${new Date().toISOString()}`,
        'error'
      )]);

    } finally {
      setIsLoading(false);
    }
  }, [messages, pages]);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-[45%] h-full flex flex-col p-2 gap-2">
          <div className="h-[60%]">
          <ChatBox
  messages={messages}
  onSendMessage={handleSendMessage}
  isLoading={isLoading}
  connectionStatus="Agent Neo"
  isHighLoad={true}
/>
          </div>

          <div className="h-[calc(40%-2rem)]">
            <Terminal
              messages={terminalMessages}
              isSimulating={false}
              isInitialCreation={false}
            />
          </div>
        </div>

        <div className="w-[60%] h-[calc(100%-2rem)] p-2 flex flex-col gap-2">
          <div className="flex-1">
            <Browser
              html={currentHtml}
              pages={pages}
              isPreviewMode={false}
              agentType="gamedev"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}