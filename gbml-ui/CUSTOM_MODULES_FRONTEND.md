# Custom Modules Frontend Implementation

## Overview

This document describes the frontend implementation for the Custom Module Registration and Binding feature in the GBML system. The implementation allows users to dynamically create, deploy, and manage custom modules through a visual interface, with automatic adaptation of the UI to support new module types.

## Architecture

### Core Components

#### 1. Type Definitions (`src/types/module.types.js`)

Defines the TypeScript-like interfaces for dynamic module configuration:

- **ModuleConfig**: Complete module structure with contracts, services, compliance, UI properties
- **CustomModuleFormData**: Form data structure for the custom module builder
- **ModuleNavItem**: Navigation item structure for dynamic sidebar
- **PREDEFINED_MODULE_TYPES**: Standard GBML module types (FUND, TREASURY, etc.)
- **AVAILABLE_CONTRACT_TYPES**: Contract types available for custom modules (TOKEN, NFT, BUNDLE, etc.)
- **ICON_OPTIONS & COLOR_OPTIONS**: UI customization options for custom modules

#### 2. Custom Module Service (`src/services/custom-module.service.js`)

API service layer for custom module operations:

- `registerCustomModule()` - Register a new custom module definition
- `getCustomModule()` - Get a specific custom module by ID
- `listCustomModules()` - List all custom modules with filters
- `updateCustomModule()` - Update a custom module definition
- `disableCustomModule()` - Disable a custom module
- `enableCustomModule()` - Enable/deploy a custom module
- `getAllActiveModules()` - Get all active modules (predefined + custom)
- `getModuleNavigationItems()` - Get formatted navigation items for sidebar

#### 3. State Management Hooks (`src/hooks/useDynamicModules.js`)

React hooks for managing dynamic module state:

- **useDynamicModules()**: Main hook for managing all modules
  - Fetches and caches active modules
  - Provides enable/disable actions
  - Filters by type (custom, predefined, enabled)
  - Returns navigation items

- **useModule(moduleId)**: Hook for a single module
  - Fetches module details
  - Returns loading/error states

- **useModuleFeatureFlags()**: Hook for feature flag management
  - Manages module enable/disable flags
  - Persists to localStorage
  - Provides toggle actions

#### 4. Custom Module Builder (`src/components/CustomModuleBuilder.jsx`)

Two-step wizard for creating custom modules:

**Step 1: Basic Configuration**
- Module ID (auto-formatted)
- Module Name & Description
- Icon selection (emoji-based)
- Color selection (gradient options)
- Contract stack selection (TOKEN, NFT, BUNDLE, GOVERNANCE, CUSTOM)
- Custom contract form (ABI + bytecode input)

**Step 2: Services & Compliance**
- GBML Services toggles (Wallet, Settlement, Conversion)
- Compliance requirements (KYC, AML)
- Module summary before deployment

**Features:**
- Real-time validation
- Custom contract support with ABI/bytecode input
- Visual contract composition
- One-click deployment integration

#### 5. Dynamic Navigation (`src/components/DynamicNavigation.jsx`)

Collapsible sidebar navigation that adapts to active modules:

**Sections:**
- Standard (Token Transfers, Fiat Gateway)
- Blockchain Modules (predefined modules)
- Custom Modules (user-created modules)
- Admin (API Keys, Disbursements - role-based)

**Features:**
- Automatic module discovery
- Badge indicators (CUSTOM, module type)
- Collapsible sections
- Feature flag integration
- Role-based access control

#### 6. Dynamic Dashboard (`src/components/DynamicDashboard.jsx`)

Generic/polymorphic dashboard that adapts to module capabilities:

**Header:**
- Module icon (customizable)
- Module name & type badges
- Enable/disable toggle (feature flag)

**Analytics Cards:**
- Total Transactions
- Total Volume
- Active Users
- Contracts Deployed

**Dynamic Widgets (based on capabilities):**
- Token Balances (if hasToken)
- Transaction History (if enabled)
- NFT Collection (if hasNFT)
- Governance (if hasGovernance)
- Compliance Status (if hasCompliance)

**Additional Sections:**
- Deployed Contracts list
- Service Bindings display
- Compliance requirements

#### 7. App Integration (`src/App.jsx`)

Updated main application with:

**New State:**
- `showCustomModuleBuilder` - Controls modal visibility
- `selectedDynamicModule` - Currently selected dynamic module

**New Tab:**
- "Dynamic Modules" tab with:
  - Create Custom Module button (admin only)
  - DynamicNavigation component
  - DynamicDashboard for selected modules

**Modal Overlay:**
- CustomModuleBuilder modal with backdrop

**Handlers:**
- `handleDynamicModuleSelect()` - Routes to appropriate view
- `handleCustomModuleCreated()` - Refreshes modules after creation

## User Flow

### Creating a Custom Module

1. **Navigate to Dynamic Modules tab**
   - Click "🚀 Dynamic Modules" in the main navigation

2. **Click "Create Custom Module"** (admin only)
   - Opens the CustomModuleBuilder modal

3. **Step 1: Configure Module**
   - Enter Module ID (e.g., "circular-economy-credits")
   - Enter Module Name (e.g., "Circular Economy Credits System")
   - Add Description
   - Select Icon and Color
   - Select Contract Stack (e.g., TOKEN + NFT)
   - Optionally add custom contracts with ABI/bytecode

4. **Step 2: Configure Services**
   - Toggle GBML Services (Wallet, Settlement, Conversion)
   - Set Compliance Requirements (KYC, AML)
   - Review summary

5. **Deploy Module**
   - Click "Deploy Module"
   - System registers module definition
   - System deploys contracts via backend
   - Module appears in navigation

### Managing Custom Modules

1. **View Module Dashboard**
   - Click on module in DynamicNavigation
   - View analytics, contracts, and capabilities

2. **Enable/Disable Module**
   - Use feature flag toggle in dashboard header
   - Instantly hides/shows module in navigation

3. **Navigate Between Modules**
   - Use DynamicNavigation sidebar
   - Switch between predefined and custom modules

## Data Flow

### Module Registration Flow

```
User fills form → CustomModuleBuilder
                ↓
registerCustomModule() → Backend API
                ↓
enableCustomModule() → Backend deployment
                ↓
useDynamicModules refresh → Navigation updates
```

### Navigation Flow

```
App mounts → useDynamicModules()
           ↓
Fetch modules → getAllActiveModules()
           ↓
Generate navigation → getModuleNavigationItems()
           ↓
DynamicNavigation renders → User clicks module
           ↓
handleDynamicModuleSelect() → Set selected module
           ↓
DynamicDashboard renders → Show module details
```

### Feature Flag Flow

```
User toggles module → useModuleFeatureFlags()
                    ↓
toggleFeatureFlag() → Update localStorage
                    ↓
DynamicNavigation filters → Hide/show module
                    ↓
DynamicDashboard checks → Enable/disable features
```

## File Structure

```
gbml-ui/src/
├── types/
│   └── module.types.js              # Type definitions
├── services/
│   ├── custom-module.service.js     # Custom module API
│   └── orchestrator.service.js      # Existing orchestrator API
├── hooks/
│   └── useDynamicModules.js         # State management hooks
├── components/
│   ├── CustomModuleBuilder.jsx      # Module creation wizard
│   ├── DynamicNavigation.jsx       # Dynamic sidebar
│   ├── DynamicDashboard.jsx        # Generic dashboard
│   └── ... (existing components)
└── App.jsx                          # Main app integration
```

## API Integration

### Custom Module Registry Endpoints

- `POST /custom-modules` - Register custom module
- `GET /custom-modules/:moduleId` - Get specific module
- `GET /custom-modules` - List custom modules
- `PUT /custom-modules/:moduleId` - Update module
- `DELETE /custom-modules/:moduleId` - Disable module

### Blockchain Orchestrator Endpoints

- `POST /enable-blockchain` - Enable/deploy module (used for custom modules too)
- `GET /blockchain-modules` - List blockchain modules
- `GET /blockchain-modules/:moduleId` - Get module status
- `POST /blockchain-modules/:moduleId/disable` - Disable module

## Configuration Example

### Frontend Module Config Structure

```javascript
{
  moduleId: "circular-economy-credits-sme",
  moduleName: "Circular Economy Credits System for SMEs",
  moduleType: "CUSTOM_CIRCULAR_ECONOMY",
  description: "A comprehensive circular economy credits system...",
  enabled: true,
  status: "ACTIVE",
  contracts: [
    {
      contractName: "CircularCreditsToken",
      contractType: "TOKEN",
      abi: [...],
      bytecode: "0x..."
    }
  ],
  services: {
    wallet: true,
    settlement: true,
    conversion: false
  },
  compliance: {
    kycRequired: true,
    amlRequired: true
  },
  uiProperties: {
    icon: "🚀",
    primaryColor: "#667eea",
    displayName: "Circular Economy Credits"
  },
  capabilities: {
    hasToken: true,
    hasNFT: true,
    hasGovernance: false,
    hasAnalytics: true,
    hasCompliance: true
  },
  contractsDeployed: [
    {
      contractName: "CircularCreditsToken",
      contractType: "TOKEN",
      contractAddress: "0x1234..."
    }
  ]
}
```

## Styling

All components use inline styles with a consistent design system:

- **Colors**: Gradient backgrounds, semi-transparent overlays
- **Spacing**: Consistent padding/margins (0.5rem, 1rem, 1.5rem, 2rem)
- **Border Radius**: 8px for cards, 12px for containers
- **Typography**: White text with rgba for secondary text
- **Transitions**: 0.2s-0.3s for hover effects
- **Backdrop Filter**: blur(10px) for glassmorphism effects

## Browser Compatibility

- Modern browsers with ES6+ support
- React 18+ features (hooks, concurrent rendering)
- localStorage for feature flag persistence

## Future Enhancements

1. **Drag-and-Drop Dashboard**: Allow users to rearrange widgets
2. **Custom Widget Builder**: Let users create custom dashboard widgets
3. **Module Templates**: Pre-built templates for common use cases
4. **Real-time Updates**: WebSocket integration for live analytics
5. **Export/Import**: Module configuration export/import functionality
6. **Version Control**: Track module configuration changes
7. **Collaboration**: Share module definitions between users

## Testing Considerations

- Unit tests for hooks (useDynamicModules, useModuleFeatureFlags)
- Integration tests for API service calls
- Component tests for CustomModuleBuilder wizard
- E2E tests for complete user flow (creation → deployment → navigation)
- Feature flag persistence tests

## Performance

- Module data cached in hooks to prevent redundant API calls
- Navigation items generated once and reused
- Lazy loading of dashboard widgets based on capabilities
- localStorage for feature flags (no API calls for toggle)

## Security

- Role-based access control (admin only for module creation)
- API authentication via Supabase session tokens
- Input validation in CustomModuleBuilder
- Feature flags stored in localStorage (client-side only)

## Accessibility

- Keyboard navigation support
- Screen reader friendly labels
- High contrast text (white on dark backgrounds)
- Clear visual indicators for enabled/disabled states
- Error messages with clear descriptions
