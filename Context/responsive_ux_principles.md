# Responsive UX Principles: AI Agent Sidebar & Canvas Interaction

## Design Philosophy

The AI agent interface uses a **responsive hybrid approach** that adapts the sidebar and canvas interaction pattern based on screen size. The design prioritizes:

1. **Single Control Point** - One primary control for toggling views at each breakpoint
2. **Clear Mental Models** - Users understand what each control does at a glance
3. **Context Preservation** - Important information remains accessible across states
4. **Progressive Disclosure** - Show only what's needed when it's needed
5. **Consistent Behavior** - Similar actions produce predictable results

---

## Screen Size Breakpoints

```
Desktop:  > 1024px
Tablet:   768px - 1024px
Mobile:   < 768px
```

---

## Desktop (> 1024px)

### Layout
- **Sidebar Position**: Right-side panel, slides in from right
- **Width**: 400px (normal) → Full screen (expanded)
- **Sidebar/Canvas Arrangement**: Side-by-side horizontal split

### Interaction Pattern

**Collapsed State** (Default)
- Sidebar: 400px width
- Canvas: Hidden
- User sees: Chat interface only

**Expanded State**
- Sidebar: Left 40% of screen
- Canvas: Right 60% of screen
- User sees: Chat + Canvas side-by-side

### Controls
- **Top-right expand button**: Toggles between collapsed (400px) and expanded (full-screen split view)
- **No additional collapse controls needed**

### When to Use
- Primary use case for desktop/laptop users
- Provides maximum workspace for viewing data tables and forms
- Side-by-side layout allows referencing chat while viewing canvas

---

## Tablet (768px - 1024px)

### Layout
- **Sidebar Position**: Right-side panel, full height
- **Width**: 480px (normal) → Nearly full screen (expanded)
- **Sidebar/Canvas Arrangement**: Stacked vertical split (when expanded)

### Interaction Pattern

**Collapsed State** (Default)
- Sidebar: 480px width
- Canvas: Hidden
- User sees: Chat interface only

**Expanded State**
- Sidebar: Top 40% of screen (stacked)
- Canvas: Bottom 60% of screen
- User sees: Both chat and canvas, stacked vertically
- **No minimize option** - keeps UX simple like mobile

### Controls

**Single Control: Top-right expand/collapse button**
- **When canvas hidden**: Shows `open_in_full` icon
  - Tap → Shows canvas in split view (40% chat / 60% canvas)
- **When canvas visible**: Shows `close_fullscreen` icon
  - Tap → Hides canvas, returns to chat-only view

### When to Use
- Ideal for iPad and larger tablets
- Vertical stacking optimizes for tablet aspect ratio
- Simple toggle keeps interaction consistent with mobile

### Design Rationale
- **Why vertical stacking?** Tablet screens are often held portrait; vertical split uses space better than horizontal
- **Why no chat minimize?** Keeps UX simple and consistent across mobile and tablet - one control does everything
- **Why 40/60 split?** Balances chat context with canvas visibility across all screen sizes

---

## Mobile (< 768px)

### Layout
- **Sidebar Position**: Full screen overlay
- **Width**: 100vw (full screen)
- **Sidebar/Canvas Arrangement**: Canvas toggles on/off, chat remains visible

### Interaction Pattern

**Default State**
- Sidebar: Full screen, fills 100% height
- Canvas: Hidden (not rendered)
- User sees: Chat interface only

**Canvas Shown State**
- Sidebar: Top 40% of screen
- Canvas: Bottom 60% of screen
- User sees: Split view with chat on top, canvas below
- **No minimize option** - keeps UX simple

### Controls

**Single Control: Top-right expand/collapse button**
- **When canvas hidden**: Shows `open_in_full` icon
  - Tap → Shows canvas in split view (40% chat / 60% canvas)
- **When canvas visible**: Shows `close_fullscreen` icon
  - Tap → Hides canvas, returns to chat-only view

### When to Use
- Primary use case for smartphones
- Optimized for touch interaction
- Simplified to binary states: chat-only or split view

### Design Rationale
- **Why no chat minimize?** Mobile screen space is too limited; showing chat header alone isn't useful
- **Why 40/60 split?** Balances chat context with canvas visibility; 40% shows ~2-3 messages with actions while keeping canvas readable
- **Why single toggle?** Reduces cognitive load; one button with clear before/after states
- **Why no auto-collapse?** Let users control when they want to hide canvas; don't interrupt their flow

---

## Key UX Principles

### 1. **Context Over Content**
When the canvas is visible, users need to reference chat history for context. Always keep chat accessible, even if minimized.

### 2. **Action Visibility**
If the last AI message contains action buttons, ensure they're visible:
- **All screen sizes**: Actions always visible in chat
- Chat is always visible when canvas is shown, ensuring action buttons are accessible

### 3. **Single Source of Truth**
Each screen size has ONE primary control for managing the view:
- **Desktop**: Top-right expand button (toggles side-by-side layout)
- **Tablet**: Top-right expand button (toggles stacked layout)
- **Mobile**: Top-right expand button (toggles stacked layout)

### 4. **Consistent Simplicity**
All screen sizes use the same simple interaction pattern:
- One button controls canvas visibility
- Chat always visible when canvas is shown
- No complex nested controls or states

### 5. **No Surprise Behaviors**
- **No auto-actions** that users don't initiate
- **No auto-collapse** that interrupts user flow
- **Predictable state changes** from every interaction

---

## Visual States & Transitions

### State Indicators

**Expand/Collapse Icon** (All screen sizes)
- Material icon: `open_in_full` (when collapsed/canvas hidden)
- Material icon: `close_fullscreen` (when expanded/canvas visible)
- Icon changes based on current state to show what WILL happen
- Same icons used consistently across desktop, tablet, and mobile
- No additional controls needed

### Transitions
- All state changes use smooth CSS transitions (300ms ease)
- Height changes animate smoothly for polish
- No jarring snaps or instant changes

---

## Responsive Behavior Summary

| Feature | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| **Layout** | Side-by-side | Stacked vertical | Stacked vertical |
| **Canvas Toggle** | Expand button | Expand button | Expand button |
| **Chat Minimize** | ❌ No | ❌ No | ❌ No |
| **Canvas Hidden by Default** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Split Ratio (Chat/Canvas)** | 40/60 | 40/60 | 40/60 |
| **Single Control** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Implementation Notes

### CSS Classes
- `.ai-container.expanded` - Canvas is visible (applies to all screen sizes)
- `.issue-cell` - Driver issue display with primary issue text
- `.additional-issues` - Container for additional issue icons
- `.issue-icon.additional` - Secondary issue icons with tooltips

### JavaScript State
- `agentState.isExpanded` - Controls whether canvas is shown
- `agentState.outputVisible` - Tracks if canvas has content to display

### Media Queries
```css
/* Desktop */
@media (min-width: 1025px) { /* Side-by-side layout */ }

/* Tablet */
@media (max-width: 1024px) and (min-width: 768px) { /* Stacked + collapsible */ }

/* Mobile */
@media (max-width: 768px) { /* Simplified toggle */ }
```

---

## Design Decision Log

### Why remove auto-collapse on mobile?
**Problem**: Auto-collapse interrupted user workflow and created confusion about control
**Solution**: Let users explicitly control canvas visibility via top-right toggle
**Result**: Clearer mental model, no surprise behaviors

### Why use same simple pattern across all screen sizes?
**Problem**: Different controls on different screen sizes creates confusion and complexity
**Solution**: Use single expand/collapse button across desktop, tablet, and mobile
**Result**: Consistent mental model; users know exactly what to expect regardless of device

### Why 40/60 split across all screen sizes?
**Problem**: Need to balance chat context visibility with canvas content readability
**Solution**: Use 40/60 split consistently across all breakpoints - chat gets 40%, canvas gets 60%
**Result**: Consistent mental model across devices; 40% chat shows ~2-3 messages with actions while canvas remains readable

---

## Canvas Content: Driver Table Responsive Design

The driver table in Activity 3 (Driver Management) uses a responsive design that adapts to screen size:

### Desktop (> 1024px)

**Table Layout**: Full table with 4 columns
- **Columns**: DRIVER | ISSUE | STATUS | ACTIONS
- **Padding**: 16px cells
- **Font Size**: 14px
- **Features**:
  - Horizontal scrolling if content exceeds viewport
  - Search bar for filtering drivers
  - Pagination for large driver lists
  - Sortable by status (AI can fix → Manual fix → Ready)

### Tablet (768px - 1024px)

**Compact Table Layout**: Optimized to fit without horizontal scroll
- **Columns**: Same 4 columns, but with reduced spacing
- **Padding**: 10px 8px cells (reduced)
- **Font Size**: 13px (reduced)
- **Column Widths**:
  - DRIVER: 35%
  - ISSUE: 30%
  - STATUS: 20%
  - ACTIONS: 15%
- **Optimizations**:
  - Smaller avatars (32px vs 40px)
  - Smaller badges and buttons
  - Reduced header font size (11px)
  - All columns fit in viewport without scroll

### Mobile (< 768px)

**Card Layout**: Table replaced with card-based design
- **Display**: Stacked vertical cards, one per driver
- **Card Structure**:
  - Header: Avatar + Name + Driver ID
  - Body: Issue field + Status badge
  - Footer: Action button (full width)
- **Benefits**:
  - Touch-friendly larger tap targets
  - Easier to scan on small screens
  - No horizontal scrolling
  - Each card is self-contained unit

### Driver Issue Detection

The ISSUE column shows **multiple issues** when applicable:

**Display Format:**
- **Primary issue**: Shown with full text (e.g., "🔒 Account locked")
- **Additional issues**: Shown as icons only (e.g., "📧 👥")
- **Tooltips**: Hover over additional icons to see full issue description

**Priority Hierarchy:**
1. **🔒 Account locked** (Critical - Red) - Requires admin intervention
2. **📧 No email provided** (Warning - Orange) - Must add email manually
3. **📧 Invalid email format** (Warning - Orange) - Must fix email manually
4. **👥 No vehicle groups assigned** (Warning - Orange) - Must assign groups
5. **📱 Mobile access disabled** (Fixable - Blue) - AI can enable automatically
6. **✓ No issues detected** (Ready - Green) - Driver is ready

**Example:** A driver with 3 issues displays as: "🔒 Account locked 📧 👥"
- Primary: Account locked (highest priority, shown with text)
- Secondary: No email (shown as icon)
- Tertiary: No groups (shown as icon)

This approach allows displaying multiple issues without taking excessive horizontal space.

### Search Functionality

**Search behavior:**
- Filters drivers by name, email, or driver ID
- Real-time filtering as you type
- **Focus maintained**: Input stays focused and cursor position preserved during filtering
- Search resets pagination to page 1
- Case-insensitive matching

---

## Testing Checklist

### AI Agent Sidebar & Canvas

- [ ] Desktop: Expand/collapse toggles side-by-side layout (40% chat / 60% canvas)
- [ ] Tablet: Expand shows stacked vertical layout (40% chat / 60% canvas)
- [ ] Tablet: No chat collapse header visible
- [ ] Mobile: Expand shows stacked vertical layout (40% chat / 60% canvas)
- [ ] Mobile: No chat collapse header visible
- [ ] All: Canvas hidden by default on all screen sizes
- [ ] All: Single expand/collapse button in top-right corner
- [ ] All: Smooth transitions between states (300ms)
- [ ] All: Icon changes reflect current state and next action (`open_in_full` / `close_fullscreen`)
- [ ] All: No auto-collapse behaviors

### Driver Table (Activity 3 Canvas Content)

- [ ] Desktop: Full 4-column table displays with proper padding and font sizes
- [ ] Desktop: Search bar filters drivers correctly
- [ ] Desktop: Pagination works for large driver lists
- [ ] Desktop: Table sorts by status (AI can fix → Manual fix → Ready)
- [ ] Tablet: All 4 columns fit without horizontal scroll
- [ ] Tablet: Compact styling applied (smaller padding, fonts, avatars)
- [ ] Tablet: Column width percentages maintain proper proportions (35/30/20/15)
- [ ] Mobile: Card layout replaces table
- [ ] Mobile: Each card shows avatar, name, driver ID, issue, status, and action button
- [ ] Mobile: Action buttons are full width and touch-friendly
- [ ] All: Issue column shows highest priority issue with correct icon and color
- [ ] All: Multiple issues displayed correctly (primary with text + additional as icons)
- [ ] All: Tooltips show full issue text when hovering over additional issue icons
- [ ] All: Color coding works (Red=critical, Orange=warning, Blue=fixable, Green=ready)
- [ ] All: AI Quick Fix button appears for AI-fixable drivers
- [ ] All: Edit button appears for manual-fix and ready drivers
- [ ] All: Search input maintains focus while typing
- [ ] All: Search filters by name, email, and driver ID
- [ ] All: Search resets to page 1 when filtering
