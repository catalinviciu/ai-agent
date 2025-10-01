// AI Agent State Management
class AgentState {
    constructor() {
        this.isActive = false;
        this.isExpanded = false;
        this.currentWorkflow = null;
        this.workflowStep = 0;
        this.workflowSteps = [];
        this.conversationHistory = [];
        this.outputVisible = false;
        this.isMobile = window.innerWidth <= 768;

        // Bind methods
        this.init = this.init.bind(this);
        this.updateUI = this.updateUI.bind(this);
        this.handleResize = this.handleResize.bind(this);

        this.init();
    }

    init() {
        window.addEventListener('resize', this.handleResize);
        this.setupKeyboardNavigation();
        this.updateUI();
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        if (wasMobile !== this.isMobile) {
            this.updateUI();
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC to close agent
            if (e.key === 'Escape' && this.isActive) {
                this.deactivate();
            }

            // Alt + A to activate agent
            if (e.altKey && e.key === 'a' && !this.isActive) {
                this.activate();
            }
        });
    }

    activate() {
        this.isActive = true;
        this.isExpanded = false;
        this.updateUI();
        this.announceToScreenReader('AI Assistant activated');
    }

    deactivate() {
        this.isActive = false;
        this.isExpanded = false;
        this.outputVisible = false;
        this.updateUI();
        this.announceToScreenReader('AI Assistant deactivated');
    }

    expand() {
        this.isExpanded = true;
        this.updateUI();
        this.announceToScreenReader('AI Assistant expanded');
    }

    collapse() {
        this.isExpanded = false;
        this.updateUI();
        this.announceToScreenReader('AI Assistant collapsed');
    }

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        this.updateUI();
        this.announceToScreenReader(this.isExpanded ? 'AI Assistant expanded' : 'AI Assistant collapsed');
    }

    close() {
        this.isActive = false;
        this.isExpanded = false;
        this.outputVisible = false;
        this.updateUI();
        this.announceToScreenReader('AI Assistant closed');
    }

    showOutput(content) {
        this.outputVisible = true;
        this.isExpanded = true; // Auto-expand when showing output
        this.updateOutputContent(content);
        this.updateUI();
        this.announceToScreenReader('AI generated content ready for review');
    }

    hideOutput() {
        this.outputVisible = false;
        this.isExpanded = false; // Collapse when hiding output
        this.updateUI();
    }

    updateWorkflowProgress(step, totalSteps, stepName) {
        this.workflowStep = step;
        this.workflowSteps = totalSteps;

        const progressElement = document.getElementById('workflow-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressPercent = document.querySelector('.progress-percent');
        const currentStepElement = document.getElementById('current-step');

        if (step > 0) {
            progressElement.style.display = 'block';
            const percentage = Math.round((step / totalSteps) * 100);
            progressFill.style.width = `${percentage}%`;
            progressPercent.textContent = `${percentage}%`;
            currentStepElement.textContent = stepName;
        } else {
            progressElement.style.display = 'none';
        }
    }

    addMessage(content, isUser = false, actions = null) {
        const message = {
            id: Date.now(),
            content,
            isUser,
            actions,
            timestamp: new Date()
        };

        this.conversationHistory.push(message);
        this.renderConversation();

        if (!isUser) {
            this.announceToScreenReader(`AI says: ${content}`);
        }
    }

    renderConversation() {
        const conversationScroll = document.getElementById('conversation-scroll');
        const conversationActions = document.getElementById('conversation-actions');
        if (!conversationScroll) return;

        // Render messages with inline actions
        conversationScroll.innerHTML = this.conversationHistory.map(message => `
            <div class="message ${message.isUser ? 'user' : 'ai'}">
                ${message.isUser ? `
                    <div class="message-avatar user">LS</div>
                ` : `
                    <svg class="message-sparkle" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#ff6b35"/>
                    </svg>
                `}
                <div class="message-content-wrapper">
                    <div class="message-text">${message.content}</div>
                    ${message.actions && !message.isUser ? `
                        <div class="message-actions">
                            ${this.renderConversationActions(message.actions)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Hide the bottom conversation actions area (we're showing actions inline now)
        if (conversationActions) {
            conversationActions.style.display = 'none';
        }

        // Scroll to bottom - use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const scrollContainer = document.getElementById('conversation-scroll').parentElement;
                if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }
            });
        });
    }

    renderConversationActions(actions) {
        // Check if actions contain status information (for driver readiness view)
        const hasStatusCards = actions.some(a => a.badge);

        if (hasStatusCards) {
            const statusCards = actions.filter(a => a.badge).map(action => `
                <div class="status-card ${action.badgeColor || ''}">
                    <span class="status-badge">${action.badge}</span>
                    <span class="status-text">${action.text}</span>
                </div>
            `).join('');

            const actionButtons = actions.filter(a => !a.badge).map(action => `
                <button class="conversation-action-btn" onclick="${action.onclick}">
                    ${action.text}
                </button>
            `).join('');

            return statusCards + actionButtons;
        }

        // Regular action buttons
        return actions.map(action => `
            <button class="conversation-action-btn" onclick="${action.onclick}">
                ${action.text}
            </button>
        `).join('');
    }

    renderMessageActions(actions) {
        return `
            <div class="message-actions" style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
                ${actions.map(action => `
                    <button class="action-btn secondary" onclick="${action.onclick}" style="padding: 8px 12px; font-size: 12px;">
                        <i class="material-icons" style="font-size: 16px;">${action.icon}</i>
                        <span>${action.text}</span>
                    </button>
                `).join('')}
                ${actions.length === 0 ? '<button class="action-btn secondary" onclick="showTextInput(\`Tell me more about what you need\`)" style="padding: 8px 12px; font-size: 12px;"><i class="material-icons" style="font-size: 16px;">chat</i><span>I need something else</span></button>' : ''}
            </div>
        `;
    }

    updateOutputContent(content) {
        const outputContent = document.getElementById('output-content');
        if (outputContent) {
            outputContent.innerHTML = content;
        }
    }

    updateUI() {
        const trigger = document.getElementById('ai-trigger');
        const container = document.getElementById('ai-container');
        const expandBtn = document.getElementById('expand-btn');
        const hostLayout = document.querySelector('.host-layout');

        // Update trigger
        if (trigger) {
            trigger.classList.toggle('hidden', this.isActive);
            trigger.classList.toggle('active', this.isActive);
        }

        // Update container
        if (container) {
            container.classList.toggle('active', this.isActive);
            container.classList.toggle('expanded', this.isExpanded);
        }

        // Update expand button icon
        if (expandBtn) {
            const icon = expandBtn.querySelector('.material-icons');
            if (icon) {
                icon.textContent = this.isExpanded ? 'close_fullscreen' : 'open_in_full';
            }
        }

        // Update host layout
        if (hostLayout && !this.isMobile) {
            // Adjust margin when AI is active and not expanded
            if (this.isActive && !this.isExpanded) {
                hostLayout.style.marginRight = '400px';
            } else if (this.isActive && this.isExpanded) {
                hostLayout.style.marginRight = 'calc(100vw - 260px)';
            } else {
                hostLayout.style.marginRight = '0';
            }
        }
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = message;

        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    }
}

// Global agent state
const agentState = new AgentState();

// Core Agent Functions
function activateAgent() {
    agentState.activate();

    // Show welcome interface with dynamic actions
    showActionInterface();
    populateWelcomeActions();
}

function populateWelcomeActions() {
    const actionInterface = document.getElementById('action-interface');
    if (!actionInterface) return;

    actionInterface.innerHTML = `
        <div class="action-cards">
            <button class="action-card primary" onclick="startDVIRSetup()">
                <div class="card-icon">
                    <i class="material-icons">description</i>
                </div>
                <div class="card-content">
                    <div class="card-title">Create your first form</div>
                    <div class="card-subtitle">With my help or from your template</div>
                </div>
                <div class="card-pointer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 21.5C7.5 21.5 6.5 21.5 6.5 20.5C6.5 19.5 7.5 16.5 12 16.5C16.5 16.5 17.5 19.5 17.5 20.5C17.5 21.5 16.5 21.5 16.5 21.5H7.5Z" fill="currentColor"/>
                        <path d="M12 15C13.933 15 15.5 13.433 15.5 11.5C15.5 9.567 13.933 8 12 8C10.067 8 8.5 9.567 8.5 11.5C8.5 13.433 10.067 15 12 15Z" fill="currentColor"/>
                        <path d="M12 2L13 7L14 2L15 7L16 2L17 8L16 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </div>
            </button>
            <button class="action-card" onclick="analyzeCurrent()">
                <div class="card-icon">
                    <i class="material-icons">people</i>
                </div>
                <div class="card-content">
                    <div class="card-title">Invite and train drivers</div>
                    <div class="card-subtitle">Allow your team to use the app</div>
                </div>
            </button>
        </div>
    `;
}

function toggleExpand() {
    agentState.toggleExpand();
}

function closeAgent() {
    agentState.close();
}

function deactivateAgent() {
    agentState.deactivate();
}


// Interface Management
function showActionInterface() {
    const actionInterface = document.getElementById('action-interface');
    const conversationHistory = document.getElementById('conversation-history');
    const conversationActions = document.getElementById('conversation-actions');
    const textInputArea = document.getElementById('text-input-area');

    if (actionInterface) actionInterface.style.display = 'block';
    if (conversationHistory) conversationHistory.style.display = 'none';
    if (conversationActions) conversationActions.style.display = 'none';
    if (textInputArea) textInputArea.style.display = 'none'; // Always hide by default
}

function showConversationInterface() {
    const actionInterface = document.getElementById('action-interface');
    const conversationHistory = document.getElementById('conversation-history');
    const conversationActions = document.getElementById('conversation-actions');
    const textInputArea = document.getElementById('text-input-area');

    if (actionInterface) actionInterface.style.display = 'none';
    if (conversationHistory) conversationHistory.style.display = 'block';
    if (conversationActions) conversationActions.style.display = 'block';
    if (textInputArea) textInputArea.style.display = 'none'; // Don't show by default

    // Auto-scroll to bottom when conversation becomes visible
    setTimeout(() => {
        const conversationScroll = document.getElementById('conversation-scroll');
        if (conversationScroll) {
            conversationScroll.scrollTo({
                top: conversationScroll.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, 150);
}

function showTextInput(reason = 'Please describe what you need help with') {
    const textInputArea = document.getElementById('text-input-area');
    const textInput = document.getElementById('text-input');

    if (textInputArea && textInput) {
        textInputArea.style.display = 'block';
        textInput.placeholder = reason;
        setTimeout(() => textInput.focus(), 100);
    }
}

function hideTextInput() {
    const textInputArea = document.getElementById('text-input-area');
    if (textInputArea) {
        textInputArea.style.display = 'none';
    }
}

// Workflow Functions
function startDVIRSetup() {
    agentState.currentWorkflow = 'dvir-setup';
    agentState.updateWorkflowProgress(1, 4, 'Building inspection form');

    showConversationInterface();

    // Start Activity 2: Build the right inspection form
    setTimeout(() => {
        agentState.addMessage("Great! Let's create your first inspection form.", false);

        setTimeout(() => {
            agentState.addMessage("How would you like to create your inspection form?", false, [
                { text: "Build with AI", onclick: "selectFormCreationMethod('ai')" },
                { text: "I have an existing inspection form I want to use", onclick: "selectFormCreationMethod('upload')" }
            ]);
        }, 1000);
    }, 500);
}

function selectFormCreationMethod(method) {
    if (method === 'ai') {
        agentState.addMessage("Build with AI", true);

        setTimeout(() => {
            agentState.addMessage("Perfect! I'll help you build a custom form. Let me ask you a few questions to create the best inspection form for your needs.", false);

            setTimeout(() => {
                askVehicleType();
            }, 1000);
        }, 500);
    } else if (method === 'upload') {
        agentState.addMessage("I have an existing inspection form I want to use", true);

        setTimeout(() => {
            agentState.addMessage("Great! You can upload your existing form and I'll convert it to a digital format.", false);

            setTimeout(() => {
                agentState.addMessage("What format is your inspection form?", false, [
                    { text: "PDF Document", onclick: "selectUploadFormat('pdf')" },
                    { text: "Image (JPG, PNG)", onclick: "selectUploadFormat('image')" }
                ]);
            }, 1000);
        }, 500);
    }
}

// Question 1: Vehicle Type
function askVehicleType() {
    agentState.addMessage("What type of vehicles do you need to inspect?", false, [
        { text: "Light commercial vehicles", onclick: "selectVehicleType('light')" },
        { text: "Heavy Trucks", onclick: "selectVehicleType('heavy')" },
        { text: "Specialized vehicles (emergency, construction, special transport)", onclick: "selectVehicleType('specialized')" }
    ]);
}

function selectVehicleType(type) {
    const typeMap = {
        light: "Light commercial vehicles",
        heavy: "Heavy Trucks",
        specialized: "Specialized vehicles (emergency, construction, special transport)"
    };

    agentState.addMessage(typeMap[type], true);

    // Store selection
    if (!agentState.formData) agentState.formData = {};
    agentState.formData.vehicleType = type;

    setTimeout(() => {
        askTrailerInspection();
    }, 500);
}

// Question 2: Trailer Inspection
function askTrailerInspection() {
    agentState.addMessage("Do you need to inspect trailers?", false, [
        { text: "Yes", onclick: "selectTrailerInspection('yes')" },
        { text: "No", onclick: "selectTrailerInspection('no')" }
    ]);
}

function selectTrailerInspection(answer) {
    agentState.addMessage(answer === 'yes' ? "Yes" : "No", true);

    // Store selection
    agentState.formData.trailerInspection = answer;

    setTimeout(() => {
        askPriority();
    }, 500);
}

// Question 3: Priority
function askPriority() {
    agentState.addMessage("What is your main priority for vehicle inspections?", false, [
        { text: "Compliance focused", onclick: "selectPriority('compliance')" },
        { text: "Safety first", onclick: "selectPriority('safety')" },
        { text: "Maintenance & uptime", onclick: "selectPriority('maintenance')" }
    ]);
}

function selectPriority(priority) {
    const priorityMap = {
        compliance: "Compliance focused",
        safety: "Safety first",
        maintenance: "Maintenance & uptime"
    };

    agentState.addMessage(priorityMap[priority], true);

    // Store selection
    agentState.formData.priority = priority;

    setTimeout(() => {
        generateInspectionForm();
    }, 500);
}

function selectUploadFormat(format) {
    const formatMap = {
        pdf: "PDF Document",
        image: "Image (JPG, PNG)"
    };

    const acceptTypes = {
        pdf: ".pdf",
        image: ".jpg,.jpeg,.png"
    };

    agentState.addMessage(formatMap[format], true);

    // Store format selection
    if (!agentState.formData) agentState.formData = {};
    agentState.formData.uploadFormat = format;

    setTimeout(() => {
        showFileUploadInterface(acceptTypes[format], formatMap[format]);
    }, 500);
}

function showFileUploadInterface(acceptTypes, formatName) {
    const uploadHTML = `
        <div class="file-upload-container">
            <div class="upload-zone" onclick="document.getElementById('file-input').click()">
                <svg class="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 18C5.17 18 3.14 16.42 3 14.35C2.87 12.5 3.85 10.83 5.29 10.06C5.11 9.38 5 8.7 5 8C5 5.24 7.24 3 10 3C11.38 3 12.64 3.56 13.54 4.44C14.39 3.56 15.62 3 17 3C19.76 3 22 5.24 22 8C22 8.7 21.89 9.38 21.71 10.06C23.15 10.83 24.13 12.5 24 14.35C23.86 16.42 21.83 18 20 18H7Z" fill="#d0d0d0"/>
                    <path d="M16 13L12 9L8 13H10.5V16H13.5V13H16Z" fill="#666"/>
                </svg>
                <h3>Drop your ${formatName} here</h3>
                <p>Or click to browse files</p>
                <button class="btn-browse">Browse Files</button>
            </div>
            <input type="file" id="file-input" accept="${acceptTypes}" style="display: none;" onchange="handleFileSelect(event)">
            <div class="upload-tips">
                <p><strong>💡 Tips for best results:</strong></p>
                <ul>
                    <li>Ensure text is clear and readable</li>
                    <li>Include all inspection categories</li>
                    <li>Maximum file size: 10MB</li>
                    <li>I'll automatically detect inspection items</li>
                </ul>
            </div>
        </div>
    `;

    agentState.showOutput(uploadHTML);
    agentState.addMessage("Please upload your inspection form. I'll analyze it and convert it to a digital format.", false);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('File size exceeds 10MB. Please choose a smaller file.');
        return;
    }

    // Show upload progress
    agentState.addMessage(`Uploading ${file.name}...`, true);

    showUploadProgress(file);
}

function showUploadProgress(file) {
    const progressHTML = `
        <div class="upload-progress-container">
            <div class="upload-file-info">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#ff6b35"/>
                    <path d="M14 2V8H20" stroke="#fff" stroke-width="2"/>
                </svg>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${(file.size / 1024).toFixed(2)} KB</div>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" id="upload-progress-bar"></div>
            </div>
            <div class="progress-text" id="upload-progress-text">0%</div>
        </div>
    `;

    agentState.updateOutputContent(progressHTML);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        const progressBar = document.getElementById('upload-progress-bar');
        const progressText = document.getElementById('upload-progress-text');

        if (progressBar) progressBar.style.width = progress + '%';
        if (progressText) progressText.textContent = Math.floor(progress) + '%';

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                handleUploadComplete(file);
            }, 500);
        }
    }, 200);
}

function handleUploadComplete(file) {
    agentState.addMessage("Upload complete! Analyzing your form...", false);

    // Show analyzing animation
    const analyzingHTML = `
        <div class="analyzing-container">
            <div class="spinner"></div>
            <h3>Analyzing ${file.name}</h3>
            <p>Extracting inspection items and categories...</p>
        </div>
    `;

    agentState.updateOutputContent(analyzingHTML);

    // Simulate analysis
    setTimeout(() => {
        showConvertedForm();
    }, 3000);
}

// Inspection form data based on vehicle type
const inspectionCategories = {
    light: [
        { name: "Engine & Fluids", items: ["Engine oil level", "Coolant level", "Brake fluid", "Power steering fluid"] },
        { name: "Tires & Wheels", items: ["Tire condition", "Tire pressure", "Wheel rims", "Lug nuts"] },
        { name: "Lights & Electrical", items: ["Headlights", "Turn signals", "Brake lights", "Hazard lights"] },
        { name: "Brakes & Safety", items: ["Brake pads", "Brake lines", "Parking brake", "Emergency equipment"] }
    ],
    heavy: [
        { name: "Engine & Powertrain", items: ["Engine oil", "Coolant", "Air filter", "Fuel system", "Transmission fluid"] },
        { name: "Braking System", items: ["Air pressure", "Brake drums", "Brake linings", "Slack adjusters", "Air lines"] },
        { name: "Steering & Suspension", items: ["Steering linkage", "Power steering", "Shock absorbers", "Springs"] },
        { name: "Lights & Electrical", items: ["All lights", "Reflectors", "Battery", "Wiring"] },
        { name: "Tires & Wheels", items: ["Tire condition", "Tire pressure", "Wheel fasteners", "Rims"] }
    ],
    specialized: [
        { name: "Core Systems", items: ["Hydraulics", "Pneumatics", "Electrical systems", "Fluid levels"] },
        { name: "Safety Equipment", items: ["Emergency shutoffs", "Fire suppression", "Safety barriers", "Warning systems"] },
        { name: "Vehicle Structure", items: ["Frame integrity", "Mounting points", "Body condition", "Access points"] },
        { name: "Standard Equipment", items: ["Lights", "Brakes", "Tires", "Steering"] }
    ]
};

// Generate inspection form after all questions answered
function generateInspectionForm() {
    agentState.updateWorkflowProgress(2, 4, 'Generating inspection form');

    agentState.addMessage("Perfect! I have all the information I need. I'm now generating your custom inspection form...", false);

    // Show loading state
    setTimeout(() => {
        agentState.updateWorkflowProgress(3, 4, 'Form ready for review');

        const vehicleType = agentState.formData?.vehicleType || 'light';
        const categories = inspectionCategories[vehicleType];

        showMobilePreview(categories, 'defects');  // Default to "defects only" layout

        agentState.addMessage("Your custom inspection form is ready! This is how it will look on your drivers' mobile devices.", false, [
            { text: "Looks great, continue", onclick: "approveForm()" },
            { text: "Edit form", onclick: "editForm()" }
        ]);
    }, 3000);
}

function showConvertedForm() {
    agentState.updateWorkflowProgress(2, 4, 'Processing uploaded form');

    // Use default categories for uploaded forms
    const categories = inspectionCategories.light;
    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);

    agentState.addMessage(`Analysis complete! I found ${totalItems} inspection items across ${categories.length} categories. I've converted them into a digital format.`, false);

    // Update progress
    agentState.updateWorkflowProgress(3, 4, 'Form ready for review');

    showMobilePreview(categories, 'defects');

    agentState.addMessage("Your custom inspection form is ready! This is how it will look on your drivers' mobile devices.", false, [
        { text: "Looks great, continue", onclick: "approveForm()" },
        { text: "Edit form", onclick: "editForm()" }
    ]);
}

// Show mobile preview in canvas
function showMobilePreview(categories, layout = 'defects') {
    // Store current layout
    if (!agentState.formData) agentState.formData = {};
    agentState.formData.currentLayout = layout;
    agentState.formData.categories = categories;

    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);

    // Generate mobile preview content based on layout
    let mobileItems = '';

    categories.forEach(category => {
        mobileItems += `<div class="mobile-section">
            <h4>${category.name}</h4>`;

        category.items.forEach(item => {
            if (layout === 'defects') {
                // Mark defects only layout - checkboxes (check only defects)
                mobileItems += `
                    <div class="mobile-item-checkbox">
                        <div class="mobile-checkbox"></div>
                        <span>${item}</span>
                    </div>`;
            } else {
                // Submit all layout - pass/fail buttons for every item
                mobileItems += `
                    <div class="mobile-item">
                        <span>${item}</span>
                        <div class="mobile-pass-fail">
                            <button class="pass">✓</button>
                            <button class="fail">✕</button>
                        </div>
                    </div>`;
            }
        });

        mobileItems += `</div>`;
    });

    const formContent = `
        <div class="mobile-preview-wrapper">
            <div class="preview-header">
                <h2>Mobile Preview</h2>
                <p>This is how drivers will see the inspection form on their mobile devices:</p>
            </div>

            <div class="layout-switcher">
                <button class="layout-option ${layout === 'defects' ? 'active' : ''}" onclick="switchLayout('defects')">
                    <div class="layout-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="layout-info">
                        <div class="layout-title">Mark defects only</div>
                        <div class="layout-subtitle">Faster - only report issues</div>
                    </div>
                </button>
                <button class="layout-option ${layout === 'submit-all' ? 'active' : ''}" onclick="switchLayout('submit-all')">
                    <div class="layout-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="layout-info">
                        <div class="layout-title">Submit all items</div>
                        <div class="layout-subtitle">Complete - check every item</div>
                    </div>
                </button>
            </div>

            <div class="mobile-preview">
                <div class="mobile-screen">
                    <div class="mobile-header">
                        <div>←</div>
                        <strong style="flex: 1;">Inspection - VH_142</strong>
                        <div>✕</div>
                    </div>
                    <div class="mobile-content">
                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                                <label style="display: flex; align-items: center; gap: 8px; color: white;">
                                    <div style="width: 20px; height: 20px; border: 2px solid white; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center;">
                                        <div style="width: 8px; height: 8px; background: #333; border-radius: 50%;"></div>
                                    </div>
                                    <span>Pre-trip</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; color: white;">
                                    <div style="width: 20px; height: 20px; border: 2px solid white; border-radius: 50%; background: transparent;"></div>
                                    <span>Post-trip</span>
                                </label>
                            </div>
                            <h3 style="margin-bottom: 8px; color: white; font-size: 24px;">Start inspection</h3>
                            <p style="color: white; font-size: 14px;">${layout === 'defects' ? 'Check items that have defects. Unchecked items are OK.' : 'Mark each item as pass or fail, then select Next.'}</p>
                        </div>

                        ${mobileItems}

                        <button style="width: 100%; padding: 16px; background: white; color: #333; border: none; border-radius: 8px; margin-top: 24px; font-weight: 600; font-size: 16px;">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <div class="preview-stats">
                <div class="stat">
                    <strong>${totalItems}</strong> inspection items
                </div>
                <div class="stat">
                    <strong>${categories.length}</strong> categories
                </div>
                <div class="stat">
                    <strong>2-3 min</strong> completion time
                </div>
            </div>
        </div>
    `;

    agentState.showOutput(formContent);
}

// Switch between layout modes
function switchLayout(newLayout) {
    if (!agentState.formData || !agentState.formData.categories) return;

    const categories = agentState.formData.categories;
    showMobilePreview(categories, newLayout);
}

function analyzeCurrent() {
    agentState.currentWorkflow = 'analysis';
    showConversationInterface();

    agentState.addMessage("I'll analyze your current DVIR setup and provide recommendations. Let me scan your system...", false);

    setTimeout(() => {
        const analysisContent = `
            <div class="analysis-report">
                <h2>📊 Current Setup Analysis</h2>

                <div class="analysis-grid">
                    <div class="analysis-card good">
                        <div class="analysis-icon">✅</div>
                        <h3>Working Well</h3>
                        <ul>
                            <li>4 drivers configured</li>
                            <li>Basic form structure</li>
                            <li>Mobile access enabled</li>
                        </ul>
                    </div>

                    <div class="analysis-card warning">
                        <div class="analysis-icon">⚠️</div>
                        <h3>Needs Attention</h3>
                        <ul>
                            <li>3 drivers missing email</li>
                            <li>No trailer inspections</li>
                            <li>Limited compliance checks</li>
                        </ul>
                    </div>

                    <div class="analysis-card info">
                        <div class="analysis-icon">💡</div>
                        <h3>Recommendations</h3>
                        <ul>
                            <li>Add photo requirements</li>
                            <li>Enable automatic reminders</li>
                            <li>Setup compliance reporting</li>
                        </ul>
                    </div>
                </div>

                <div class="improvement-potential">
                    <h3>🚀 Improvement Potential</h3>
                    <div class="metric">
                        <span>Compliance Score: <strong>78%</strong></span>
                        <div class="progress-bar">
                            <div class="progress" style="width: 78%"></div>
                        </div>
                    </div>
                    <div class="metric">
                        <span>Driver Readiness: <strong>65%</strong></span>
                        <div class="progress-bar">
                            <div class="progress" style="width: 65%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
            .analysis-report {
                font-family: var(--font-family);
            }

            .analysis-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 16px;
                margin: 20px 0;
            }

            .analysis-card {
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
            }

            .analysis-card.good {
                background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
                border-color: #28a745;
            }

            .analysis-card.warning {
                background: linear-gradient(135deg, #fff8e6 0%, #fffaf0 100%);
                border-color: #ffc107;
            }

            .analysis-card.info {
                background: linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%);
                border-color: #007bff;
            }

            .analysis-icon {
                font-size: 24px;
                margin-bottom: 12px;
            }

            .analysis-card h3 {
                margin-bottom: 12px;
                color: var(--vz-charcoal-gray);
            }

            .analysis-card ul {
                list-style: none;
                padding: 0;
            }

            .analysis-card li {
                padding: 4px 0;
                color: var(--vz-gray);
                font-size: 14px;
            }

            .improvement-potential {
                background: #f8f9ff;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
            }

            .metric {
                margin: 12px 0;
            }

            .progress-bar {
                background: #e9ecef;
                height: 8px;
                border-radius: 4px;
                margin-top: 8px;
                overflow: hidden;
            }

            .progress {
                background: linear-gradient(90deg, #007bff 0%, #0056b3 100%);
                height: 100%;
                transition: width 1s ease;
            }

            @media (max-width: 768px) {
                .analysis-grid {
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
            }
            </style>
        `;

        agentState.showOutput(analysisContent);
        agentState.addMessage("Analysis complete! I found several areas for improvement. Your compliance score is 78% and driver readiness is 65%. Would you like me to fix these issues automatically?", false, [
            { text: "Yes, fix automatically", icon: "auto_fix_high", onclick: "autoFix()" },
            { text: "Show me what to fix", icon: "list", onclick: "showFixList()" },
            { text: "I'll handle it manually", icon: "person", onclick: "manualFix()" }
        ]);
    }, 2500);
}

function uploadTemplate() {
    showConversationInterface();
    agentState.addMessage("I'll help you upload and convert your existing inspection template. What format is your template?", false, [
        { text: "PDF Document", icon: "picture_as_pdf", onclick: "selectFormat('pdf')" },
        { text: "Word Document", icon: "description", onclick: "selectFormat('word')" },
        { text: "Excel Spreadsheet", icon: "table_chart", onclick: "selectFormat('excel')" },
        { text: "Image/Photo", icon: "image", onclick: "selectFormat('image')" }
    ]);
}

function selectFormat(format) {
    const formatMap = {
        pdf: "PDF Document",
        word: "Word Document",
        excel: "Excel Spreadsheet",
        image: "Image/Photo"
    };

    agentState.addMessage(formatMap[format], true);

    setTimeout(() => {
        agentState.addMessage("Perfect! I can process that format. Please drag and drop your file here, or click to browse for it.", false);

        // Simulate file upload interface
        const uploadContent = `
            <div class="upload-interface">
                <h2>📁 Upload Your Template</h2>
                <div class="upload-zone" onclick="triggerFileUpload()">
                    <div class="upload-icon">
                        <i class="material-icons" style="font-size: 48px; color: var(--ai-accent);">cloud_upload</i>
                    </div>
                    <h3>Drop your ${formatMap[format]} here</h3>
                    <p>Or click to browse files</p>
                    <button class="btn btn-primary" style="margin-top: 16px;">
                        Browse Files
                    </button>
                </div>
                <input type="file" id="template-upload" style="display: none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onchange="handleFileUpload(event)">

                <div class="upload-tips">
                    <h4>💡 Tips for best results:</h4>
                    <ul>
                        <li>Ensure text is clear and readable</li>
                        <li>Include all inspection categories</li>
                        <li>Maximum file size: 10MB</li>
                        <li>I'll automatically detect inspection items</li>
                    </ul>
                </div>
            </div>

            <style>
            .upload-interface {
                font-family: var(--font-family);
                text-align: center;
            }

            .upload-zone {
                border: 2px dashed var(--ai-accent);
                border-radius: 12px;
                padding: 40px 20px;
                margin: 20px 0;
                background: linear-gradient(135deg, #f8f9ff 0%, #f0f8ff 100%);
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .upload-zone:hover {
                border-color: #0056b3;
                background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
                transform: translateY(-2px);
            }

            .upload-zone h3 {
                margin: 16px 0 8px;
                color: var(--vz-charcoal-gray);
            }

            .upload-zone p {
                color: var(--vz-gray);
                margin-bottom: 0;
            }

            .upload-tips {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                text-align: left;
                margin-top: 20px;
            }

            .upload-tips h4 {
                margin-bottom: 12px;
                color: var(--vz-charcoal-gray);
            }

            .upload-tips ul {
                list-style: none;
                padding: 0;
            }

            .upload-tips li {
                padding: 4px 0;
                color: var(--vz-gray);
            }

            .upload-tips li:before {
                content: "• ";
                color: var(--ai-accent);
                font-weight: bold;
            }
            </style>
        `;

        agentState.showOutput(uploadContent);
    }, 1000);
}

// Output Canvas Functions
function editOutput() {
    agentState.addMessage("I've opened the form editor for you. You can modify any inspection items, add new categories, or change the layout.", false);

    // Add edit interface to output
    const editButton = document.querySelector('.output-actions .btn-secondary');
    if (editButton) {
        editButton.innerHTML = '<i class="material-icons">edit_off</i> Exit Edit Mode';
        editButton.onclick = function() { exitEditMode(); };
    }

    // Add editing indicators to output content
    const outputContent = document.getElementById('output-content');
    if (outputContent) {
        outputContent.style.border = '2px dashed var(--ai-accent)';
        outputContent.style.position = 'relative';

        const editOverlay = document.createElement('div');
        editOverlay.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: var(--ai-accent);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        `;
        editOverlay.textContent = '✏️ Edit Mode';
        outputContent.appendChild(editOverlay);
    }
}

function exitEditMode() {
    const editButton = document.querySelector('.output-actions .btn-secondary');
    if (editButton) {
        editButton.innerHTML = '<i class="material-icons">edit</i> Edit';
        editButton.onclick = function() { editOutput(); };
    }

    const outputContent = document.getElementById('output-content');
    if (outputContent) {
        outputContent.style.border = 'none';
        const editOverlay = outputContent.querySelector('div[style*="position: absolute"]');
        if (editOverlay) {
            editOverlay.remove();
        }
    }

    agentState.addMessage("Changes saved! The form has been updated with your modifications.", false);
}

function approveOutput() {
    agentState.updateWorkflowProgress(5, 5, 'Setup complete');
    agentState.hideOutput();

    setTimeout(() => {
        agentState.addMessage("Excellent! I've approved your inspection form and it's now active in your system. Your drivers can start using it immediately. Would you like me to help set up driver training next?", false, [
            { text: "Yes, setup training", icon: "school", onclick: "setupTraining()" },
            { text: "Configure drivers first", icon: "people", onclick: "configureDrivers()" },
            { text: "I'm all set, thanks!", icon: "check_circle", onclick: "completeWorkflow()" }
        ]);
    }, 500);
}

function closeOutput() {
    agentState.hideOutput();
}

// Utility Functions
function triggerFileUpload() {
    const fileInput = document.getElementById('template-upload');
    if (fileInput) {
        fileInput.click();
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    agentState.addMessage(`Uploading ${file.name}...`, true);

    // Simulate upload progress
    setTimeout(() => {
        agentState.addMessage("File uploaded successfully! I'm analyzing your template and extracting inspection items. This may take a moment...", false);

        setTimeout(() => {
            agentState.addMessage("Analysis complete! I found 18 inspection items across 5 categories. I've converted them into a digital format. Would you like to review the converted form?", false, [
                { text: "Yes, show me the form", icon: "preview", onclick: "showConvertedForm()" },
                { text: "Add more items", icon: "add", onclick: "addMoreItems()" }
            ]);
        }, 3000);
    }, 1500);
}

function sendMessage() {
    const input = document.getElementById('text-input');
    if (!input || !input.value.trim()) return;

    const message = input.value.trim();
    input.value = '';

    // Hide text input after sending
    hideTextInput();

    agentState.addMessage(message, true);

    // Simulate AI response with contextual actions
    setTimeout(() => {
        const responses = [
            "I understand. Let me help you with that.",
            "That's a great question. Here's what I can do...",
            "I can definitely assist with that. Let me walk you through the process.",
            "No problem! I'll take care of that for you."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        // Provide contextual actions based on the input
        const contextualActions = [
            { text: "Show me options", icon: "list", onclick: "showActionInterface()" },
            { text: "Start setup process", icon: "settings", onclick: "startDVIRSetup()" },
            { text: "Analyze my current setup", icon: "analytics", onclick: "analyzeCurrent()" }
        ];

        agentState.addMessage(randomResponse, false, contextualActions);
    }, 1000);
}

// Demo and Testing Functions
function startWorkflowDemo() {
    activateAgent();
    setTimeout(() => {
        startDVIRSetup();
    }, 500);
}

function autoFix() {
    agentState.addMessage("Auto-fix selected. I'll resolve all issues automatically.", true);

    setTimeout(() => {
        agentState.addMessage("🔧 Fixing driver email configurations...", false);

        setTimeout(() => {
            agentState.addMessage("📋 Adding compliance checks...", false);

            setTimeout(() => {
                agentState.addMessage("✅ All issues resolved! Your compliance score is now 95% and driver readiness is 100%. The system is ready for use.", false, [
                    { text: "View updated dashboard", icon: "dashboard", onclick: "viewDashboard()" },
                    { text: "Setup training", icon: "school", onclick: "setupTraining()" }
                ]);
            }, 2000);
        }, 2000);
    }, 1500);
}

function setupTraining() {
    agentState.addMessage("I'll help you create training materials for your drivers. This includes email templates, quick reference guides, and video tutorials.", false, [
        { text: "Generate email template", icon: "email", onclick: "generateEmail()" },
        { text: "Create reference guide", icon: "menu_book", onclick: "createGuide()" },
        { text: "Setup video tutorials", icon: "play_circle", onclick: "setupVideos()" }
    ]);
}

function completeWorkflow() {
    agentState.currentWorkflow = null;
    agentState.updateWorkflowProgress(0, 0, '');
    agentState.addMessage("Perfect! Your DVIR system is now fully configured and ready to use. Your drivers can start submitting inspections immediately. If you need any help in the future, just click the AI Assistant button!", false);

    setTimeout(() => {
        agentState.deactivate();
    }, 3000);
}

// Handle Enter key in text input
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('text-input');
    if (textInput) {
        textInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Handle window focus for accessibility
window.addEventListener('focus', function() {
    if (agentState.isActive) {
        agentState.announceToScreenReader('AI Assistant is active and ready for interaction');
    }
});

