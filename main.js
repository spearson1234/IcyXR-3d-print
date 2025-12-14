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
        selectedPriceItem: null,
        isSiteActive: true,
        userId: null,
        userEmail: null,
        allUsersCache: null, // To cache user data for search
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
            { name: "Brooke", userId: "some-brooke-uid", email: "lillupa568@gmail.com", role: "Designer", verified: true, icon: '<circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>' },
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
        };
        this.elements.viewMyTasksBtn = document.getElementById('view-my-tasks-btn');
        this.elements.setTaskBtn = document.getElementById('set-task-btn');

        this.viewManager.init(this);
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
        this.elements.navDots.forEach((dot, idx) => dot.onclick = () => this.threeDViewer.setModel(idx));
        this.elements.redeemBtn.onclick = () => this.handleDiscountRedeem();
        this.elements.qualitySelector.onchange = () => this.renderModelDetails();
        this.elements.purchaseBtn.onclick = () => this.handlePurchase();
        this.elements.authorNameInput.onchange = () => this.updateAuthorName();
        this.elements.signinBtn.onclick = () => this.signIn();
        this.elements.signupBtn.onclick = () => this.signUp();

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
        if (this.elements.executeBanBtn) {
            this.elements.executeBanBtn.onclick = () => this.executeBan();
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

                // Show verified badge for specific user
                this.elements.adminBanBtn.classList.add('hidden');
                this.elements.ordersBtn.classList.add('hidden'); // Hide by default
                this.elements.viewCounter.classList.add('hidden');
                this.elements.viewMyTasksBtn.classList.add('hidden');
                this.elements.announcementAdminPanel.classList.add('hidden');
                if (user.email === 'icyxrr@gmail.com') {
                    this.elements.adminBanBtn.classList.remove('hidden');
                    this.elements.ordersBtn.classList.remove('hidden');
                    this.elements.viewCounter.classList.remove('hidden');
                    this.elements.announcementAdminPanel.classList.remove('hidden');
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
                    if (profile) {
                        // Only update the UI if the profile exists.
                        // This prevents resetting the name on subsequent loads.
                        this.elements.authorNameDisplay.textContent = profile.name || 'New User';
                        this.elements.authorNameInput.value = profile.name || 'New User';
                    } else {
                        // If the profile doesn't exist for some reason, create it.
                        // This should only happen once.
                        this.db.ref('users/' + user.uid).set({ name: "New User" });
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
                this.elements.userVerifiedBadge.classList.add('hidden'); // Hide on logout
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
        this.auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Create a user profile in the database
                this.db.ref('users/' + userCredential.user.uid).set({ name: "New User" });
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
        const countdownDate = new Date('2026-01-01T13:00:00').getTime();
        if (!this.elements.countdownTimer) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            if (distance < 0) {
                clearInterval(interval);
                this.elements.countdownTimer.innerHTML = '<p class="text-2xl font-bold text-green-400">The store is now open!</p>';
                // Automatically set the site to active when the countdown finishes
                this.db.ref('siteStatus').set({ isActive: true });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Helper to add leading zero
            const pad = (num) => num.toString().padStart(2, '0');

            this.elements.countdownDays.textContent = pad(days);
            this.elements.countdownHours.textContent = pad(hours);
            this.elements.countdownMinutes.textContent = pad(minutes);
            this.elements.countdownSeconds.textContent = pad(seconds);

        }, 1000);
    },

    updateViewCount() {
        this.db.ref('users').on('value', (snapshot) => {
            const userCount = snapshot.numChildren();
            if (this.elements.viewCountNumber) {
                this.elements.viewCountNumber.textContent = userCount;
            }
        });
    },

    openSupportChat() {
        this.elements.feedbackModal.classList.remove('hidden');
        const messagesContainer = this.elements.supportChatMessages;

        // Check if chat has already been started
        if (messagesContainer.innerHTML !== '') {
            return;
        }

        // --- New Chat Logic ---
        messagesContainer.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        this.elements.supportInputArea.classList.add('hidden');
        this.elements.supportInputArea.classList.remove('fade-in');

        setTimeout(() => {
            messagesContainer.innerHTML = `<p class="bot-message">Hi! Welcome to ICYXR 3D Printing, how can I help?</p>`;
            
            // Fade in the input area
            setTimeout(() => {
                this.elements.supportInputArea.classList.remove('hidden');
                this.elements.supportInputArea.classList.add('fade-in');
            }, 500);

        }, 2500);
    },

    closeSupportChat() {
        this.elements.feedbackModal.classList.add('hidden');
        // Reset the chat so it can be started again on next open
        this.elements.supportChatMessages.innerHTML = '';
        this.elements.supportInputArea.classList.add('hidden');
        this.elements.supportInput.value = '';
    },

    sendSupportMessage() {
        const message = this.elements.supportInput.value.trim();
        if (!message) {
            this.showMessage("Please type a message before sending.");
            return;
        }

        const ticketData = {
            message: message,
            userId: this.state.userId || 'guest',
            userEmail: this.state.userEmail || 'guest',
            timestamp: new Date().toISOString(),
            status: 'new'
        };

        this.db.ref('SupportTickets').push(ticketData)
            .then(() => {
                this.elements.supportChatMessages.innerHTML = `<p class="bot-message">Thank you! Your message has been sent. Our team will be in touch shortly.</p>`;
                this.elements.supportInputArea.classList.add('hidden');
            })
            .catch(error => this.showMessage(`Error sending message: ${error.message}`));
    },

    showUserNotification(snapshot) {
        const notification = snapshot.val();
        const box = this.elements.userNotificationBox;
        box.textContent = notification.message;
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
                resultItem.innerHTML = `
                    <p class="font-bold text-white">${user.name || 'Unnamed User'}</p>
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
    }
};

// --- Initialize ---
window.onload = () => {
    App.init();
    App.viewManager.show('viewer');
};
