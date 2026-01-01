/**
 * Encapsulated 3D Viewer Module
 */
class ThreeDViewer {
    constructor(canvasId, modelSpecs, onModelChange) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("3D Canvas not found!");
            return;
        }
        this.modelSpecs = modelSpecs;
        this.onModelChange = onModelChange;
        this.modelIndex = 0;

        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };

        this._initScene();
        this._initModels();
        this._initEventListeners();
        this.setModel(0);
        this._animate();
    }

    _initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 2.5;

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dirLight = new THREE.DirectionalLight(0x87cefa, 1.5);
        dirLight.position.set(5, 5, 5);
        this.scene.add(dirLight);
    }

    _initModels() {
        this.models = [this._createOctahedron(), this._createReindeer()];
    }

    _createOctahedron() {
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x87cefa, wireframe: true, transparent: true, opacity: 0.9 });
        return new THREE.Mesh(geometry, material);
    }

    _createReindeer() {
        const group = new THREE.Group();
        const mat = new THREE.MeshPhongMaterial({ color: 0xdda0dd, wireframe: true, transparent: true, opacity: 0.8 });
        const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0), mat);
        group.add(body);
        const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), mat);
        head.position.set(0, 0.8, 0.5);
        group.add(head);
        const createBranch = (len, rad, pos, rotZ) => {
            const branch = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, len, 4), mat);
            branch.position.set(pos.x, pos.y, pos.z);
            branch.rotation.z = rotZ;
            return branch;
        };
        group.add(createBranch(0.8, 0.05, { x: -0.3, y: 1.2, z: 0.5 }, -Math.PI / 4));
        group.add(createBranch(0.4, 0.04, { x: -0.6, y: 1.5, z: 0.5 }, -Math.PI / 2));
        group.add(createBranch(0.8, 0.05, { x: 0.3, y: 1.2, z: 0.5 }, Math.PI / 4));
        group.add(createBranch(0.4, 0.04, { x: 0.6, y: 1.5, z: 0.5 }, Math.PI / 2));
        const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 4);
        const legMat = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true });
        [{ x: 0.4, z: 0.4 }, { x: -0.4, z: 0.4 }, { x: 0.4, z: -0.4 }, { x: -0.4, z: -0.4 }].forEach(pos => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(pos.x, -0.6, pos.z);
            group.add(leg);
        });
        group.position.y = 0.5;
        return group;
    }

    _initEventListeners() {
        const onMouseDown = (e) => {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        };
        const onMouseMove = (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;
            this.currentModelMesh.rotation.y += deltaX * 0.005;
            this.currentModelMesh.rotation.x += deltaY * 0.005;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        };
        const onMouseUp = () => { this.isDragging = false; };

        this.canvas.addEventListener('mousedown', onMouseDown);
        this.canvas.addEventListener('mousemove', onMouseMove);
        this.canvas.addEventListener('mouseup', onMouseUp);
        this.canvas.addEventListener('mouseleave', onMouseUp);

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        });
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.isDragging || e.touches.length !== 1) return;
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.previousMousePosition.x;
            const deltaY = touch.clientY - this.previousMousePosition.y;
            this.currentModelMesh.rotation.y += deltaX * 0.01;
            this.currentModelMesh.rotation.x += deltaY * 0.01;
            this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
        });
        this.canvas.addEventListener('touchend', () => { this.isDragging = false; });

        window.addEventListener('resize', () => {
            const w = this.canvas.clientWidth;
            const h = this.canvas.clientHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    }

    _animate() {
        requestAnimationFrame(() => this._animate());
        if (this.currentModelMesh && !this.isDragging) {
            this.currentModelMesh.rotation.x += 0.001;
            this.currentModelMesh.rotation.y += 0.002;
        }
        this.renderer.render(this.scene, this.camera);
    }

    setModel(index) {
        if (index < 0 || index >= this.models.length || index === this.modelIndex && this.currentModelMesh) return;
        this.modelIndex = index;

        if (this.currentModelMesh) this.scene.remove(this.currentModelMesh);

        this.currentModelMesh = this.models[this.modelIndex];
        this.currentModelMesh.rotation.set(0, 0, 0);
        this.scene.add(this.currentModelMesh);

        this.onModelChange(this.modelIndex);
    }

    nextModel() {
        this.setModel((this.modelIndex + 1) % this.models.length);
    }

    prevModel() {
        this.setModel((this.modelIndex - 1 + this.models.length) % this.models.length);
    }
    toggleAutoRotate() {
        this.isAutoRotating = !this.isAutoRotating;
        return this.isAutoRotating;
    }

    toggleMaterial() {
        this.isWireframe = !this.isWireframe;
        if (this.currentModelMesh) {
            this._updateMaterialRecursive(this.currentModelMesh, this.isWireframe);
        }
        return this.isWireframe;
    }

    _updateMaterialRecursive(object, isWireframe) {
        if (object.isMesh) {
            if (Array.isArray(object.material)) {
                object.material.forEach(mat => mat.wireframe = isWireframe);
            } else {
                object.material.wireframe = isWireframe;
            }
        }
        if (object.children) {
            object.children.forEach(child => this._updateMaterialRecursive(child, isWireframe));
        }
    }
}

/**
 * Particle Background System
 */
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this._initParticles();
        this._animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    _initParticles() {
        this.particleCount = 100;
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2,
                alpha: Math.random()
            });
        }
    }

    _animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#87CEFA';

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            this.ctx.globalAlpha = p.alpha * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw connections
        this.ctx.strokeStyle = '#87CEFA';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    this.ctx.globalAlpha = (1 - dist / 100) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this._animate());
    }
}

/**
 * Fireworks Effect System
 */
class FireworksEffect {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.particles = [];
        this.isActive = false;
        this.autoLaunchInterval = null;
        
        this.maxFireworks = 6;
        this.maxParticles = 300;
        this.trailMaxLength = 6;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.colors = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', 
            '#00ffff', '#ffa500', '#ff69b4', '#ffd700', '#87cefa'
        ];
        
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createFirework(x, y, targetX, targetY, color) {
        return {
            x: x,
            y: y,
            targetX: targetX,
            targetY: targetY,
            speed: 2,
            angle: Math.atan2(targetY - y, targetX - x),
            color: color || this.colors[Math.floor(Math.random() * this.colors.length)],
            trail: []
        };
    }
    
    createParticle(x, y, color) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        return {
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color,
            alpha: 1,
            decay: Math.random() * 0.02 + 0.01
        };
    }
    
    launchFirework(startX, startY, targetX, targetY) {
        if (this.fireworks.length >= this.maxFireworks) return;
        const firework = this.createFirework(startX, startY, targetX, targetY);
        this.fireworks.push(firework);
    }
    
    explode(x, y) {
        const particleCount = 12 + Math.floor(Math.random() * 8);
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];

        const availableSlots = this.maxParticles - this.particles.length;
        const toSpawn = Math.max(0, Math.min(particleCount, availableSlots));
        for (let i = 0; i < toSpawn; i++) {
            this.particles.push(this.createParticle(x, y, color));
        }
    }
    
    update() {
        // Update fireworks
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            
            fw.trail.push({ x: fw.x, y: fw.y });
            if (fw.trail.length > this.trailMaxLength) fw.trail.shift();
            
            fw.x += Math.cos(fw.angle) * fw.speed;
            fw.y += Math.sin(fw.angle) * fw.speed;
            
            const distance = Math.sqrt(
                Math.pow(fw.targetX - fw.x, 2) + 
                Math.pow(fw.targetY - fw.y, 2)
            );
            
            if (distance < 5) {
                this.explode(fw.x, fw.y);
                this.fireworks.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.alpha -= p.decay;
            
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw fireworks
        this.fireworks.forEach(fw => {
            // Draw trail
            fw.trail.forEach((point, index) => {
                this.ctx.globalAlpha = index / fw.trail.length * 0.5;
                this.ctx.fillStyle = fw.color;
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            // Draw firework
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = fw.color;
            this.ctx.beginPath();
            this.ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    animate() {
        if (this.isActive) {
            this.update();
            this.draw();
        }
        requestAnimationFrame(() => this.animate());
    }
    
    start() {
        this.isActive = true;
    }
    
    stop() {
        this.isActive = false;
        this.fireworks = [];
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.autoLaunchInterval) {
            clearInterval(this.autoLaunchInterval);
            this.autoLaunchInterval = null;
        }
    }
    
    startAutoLaunch(interval = 2000) {
        this.start();
        this.autoLaunchInterval = setInterval(() => {
            const startX = Math.random() * this.canvas.width;
            const startY = this.canvas.height;
            const targetX = Math.random() * this.canvas.width;
            const targetY = Math.random() * this.canvas.height * 0.5;
            this.launchFirework(startX, startY, targetX, targetY);
        }, interval);
    }
    
    stopAutoLaunch() {
        if (this.autoLaunchInterval) {
            clearInterval(this.autoLaunchInterval);
            this.autoLaunchInterval = null;
        }
    }
    
    launchMultiple(count = 5) {
        const maxExtra = Math.max(0, this.maxFireworks - this.fireworks.length);
        const limitedCount = Math.min(count, maxExtra);
        for (let i = 0; i < limitedCount; i++) {
            setTimeout(() => {
                const startX = Math.random() * this.canvas.width;
                const startY = this.canvas.height;
                const targetX = Math.random() * this.canvas.width;
                const targetY = Math.random() * this.canvas.height * 0.5;
                this.launchFirework(startX, startY, targetX, targetY);
            }, i * 200);
        }
    }
}

/**
 * Main Application Object
 */
const App = {
    // --- State and Data ---
    state: {
        isDiscountActive: false,
        modelIndex: 0,
        activeLiveChatId: null,
        adminActiveChatId: null,
        selectedPriceItem: null,
        isSiteActive: true,
        userId: null,
        userEmail: null,
        allUsersCache: null, // To cache user data for search
        coinBalance: 0, // User's coin balance
        selectedFilamentColor: null,
    },
    config: {
        DISCOUNT_CODE: "6543210445",
        DISCOUNT_RATE: 0.05,
        originalPrices: [
            // Example: { name: "(S) Shark Toy", price: 1.80, printTime: "25m 46s" },
            { name: "(S) Shark Toy", price: 1.50 + 0.30, printTime: "25m 46s" }, // Note: JS will calculate this to 1.8
            { name: "(M) Dragon", price: 5.30 + 0.87, printTime: "1h 24m" },
        ],
        modelSpecs: [
            { name: "Octahedron Prototype", quality: { standard: { material: "PLA Filament (Recycled)", layerHeight: "0.2mm (Standard)", printTime: "25m 46s", basePrice: 1.50 + 0.30 }, high: { material: "PLA+ Filament (Enhanced)", layerHeight: "0.1mm (High Detail)", printTime: "Approx 8 hours", basePrice: 5.80 } } },
            { name: "Geometric Reindeer", quality: { standard: { material: "Metallic Grey PLA", layerHeight: "0.15mm (Sharp Edges)", printTime: "1h 24m", basePrice: 5.30 + 0.87 }, high: { material: "Silver Resin (SLA Print)", layerHeight: "0.05mm (Premium Finish)", printTime: "Approx 10 hours", basePrice: 12.99 } } }
        ],
        teamData: [
            { name: "Brooke", userId: "wd99DxqJqMXugmXqLGA2OZhbcdr1", email: "lillupa568@gmail.com", role: "Manager", verified: true, icon: '<circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>' },
            { name: "Smithy", userId: "your-admin-uid", email: "icyxrr@gmail.com", role: "Chief Executive Officer (CEO)", verified: true, icon: '<path d="M12 2l3.09 6.31 6.91.86-5 4.88 1.18 6.91L12 18l-6.18 3.25 1.18-6.91-5-4.88 6.91-.86L12 2z"></path>' },
            { name: "Adam", userId: "some-adam-uid", email: "adam@example.com", role: "Seller", verified: true, icon: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>' }
        ],
        bannedWords: ['spam', 'scam', 'inappropriate'] // Add words that should trigger a ban
    },

    // --- DOM Elements ---
    elements: {},

    // --- Initialization ---
    init() {
        this.auth = window.auth;
        this.db = window.db;
        this.taskListener = null;
        this.liveChatListener = null;
        this.adminChatListener = null;
        this.notificationListener = null;


        // Cache DOM elements
        this.elements = {
            messageBox: document.getElementById("message-box"),
            topHeader: document.getElementById("top-header"),
            sidebar: document.getElementById("sidebar"),
            pricingWave: document.getElementById("pricing-wave"),
            contactForm: document.getElementById("contact-form"),
            viewerSection: document.getElementById("viewer-section"),
            userProfileCard: document.getElementById("user-profile-card"),
            jobsSection: document.getElementById('jobs-section'),
            loginFormCard: document.getElementById('login-form-card'),
            userEmailDisplay: document.getElementById('user-email-display'),
            authorNameDisplay: document.getElementById('author-name-display'),
            userRoleDisplay: document.getElementById('user-role-display'),
            authorNameInput: document.getElementById('author-name-input'),
            emailInput: document.getElementById('email-input'),
            passwordInput: document.getElementById('password-input'),
            signinBtn: document.getElementById('signin-btn'),
            signupBtn: document.getElementById('signup-btn'),
            employeeCardsContainer: document.getElementById("employee-cards-container"),
            pricingCardsContainer: document.querySelector('.pricing-cards'),
            qualitySelector: document.getElementById('quality-selector'),
            discountInput: document.getElementById('discount-input'),
            purchaseBtn: document.getElementById('purchase-btn'),
            redeemBtn: document.getElementById('redeem-btn'),
            closeSidebarBtn: document.getElementById('close-sidebar-btn'),
            navDots: document.querySelectorAll('.nav-dot'),
            logoutBtn: document.getElementById('logout-btn'),
            customerServiceBtn: document.getElementById('customer-service-btn'),
            feedbackModal: document.getElementById('feedback-modal'),
            closeFeedbackBtn: document.getElementById('close-feedback-btn'),
            supportChatWidget: document.getElementById('support-chat-widget'),
            supportChatHeader: document.getElementById('support-chat-header'),
            supportChatStatus: document.getElementById('support-chat-status'),
            supportChatMessages: document.getElementById('support-chat-messages'),
            supportInputArea: document.getElementById('support-input-area'),
            supportInput: document.getElementById('support-input'),
            sendSupportMessageBtn: document.getElementById('send-support-message-btn'),
            copyIdBtn: document.getElementById('copy-id-btn'),
            signupPromptModal: document.getElementById('signup-prompt-modal'),
            signupPromptYes: document.getElementById('signup-prompt-yes'),
            signupPromptNo: document.getElementById('signup-prompt-no'),
            ordersBtn: document.getElementById('orders-btn'),
            ordersPanel: document.getElementById('orders-panel'),
            ordersList: document.getElementById('orders-list'),
            closeOrdersBtn: document.getElementById('close-orders-btn'),
            adminBanBtn: document.getElementById('admin-ban-btn'),
            adminBanPanel: document.getElementById('admin-ban-panel'),
            liveSupportBtn: document.getElementById('live-support-btn'),
            liveSupportPanel: document.getElementById('live-support-panel'),
            closeLiveSupportBtn: document.getElementById('close-live-support-btn'),
            liveSupportRequests: document.getElementById('live-support-requests'),
            liveChatAdminView: document.getElementById('live-chat-admin-view'),
            adminChatUserEmail: document.getElementById('admin-chat-user-email'),
            adminChatMessages: document.getElementById('admin-chat-messages'),
            adminChatInput: document.getElementById('admin-chat-input'),
            adminSendChatBtn: document.getElementById('admin-send-chat-btn'),
            adminEndChatBtn: document.getElementById('admin-end-chat-btn'),
            closeAdminBanBtn: document.getElementById('close-admin-ban-btn'),
            banUserSelect: document.getElementById('ban-user-select'),
            banReasonInput: document.getElementById('ban-reason-input'),
            executeBanBtn: document.getElementById('execute-ban-btn'),
            userNotificationBox: document.getElementById('user-notification-box'),
            announcementText: document.getElementById('announcement-text'),
            announcementAdminPanel: document.getElementById('announcement-admin-panel'),
            announcementInput: document.getElementById('announcement-input'),
            saveAnnouncementBtn: document.getElementById('save-announcement-btn'),
            toggleSiteStatusBtn: document.getElementById('toggle-site-status-btn'),
            bannerDotPing: document.getElementById('banner-dot-ping'),
            bannerDotMain: document.getElementById('banner-dot-main'),
            banReasonDisplay: document.getElementById('ban-reason-display'),
            viewCounter: document.getElementById('view-counter'),
            viewCountNumber: document.getElementById('view-count-number'),
            bannedUserPanel: document.getElementById('banned-user-panel'),
            userVerifiedBadge: document.getElementById('user-verified-badge'),
            adminTaskPanel: document.getElementById('admin-task-panel'),
            closeAdminTaskBtn: document.getElementById('close-admin-task-btn'),
            taskUserSelect: document.getElementById('task-user-select'),
            taskDescriptionInput: document.getElementById('task-description-input'),
            saveTaskBtn: document.getElementById('save-task-btn'),
            viewTasksPanel: document.getElementById('view-tasks-panel'),
            closeViewTasksBtn: document.getElementById('close-view-tasks-btn'),
            tasksList: document.getElementById('tasks-list'),
            searchPanel: document.getElementById('search-panel'),
            closeSearchBtn: document.getElementById('close-search-btn'),
            searchInput: document.getElementById('search-input'),
            searchResults: document.getElementById('search-results'),
            searchedUserProfileModal: document.getElementById('searched-user-profile-modal'),
            countdownTimer: document.getElementById('countdown-timer'),
            countdownDays: document.getElementById('countdown-days'),
            countdownHours: document.getElementById('countdown-hours'),
            countdownMinutes: document.getElementById('countdown-minutes'),
            countdownSeconds: document.getElementById('countdown-seconds'),
            coinsBalance: document.getElementById('coins-balance'),
            coinsValue: document.getElementById('coins-value'),
            selectedFilament: document.getElementById('selected-filament'),
            filamentOptions: document.querySelectorAll('.filament-option'),
        };
        this.elements.viewMyTasksBtn = document.getElementById('view-my-tasks-btn');
        this.elements.setTaskBtn = document.getElementById('set-task-btn');

        this.viewManager.init(this);
        this.tutorialManager.init(this);
        this.particleSystem = new ParticleSystem('bg-canvas');
        this.fireworksEffect = new FireworksEffect('fireworks-canvas');
        this.threeDViewer = new ThreeDViewer('three-canvas', this.config.modelSpecs, (index) => {
            this.state.modelIndex = index;
            this.renderModelDetails();
        });

        this.initFirebase();
        this.bindEvents();
        this.initAnnouncementListener();
        this.initCountdown();
        this.initSiteStatusListener();
        this.updateViewCount();
        this.renderEmployeeCards();
        const banner = document.getElementById('beta-banner'); if (banner && this.elements.topHeader) {
            const bannerHeight = banner.offsetHeight;
            this.elements.topHeader.style.top = `${bannerHeight}px`;
            document.body.style.paddingTop = `${bannerHeight + this.elements.topHeader.offsetHeight}px`;
        }
    },

    // --- Event Binding ---
    bindEvents() {
        document.getElementById("burger").onclick = () => this.toggleSidebar(); document.getElementById("search").onclick = () => this.openSearchPanel();
        if (this.elements.ordersBtn) {
            this.elements.ordersBtn.onclick = () => this.viewManager.show('orders');
        }
        if (this.elements.adminBanBtn) {
            this.elements.adminBanBtn.onclick = () => this.openBanPanel();
        }
        if (this.elements.liveSupportBtn) {
            this.elements.liveSupportBtn.onclick = () => this.openLiveSupportPanel();
        }
        const notifyBtn = document.getElementById('notify-brooke-btn');
        if (notifyBtn) {
            notifyBtn.onclick = () => this.notifyBrookePromotion();
        }
        document.getElementById("profile-btn").onclick = () => {
            if (this.state.userId) {
                this.viewManager.show('userProfile');
            } else {
                this.viewManager.show('login');
            }
        };
        document.getElementById("pricing-btn").onclick = () => {
            if (this.state.userId) {
                this.viewManager.show('pricing');
            } else {
                this.elements.signupPromptModal.classList.remove('hidden');
            }
        };
        document.getElementById("contact-btn").onclick = () => this.viewManager.show('contact');
        document.getElementById("viewer-btn").onclick = () => this.viewManager.show('viewer');
        document.getElementById("jobs-btn").onclick = () => this.viewManager.show('jobs');
        document.getElementById("close-pricing-btn").onclick = () => this.viewManager.show('viewer');
        this.elements.closeSidebarBtn.onclick = () => this.toggleSidebar();
        document.getElementById("prev-model-btn").onclick = () => this.threeDViewer.prevModel();
        document.getElementById("next-model-btn").onclick = () => this.threeDViewer.nextModel();
        document.getElementById("auto-rotate-btn").onclick = () => this.threeDViewer.toggleAutoRotate();
        document.getElementById("material-toggle-btn").onclick = () => this.threeDViewer.toggleMaterial();
        const newYearBtn = document.getElementById("newyear-toggle-btn");
        if (newYearBtn) newYearBtn.onclick = () => this.toggleNewYearTheme();
        const xmasBtn = document.getElementById("christmas-toggle-btn");
        if (xmasBtn) xmasBtn.onclick = () => this.toggleChristmasTheme();
        this.elements.navDots.forEach((dot, idx) => dot.onclick = () => this.threeDViewer.setModel(idx));
        this.elements.redeemBtn.onclick = () => this.handleDiscountRedeem();
        this.elements.qualitySelector.onchange = () => this.renderModelDetails();
        this.elements.purchaseBtn.onclick = () => this.handlePurchase();
        this.elements.authorNameInput.onchange = () => this.updateAuthorName();
        this.elements.signinBtn.onclick = () => this.signIn();
        this.elements.signupBtn.onclick = () => this.signUp();

        if (this.elements.filamentOptions && this.elements.filamentOptions.length) {
            this.elements.filamentOptions.forEach((btn) => {
                if (btn.dataset && btn.dataset.available === 'true') {
                    btn.onclick = () => {
                        const color = btn.dataset.color;
                        this.state.selectedFilamentColor = color;
                        if (this.elements.selectedFilament) {
                            this.elements.selectedFilament.textContent = color;
                        }
                        this.elements.filamentOptions.forEach((b) => b.classList.remove('selected'));
                        btn.classList.add('selected');
                        this.renderModelDetails();
                    };
                }
            });

            const defaultBtn = Array.from(this.elements.filamentOptions).find((b) => b.dataset && b.dataset.available === 'true');
            if (defaultBtn && !this.state.selectedFilamentColor) {
                defaultBtn.click();
            }
        }

        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.onclick = () => this.signOut();
        }
        if (this.elements.customerServiceBtn) {
            this.elements.customerServiceBtn.onclick = () => this.openSupportChat();
            this.elements.closeFeedbackBtn.onclick = () => this.closeSupportChat();
            this.elements.sendSupportMessageBtn.onclick = () => this.sendSupportMessage();
        }
        if (this.elements.copyIdBtn) {
            this.elements.copyIdBtn.onclick = () => this.copyUserId();
        }
        if (this.elements.signupPromptYes) {
            this.elements.signupPromptYes.onclick = () => {
                this.elements.signupPromptModal.classList.add('hidden');
                this.viewManager.show('login');
            };
            this.elements.signupPromptNo.onclick = () => {
                document.body.classList.add('fade-out');
            };
        }
        if (this.elements.closeOrdersBtn) {
            this.elements.closeOrdersBtn.onclick = () => this.viewManager.show('viewer');
        }
        if (this.elements.closeAdminBanBtn) {
            this.elements.closeAdminBanBtn.onclick = () => this.elements.adminBanPanel.classList.add('hidden');
        }
        if (this.elements.closeLiveSupportBtn) {
            this.elements.closeLiveSupportBtn.onclick = () => this.elements.liveSupportPanel.classList.add('hidden');
        }
        if (this.elements.executeBanBtn) {
            this.elements.executeBanBtn.onclick = () => this.executeBan();
        }
        if (this.elements.adminSendChatBtn) {
            this.elements.adminSendChatBtn.onclick = () => this.sendAdminChatMessage();
            this.elements.adminChatInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    this.sendAdminChatMessage();
                }
            };
        }
        if (this.elements.saveAnnouncementBtn) {
            this.elements.saveAnnouncementBtn.onclick = () => this.updateAnnouncement();
        }
        if (this.elements.toggleSiteStatusBtn) {
            this.elements.toggleSiteStatusBtn.onclick = () => this.toggleSiteStatus();
        }
        if (this.elements.closeSearchBtn) {
            this.elements.closeSearchBtn.onclick = () => this.closeSearchPanel();
        }
        if (this.elements.searchInput) {
            this.elements.searchInput.onkeyup = () => this.handleUserSearch();
        }
        if (this.elements.searchedUserProfileModal) {
            // Close modal if user clicks outside the content
            this.elements.searchedUserProfileModal.onclick = (e) => { if (e.target === this.elements.searchedUserProfileModal) this.elements.searchedUserProfileModal.classList.add('hidden'); };
        }

        // Use event delegation for dynamically created order buttons
        this.elements.ordersList.addEventListener('click', (e) => {
            const orderId = e.target.dataset.orderId;
            const userId = e.target.dataset.userId;
            if (e.target.classList.contains('approve-order-btn')) {
                this.approveOrder(orderId, userId);
            }
            if (e.target.classList.contains('deny-order-btn')) {
                this.denyOrder(orderId, userId);
            }
        });

        // Event delegation for search results
        this.elements.searchResults.addEventListener('click', e => {
            const resultItem = e.target.closest('.search-result-item');
            if (!resultItem) return;
            this.showUserProfileFromSearch(resultItem.dataset.userId);
        });

        // Event delegation for live support requests
        this.elements.liveSupportRequests.addEventListener('click', e => {
            const acceptBtn = e.target.closest('.accept-chat-btn');
            if (acceptBtn) this.acceptChat(acceptBtn.dataset.chatId);
        });

        // Fireworks click functionality
        document.addEventListener('click', (e) => {
            if (this.fireworksEffect && !e.target.closest('button') && !e.target.closest('input') && !e.target.closest('textarea') && !e.target.closest('.feedback-modal')) {
                const rect = this.fireworksEffect.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.fireworksEffect.launchFirework(
                    Math.random() * this.fireworksEffect.canvas.width,
                    this.fireworksEffect.canvas.height,
                    x,
                    y
                );
            }
        });
    },

    // --- Utility Methods ---
    showMessage(text) {
        this.elements.messageBox.textContent = text;
        this.elements.messageBox.classList.add("show");
        setTimeout(() => this.elements.messageBox.classList.remove("show"), 3000);
    },

    toggleSidebar() {
        this.elements.sidebar.style.left = (this.elements.sidebar.style.left === "0px") ? "-250px" : "0px";
    },

    // --- Coin Balance Methods ---
    updateCoinBalance() {
        if (this.state.userEmail === 'icyxrr@gmail.com') {
            // Admin gets infinity coins
            this.elements.coinsValue.innerHTML = '<span class="infinity-icon">∞</span>';
            this.state.coinBalance = Infinity;
        } else {
            // Regular users get 0 coins
            this.elements.coinsValue.textContent = '0';
            this.state.coinBalance = 0;
        }
    },

    addCoins(amount) {
        if (this.state.coinBalance !== Infinity) {
            this.state.coinBalance += amount;
            this.elements.coinsValue.textContent = this.state.coinBalance;
            
            // Save to Firebase if user is logged in
            if (this.state.userId) {
                this.db.ref('users/' + this.state.userId + '/coins').set(this.state.coinBalance);
            }
        }
    },

    loadCoinBalance() {
        if (this.state.userId) {
            this.db.ref('users/' + this.state.userId + '/coins').once('value', (snapshot) => {
                const coins = snapshot.val();
                if (coins !== null) {
                    this.state.coinBalance = coins;
                    if (coins === Infinity) {
                        this.elements.coinsValue.innerHTML = '<span class="infinity-icon">∞</span>';
                    } else {
                        this.elements.coinsValue.textContent = coins;
                    }
                } else {
                    this.updateCoinBalance(); // Set default balance
                }
            });
        } else {
            this.updateCoinBalance(); // Set default for guest
        }
    },

    // --- Firebase Methods ---
    initFirebase() {
        this.auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in.
                this.viewManager.show('viewer'); // Go to a default view on login
                this.state.userId = user.uid;
                this.state.userEmail = user.email;
                this.elements.userEmailDisplay.textContent = this.state.userEmail;
                this.elements.logoutBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-14l5 5-5 5m5-5H3"></path></svg>';

                // Initialize coin balance
                this.loadCoinBalance();

                // Show verified badge for specific user
                this.elements.adminBanBtn.classList.add('hidden');
                this.elements.ordersBtn.classList.add('hidden'); // Hide by default
                this.elements.liveSupportBtn.classList.add('hidden');
                this.elements.viewCounter.classList.add('hidden');
                this.elements.viewMyTasksBtn.classList.add('hidden');
                this.elements.announcementAdminPanel.classList.add('hidden');
                if (user.email === 'icyxrr@gmail.com') {
                    this.elements.adminBanBtn.classList.remove('hidden');
                    this.elements.ordersBtn.classList.remove('hidden');
                    this.elements.liveSupportBtn.classList.remove('hidden');
                    this.elements.viewCounter.classList.remove('hidden');
                    this.elements.announcementAdminPanel.classList.remove('hidden');
                    const notifyBtn = document.getElementById('notify-brooke-btn');
                    if (notifyBtn) notifyBtn.classList.remove('hidden');
                    if (notifyBtn) notifyBtn.classList.remove('hidden');
                }

                // Check for Brooke's email to auto-trigger the notification
                if (user.email === 'lillupa568@gmail.com') {
                    // Wait slightly for UI to settle
                    setTimeout(() => this.notifyBrookePromotion(), 1500);
                }

                const teamMember = this.config.teamData.find(member => member.email === user.email);

                // Show verified badge for specific users
                if (teamMember?.verified) {
                    this.elements.userVerifiedBadge.classList.remove('hidden');
                } else {
                    this.elements.userVerifiedBadge.classList.add('hidden');
                }

                // Display user role if they are a team member
                if (teamMember?.role) {
                    this.elements.userRoleDisplay.textContent = teamMember.role;
                    this.elements.userRoleDisplay.classList.remove('hidden');
                }

                // Start listening for notifications for this user
                if (this.notificationListener) this.notificationListener.off();
                this.notificationListener = this.db.ref('notifications/' + user.uid);
                this.notificationListener.on('child_added', (snapshot) => this.showUserNotification(snapshot));


                // Listen for profile changes
                this.profileRef = this.db.ref('users/' + user.uid);
                this.profileRef.on('value', (snapshot) => {
                    const profile = snapshot.val();
                    if (profile?.banned?.status === true) {
                        // If user is banned, show the panel and sign them out.
                        this.elements.banReasonDisplay.textContent = `Reason: ${profile.banned.reason || 'No reason provided.'}`;
                        this.viewManager.hideAll(); // Hide all other UI
                        this.elements.bannedUserPanel.classList.remove('hidden');
                        return;
                    } else {
                        // Explicitly hide the panel if the user is not banned.
                        this.elements.bannedUserPanel.classList.add('hidden');
                    }
                    const defaultName = this.generateDefaultUsername(user.email);
                    if (profile) {
                        // Only update the UI if the profile exists.
                        // This prevents resetting the name on subsequent loads.
                        const safeName = (profile.name && String(profile.name).trim()) ? profile.name : defaultName;
                        this.elements.authorNameDisplay.textContent = safeName;
                        this.elements.authorNameInput.value = safeName;
                        if (!profile.name || String(profile.name).trim().length === 0) {
                            this.db.ref('users/' + user.uid).update({ name: safeName });
                        }
                    } else {
                        // If the profile doesn't exist for some reason, create it.
                        // This should only happen once.
                        this.db.ref('users/' + user.uid).set({ name: defaultName });
                    }
                });
            } else {
                // User is signed out.
                this.state.userId = null;
                this.state.userEmail = null;
                this.elements.authorNameDisplay.textContent = "Guest";
                this.elements.bannedUserPanel.classList.add('hidden'); // Ensure panel is hidden for guests
                this.elements.userRoleDisplay.classList.add('hidden');
                this.elements.logoutBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>';
                this.elements.adminBanBtn.classList.add('hidden');
                this.elements.announcementAdminPanel.classList.add('hidden');
                this.elements.viewCounter.classList.add('hidden');
                this.elements.viewMyTasksBtn.classList.add('hidden');
                this.elements.ordersBtn.classList.add('hidden');
                this.elements.liveSupportBtn.classList.add('hidden');
                this.elements.userVerifiedBadge.classList.add('hidden'); // Hide on logout
                
                // Reset coin balance for guest
                this.updateCoinBalance();
                
                if (this.profileRef) this.profileRef.off(); // Stop listening
                if (this.notificationListener) this.notificationListener.off(); // Stop listening for notifications
                if (this.taskListener) { this.taskListener.off(); this.taskListener = null; }
            }
        });
    },

    signUp() {
        const email = this.elements.emailInput.value;
        const password = this.elements.passwordInput.value;
        if (!email || !password) {
            this.showMessage("Please enter both email and password.");
            return;
        }
        const defaultName = this.generateDefaultUsername(email);
        this.auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Create a user profile in the database
                this.db.ref('users/' + userCredential.user.uid).set({ name: defaultName });
                this.showMessage("Account created successfully! You are now logged in.");
            })
            .catch(error => this.showMessage(`Sign-up failed: ${error.message}`));
    },

    signIn() {
        const email = this.elements.emailInput.value;
        const password = this.elements.passwordInput.value;
        if (!email || !password) {
            this.showMessage("Please enter both email and password.");
            return;
        }
        this.auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                this.showMessage("Signed in successfully!");
            })
            .catch(error => this.showMessage(`Sign-in failed: ${error.message}`));
    },

    signOut() {
        if (this.state.userId) {
            this.auth.signOut();
            this.showMessage("You have been signed out.");
            this.viewManager.show('viewer'); // Redirect to a neutral view after logout
        }
    },

    generateDefaultUsername(email) {
        const base = (email || '').split('@')[0] || 'User';
        const cleaned = base.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 12);
        const safeBase = cleaned && cleaned.toLowerCase() !== 'user' ? cleaned : 'User';
        const suffix = Math.floor(1000 + Math.random() * 9000);
        return `${safeBase}${suffix}`;
    },
    updateAuthorName() {
        const newName = this.elements.authorNameInput.value.trim();
        if (newName && this.state.userId) {
            this.db.ref('users/' + this.state.userId).update({ name: newName })
                .then(() => this.showMessage("Name updated!"))
                .catch(error => this.showMessage("Error updating name: " + error.message));
        }
    },

    copyUserId() {
        if (this.state.userId) {
            navigator.clipboard.writeText(this.state.userId)
                .then(() => this.showMessage("User ID copied to clipboard!"))
                .catch(err => this.showMessage("Failed to copy User ID."));
        } else {
            this.showMessage("No User ID to copy.");
        }
    },

    initAnnouncementListener() {
        this.db.ref('announcement').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data && data.text) {
                this.elements.announcementText.textContent = data.text;
                this.elements.announcementInput.value = data.text; // Also update admin input
            }
        });
    },

    updateAnnouncement() {
        const newText = this.elements.announcementInput.value.trim();
        if (!newText) {
            this.showMessage("Announcement text cannot be empty.");
            return;
        }
        this.db.ref('announcement').set({ text: newText })
            .then(() => this.showMessage("Announcement updated successfully!"))
            .catch(error => this.showMessage(`Error: ${error.message}`));
    },

    initSiteStatusListener() {
        this.db.ref('siteStatus').on('value', (snapshot) => {
            const data = snapshot.val();
            // If data exists, use its value. Otherwise, default to true (active).
            const isActive = data ? data.isActive : true;
            this.state.isSiteActive = isActive;
            this.updateBannerStatus(isActive);
        });
    },

    updateBannerStatus(isActive) {
        const { bannerDotPing, bannerDotMain, toggleSiteStatusBtn, purchaseBtn, announcementText, jobsBtn } = this.elements;
        if (isActive) {
            bannerDotPing.classList.replace('bg-red-700', 'bg-green-400');
            bannerDotMain.classList.replace('bg-red-800', 'bg-green-500');
            toggleSiteStatusBtn.textContent = 'Deactivate Site (Go Offline)';
            toggleSiteStatusBtn.classList.replace('bg-green-600', 'bg-yellow-600');
            purchaseBtn.disabled = false;
            purchaseBtn.classList.replace('bg-gray-500', 'bg-green-500');
            purchaseBtn.classList.replace('cursor-not-allowed', 'hover:bg-green-600');
            if (document.getElementById('jobs-btn')) {
                document.getElementById('jobs-btn').classList.remove('disabled');
            }

            // Restore original announcement text when activated
            this.db.ref('announcement/text').once('value', snapshot => {
                announcementText.textContent = snapshot.val() || 'We are currently in Beta.';
            });
        } else {
            bannerDotPing.classList.replace('bg-green-400', 'bg-red-700');
            bannerDotMain.classList.replace('bg-green-500', 'bg-red-800');
            toggleSiteStatusBtn.textContent = 'Activate Site (Go Online)';
            toggleSiteStatusBtn.classList.replace('bg-yellow-600', 'bg-green-600');
            purchaseBtn.disabled = true;
            purchaseBtn.classList.replace('bg-green-500', 'bg-gray-500');
            purchaseBtn.classList.replace('hover:bg-green-600', 'cursor-not-allowed');
            if (document.getElementById('jobs-btn')) {
                document.getElementById('jobs-btn').classList.add('disabled');
            }

            announcementText.textContent = 'The store is currently closed. No new orders can be placed.';
        }
    },

    toggleSiteStatus() {
        const newStatus = !this.state.isSiteActive;
        this.db.ref('siteStatus').set({ isActive: newStatus });
    },

    initCountdown() {
        // Set target to New Year 2026
        const targetDate = new Date('January 1, 2026 00:00:00').getTime();
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                // New Year has arrived!
                this.elements.countdownDays.textContent = '00';
                this.elements.countdownHours.textContent = '00';
                this.elements.countdownMinutes.textContent = '00';
                this.elements.countdownSeconds.textContent = '00';
                this.celebrateNewYear();
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            this.elements.countdownDays.textContent = String(days).padStart(2, '0');
            this.elements.countdownHours.textContent = String(hours).padStart(2, '0');
            this.elements.countdownMinutes.textContent = String(minutes).padStart(2, '0');
            this.elements.countdownSeconds.textContent = String(seconds).padStart(2, '0');
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    },

    celebrateNewYear() {
        // Fireworks
        const fireworks = document.createElement('div');
        fireworks.classList.add('fireworks');
        document.body.appendChild(fireworks);
        
        // Confetti
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        document.body.appendChild(confetti);
        
        // Theme toggle
        document.body.classList.toggle('new-year-theme');
        
        // Message
        this.showMessage("Happy New Year!");
    },

    updateViewCount() {
        this.db.ref('users').on('value', (snapshot) => {
            const userCount = snapshot.numChildren();
            if (this.elements.viewCountNumber) {
                this.elements.viewCountNumber.textContent = userCount;
            }
        });
    },

    playChristmasJingle() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const t = ctx.currentTime;
        const notes = [
            { f: 329.63, d: 0.2, t: 0 },   // E
            { f: 329.63, d: 0.2, t: 0.25 }, // E
            { f: 329.63, d: 0.4, t: 0.5 },  // E
            { f: 329.63, d: 0.2, t: 1.0 },  // E
            { f: 329.63, d: 0.2, t: 1.25 }, // E
            { f: 329.63, d: 0.4, t: 1.5 },  // E
            { f: 329.63, d: 0.2, t: 2.0 },  // E
            { f: 392.00, d: 0.2, t: 2.25 }, // G
            { f: 261.63, d: 0.3, t: 2.5 },  // C
            { f: 293.66, d: 0.1, t: 2.85 }, // D
            { f: 329.63, d: 0.8, t: 3.0 },  // E
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = note.f;
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t + note.t);
            gain.gain.setValueAtTime(0.1, t + note.t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + note.t + note.d);
            osc.stop(t + note.t + note.d);
        });
    },

    toggleChristmasTheme() {
        document.body.classList.toggle('christmas-theme');
        const isXmas = document.body.classList.contains('christmas-theme');

        if (isXmas) {
            this.showMessage("Merry Christmas! 🎄");
            this.playChristmasJingle();
            // Create Snowflakes
            this.snowInterval = setInterval(() => {
                const snowflake = document.createElement('div');
                snowflake.classList.add('snowflake');
                snowflake.innerHTML = '❄';
                snowflake.style.left = Math.random() * 100 + 'vw';
                snowflake.style.animationDuration = Math.random() * 3 + 2 + 's'; // 2-5s fall
                snowflake.style.opacity = Math.random();
                snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';

                document.body.appendChild(snowflake);

                // Cleanup
                setTimeout(() => {
                    snowflake.remove();
                }, 5000);
            }, 100);
        } else {
            this.showMessage("Back to normal.");
            if (this.snowInterval) clearInterval(this.snowInterval);
            document.querySelectorAll('.snowflake').forEach(el => el.remove());
        }
    },

    openSupportChat() {
        this.elements.feedbackModal.classList.remove('hidden');
        this.elements.supportChatHeader.textContent = 'Support Bot';
        this.elements.supportChatStatus.innerHTML = `<span class="flex items-center gap-2 text-xs text-gray-400"><span class="relative flex h-2.5 w-2.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span></span>Connecting...</span>`;
        this.elements.supportChatStatus.classList.remove('hidden');

        const messagesContainer = this.elements.supportChatMessages;

        // Check if chat has already been started
        if (messagesContainer.innerHTML !== '') {
            return;
        }
        // --- New Chat Logic ---
        messagesContainer.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        this.elements.supportInputArea.classList.add('hidden');
        this.elements.supportInputArea.classList.remove('fade-in');

        // New bot flow
        setTimeout(() => {
            messagesContainer.innerHTML = `<p class="bot-message">Hi! Welcome to ICYXR 3D Printing, how can I help?</p>`;
            this.elements.supportChatStatus.classList.add('hidden'); // Hide status during bot interaction
            setTimeout(() => {
                messagesContainer.innerHTML += `<p class="bot-message">Would you like to speak to a customer service representative?</p>`;
                const yesBtn = document.createElement('button');
                yesBtn.textContent = 'Yes, connect me to a person';
                yesBtn.className = 'w-full mt-4 py-2 bg-green-600 text-white font-bold rounded-lg transition hover:bg-green-700';
                yesBtn.onclick = () => this.requestLiveChat(yesBtn);
                messagesContainer.appendChild(yesBtn);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 1500);
        }, 1000);
    },

    closeSupportChat() {
        this.elements.feedbackModal.classList.add('hidden');
        // If user was in an active chat, stop listening
        if (this.liveChatListener) {
            this.liveChatListener.off();
            this.liveChatListener = null;
        }
        this.state.activeLiveChatId = null;
        // A small delay to allow the modal to close before resetting content
        setTimeout(() => {
            this.elements.supportChatMessages.innerHTML = '';
            this.elements.supportInputArea.classList.add('hidden');
            this.elements.supportInput.value = '';
        }, 500);
    },

    requestLiveChat(button) {
        button.disabled = true;
        button.textContent = 'Please wait...';
        const messagesContainer = this.elements.supportChatMessages;
        messagesContainer.innerHTML += `<p class="bot-message">Connecting you to a helper... Please wait, this may take a moment.</p>`;
        this.elements.supportChatStatus.innerHTML = `<span class="flex items-center gap-2 text-xs text-gray-400"><span class="relative flex h-2.5 w-2.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span></span>Waiting for admin...</span>`;
        this.elements.supportChatStatus.classList.remove('hidden');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        const chatRequest = {
            userId: this.state.userId || 'guest-' + Date.now(),
            userEmail: this.state.userEmail || 'Guest',
            userName: this.elements.authorNameDisplay.textContent || 'Guest',
            createdAt: new Date().toISOString(),
            status: 'waiting', // waiting, active, closed
        };

        const newChatRef = this.db.ref('LiveSupportChats').push(chatRequest);
        this.state.activeLiveChatId = newChatRef.key;
        this.listenToLiveChat(newChatRef.key);
    },

    sendSupportMessage() {
        const input = this.elements.supportInput;
        const messageText = input.value.trim();
        if (!messageText || !this.state.activeLiveChatId) return;

        const messageData = {
            sender: this.state.userId || 'guest',
            name: this.elements.authorNameDisplay.textContent || 'Guest',
            text: messageText,
            timestamp: new Date().toISOString()
        };

        this.db.ref(`LiveSupportChats/${this.state.activeLiveChatId}/messages`).push(messageData);
        input.value = '';
    },

    listenToLiveChat(chatId) {
        if (this.liveChatListener) this.liveChatListener.off();

        const chatRef = this.db.ref(`LiveSupportChats/${chatId}`);
        this.liveChatListener = chatRef;

        chatRef.on('value', snapshot => {
            const chatData = snapshot.val();
            if (!chatData) {
                this.closeSupportChat();
                return;
            }

            const messagesContainer = this.elements.supportChatMessages; // Customer's message view

            if (chatData.status === 'active' && !this.elements.supportInputArea.classList.contains('fade-in')) {
                this.elements.supportChatHeader.textContent = 'Live Support';
                this.elements.supportChatStatus.innerHTML = `<span class="flex items-center gap-2 text-xs text-green-400"><span class="relative flex h-2.5 w-2.5"><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></span>Connected</span>`;
                this.elements.supportInputArea.classList.remove('hidden');
                this.elements.supportInputArea.classList.add('fade-in');
            }

            if (chatData.status === 'closed') {
                this.elements.supportChatHeader.textContent = 'Chat Ended';
                this.elements.supportChatStatus.innerHTML = `<span class="flex items-center gap-2 text-xs text-red-400"><span class="relative flex h-2.5 w-2.5"><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span></span>Disconnected</span>`;

                messagesContainer.innerHTML += `<p class="chat-ended-message">The chat has been ended by the admin.</p>`;
                this.elements.supportInputArea.classList.add('hidden');
                this.liveChatListener.off(); // Stop listening
            }

            if (chatData.messages) {
                messagesContainer.innerHTML = ''; // Clear and re-render all messages to maintain order
                Object.entries(chatData.messages).forEach(([key, msg]) => {
                    const isOwnMessage = msg.sender === this.state.userId;
                    const messageContainer = this.createMessageElement(key, msg, isOwnMessage);
                    messagesContainer.appendChild(messageContainer);
                });
            }

            // Prepend the initial connection message if chat is active
            if (chatData.status === 'active') {
                const welcomeMsg = document.createElement('p');
                welcomeMsg.className = 'bot-message';
                welcomeMsg.textContent = 'You are now connected with an admin.';
                messagesContainer.prepend(welcomeMsg);
            }
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    },

    openLiveSupportPanel() {
        this.elements.liveSupportPanel.classList.remove('hidden');
        this.elements.liveChatAdminView.classList.add('hidden'); // Hide active chat view initially
        this.elements.liveSupportRequests.classList.remove('hidden');

        this.db.ref('LiveSupportChats').orderByChild('status').equalTo('waiting').on('value', snapshot => {
            const requestsContainer = this.elements.liveSupportRequests;
            requestsContainer.innerHTML = '';
            if (!snapshot.exists()) {
                requestsContainer.innerHTML = '<p class="text-gray-400">No pending support requests.</p>';
                return;
            }
            snapshot.forEach(childSnapshot => {
                const request = childSnapshot.val();
                const chatId = childSnapshot.key;
                const item = document.createElement('div');
                item.className = 'support-request-item';
                item.innerHTML = `
                    <div>
                        <p class="font-bold">${request.userName} (${request.userEmail})</p>
                        <p class="text-xs text-gray-400">${new Date(request.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <button data-chat-id="${chatId}" class="accept-chat-btn px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700">Accept</button>
                `;
                requestsContainer.appendChild(item);
            });
        });
    },

    acceptChat(chatId) {
        // Logic for admin to accept a chat
        this.db.ref(`LiveSupportChats/${chatId}`).once('value', snapshot => {
            const chatData = snapshot.val();
            if (!chatData || chatData.status !== 'waiting') {
                this.showMessage("This chat is no longer available.");
                this.openLiveSupportPanel(); // Refresh list
                return;
            }

            this.db.ref(`LiveSupportChats/${chatId}`).update({ status: 'active', adminId: this.state.userId });
            this.state.adminActiveChatId = chatId;

            this.elements.liveSupportRequests.classList.add('hidden');
            this.elements.liveChatAdminView.classList.remove('hidden');
            this.elements.adminChatUserEmail.textContent = `${chatData.userName} (${chatData.userEmail})`;
            this.elements.adminChatMessages.innerHTML = ''; // Clear previous chat
            this.elements.adminChatInput.disabled = false;
            this.elements.adminSendChatBtn.disabled = false;

            this.elements.adminEndChatBtn.onclick = () => this.endChat(chatId);

            this.listenToAdminChat(chatId);
        });
    },

    listenToAdminChat(chatId) {
        if (this.adminChatListener) this.adminChatListener.off();

        const messagesRef = this.db.ref(`LiveSupportChats/${chatId}/messages`);
        this.adminChatListener = messagesRef;

        messagesRef.on('value', snapshot => {
            const messagesContainer = this.elements.adminChatMessages;
            messagesContainer.innerHTML = ''; // Clear and re-render
            snapshot.forEach(childSnapshot => {
                const isOwnMessage = childSnapshot.val().sender === this.state.userId;
                messagesContainer.appendChild(this.createMessageElement(childSnapshot.key, childSnapshot.val(), isOwnMessage));
            });
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });

        // Also listen for chat closure by other means
        this.db.ref(`LiveSupportChats/${chatId}/status`).on('value', statusSnap => {
            if (statusSnap.val() === 'closed') {
                this.elements.adminChatMessages.innerHTML += `<p class="chat-ended-message">The chat has been closed.</p>`;
                this.elements.adminChatInput.disabled = true;
                this.elements.adminSendChatBtn.disabled = true;
                if (this.adminChatListener) this.adminChatListener.off();
            }
        });
    },

    sendAdminChatMessage() {
        const input = this.elements.adminChatInput;
        const messageText = input.value.trim();
        if (!messageText || !this.state.adminActiveChatId) return;

        const messageData = {
            sender: this.state.userId, // Admin's user ID
            name: 'Admin', // Admin's display name
            text: messageText,
            timestamp: new Date().toISOString()
        };

        this.db.ref(`LiveSupportChats/${this.state.adminActiveChatId}/messages`).push(messageData);
        input.value = '';
    },

    endChat(chatId) {
        this.db.ref(`LiveSupportChats/${chatId}`).update({ status: 'closed' })
            .then(() => {
                this.showMessage("Chat has been closed.");
                this.openLiveSupportPanel(); // Go back to the list of requests
                if (this.adminChatListener) this.adminChatListener.off();
                this.state.adminActiveChatId = null;
                this.elements.adminChatInput.disabled = false;
                this.elements.adminSendChatBtn.disabled = false;
            })
            .catch(error => this.showMessage(`Error: ${error.message}`));
    },

    createMessageElement(key, msg, isOwnMessage) {
        const container = document.createElement('div');
        container.dataset.msgId = key;
        container.className = `message-container ${isOwnMessage ? 'user' : 'other'}`;

        // Profile Icon
        const iconDiv = document.createElement('div');
        iconDiv.className = 'message-profile-icon';
        const initial = (msg.name || 'U').charAt(0).toUpperCase();
        iconDiv.innerHTML = `<span class="font-bold text-white">${initial}</span>`;

        // Message Bubble and Name
        const bubbleWrapper = document.createElement('div');
        bubbleWrapper.className = 'flex flex-col';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'message-sender-name';
        nameSpan.textContent = msg.name || (isOwnMessage ? 'You' : 'User');

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = msg.text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-timestamp';
        timeSpan.textContent = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        bubbleWrapper.appendChild(nameSpan);
        bubbleWrapper.appendChild(bubbleDiv);
        bubbleWrapper.appendChild(timeSpan);

        container.appendChild(iconDiv);
        container.appendChild(bubbleWrapper);
        return container;
    },

    showUserNotification(snapshot) {
        const notification = snapshot.val();
        const box = this.elements.userNotificationBox;
        box.innerHTML = notification.message;
        box.style.opacity = 1;
        box.style.transform = 'translateX(-50%) translateY(0)';

        // Remove the notification from DB after showing it
        snapshot.ref.remove();

        setTimeout(() => { box.style.opacity = 0; box.style.transform = 'translateX(-50%) translateY(20px)'; }, 5000);
    },

    openBanPanel() {
        this.elements.adminBanPanel.classList.remove('hidden');
        const userSelect = this.elements.banUserSelect;
        userSelect.innerHTML = '<option>Loading users...</option>';

        this.db.ref('users').once('value', (snapshot) => {
            userSelect.innerHTML = '';
            const users = snapshot.val();
            if (users) {
                Object.keys(users).forEach(userId => {
                    // Don't allow admin to ban themselves
                    if (userId !== this.state.userId) {
                        const user = users[userId];
                        const option = document.createElement('option');
                        option.value = userId;
                        option.textContent = `${user.name} (${user.email || 'no email'})`;
                        userSelect.appendChild(option);
                    }
                });
            }
        });
    },

    executeBan() {
        const userIdToBan = this.elements.banUserSelect.value;
        const reason = this.elements.banReasonInput.value.trim();

        if (!userIdToBan) {
            this.showMessage("Please select a user to ban.");
            return;
        }
        if (!reason) {
            this.showMessage("Please provide a reason for the ban.");
            return;
        }

        const banDetails = {
            status: true,
            reason: reason,
            timestamp: new Date().toISOString()
        };

        this.db.ref('users/' + userIdToBan).update({ banned: banDetails })
            .then(() => {
                this.showMessage(`User has been banned.`);
                this.elements.adminBanPanel.classList.add('hidden');
                this.elements.banReasonInput.value = '';
            })
            .catch(error => this.showMessage(`Error banning user: ${error.message}`));
    },

    notifyBrookePromotion() {
        const brookeEmail = 'lillupa568@gmail.com';
        this.db.ref('users').orderByChild('email').equalTo(brookeEmail).once('value', snapshot => {
            if (!snapshot.exists()) {
                this.showMessage("Brooke's account not found in DB.");
                return;
            }

            let userId = null;
            snapshot.forEach(child => userId = child.key);

            if (userId) {
                const icon = `<svg style="display:inline-block; vertical-align:middle; margin-right:8px; color:#ffd700;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.31 6.91.86-5 4.88 1.18 6.91L12 18l-6.18 3.25 1.18-6.91-5-4.88 6.91-.86L12 2z"></path></svg>`;
                const notification = {
                    message: `${icon} hi Brooke we have been seen ur amazing ideas and for ur husband choice he gace u a proption of manager,.`,
                    timestamp: new Date().toISOString(),
                    read: false
                };

                this.db.ref(`notifications/${userId}`).push(notification)
                    .then(() => this.showMessage("Promotion notification sent to Brooke!"))
                    .catch(e => this.showMessage("Error: " + e.message));
            }
        });
    },

    // --- Rendering Methods ---
    renderPricingCards() {
        this.elements.pricingCardsContainer.innerHTML = '';
        this.config.originalPrices.forEach((item, index) => {
            let priceHtml;
            if (item.price === null) {
                priceHtml = `<p class="text-sm text-gray-300 mt-2">Contact us for a price range</p>`;
            } else {
                const priceDisplay = item.price.toFixed(2);
                priceHtml = `<p class="font-light text-2xl mt-1">£${priceDisplay}</p>`;
                if (this.state.isDiscountActive) {
                    const discounted = (item.price * (1 - this.config.DISCOUNT_RATE)).toFixed(2);
                    priceHtml = `<div class="flex items-end justify-between mt-1"><div class="flex flex-col items-start"><p class="text-base font-normal text-gray-400 line-through">£${priceDisplay}</p><p class="text-3xl font-extrabold text-green-400">£${discounted}</p></div><span class="text-xs text-green-400 bg-green-900/50 px-2 py-1 rounded-full">-5% OFF</span></div>`;
                }
            }
            const card = document.createElement('div');
            card.className = `pricing-card relative ${this.state.selectedPriceItem === index ? 'selected' : ''}`;
            card.dataset.index = index;
            card.innerHTML = `
            <div class="tick-icon" style="transform: ${this.state.selectedPriceItem === index ? 'scale(1)' : 'scale(0)'};">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"></path></svg>
            </div>
            <h3 class="text-xl font-bold pl-2">${item.name}</h3>
            <p class="text-sm text-gray-300">Print Time: ${item.printTime}</p>
            ${priceHtml}
            <button class="mt-3 px-4 py-2 bg-baby-blue text-black rounded-lg font-bold hover:bg-white transition ${!this.state.isSiteActive ? 'opacity-50 cursor-not-allowed' : ''}" ${!this.state.isSiteActive ? 'disabled' : ''}>
                Buy Now
            </button>`;

            // The original pricing cards in home.html have a buy now button that isn't used.
            // This code adds a "Buy Now" button to the dynamically generated cards and disables it if the site is inactive.
            // Note: The click handler for this new button would need to be implemented if desired.
            // For now, it correctly reflects the site's active/inactive status.

            this.elements.pricingCardsContainer.appendChild(card);
            card.onclick = () => this.selectPriceItem(index, item.price !== null);
        });
        this.elements.purchaseBtn.classList.toggle('hidden', this.state.selectedPriceItem === null);
    },

    renderModelDetails() {
        const quality = this.elements.qualitySelector.value;
        const currentModel = this.config.modelSpecs[this.state.modelIndex];
        const specs = currentModel.quality[quality];
        if (!specs) return;

        const priceElement = document.getElementById('spec-price-est');
        let priceText = `£${specs.basePrice.toFixed(2)}`;
        if (this.state.isDiscountActive) {
            const finalPrice = specs.basePrice * (1 - this.config.DISCOUNT_RATE);
            priceText = `£${finalPrice.toFixed(2)} (Discounted)`;
            priceElement.classList.add('text-green-400');
        } else {
            priceElement.classList.remove('text-green-400');
        }

        document.getElementById('model-title').textContent = `Interactive 3D Preview: ${currentModel.name}`;
        const filamentColor = this.state.selectedFilamentColor;
        const materialText = filamentColor ? `${specs.material} (${filamentColor})` : specs.material;
        document.getElementById('spec-material').textContent = materialText;
        document.getElementById('spec-layer-height').textContent = specs.layerHeight;
        document.getElementById('spec-print-time').textContent = specs.printTime;
        priceElement.textContent = priceText;

        this.elements.navDots.forEach((dot, idx) => dot.classList.toggle('active', idx === this.state.modelIndex));
    },

    renderEmployeeCards() {
        this.elements.employeeCardsContainer.innerHTML = '';
        this.config.teamData.forEach(employee => {
            const card = document.createElement('div');
            card.className = 'employee-card flex items-center gap-4 p-4 rounded-xl';;

            const verifiedBadge = employee.verified ? '<span class="verified-badge">✓</span>' : '';

            card.innerHTML = `
                <div class="employee-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${employee.icon}</svg>
                </div>
                <div class="employee-info">
                    <div class="employee-name text-lg flex items-center gap-2">${employee.name} ${verifiedBadge}</div>
                    <div class="employee-role text-sm text-gray-400">${employee.role}</div>
                </div>`;
            this.elements.employeeCardsContainer.appendChild(card);
        });
    },

    renderOrders(orders) {
        this.elements.ordersList.innerHTML = '';
        if (!orders) {
            this.elements.ordersList.innerHTML = '<p class="text-gray-400">No orders found.</p>';
            return;
        }

        // Newest orders first
        const orderKeys = Object.keys(orders).reverse();

        orderKeys.forEach(key => {
            const order = orders[key];
            const orderDate = new Date(order.timestamp).toLocaleString();
            const orderElement = document.createElement('div');

            let statusHtml = `<span class="order-status bg-yellow-500/20 text-yellow-300">${order.status}</span>`;
            if (order.status === 'approved') {
                statusHtml = `<span class="order-status bg-green-500/20 text-green-300">${order.status}</span>`;
            } else if (order.status === 'denied') {
                statusHtml = `<span class="order-status bg-red-500/20 text-red-300">${order.status}</span>`;
            }

            let buttonsHtml = '';
            if (order.status === 'pending') {
                buttonsHtml = `
                    <div class="flex gap-2 mt-3">
                        <button data-order-id="${key}" data-user-id="${order.userId}" class="approve-order-btn w-full px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700">Approve</button>
                        <button data-order-id="${key}" data-user-id="${order.userId}" class="deny-order-btn w-full px-3 py-1 bg-red-700 text-white text-xs font-bold rounded hover:bg-red-800">Deny</button>
                    </div>`;
            }

            orderElement.className = 'order-item text-left text-sm';
            orderElement.innerHTML = `
                <div class="flex justify-between items-start">
                    <p class="font-bold text-base">${order.itemName}</p>
                    ${statusHtml}
                </div>
                <div class="mt-2 space-y-1">
                    <p class="text-gray-300">User: <span class="font-mono">${order.userEmail}</span></p>
                    <p class="text-gray-300">Price: <span class="font-mono">£${order.finalPrice.toFixed(2)}</span></p>
                    <p class="text-gray-400 text-xs mt-1">${orderDate}</p>
                </div>
                ${buttonsHtml}`;
            
            this.elements.ordersList.appendChild(orderElement);
        });
    },

    // --- New Year Celebration Functions ---
    celebrateNewYear() {
        // Trigger fireworks and confetti using the new system
        if (this.fireworksEffect) {
            this.fireworksEffect.startAutoLaunch(5000);
            this.launchMultipleFireworks(4);
        }
        this.dropConfetti();
        this.showNewYearMessage();
        
        // Apply New Year theme
        document.body.classList.add('newyear-theme');
        
        // Update countdown message
        const countdownText = document.querySelector('#countdown-timer p');
        if (countdownText) {
            countdownText.textContent = '🎆 Happy New Year 2026! 🎊';
        }
    },
    
    launchFireworks() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffd700', '#ff69b4'];
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight * 0.5;
                this.createFirework(x, y, colors[Math.floor(Math.random() * colors.length)]);
            }, i * 200);
        }
    },
    
    createFirework(x, y, color) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';
        firework.style.background = color;
        document.body.appendChild(firework);
        
        // Create explosion particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.background = color;
            
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--x', vx + 'px');
            particle.style.setProperty('--y', vy + 'px');
            
            firework.appendChild(particle);
        }
        
        setTimeout(() => firework.remove(), 1000);
    },
    
    dropConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffd700', '#ff69b4'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, i * 50);
        }
    },
    
    showNewYearMessage() {
        this.showMessage('🎆 Happy New Year 2026! Welcome to the future! 🎊');
    },
    
    toggleNewYearTheme() {
        document.body.classList.toggle('newyear-theme');
        const isActive = document.body.classList.contains('newyear-theme');
        
        if (isActive && this.fireworksEffect) {
            // Start auto-launching fireworks when New Year theme is activated
            this.fireworksEffect.startAutoLaunch(6000);
            this.launchMultipleFireworks(3);
        } else if (!isActive && this.fireworksEffect) {
            // Stop fireworks when theme is deactivated
            this.fireworksEffect.stopAutoLaunch();
        }
        
        this.showMessage(isActive ? '🎊 New Year theme activated!' : 'New Year theme deactivated');
    },
    
    launchMultipleFireworks(count = 5) {
        if (this.fireworksEffect) {
            this.fireworksEffect.launchMultiple(count);
        }
    },
    handleDiscountRedeem() {
        const input = this.elements.discountInput.value.trim();
        if (input === this.config.DISCOUNT_CODE) {
            if (!this.state.isDiscountActive) {
                this.state.isDiscountActive = true;
                this.showMessage("Discount applied: 5% off!");
                this.elements.discountInput.classList.replace('bg-gray-800', 'bg-green-800/50');
                this.elements.discountInput.classList.replace('border-gray-600', 'border-green-500');
                this.elements.redeemBtn.textContent = "Applied";
                this.elements.redeemBtn.disabled = true;
                this.renderModelDetails();
                if (this.elements.pricingWave.classList.contains('active')) {
                    this.renderPricingCards();
                }
            } else {
                this.showMessage("Discount already active.");
            }
        } else {
            this.showMessage("Invalid discount code!");
            this.elements.discountInput.value = '';
        }
    },

    selectPriceItem(index, isSelectable) {
        if (!isSelectable) {
            this.showMessage("This item requires contacting us for a price.");
            return;
        }
        if (this.state.selectedPriceItem === index) {
            this.state.selectedPriceItem = null; // Deselect
        } else {
            this.state.selectedPriceItem = index; // Select
        }
        this.renderPricingCards(); // Re-render to show selection
    },

    handlePurchase() {
        if (!this.state.isSiteActive) {
            this.showMessage("The store is currently closed and not accepting new orders.");
            return;
        }

        if (this.state.selectedPriceItem === null) {
            this.showMessage("Please select an item to purchase.");
            return;
        }

        const item = this.config.originalPrices[this.state.selectedPriceItem];
        let finalPrice = item.price;
        if (this.state.isDiscountActive) {
            finalPrice *= (1 - this.config.DISCOUNT_RATE);
        }

        const orderData = {
            itemName: item.name,
            finalPrice: finalPrice,
            isDiscounted: this.state.isDiscountActive,
            userEmail: this.state.userEmail || 'Guest',
            userId: this.state.userId || 'anonymous',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        this.db.ref('Orders').push(orderData)
            .then(() => {
                this.showMessage("Order placed! Brooke will be in touch to arrange payment.");
                this.viewManager.show('viewer');
            })
            .catch(error => this.showMessage(`Order failed: ${error.message}`));
    },

    approveOrder(orderId, userId) {
        this.db.ref('Orders/' + orderId).update({ status: 'approved' });
        const notification = {
            message: "Your recent order has been approved! Brooke will be in touch.",
            timestamp: new Date().toISOString()
        };
        this.db.ref('notifications/' + userId).push(notification);
        this.showMessage("Order approved and user notified.");
    },

    denyOrder(orderId, userId) {
        this.db.ref('Orders/' + orderId).update({ status: 'denied' });
        const notification = {
            message: "Unfortunately, your recent order has been denied. Please contact support for details.",
            timestamp: new Date().toISOString()
        };
        this.db.ref('notifications/' + userId).push(notification);
        this.showMessage("Order denied and user notified.");
    },

    openSearchPanel() {
        this.elements.searchPanel.classList.remove('hidden');
        this.elements.searchInput.focus();
        // Fetch all users and cache them if not already done
        if (!this.state.allUsersCache) {
            this.db.ref('users').once('value', (snapshot) => {
                this.state.allUsersCache = snapshot.val();
            });
        }
    },

    closeSearchPanel() {
        this.elements.searchPanel.classList.add('hidden');
        this.elements.searchInput.value = '';
        this.elements.searchResults.innerHTML = '';
        this.elements.searchResults.classList.add('hidden');
    },

    handleUserSearch() {
        const query = this.elements.searchInput.value.toLowerCase().trim();
        const resultsContainer = this.elements.searchResults;

        if (!query) {
            resultsContainer.innerHTML = '';
            resultsContainer.classList.add('hidden');
            return;
        }

        if (!this.state.allUsersCache) {
            resultsContainer.innerHTML = '<div class="p-3 text-gray-400">User data is loading...</div>';
            resultsContainer.classList.remove('hidden');
            return;
        }

        const results = Object.entries(this.state.allUsersCache)
            .filter(([userId, user]) =>
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query)
            );

        resultsContainer.innerHTML = '';
        if (results.length > 0) {
            results.forEach(([userId, user]) => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item p-3 hover:bg-gray-700 cursor-pointer';
                resultItem.dataset.userId = userId;

                // Check verification status (DB or TeamData)
                const isVerified = user.verified || this.config.teamData.some(m => m.email === user.email && m.verified);

                // Add click listener for preview
                resultItem.onclick = () => this.showUserPreview({ ...user, userId, verified: isVerified });

                resultItem.innerHTML = `
                    <p class="font-bold text-white flex items-center gap-2">
                        ${user.name || 'Unnamed User'}
                        ${isVerified ? '<span class="text-blue-400 text-xs" title="Verified">✓</span>' : ''}
                    </p>
                    <p class="text-sm text-gray-400">${user.email || 'No email'}</p>
                `;
                resultsContainer.appendChild(resultItem);
            });
            resultsContainer.classList.remove('hidden');
        } else {
            resultsContainer.innerHTML = '<div class="p-3 text-gray-400">No users found.</div>';
            resultsContainer.classList.remove('hidden');
        }
    },

    showUserPreview(user) {
        const modal = document.getElementById('user-preview-modal');
        const content = document.getElementById('preview-content');

        let iconSvg = user.icon || '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';

        // Render preview with cleaned up styles
        content.innerHTML = `
            <div class="preview-icon-container">
                <div>${iconSvg}</div>
            </div>
            <div class="employee-info text-left">
                <h3 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    ${user.name || 'Unknown'}
                    ${user.verified ? '<span class="verified-badge" style="transform:none; animation:none;">✓</span>' : ''}
                </h3>
                <p class="font-mono text-sm text-gray-400 mb-2 bg-black/30 px-2 py-1 rounded border border-white/10 inline-block">ID: ${user.userId || 'Unknown'}</p>
                <div class="text-baby-blue font-semibold uppercase tracking-wider text-sm">${user.role || 'User'}</div>
                <div class="text-gray-500 text-xs mt-1">${user.email || ''}</div>
            </div>
        `;

        modal.classList.remove('hidden');

        const closeBtn = document.getElementById('close-preview-btn');
        closeBtn.onclick = () => modal.classList.add('hidden');
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        }
    },



    showUserProfileFromSearch(userId) {
        const user = this.state.allUsersCache?.[userId];
        if (!user) {
            this.showMessage("Could not find user data.");
            return;
        }

        this.closeSearchPanel();

        // Check if the user is a team member to get specific data
        const teamMember = this.config.teamData.find(member => member.userId === userId || member.email === user.email);

        const modal = this.elements.searchedUserProfileModal;
        const nameEl = modal.querySelector('.profile-name');
        const roleEl = modal.querySelector('.profile-role');
        const iconEl = modal.querySelector('.profile-icon');

        let iconSvg = '<circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>'; // Default icon
        let role = "User";
        let isVerified = false;

        if (teamMember) {
            iconSvg = teamMember.icon;
            role = teamMember.role;
            isVerified = teamMember.verified;
        }

        const verifiedBadge = isVerified ? '<span class="verified-badge">✓</span>' : '';

        nameEl.innerHTML = `${user.name || 'Unnamed User'} ${verifiedBadge}`;
        roleEl.textContent = role;
        iconEl.innerHTML = `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${iconSvg}</svg>`;


        modal.classList.remove('hidden');

        // Close modal on click outside
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        }
    },

    // --- View Management ---
    viewManager: {
        init(app) {
            this.app = app;
            this.views = {
                pricing: { element: app.elements.pricingWave, onShow: () => { this.app.state.selectedPriceItem = null; app.renderPricingCards(); this.app.elements.employeeCardsContainer.classList.add('hidden'); app.elements.pricingWave.classList.add('active'); } },
                contact: { element: app.elements.contactForm, onShow: () => { this.app.elements.employeeCardsContainer.classList.add('hidden'); app.elements.contactForm.classList.add('active'); } },
                jobs: { element: app.elements.jobsSection, onShow: () => { this.app.elements.employeeCardsContainer.classList.add('hidden'); app.elements.jobsSection.classList.add('active'); } },
                userProfile: { element: app.elements.userProfileCard, onShow: () => { this.app.elements.employeeCardsContainer.classList.add('hidden'); this.app.elements.userProfileCard.classList.remove('hidden'); } },
                login: { element: app.elements.loginFormCard, onShow: () => { this.app.elements.loginFormCard.classList.remove('hidden'); this.app.elements.loginFormCard.classList.add('flex'); } },
                viewer: { element: app.elements.viewerSection, onShow: () => { app.renderModelDetails(); this.app.elements.employeeCardsContainer.classList.remove('hidden'); app.elements.viewerSection.style.display = 'flex'; } },
                orders: {
                    element: app.elements.ordersPanel, onShow: () => {
                        this.app.elements.ordersPanel.classList.remove('hidden');
                        this.app.db.ref('Orders').once('value', (snapshot) => {
                            this.app.renderOrders(snapshot.val());
                        });
                    }
                }
            };
        },
        hideAll() {
            this.app.elements.pricingWave.classList.remove("active");
            this.app.elements.contactForm.classList.remove("active");
            this.app.elements.jobsSection.classList.remove("active");
            this.app.elements.viewerSection.style.display = 'none';
            this.app.elements.userProfileCard.classList.add('hidden');
            this.app.elements.loginFormCard.classList.add('hidden');
            this.app.elements.employeeCardsContainer.classList.add('hidden');
            this.app.elements.ordersPanel.classList.add('hidden');
            this.app.elements.adminBanPanel.classList.add('hidden');
            this.app.elements.bannedUserPanel.classList.add('hidden');
            this.app.elements.liveSupportPanel.classList.add('hidden');
            this.app.elements.searchPanel.classList.add('hidden');
            this.app.elements.searchedUserProfileModal.classList.add('hidden');
        },
        show(viewName) {
            this.hideAll();
            const view = this.views[viewName];
            if (view && view.element) {
                if (view.onShow) view.onShow();
                else view.element.classList.remove('hidden');
            }
        }
    },

    /**
     * Fireworks Effect System
     */
    fireworksEffect: null,

    /**
     * Tutorial Manager
     */
    tutorialManager: {
        app: null,
        currentStep: 0,
        steps: [
            {
                title: "Welcome to ICYXR",
                text: "Your destination for premium 3D printed models. Let's take a quick tour of what we offer!",
                icon: "👋"
            },
            {
                title: "Interactive 3D Viewer",
                text: "Explore models in full 3D! Drag to rotate, scroll to zoom. Use the controls to toggle wireframe mode or auto-rotation.",
                icon: "🧊"
            },
            {
                title: "Pricing & Orders",
                text: "View our pricing tiers for different models. Sign up to unlock exclusive prices and place orders directly.",
                icon: "💎"
            },
            {
                title: "Live Support",
                text: "Need help? Chat with our AI bot or request a live agent for personalized assistance.",
                icon: "💬"
            },
            {
                title: "XMAS Mode",
                text: "Toggle the Christmas theme for a festive experience with snow and music!",
                icon: "🎄"
            }
        ],

        init(app) {
            this.app = app;
            this.modal = document.getElementById('tutorial-modal');
            this.title = document.getElementById('tutorial-title');
            this.text = document.getElementById('tutorial-text');
            this.media = document.getElementById('tutorial-media');
            this.dotsContainer = document.getElementById('tutorial-progress');
            this.prevBtn = document.getElementById('tutorial-prev-btn');
            this.nextBtn = document.getElementById('tutorial-next-btn');
            this.skipBtn = document.getElementById('tutorial-skip-btn');

            if (!this.modal) return;

            this.bindEvents();
            this.checkFirstTime();
        },

        bindEvents() {
            this.prevBtn.onclick = () => this.prevStep();
            this.nextBtn.onclick = () => this.nextStep();
            this.skipBtn.onclick = () => this.close();
        },

        checkFirstTime() {
            const hasSeenTutorial = localStorage.getItem('icyxr_tutorial_seen');
            if (!hasSeenTutorial) {
                // creating a small delay so it doesn't pop up INSTANTLY upon load
                setTimeout(() => this.start(), 1500);
            }
        },

        start() {
            this.currentStep = 0;
            this.modal.classList.remove('hidden');
            this.renderStep();
        },

        close() {
            this.modal.classList.add('hidden');
            localStorage.setItem('icyxr_tutorial_seen', 'true');
        },

        nextStep() {
            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.renderStep();
            } else {
                this.close();
            }
        },

        prevStep() {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.renderStep();
            }
        },

        renderStep() {
            const step = this.steps[this.currentStep];

            // Animate content out/in
            this.title.style.opacity = 0;
            this.text.style.opacity = 0;
            this.media.style.opacity = 0;

            setTimeout(() => {
                this.title.textContent = step.title;
                this.text.textContent = step.text;
                this.media.innerHTML = `<div class="tutorial-icon">${step.icon}</div>`;

                this.title.style.opacity = 1;
                this.text.style.opacity = 1;
                this.media.style.opacity = 1;
            }, 200);

            // Update Buttons
            this.prevBtn.classList.toggle('hidden', this.currentStep === 0);
            this.nextBtn.textContent = this.currentStep === this.steps.length - 1 ? "Finish" : "Next";

            // Render Dots
            this.dotsContainer.innerHTML = '';
            this.steps.forEach((_, idx) => {
                const dot = document.createElement('div');
                dot.className = `tutorial-dot ${idx === this.currentStep ? 'active' : ''}`;
                this.dotsContainer.appendChild(dot);
            });
        }
    }
};

// --- Initialize ---
window.onload = () => {
    App.init();
};