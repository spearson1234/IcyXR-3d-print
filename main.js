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
}

/**
 * Main Application Object
 */
const App = {
    // --- State and Data ---
    state: {
        isDiscountActive: false,
        modelIndex: 0,
        userId: null,
    },
    config: {
        DISCOUNT_CODE: "6543210445",
        DISCOUNT_RATE: 0.05,
        originalPrices: [
            { name: "(S) Shark Toy", price: 1.50 + 0.30, printTime: "25m 46s" },
            { name: "(S) Any Statue", price: null, printTime: "N/A" },
            { name: "(M) Dragon", price: 5.30 + 0.87, printTime: "1h 24m" },
        ],
        modelSpecs: [
            { name: "Octahedron Prototype", quality: { standard: { material: "PLA Filament (Recycled)", layerHeight: "0.2mm (Standard)", printTime: "25m 46s", basePrice: 1.50 + 0.30 }, high: { material: "PLA+ Filament (Enhanced)", layerHeight: "0.1mm (High Detail)", printTime: "Approx 8 hours", basePrice: 5.80 } } },
            { name: "Geometric Reindeer", quality: { standard: { material: "Metallic Grey PLA", layerHeight: "0.15mm (Sharp Edges)", printTime: "1h 24m", basePrice: 5.30 + 0.87 }, high: { material: "Silver Resin (SLA Print)", layerHeight: "0.05mm (Premium Finish)", printTime: "Approx 10 hours", basePrice: 12.99 } } }
        ],
        teamData: [
            { name: "Brooke", role: "Designer", verified: true, icon: '<circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>' },
            { name: "Smithy", role: "Chief Executive Officer (CEO)", verified: true, icon: '<path d="M12 2l3.09 6.31 6.91.86-5 4.88 1.18 6.91L12 18l-6.18 3.25 1.18-6.91-5-4.88 6.91-.86L12 2z"></path>' },
            { name: "Terry", role: "IT Support", verified: true, icon: '<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84 c-0.24,0-0.44,0.17-0.48,0.41L9.2,5.59C8.6,5.82,8.08,6.14,7.58,6.52L5.19,5.56C4.97,5.49,4.72,5.56,4.6,5.78L2.68,9.1 c-0.11,0.2-0.06,0.47,0.12,0.61l2.03,1.58C4.78,11.36,4.76,11.68,4.76,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.78 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.48-0.41l0.36-2.78c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0.01,0.59-0.22l1.92-3.32c0.11-0.2,0.06-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"></path>' }
        ]
    },

    // --- DOM Elements ---
    elements: {},

    // --- Initialization ---
    init() {
        // Cache DOM elements
        this.elements = {
            messageBox: document.getElementById("message-box"),
            topHeader: document.getElementById("top-header"),
            sidebar: document.getElementById("sidebar"),
            pricingWave: document.getElementById("pricing-wave"),
            contactForm: document.getElementById("contact-form"),
            viewerSection: document.getElementById("viewer-section"),
            userProfileCard: document.getElementById("user-profile-card"),
            userIdSkeleton: document.getElementById("user-id-skeleton"),
            userIdDisplay: document.getElementById('user-id-display'),
            employeeCardsContainer: document.getElementById("employee-cards-container"),
            pricingCardsContainer: document.querySelector('.pricing-cards'),
            qualitySelector: document.getElementById('quality-selector'),
            discountInput: document.getElementById('discount-input'),
            redeemBtn: document.getElementById('redeem-btn'),
            closeSidebarBtn: document.getElementById('close-sidebar-btn'),
            navDots: document.querySelectorAll('.nav-dot'),
            logoutBtn: document.getElementById('logout-btn'),
        };

        this.viewManager.init(this);
        this.threeDViewer = new ThreeDViewer('three-canvas', this.config.modelSpecs, (index) => {
            this.state.modelIndex = index;
            this.renderModelDetails();
        });

        this.bindEvents();
        this.renderEmployeeCards();

        // Expose a method for firebase-init.js to call
        window.updateAppUserId = this.updateUserId.bind(this);

        // Adjust layout to account for fixed headers
        const banner = document.getElementById('beta-banner');
        if (banner && this.elements.topHeader) {
            const bannerHeight = banner.offsetHeight;
            this.elements.topHeader.style.top = `${bannerHeight}px`;
            document.body.style.paddingTop = `${bannerHeight + this.elements.topHeader.offsetHeight}px`;
        }
    },

    // --- Event Binding ---
    bindEvents() {
        document.getElementById("burger").onclick = () => this.toggleSidebar();
        document.getElementById("search").onclick = () => this.showMessage("Search coming soon!");
        document.getElementById("profile-btn").onclick = () => this.viewManager.show('userProfile');
        document.getElementById("pricing-btn").onclick = () => this.viewManager.show('pricing');
        document.getElementById("contact-btn").onclick = () => this.viewManager.show('contact');
        document.getElementById("viewer-btn").onclick = () => this.viewManager.show('viewer');
        document.getElementById("close-pricing-btn").onclick = () => this.viewManager.show('viewer');
        this.elements.closeSidebarBtn.onclick = () => this.toggleSidebar();
        document.getElementById("prev-model-btn").onclick = () => this.threeDViewer.prevModel();
        document.getElementById("next-model-btn").onclick = () => this.threeDViewer.nextModel();
        this.elements.navDots.forEach((dot, idx) => dot.onclick = () => this.threeDViewer.setModel(idx));
        this.elements.redeemBtn.onclick = () => this.handleDiscountRedeem();
        this.elements.qualitySelector.onchange = () => this.renderModelDetails();
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

    updateUserId(userId) {
        if (userId) {
            this.state.userId = userId; // Store the new user ID in the state
        }

        if (this.state.userId) {
            this.elements.userIdDisplay.textContent = this.state.userId;
            this.elements.userIdSkeleton.classList.add('hidden');
            this.elements.userIdDisplay.classList.remove('hidden');
        }
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.onclick = () => auth.signInAnonymously()
                .then(() => this.showMessage("New anonymous user session created."))
                .catch(err => console.error("New session failed", err));
        }
    },

    // --- Rendering Methods ---
    renderPricingCards() {
        this.elements.pricingCardsContainer.innerHTML = '';
        this.config.originalPrices.forEach(item => {
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
            card.className = 'pricing-card';
            card.innerHTML = `<h3 class="text-xl font-bold">${item.name}</h3><p class="text-sm text-gray-300">Print Time: ${item.printTime}</p>${priceHtml}`;
            this.elements.pricingCardsContainer.appendChild(card);
        });
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
        document.getElementById('spec-material').textContent = specs.material;
        document.getElementById('spec-layer-height').textContent = specs.layerHeight;
        document.getElementById('spec-print-time').textContent = specs.printTime;
        priceElement.textContent = priceText;

        this.elements.navDots.forEach((dot, idx) => dot.classList.toggle('active', idx === this.state.modelIndex));
    },

    renderEmployeeCards() {
        this.elements.employeeCardsContainer.innerHTML = '';
        this.config.teamData.forEach(employee => {
            const card = document.createElement('div');
            card.className = 'employee-card flex items-center gap-4 p-4 rounded-xl';
            const verifiedBadge = employee.verified ? '<span class="verified-badge">✓</span>' : '';
            card.innerHTML = `
                <div class="employee-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${employee.icon}</svg>
                </div>
                <div class="employee-info">
                    <div class="employee-name text-lg">${employee.name} ${verifiedBadge}</div>
                    <div class="employee-role text-sm text-gray-400">${employee.role}</div>
                </div>`;
            this.elements.employeeCardsContainer.appendChild(card);
        });
    },

    // --- Logic Methods ---
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

    // --- View Management ---
    viewManager: {
        init(app) {
            this.app = app;
            this.views = {
                pricing: { element: app.elements.pricingWave, onShow: () => { app.renderPricingCards(); this.app.elements.employeeCardsContainer.classList.add('hidden'); app.elements.pricingWave.classList.add('active'); } },
                contact: { element: app.elements.contactForm, onShow: () => { this.app.elements.employeeCardsContainer.classList.add('hidden'); app.elements.contactForm.classList.add('active'); } },
                userProfile: { element: app.elements.userProfileCard, onShow: () => { 
                    this.app.elements.employeeCardsContainer.classList.add('hidden'); 
                    this.app.elements.userProfileCard.classList.remove('hidden'); 
                    // Refresh the display based on current state
                    if (!this.app.state.userId) {
                        this.app.elements.userIdSkeleton.classList.remove('hidden');
                        this.app.elements.userIdDisplay.classList.add('hidden');
                    } else { this.app.updateUserId(); } } },
                viewer: { element: app.elements.viewerSection, onShow: () => { app.renderModelDetails(); this.app.elements.employeeCardsContainer.classList.remove('hidden'); app.elements.viewerSection.style.display = 'flex'; } }
            };
        },
        hideAll() {
            this.app.elements.pricingWave.classList.remove("active");
            this.app.elements.contactForm.classList.remove("active");
            this.app.elements.viewerSection.style.display = 'none';
            this.app.elements.userProfileCard.classList.add('hidden');
            this.app.elements.employeeCardsContainer.classList.add('hidden');
        },
        show(viewName) {
            this.hideAll();
            if (this.views[viewName] && this.views[viewName].onShow) {
                this.views[viewName].onShow();
            }
        }
    }
};

// --- Initialize ---
window.onload = () => {
    App.init();
    // Let onAuthStateChanged handle the initial user state
    auth.signInAnonymously().catch(err => console.error("Anonymous sign-in failed", err));
    App.viewManager.show('viewer');
};
