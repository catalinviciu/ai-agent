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
        this.drivers = []; // Store driver data for Activity 3
        this.currentPage = 1; // Pagination state
        this.pageSize = 10; // Drivers per page
        this.searchQuery = ''; // Search filter

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
        const isMobile = window.innerWidth <= 768;

        // Mobile behavior: Toggle canvas visibility instead of full-screen
        if (isMobile && this.outputVisible) {
            this.isExpanded = !this.isExpanded;
            this.updateUI();
            const message = this.isExpanded ? 'Canvas shown' : 'Canvas hidden';
            this.announceToScreenReader(message);
        } else {
            // Desktop/tablet: Normal expand behavior
            this.isExpanded = !this.isExpanded;
            this.updateUI();
            this.announceToScreenReader(this.isExpanded ? 'AI Assistant expanded' : 'AI Assistant collapsed');
        }
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

    addMessage(content, isUser = false, actions = null, showFeedback = false) {
        const message = {
            id: Date.now(),
            content,
            isUser,
            actions,
            showFeedback,
            timestamp: new Date()
        };

        this.conversationHistory.push(message);
        this.renderConversation();

        if (!isUser) {
            this.announceToScreenReader(`AI says: ${content}`);
        }
    }

    resetConversation() {
        this.conversationHistory = [];
        this.renderConversation();
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
                    ${message.showFeedback && !message.isUser ? `
                        <div class="canvas-secondary-buttons" style="margin-top: 12px;">
                            <button class="secondary-btn" onclick="provideFeedback('positive')" title="Helpful">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 22V11M2 13v6a2 2 0 002 2h3m0 0h8a2 2 0 002-2v-7.5a2 2 0 00-2-2h-2.5m-3.5 0l3-5.5V3a1 1 0 011-1h1a1 1 0 011 1v3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <button class="secondary-btn" onclick="provideFeedback('negative')" title="Not helpful">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 2v11m-5-2v-6a2 2 0 012-2h3m0 0h8a2 2 0 012 2v7.5a2 2 0 01-2 2h-2.5m-3.5 0l3 5.5V21a1 1 0 01-1 1h-1a1 1 0 01-1-1v-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
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
        <div class="welcome-message">
            <h3>Hi! I'm your Reveal Intelligence assistant.</h3>
            <p>I can help you set up your DVIR system quickly and correctly. Here's what I can do for you:</p>
        </div>
        <div class="action-cards">
            <button class="action-card primary" onclick="startDVIRSetup()">
                <div class="card-icon">
                    <i class="material-icons">description</i>
                </div>
                <div class="card-content">
                    <div class="card-title">Create an inspection form</div>
                    <div class="card-subtitle">Choose what drivers will see</div>
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

// Chat Collapse/Expand for Mobile/Tablet
let chatCollapseTimer = null;

function toggleChatCollapse() {
    const sidebar = document.getElementById('ai-sidebar');
    if (!sidebar) return;

    const isCollapsed = sidebar.classList.contains('collapsed');

    if (isCollapsed) {
        // Expand
        sidebar.classList.remove('collapsed');
        sidebar.classList.remove('has-actions');
    } else {
        // Collapse
        sidebar.classList.add('collapsed');
        updateChatPreview();
        updateCollapsedState();
    }
}

function updateCollapsedState() {
    const sidebar = document.getElementById('ai-sidebar');
    if (!sidebar || !sidebar.classList.contains('collapsed')) return;

    // Check if the last message has actions
    const conversationScroll = document.getElementById('conversation-scroll');
    if (!conversationScroll) return;

    const lastMessage = conversationScroll.querySelector('.message:last-child');
    if (lastMessage) {
        const hasActions = lastMessage.querySelector('.message-actions') !== null;
        if (hasActions) {
            sidebar.classList.add('has-actions');
        } else {
            sidebar.classList.remove('has-actions');
        }
    }
}

function collapseChatWithDelay(delayMs = 2000) {
    // Only auto-collapse on tablet/mobile when expanded view is active
    const container = document.getElementById('ai-container');
    if (!container || !container.classList.contains('expanded')) return;

    // Check if we're on tablet or mobile
    const isMobileOrTablet = window.innerWidth <= 1024;
    if (!isMobileOrTablet) return;

    // Don't collapse if there are user actions waiting
    const hasUserActions = checkForUserActions();
    if (hasUserActions) return;

    // Clear any existing timer
    if (chatCollapseTimer) {
        clearTimeout(chatCollapseTimer);
    }

    // Set new timer
    chatCollapseTimer = setTimeout(() => {
        const sidebar = document.getElementById('ai-sidebar');
        if (sidebar && !sidebar.classList.contains('collapsed')) {
            // Double-check no actions appeared during the delay
            if (!checkForUserActions()) {
                sidebar.classList.add('collapsed');
                updateChatPreview();
                updateCollapsedState();
            }
        }
    }, delayMs);
}

function checkForUserActions() {
    // Check if action interface is visible with buttons
    const actionInterface = document.getElementById('action-interface');
    if (actionInterface && actionInterface.style.display !== 'none') {
        const hasActions = actionInterface.querySelectorAll('.action-btn, .primary-action-btn, .secondary-action-btn').length > 0;
        if (hasActions) return true;
    }

    // Check if conversation actions are visible with buttons
    const conversationActions = document.getElementById('conversation-actions');
    if (conversationActions && conversationActions.style.display !== 'none') {
        const hasActions = conversationActions.querySelectorAll('.action-btn').length > 0;
        if (hasActions) return true;
    }

    // Check for inline message actions in conversation history
    const conversationScroll = document.getElementById('conversation-scroll');
    if (conversationScroll) {
        const hasInlineActions = conversationScroll.querySelectorAll('.message-actions .action-btn').length > 0;
        if (hasInlineActions) return true;
    }

    return false;
}

function updateChatPreview() {
    const previewElement = document.getElementById('chat-preview');
    if (!previewElement) return;

    // Get the last AI message from conversation history
    const conversationScroll = document.getElementById('conversation-scroll');
    if (!conversationScroll) {
        previewElement.textContent = 'Tap to view conversation';
        return;
    }

    const messages = conversationScroll.querySelectorAll('.message.ai-message');
    if (messages.length === 0) {
        previewElement.textContent = 'Tap to view conversation';
        return;
    }

    // Get the last AI message text
    const lastMessage = messages[messages.length - 1];
    const messageContent = lastMessage.querySelector('.message-content');
    if (messageContent) {
        let text = messageContent.textContent.trim();
        // Truncate to ~50 characters
        if (text.length > 50) {
            text = text.substring(0, 50) + '...';
        }
        previewElement.textContent = text;
    } else {
        previewElement.textContent = 'Tap to view conversation';
    }
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
    // Reset conversation history for new activity
    agentState.resetConversation();

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

// Mock Driver Data
const mockDrivers = [
    // Can be fixed with AI (10 drivers) - have email and groups, just need mobile access enabled
    {
        id: "D002",
        name: "Mike Smith",
        driverId: "#002",
        email: "mike.smith@company.com",
        mobileAccess: false,
        vehicleGroups: ["Fleet A"],
        status: "ai-fix"
    },
    {
        id: "D004",
        name: "Tom Carter",
        driverId: "#004",
        email: "tom.carter@company.com",
        mobileAccess: false,
        vehicleGroups: ["Fleet B"],
        status: "ai-fix"
    },
    {
        id: "D005",
        name: "Lisa Martin",
        driverId: "#005",
        email: "lisa.martin@company.com",
        mobileAccess: false,
        vehicleGroups: ["Fleet A"],
        status: "ai-fix"
    },
    {
        id: "D009",
        name: "Maria Rodriguez",
        driverId: "#009",
        email: "maria.rodriguez@company.com",
        mobileAccess: false,
        vehicleGroups: ["Fleet A"],
        status: "ai-fix"
    },
    {
        id: "D011",
        name: "Robert Wilson",
        driverId: "#011",
        email: "robert.wilson@company.com",
        mobileAccess: false,
        vehicleGroups: ["Fleet B"],
        status: "ai-fix"
    },
    {
        id: "D013",
        name: "Patricia Garcia",
        driverId: "#013",
        email: "patricia.garcia@company.com",
        mobileAccess: false,
        vehicleGroups: ["Fleet A", "Fleet B"],
        status: "ai-fix"
    },
    {
        id: "D016",
        name: "David Anderson",
        driverId: "#016",
        email: "david.anderson@company.com",
        mobileAccess: false,
        vehicleGroups: ["Fleet C"],
        status: "ai-fix"
    },
    {
        id: "D018",
        name: "Jennifer Taylor",
        driverId: "#018",
        email: "jennifer.taylor@company.com",
        mobileAccess: false,
        vehicleGroups: ["Fleet A"],
        status: "ai-fix"
    },
    {
        id: "D021",
        name: "Christopher Moore",
        driverId: "#021",
        email: "christopher.moore@company.com",
        mobileAccess: false,
        vehicleGroups: ["Fleet B"],
        status: "ai-fix"
    },
    {
        id: "D024",
        name: "Amanda White",
        driverId: "#024",
        email: "amanda.white@company.com",
        mobileAccess: false,
        vehicleGroups: ["Fleet C"],
        status: "ai-fix"
    },

    // Needs manual fix (12 drivers) - various issues requiring manual intervention
    // Issue: Account locked + No email + No groups (3 issues)
    {
        id: "D003",
        name: "Sarah Johnson",
        driverId: "#003",
        email: "",
        emailError: "No email provided",
        mobileAccess: false,
        accountLocked: true,
        vehicleGroups: [],
        groupsError: "No groups assigned",
        status: "manual-fix"
    },
    // Issue: Account locked + Invalid email + No groups (3 issues)
    {
        id: "D007",
        name: "Alex Davis",
        driverId: "#007",
        email: "invalid-email",
        emailError: "Invalid email format",
        mobileAccess: false,
        accountLocked: true,
        vehicleGroups: [],
        groupsError: "No groups assigned",
        status: "manual-fix"
    },
    // Issue: Account locked + No groups (2 issues)
    {
        id: "D008",
        name: "Karen Lee",
        driverId: "#008",
        email: "karen.lee@company.com",
        mobileAccess: false,
        accountLocked: true,
        vehicleGroups: [],
        groupsError: "No groups assigned",
        status: "manual-fix"
    },
    // Issue: Account locked only (1 issue)
    {
        id: "D026",
        name: "Steven Parker",
        driverId: "#026",
        email: "steven.parker@company.com",
        mobileAccess: false,
        accountLocked: true,
        vehicleGroups: ["Fleet C"],
        status: "manual-fix"
    },
    // Issue: No email + No groups (2 issues)
    {
        id: "D012",
        name: "Daniel Thompson",
        driverId: "#012",
        email: "",
        emailError: "No email provided",
        mobileAccess: false,
        vehicleGroups: [],
        groupsError: "No groups assigned",
        status: "manual-fix"
    },
    // Issue: Invalid email + No groups (2 issues)
    {
        id: "D015",
        name: "Michelle Harris",
        driverId: "#015",
        email: "michelle@invalid",
        emailError: "Invalid email format",
        mobileAccess: false,
        vehicleGroups: [],
        groupsError: "No groups assigned",
        status: "manual-fix"
    },
    // Issue: No email (has groups)
    {
        id: "D019",
        name: "Brian Clark",
        driverId: "#019",
        email: "",
        emailError: "No email provided",
        mobileAccess: false,
        vehicleGroups: ["Fleet C"],
        status: "manual-fix"
    },
    // Issue: Invalid email (has groups)
    {
        id: "D025",
        name: "Kevin Young",
        driverId: "#025",
        email: "notanemail",
        emailError: "Invalid email format",
        mobileAccess: false,
        vehicleGroups: ["Fleet A"],
        status: "manual-fix"
    },
    // Issue: No groups (has valid email)
    {
        id: "D022",
        name: "Laura Martinez",
        driverId: "#022",
        email: "laura.martinez@company.com",
        mobileAccess: false,
        vehicleGroups: [],
        groupsError: "No groups assigned",
        status: "manual-fix"
    },
    // Issue: No groups (has valid email)
    {
        id: "D027",
        name: "Rachel Green",
        driverId: "#027",
        email: "rachel.green@company.com",
        mobileAccess: false,
        vehicleGroups: [],
        groupsError: "No groups assigned",
        status: "manual-fix"
    },
    // Issue: Invalid email format (multiple @ signs)
    {
        id: "D028",
        name: "Timothy Wright",
        driverId: "#028",
        email: "tim@@company.com",
        emailError: "Invalid email format",
        mobileAccess: false,
        vehicleGroups: ["Fleet B"],
        status: "manual-fix"
    },
    // Issue: Invalid email format (missing domain)
    {
        id: "D029",
        name: "Sandra Lopez",
        driverId: "#029",
        email: "sandra.lopez@",
        emailError: "Invalid email format",
        mobileAccess: false,
        vehicleGroups: ["Fleet A", "Fleet C"],
        status: "manual-fix"
    },

    // Ready to go (7 drivers) - all set up correctly
    {
        id: "D001",
        name: "John Doe",
        driverId: "#001",
        email: "john.doe@company.com",
        mobileAccess: true,
        vehicleGroups: ["Fleet A", "Fleet B"],
        status: "ready"
    },
    {
        id: "D006",
        name: "James Brown",
        driverId: "#006",
        email: "james.brown@company.com",
        mobileAccess: true,
        vehicleGroups: ["Fleet B"],
        status: "ready"
    },
    {
        id: "D010",
        name: "Elizabeth King",
        driverId: "#010",
        email: "elizabeth.king@company.com",
        mobileAccess: true,
        vehicleGroups: ["Fleet A"],
        status: "ready"
    },
    {
        id: "D014",
        name: "William Scott",
        driverId: "#014",
        email: "william.scott@company.com",
        mobileAccess: true,
        vehicleGroups: ["Fleet C"],
        status: "ready"
    },
    {
        id: "D017",
        name: "Nancy Lewis",
        driverId: "#017",
        email: "nancy.lewis@company.com",
        mobileAccess: true,
        vehicleGroups: ["Fleet A", "Fleet B"],
        status: "ready"
    },
    {
        id: "D020",
        name: "Matthew Hall",
        driverId: "#020",
        email: "matthew.hall@company.com",
        mobileAccess: true,
        vehicleGroups: ["Fleet B"],
        status: "ready"
    },
    {
        id: "D023",
        name: "Betty Allen",
        driverId: "#023",
        email: "betty.allen@company.com",
        mobileAccess: true,
        vehicleGroups: ["Fleet C"],
        status: "ready"
    }
];

// Helper function to get avatar initials from name
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Helper function to get ALL issues for a driver (can have multiple)
function getAllDriverIssues(driver) {
    const issues = [];

    // Priority hierarchy:
    // 1. Account locked (critical)
    if (driver.accountLocked) {
        issues.push({
            icon: '🔒',
            text: 'Account locked',
            class: 'critical',
            priority: 1
        });
    }

    // 2. No email (high)
    if (!driver.email) {
        issues.push({
            icon: '📧',
            text: 'No email provided',
            class: 'warning',
            priority: 2
        });
    }

    // 3. Invalid email (high)
    if (driver.emailError && driver.email) {
        issues.push({
            icon: '📧',
            text: 'Invalid email format',
            class: 'warning',
            priority: 3
        });
    }

    // 4. No vehicle groups (medium)
    if (!driver.vehicleGroups || driver.vehicleGroups.length === 0 || driver.groupsError) {
        issues.push({
            icon: '👥',
            text: 'No vehicle groups assigned',
            class: 'warning',
            priority: 4
        });
    }

    // 5. Mobile access disabled (low - AI fixable)
    if (!driver.mobileAccess && driver.status === 'ai-fix') {
        issues.push({
            icon: '📱',
            text: 'Mobile access disabled',
            class: 'fixable',
            priority: 5
        });
    }

    // If no issues, driver is ready
    if (issues.length === 0) {
        issues.push({
            icon: '✓',
            text: 'No issues detected',
            class: 'ready',
            priority: 99
        });
    }

    return issues;
}

// Helper function for backward compatibility - returns primary (highest priority) issue
function getDriverIssue(driver) {
    const issues = getAllDriverIssues(driver);
    return issues[0]; // Return highest priority issue
}

// Helper function to render driver table
function renderDriverTable(drivers) {
    // Filter drivers based on search query
    const searchQuery = agentState.searchQuery.toLowerCase();
    let filteredDrivers = drivers;

    if (searchQuery) {
        filteredDrivers = drivers.filter(driver => {
            return driver.name.toLowerCase().includes(searchQuery) ||
                   driver.email.toLowerCase().includes(searchQuery) ||
                   driver.driverId.toLowerCase().includes(searchQuery);
        });
    }

    // Sort drivers by priority: ai-fix -> manual-fix -> ready
    const sortOrder = { 'ai-fix': 1, 'manual-fix': 2, 'ready': 3 };
    const sortedDrivers = [...filteredDrivers].sort((a, b) => sortOrder[a.status] - sortOrder[b.status]);

    // Pagination calculations
    const totalDrivers = sortedDrivers.length;
    const totalPages = Math.ceil(totalDrivers / agentState.pageSize);
    const startIndex = (agentState.currentPage - 1) * agentState.pageSize;
    const endIndex = startIndex + agentState.pageSize;
    const paginatedDrivers = sortedDrivers.slice(startIndex, endIndex);

    const driverRows = paginatedDrivers.map(driver => {
        // Get ALL driver issues
        const allIssues = getAllDriverIssues(driver);
        const primaryIssue = allIssues[0];

        // Build issue display: primary issue text + additional issue icons
        let issueDisplay = `<span class="issue-icon">${primaryIssue.icon}</span> <span class="issue-text">${primaryIssue.text}</span>`;

        if (allIssues.length > 1) {
            // Add additional issue icons
            const additionalIcons = allIssues.slice(1).map(issue =>
                `<span class="issue-icon additional" title="${issue.text}">${issue.icon}</span>`
            ).join('');
            issueDisplay += `<span class="additional-issues">${additionalIcons}</span>`;
        }

        // Determine status badge
        let statusBadge = '';
        let statusIcon = '';
        if (driver.status === 'ready') {
            statusBadge = 'Ready';
            statusIcon = '✓';
        } else if (driver.status === 'ai-fix') {
            statusBadge = 'AI can fix';
            statusIcon = '📱';
        } else {
            statusBadge = 'Manual fix needed';
            statusIcon = '⚠️';
        }

        // Determine action button
        let actionButton = '';
        if (driver.status === 'ai-fix') {
            actionButton = '<button class="action-btn ai-fix" onclick="quickFixDriver(\'' + driver.id + '\')">AI Quick Fix</button>';
        } else {
            actionButton = '<button class="action-btn edit" onclick="editDriver(\'' + driver.id + '\')">Edit</button>';
        }

        return `
            <tr class="driver-row status-${driver.status}">
                <td class="driver-cell">
                    <div class="driver-info">
                        <div class="driver-avatar">${getInitials(driver.name)}</div>
                        <div class="driver-details">
                            <div class="driver-name">${driver.name}</div>
                            <div class="driver-id">Driver ${driver.driverId}</div>
                        </div>
                    </div>
                </td>
                <td class="issue-cell ${primaryIssue.class}">
                    ${issueDisplay}
                </td>
                <td class="status-cell">
                    <div class="status-badge ${driver.status}">
                        <span class="status-icon">${statusIcon}</span> ${statusBadge}
                    </div>
                </td>
                <td class="actions-cell">
                    ${actionButton}
                </td>
            </tr>
        `;
    }).join('');

    // Generate pagination controls
    let paginationHTML = '';
    if (totalPages > 1) {
        let pageButtons = '';

        // Previous button
        const prevDisabled = agentState.currentPage === 1 ? 'disabled' : '';
        pageButtons += `<button class="page-btn ${prevDisabled}" onclick="changePage(${agentState.currentPage - 1})" ${prevDisabled ? 'disabled' : ''}>Previous</button>`;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === agentState.currentPage ? 'active' : '';
            pageButtons += `<button class="page-btn ${activeClass}" onclick="changePage(${i})">${i}</button>`;
        }

        // Next button
        const nextDisabled = agentState.currentPage === totalPages ? 'disabled' : '';
        pageButtons += `<button class="page-btn ${nextDisabled}" onclick="changePage(${agentState.currentPage + 1})" ${nextDisabled ? 'disabled' : ''}>Next</button>`;

        paginationHTML = `
            <div class="pagination">
                <div class="pagination-info">Showing ${startIndex + 1}-${Math.min(endIndex, totalDrivers)} of ${totalDrivers} drivers</div>
                <div class="pagination-controls">
                    ${pageButtons}
                </div>
            </div>
        `;
    }

    // Generate mobile card layout
    const driverCards = paginatedDrivers.map(driver => {
        // Get ALL driver issues
        const allIssues = getAllDriverIssues(driver);
        const primaryIssue = allIssues[0];

        // Build issue display for mobile
        let issueDisplay = `${primaryIssue.icon} ${primaryIssue.text}`;
        if (allIssues.length > 1) {
            const additionalIcons = allIssues.slice(1).map(issue => issue.icon).join(' ');
            issueDisplay += ` ${additionalIcons}`;
        }

        // Determine status badge
        let statusBadge = '';
        let statusIcon = '';
        let statusClass = driver.status;
        if (driver.status === 'ready') {
            statusBadge = 'Ready';
            statusIcon = '✓';
        } else if (driver.status === 'ai-fix') {
            statusBadge = 'AI can fix';
            statusIcon = '📱';
        } else {
            statusBadge = 'Manual fix needed';
            statusIcon = '⚠️';
        }

        // Determine action button
        let actionButton = '';
        if (driver.status === 'ai-fix') {
            actionButton = '<button class="action-btn ai-fix" onclick="quickFixDriver(\'' + driver.id + '\')">AI Quick Fix</button>';
        } else {
            actionButton = '<button class="action-btn edit" onclick="editDriver(\'' + driver.id + '\')">Edit</button>';
        }

        return `
            <div class="driver-card">
                <div class="driver-card-header">
                    <div class="driver-card-avatar">${getInitials(driver.name)}</div>
                    <div class="driver-card-info">
                        <div class="driver-card-name">${driver.name}</div>
                        <div class="driver-card-id">Driver ${driver.driverId}</div>
                    </div>
                </div>
                <div class="driver-card-body">
                    <div class="driver-card-field">
                        <div class="driver-card-label">Issues</div>
                        <div class="driver-card-value ${primaryIssue.class}">${issueDisplay}</div>
                    </div>
                    <div class="driver-card-field">
                        <div class="driver-card-label">Status</div>
                        <div class="driver-card-status ${statusClass}">
                            <span>${statusIcon}</span> ${statusBadge}
                        </div>
                    </div>
                </div>
                <div class="driver-card-actions">
                    ${actionButton}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="driver-table-container">
            <div class="table-header">
                <h2>Driver list analyses</h2>
                <div class="search-bar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#6c757d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <input type="text" id="driver-search" placeholder="Search drivers..." value="${agentState.searchQuery}" oninput="handleSearch(event)">
                </div>
            </div>
            <table class="driver-table">
                <thead>
                    <tr>
                        <th>DRIVER</th>
                        <th>ISSUE</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    ${driverRows}
                </tbody>
            </table>
            <div class="driver-cards-mobile">
                ${driverCards}
            </div>
            ${paginationHTML}
        </div>
    `;
}

// Generate inspection form after all questions answered
function generateInspectionForm() {
    agentState.updateWorkflowProgress(2, 4, 'Generating inspection form');

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

// Approve and publish the inspection form
function approveForm() {
    agentState.updateWorkflowProgress(4, 4, 'Publishing inspection form');

    agentState.addMessage("Perfect! I'm publishing your inspection form now...", false);

    // Show publishing animation in canvas
    const publishingHTML = `
        <div class="publishing-container">
            <div class="spinner"></div>
            <h3>Publishing inspection form</h3>
            <p>Making it available to your drivers...</p>
        </div>
    `;

    agentState.updateOutputContent(publishingHTML);

    // Simulate publishing process
    setTimeout(() => {
        // Show success state in canvas
        const successHTML = `
            <div class="success-container">
                <div class="success-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#28a745"/>
                        <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h2>Inspection Form Published!</h2>
                <p>Your drivers can now use this form on their mobile devices.</p>
                <div class="success-stats">
                    <div class="success-stat">
                        <strong>Form Status</strong>
                        <span>Active</span>
                    </div>
                    <div class="success-stat">
                        <strong>Available To</strong>
                        <span>All Drivers</span>
                    </div>
                </div>
                <div class="canvas-secondary-buttons">
                    <button class="secondary-btn" onclick="copyToClipboard()" title="Copy">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="secondary-btn" onclick="provideFeedback('positive')" title="Helpful">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 22V11M2 13v6a2 2 0 002 2h3m0 0h8a2 2 0 002-2v-7.5a2 2 0 00-2-2h-2.5m-3.5 0l3-5.5V3a1 1 0 011-1h1a1 1 0 011 1v3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="secondary-btn" onclick="provideFeedback('negative')" title="Not helpful">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 2v11m-5-2v-6a2 2 0 012-2h3m0 0h8a2 2 0 012 2v7.5a2 2 0 01-2 2h-2.5m-3.5 0l3 5.5V21a1 1 0 01-1 1h-1a1 1 0 01-1-1v-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        agentState.updateOutputContent(successHTML);

        // Add success message with feedback buttons and option to start new task
        agentState.addMessage("Success! Your inspection form has been published and is now active. Drivers can start using it immediately.", false, [
            { text: "Start a new task", onclick: "returnToActivitySelection()" }
        ], true);  // Show feedback buttons
    }, 2500);
}

// Handle feedback from canvas buttons
function provideFeedback(type) {
    // Record feedback (in real app would send to backend)
    console.log(`User feedback: ${type}`);

    // Show user's feedback as a message
    agentState.addMessage(type === 'positive' ? '👍' : '👎', true);

    // AI responds with thank you
    setTimeout(() => {
        agentState.addMessage("Thank you for your feedback! It helps us improve the experience.", false);
    }, 300);
}

// Copy content to clipboard
function copyToClipboard() {
    // Get the preview content
    const previewText = "Inspection form preview copied to clipboard";
    navigator.clipboard.writeText(previewText).then(() => {
        console.log('Content copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Return to initial activity selection
function returnToActivitySelection() {
    agentState.updateWorkflowProgress(0, 0, '');
    agentState.hideOutput();
    showActionInterface();
    populateWelcomeActions();
}

// Edit the inspection form (mocked for now)
function editForm() {
    agentState.addMessage("Form editing is coming soon! For now, you can approve the form or start over by selecting a different creation method.", false, [
        { text: "Approve this form", onclick: "approveForm()" },
        { text: "Start over", onclick: "startDVIRSetup()" }
    ]);
}

// Activity 3: Driver management functions

// Helper function to update driver table
function updateDriverTable() {
    const tableHTML = renderDriverTable(agentState.drivers);
    agentState.updateOutputContent(tableHTML);
}

// Search handler (Phase 6)
function handleSearch(event) {
    const inputValue = event.target.value;
    const cursorPosition = event.target.selectionStart; // Save cursor position

    agentState.searchQuery = inputValue;
    agentState.currentPage = 1; // Reset to first page when searching
    updateDriverTable();

    // Restore focus and cursor position after re-render
    setTimeout(() => {
        const searchInput = document.getElementById('driver-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, 0);
}

// Pagination handler (Phase 6)
function changePage(pageNumber) {
    agentState.currentPage = pageNumber;
    updateDriverTable();

    // Scroll to top of table
    const canvas = document.getElementById('ai-output-canvas');
    if (canvas) {
        canvas.scrollTop = 0;
    }
}

// Fix all drivers with AI (Phase 4)
function fixAllDriversWithAI() {
    // Find all drivers that can be fixed with AI
    const driversToFix = agentState.drivers.filter(d => d.status === 'ai-fix');
    const fixCount = driversToFix.length;

    // User clicks button
    agentState.addMessage(`AI FIX ALL DRIVERS (${fixCount})`, true);

    if (fixCount === 0) {
        agentState.addMessage("No drivers need AI fixing at this time.", false);
        return;
    }

    // Show progress message
    setTimeout(() => {
        agentState.addMessage(`Enabling mobile access for ${fixCount} drivers...`, false);

        // Simulate AI fixing process
        setTimeout(() => {
            // Fix all drivers: enable mobile access and update status
            driversToFix.forEach(driver => {
                driver.mobileAccess = true;
                driver.status = 'ready';
            });

            // Update the table with new data
            updateDriverTable();

            // Calculate new counts
            const aiFixCount = agentState.drivers.filter(d => d.status === 'ai-fix').length;
            const manualFixCount = agentState.drivers.filter(d => d.status === 'manual-fix').length;
            const readyCount = agentState.drivers.filter(d => d.status === 'ready').length;

            // Show success message
            agentState.addMessage(`Done! I've enabled mobile access for ${fixCount} drivers. They're now ready to use the mobile app.`, false);

            // Show updated summary
            setTimeout(() => {
                const statusCards = [
                    { text: "Ready to go", badge: readyCount, badgeColor: 'green' }
                ];

                // Only show "Can be fixed with AI" if count > 0
                if (aiFixCount > 0) {
                    statusCards.push({ text: "Can be fixed with AI", badge: aiFixCount, badgeColor: 'orange' });
                }

                statusCards.push({ text: "Needs manual fix", badge: manualFixCount, badgeColor: 'orange' });

                agentState.addMessage(`Great progress! You now have ${readyCount} drivers ready for mobile inspections.`, false, statusCards);

                // Add feedback and next steps
                setTimeout(() => {
                    if (manualFixCount > 0) {
                        agentState.addMessage(`You still have ${manualFixCount} drivers that need manual attention. Click EDIT DRIVERS to fix them, or start a new task when ready.`, false, [
                            { text: "Start a new task", onclick: "returnToActivitySelection()" }
                        ], true);  // Show feedback buttons
                    } else {
                        agentState.addMessage("All drivers are now ready! You can start a new task when ready.", false, [
                            { text: "Start a new task", onclick: "returnToActivitySelection()" }
                        ], true);  // Show feedback buttons
                    }
                }, 1000);
            }, 500);

        }, 2000); // 2 second delay for AI processing
    }, 500);
}

// Quick fix individual driver
function quickFixDriver(driverId) {
    // Find the driver
    const driver = agentState.drivers.find(d => d.id === driverId);
    if (!driver) return;

    // Add loading state to button (Phase 7 - Polish)
    const button = event.target;
    button.classList.add('loading');
    button.disabled = true;

    // Simulate processing delay
    setTimeout(() => {
        // Enable mobile access and update status
        driver.mobileAccess = true;
        driver.status = 'ready';

        // Update the table
        updateDriverTable();

        // Show success message in chat
        agentState.addMessage(`Enabled mobile access for ${driver.name}. They're now ready to use the mobile app!`, false);

        // Remove loading state
        button.classList.remove('loading');
        button.disabled = false;

        // Check if there are any more AI-fixable drivers
        const aiFixCount = agentState.drivers.filter(d => d.status === 'ai-fix').length;
        const manualFixCount = agentState.drivers.filter(d => d.status === 'manual-fix').length;
        const readyCount = agentState.drivers.filter(d => d.status === 'ready').length;

        // If no more AI-fixable drivers, show completion flow
        if (aiFixCount === 0) {
            setTimeout(() => {
                const statusCards = [
                    { text: "Ready to go", badge: readyCount, badgeColor: 'green' }
                ];

                // Only show "Can be fixed with AI" if count > 0
                if (aiFixCount > 0) {
                    statusCards.push({ text: "Can be fixed with AI", badge: aiFixCount, badgeColor: 'orange' });
                }

                statusCards.push({ text: "Needs manual fix", badge: manualFixCount, badgeColor: 'orange' });

                agentState.addMessage(`Great progress! You now have ${readyCount} drivers ready for mobile inspections.`, false, statusCards);

                // Add feedback and next steps
                setTimeout(() => {
                    if (manualFixCount > 0) {
                        agentState.addMessage(`You still have ${manualFixCount} drivers that need manual attention. Click EDIT DRIVERS to fix them, or start a new task when ready.`, false, [
                            { text: "Start a new task", onclick: "returnToActivitySelection()" }
                        ], true);  // Show feedback buttons
                    } else {
                        agentState.addMessage("All drivers are now ready! You can start a new task when ready.", false, [
                            { text: "Start a new task", onclick: "returnToActivitySelection()" }
                        ], true);  // Show feedback buttons
                    }
                }, 500);
            }, 500);
        }
    }, 800); // Small delay for better UX
}

// Edit driver (Phase 5)
function editDriver(driverId) {
    const driver = agentState.drivers.find(d => d.id === driverId);
    if (!driver) return;

    // Store the driver ID being edited
    agentState.editingDriverId = driverId;

    // Populate the edit form
    document.getElementById('edit-driver-avatar').textContent = getInitials(driver.name);
    document.getElementById('edit-driver-name').textContent = driver.name;
    document.getElementById('edit-driver-id').textContent = `Driver ${driver.driverId}`;
    document.getElementById('edit-email').value = driver.email || '';
    document.getElementById('edit-mobile-access').checked = driver.mobileAccess;

    // Populate vehicle groups
    const groupsContainer = document.getElementById('edit-vehicle-groups');
    groupsContainer.innerHTML = '';

    const availableFleets = ['Fleet A', 'Fleet B', 'Fleet C'];
    availableFleets.forEach(fleet => {
        const checkbox = document.createElement('label');
        checkbox.className = 'group-checkbox';
        checkbox.innerHTML = `
            <input type="checkbox" value="${fleet}" ${driver.vehicleGroups && driver.vehicleGroups.includes(fleet) ? 'checked' : ''}>
            <span>${fleet}</span>
        `;
        groupsContainer.appendChild(checkbox);
    });

    // Show the modal
    document.getElementById('edit-driver-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-driver-modal').style.display = 'none';
    agentState.editingDriverId = null;
}

function saveDriverEdits() {
    const driverId = agentState.editingDriverId;
    const driver = agentState.drivers.find(d => d.id === driverId);
    if (!driver) return;

    // Get form values
    const email = document.getElementById('edit-email').value.trim();
    const mobileAccess = document.getElementById('edit-mobile-access').checked;

    // Get selected vehicle groups
    const selectedGroups = [];
    document.querySelectorAll('#edit-vehicle-groups input[type="checkbox"]:checked').forEach(checkbox => {
        selectedGroups.push(checkbox.value);
    });

    // Validate email
    let emailError = '';
    if (!email) {
        emailError = 'No email provided';
    } else if (!isValidEmail(email)) {
        emailError = 'Invalid email format';
    }

    // Update driver
    driver.email = email;
    driver.emailError = emailError;
    driver.mobileAccess = mobileAccess;
    driver.vehicleGroups = selectedGroups;
    driver.groupsError = selectedGroups.length === 0 ? 'No groups assigned' : '';

    // Recalculate status
    if (!emailError && selectedGroups.length > 0 && mobileAccess) {
        driver.status = 'ready';
    } else if (!emailError && selectedGroups.length > 0 && !mobileAccess) {
        driver.status = 'ai-fix';
    } else {
        driver.status = 'manual-fix';
    }

    // Update the table
    updateDriverTable();

    // Close modal
    closeEditModal();

    // Show success message in chat
    agentState.addMessage(`Updated ${driver.name}. Changes have been saved.`, false);

    // Check if all drivers are now ready
    const aiFixCount = agentState.drivers.filter(d => d.status === 'ai-fix').length;
    const manualFixCount = agentState.drivers.filter(d => d.status === 'manual-fix').length;
    const readyCount = agentState.drivers.filter(d => d.status === 'ready').length;

    // If all drivers are ready, show completion flow
    if (aiFixCount === 0 && manualFixCount === 0 && readyCount > 0) {
        setTimeout(() => {
            const statusCards = [
                { text: "Ready to go", badge: readyCount, badgeColor: 'green' }
            ];

            agentState.addMessage(`Excellent! All ${readyCount} drivers are now ready for mobile inspections.`, false, statusCards);

            setTimeout(() => {
                agentState.addMessage("You can now start training your drivers or proceed with other tasks.", false, [
                    { text: "Start a new task", onclick: "returnToActivitySelection()" }
                ], true);  // Show feedback buttons
            }, 500);
        }, 500);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Activity 3: Invite and train drivers
function analyzeCurrent() {
    // Reset conversation history for new activity
    agentState.resetConversation();

    // Initialize drivers in state from mock data
    agentState.drivers = JSON.parse(JSON.stringify(mockDrivers)); // Deep copy

    // Reset pagination and search state (Phase 6)
    agentState.currentPage = 1;
    agentState.searchQuery = '';

    agentState.currentWorkflow = 'driver-analysis';
    agentState.updateWorkflowProgress(1, 4, 'Analyzing driver list');

    showConversationInterface();

    // Step 1: Initial greeting
    setTimeout(() => {
        agentState.addMessage("Great! Let's get your drivers ready for mobile inspections.", false);

        // Step 2: Show analyzing state
        setTimeout(() => {
            agentState.addMessage("Analyzing your current driver list...", false);
            agentState.updateWorkflowProgress(2, 4, 'Processing drivers');

            // Step 3: Calculate driver categories and show summary + table
            setTimeout(() => {
                // Calculate counts by category
                const aiFixCount = agentState.drivers.filter(d => d.status === 'ai-fix').length;
                const manualFixCount = agentState.drivers.filter(d => d.status === 'manual-fix').length;
                const readyCount = agentState.drivers.filter(d => d.status === 'ready').length;

                agentState.updateWorkflowProgress(3, 4, 'Analysis complete');

                // Show driver table in canvas
                const tableHTML = renderDriverTable(agentState.drivers);
                agentState.showOutput(tableHTML);

                // Show analysis summary with status cards
                agentState.addMessage("I've analyzed your current driver list. Here's what needs attention before drivers can start submitting inspections:", false, [
                    { text: "Ready to go", badge: readyCount, badgeColor: 'green' },
                    { text: "Can be fixed with AI", badge: aiFixCount, badgeColor: 'orange' },
                    { text: "Needs manual fix", badge: manualFixCount, badgeColor: 'orange' }
                ]);

                // Add guidance message with AI FIX ALL button
                setTimeout(() => {
                    if (aiFixCount > 0) {
                        agentState.addMessage(`${aiFixCount} of your drivers can be fixed with my help. If you want to go ahead just click AI FIX ALL DRIVERS`, false, [
                            { text: `AI FIX ALL DRIVERS (${aiFixCount})`, onclick: "fixAllDriversWithAI()" }
                        ]);
                    }

                    setTimeout(() => {
                        agentState.addMessage("For the others that need manual fix, go ahead and click EDIT DRIVERS. If you have questions or want to do something else, just let me know!", false);
                    }, 500);
                }, 1000);

            }, 2500);
        }, 1000);
    }, 500);
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

