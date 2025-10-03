# Solution 4: Guided AI Onboarder

### **Concept**
A sophisticated AI consultant that interviews the fleet manager to dynamically build custom inspection forms. It provides intelligent, context-aware guidance for editing existing drivers and creating new ones. All training materials are auto-generated and placed in a centralized hub for a manager-controlled rollout.


### **User Story Map**

*   **Goal:** I want to set up my vehicle inspection process quickly and correctly with expert guidance.

	* **Activity 1: Engage with the AI agent to setup DVIR**
		* **Step 1:** Land on Inspection History Page
		* **Step 2:** Click on button "Setup DVIR with Reveal Intelligence"
		* **Step 3:** AI agent activates, presents itself with welcome message: "Hi! I'm your Reveal Intelligence assistant. I can help you set up your DVIR system quickly and correctly."
		* **Step 4:** AI agent displays available tasks:
			* Create an inspection form (Primary action)
			* Invite and train drivers
		* **Step 5:** User selects "Create an inspection form" to begin Activity 2

	* **Activity 2: Build the right inspection form**
		* **Step 1: Choose form creation method**
			* AI asks: "How would you like to create your inspection form?"
			* User selects one of two options:
				* "Build with AI" - AI-guided form creation (proceed to Step 2)
				* "I have an existing inspection form I want to use" - Upload existing form (proceed to Step 6)

		* **Step 2: Build with AI - Answer questions** (3 questions)
			* Question 1: "What type of vehicles do you need to inspect?"
				* Light commercial vehicles
				* Heavy Trucks
				* Specialized vehicles (emergency, construction, special transport)
			* Question 2: "Do you need to inspect trailers?"
				* Yes
				* No
			* Question 3: "What is your main priority for vehicle inspections?"
				* Compliance focused
				* Safety first
				* Maintenance & uptime

		* **Step 3: AI generates inspection form**
			* AI shows loading state: "Generating inspection form..."
			* Progress indicator updates: "Form ready for review"
			* Generation takes ~3 seconds

		* **Step 4: Review the generated form**
			* AI displays mobile preview in expanded canvas
			* Default layout is "Mark defects only"
			* Mobile preview shows realistic phone interface with inspection items organized by categories
			* Preview includes stats: total inspection items, number of categories, estimated completion time

		* **Step 5: Choose inspection layout**
			* User can switch between two layout modes using the layout switcher:
				* **Mark defects only** - Checkboxes (check only items with defects, unchecked items are OK)
				* **Submit all items** - Pass/Fail buttons (mark every item as pass or fail)
			* Mobile preview updates in real-time when layout is switched
			* AI message: "Your custom inspection form is ready! This is how it will look on your drivers' mobile devices."
			* User action buttons:
				* "Looks great, continue" - Proceed to publish
				* "Edit form" - Manual editing (mocked for now)

		* **Step 6: Upload existing form** (Alternative path from Step 1)
			* AI asks: "What format is your inspection form?"
				* PDF Document
				* Image (JPG, PNG)
			* User uploads file
			* AI shows upload progress with file details
			* AI processes and converts form to digital format
			* AI displays analysis: "I found X inspection items across Y categories"
			* Proceeds to Step 4 (Review the generated form)

		* **Step 7: Publish inspection form**
			* User clicks "Looks great, continue"
			* AI shows publishing animation in canvas: "Publishing inspection form..."
			* Canvas displays spinner and message: "Making it available to your drivers..."
			* Publishing takes ~2.5 seconds

		* **Step 8: Confirm success and provide feedback**
			* Canvas shows success screen with:
				* Green checkmark icon
				* "Inspection Form Published!" heading
				* Confirmation message
				* Status information (Form Status: Active, Available To: All Drivers)
				* Secondary action buttons: Copy, Thumbs up, Thumbs down
			* Chat sidebar shows:
				* AI message: "Success! Your inspection form has been published and is now active. Drivers can start using it immediately."
				* Feedback buttons below message: Thumbs up, Thumbs down (optional)
				* "Start a new task" button to return to activity selection

		* **Step 9: Return to activity selection**
			* User clicks "Start a new task" when ready
			* Chat history resets
			* AI returns to welcome screen showing all available activities

	*   **Activity 3: Get all my drivers ready for mobile inspections**

		* **Step 1: Initiate driver analysis**
			* User selects "Invite and train drivers" from the activity selection
			* Chat history resets for new activity
			* AI message: "Great! Let's get your drivers ready for mobile inspections."

		* **Step 2: AI analyzes current driver list**
			* AI shows analyzing state: "Analyzing your current driver list..."
			* Progress indicator updates
			* AI processes all drivers in the system (~2-3 seconds)

		* **Step 3: Review analysis results in chat**
			* Chat sidebar shows AI analysis message: "I've analyzed your current driver list. Here's what needs attention before drivers can start submitting inspections:"
			* **Driver list analysis summary** with 3 categories:
				* **[Number] - Can be fixed with AI** - Drivers with valid email and assigned groups but mobile access disabled
				* **[Number] - Needs manual fix** - Drivers with missing/invalid emails, account issues, or no vehicle groups assigned
				* **[Number] - Ready to go** - Drivers with email, mobile access enabled, and assigned to vehicle groups
			* AI message: "You can close this activity anytime and choose another task if needed."

		* **Step 4: View detailed driver table in canvas**
			* Canvas displays "Driver list analyses" table with all drivers
			* **Table is automatically sorted by priority:**
				1. **"Can be fixed with AI"** drivers first (blue badge 📱)
				2. **"Needs manual fix"** drivers second (orange badge ⚠️)
				3. **"Ready to go"** drivers last (green badge ✓)
			* **Table structure:**
				* **Search bar** at top - Filter drivers by name, email, or driver ID
				* **Table columns:**
					* DRIVER - Avatar, name, and driver ID
					* EMAIL - Email address (or error state: "No email provided", "Invalid email format")
					* MOBILE ACCESS - Status with icon
						* ✓ Enabled (green)
						* ✓ Can enable (blue)
						* ❌ Disabled (red)
						* ❌ Account locked (red)
					* VEHICLE GROUPS - Assigned fleet(s)
						* Shows fleet names (e.g., "Fleet A", "Fleet A, Fleet B")
						* "No groups assigned" in red if empty
					* STATUS - Overall readiness badge
						* 📱 AI can fix (blue badge) - shown first
						* ⚠️ Manual fix needed (orange badge) - shown second
						* ✓ Ready (green badge) - shown last
					* ACTIONS - Action buttons
						* "AI Quick Fix" (for AI-fixable drivers)
						* "Edit Driver" (for manual fixes)
						* "Edit" (for ready drivers)
				* **Pagination** at bottom - Navigate through driver list (e.g., "Showing 1-10 of 45 drivers")

		* **Step 5: Use AI bulk fix** (recommended path)
			* AI suggests in chat: "Four of your drivers can be fixed with my help. If you want to go ahead just click AI FIX ALL DRIVERS"
			* **"AI FIX ALL DRIVERS (4)"** button appears in chat
			* User clicks button to auto-fix all drivers that:
				* Have valid email addresses
				* Are assigned to vehicle groups
				* Just need mobile access enabled
			* AI shows progress: "Enabling mobile access for 4 drivers..."
			* AI confirms completion: "Done! I've enabled mobile access for 4 drivers. They're now ready to use the mobile app."
			* Table updates in real-time - fixed drivers move to "Ready" status and resort to bottom

		* **Step 6: Manual driver editing** (for exceptions)
			* AI message: "For the others that need manual fix, go ahead and click EDIT DRIVERS. If you have questions or want to do something else, just let me know!"
			* User can fix drivers individually by clicking "Edit Driver" button in table
			* **Common manual fixes needed:**
				* **Missing email:** Add email address
				* **Invalid email format:** Correct email format
				* **No groups assigned:** Assign driver to one or more vehicle groups
				* **Account locked:** Resolve account access issues (may require admin action)

		* **Step 7: Edit driver modal/interface** (when "Edit Driver" is clicked)
			* Modal or inline form appears with driver details
			* **Editable fields:**
				* Email address (text input with validation)
				* Mobile access (toggle switch)
				* Vehicle groups (multi-select dropdown)
			* **Actions:**
				* "Save changes" - Updates driver and returns to table
				* "Cancel" - Closes without saving
			* Table updates and re-sorts after save to reflect new status

		* **Step 8: Search and filter drivers**
			* User can use search bar to find specific drivers
			* Search filters by: driver name, email, or driver ID
			* Results update in real-time as user types
			* **Sorting is maintained** within search results (AI can fix → Manual fix → Ready)
			* Helpful for large driver lists

		* **Step 9: Navigate through driver pages**
			* For organizations with many drivers, pagination allows browsing
			* Controls: "Previous", page numbers, "Next"
			* Shows current range (e.g., "Showing 1-10 of 45 drivers")
			* **Sorting is maintained** across all pages

		* **Step 10: Add new drivers** (optional)
			* If user needs to add drivers not in the system
			* "Add new driver" button available in canvas header or via chat
			* Opens form to input new driver details
			* New drivers appear in table after creation (sorted by their status)

		* **Step 11: Exit activity anytime** (flexible navigation)
			* **User can exit this activity at any point** by:
				* Typing a request in chat to do something else
				* Clicking "Start a new task" button
				* Asking AI to show other available tasks
			* AI responds: "No problem! What would you like to do next?" and shows activity selection
			* **Progress is automatically saved** - user can return to driver management later

		* **Step 12: Verify all drivers are ready** (optional completion)
			* AI monitors the driver list status
			* When all critical fixes are complete, AI message: "Great progress! You now have [X] drivers ready for mobile inspections."
			* **Remaining statuses shown:**
				* [X] Can be fixed with AI
				* [X] Needs manual fix
				* [X] Ready to go
			* Chat shows optional feedback buttons (Thumbs up/down)

		* **Step 13: Complete driver setup and proceed**
			* User clicks "Start a new task" button when satisfied
			* Options presented:
				* Continue to Activity 4: "Roll out training and monitor activation"
				* Return to activity selection
			* Chat history resets for next activity

	*   **Activity 4: Roll out training and monitor activation**
		*   *Steps:* Review the AI-drafted training email and downloadable PDF guide → Edit the email subject and body directly in the browser → Use an AI prompt to ask for stylistic changes to the email → Send the training materials to all drivers with one click → Optionally, skip the email step and handle training manually → View the activation dashboard to see which drivers have logged in.
