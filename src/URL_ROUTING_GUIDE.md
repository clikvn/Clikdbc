# URL Routing & Group-Based Visibility Guide

## URL Structure

The app now uses full URL-based routing to maintain group context throughout navigation:

### URL Patterns

1. **Owner's Profile (No Group)**
   - Home: `/{usercode}` (e.g., `/christine`)
   - Contact: `/{usercode}/contact`
   - Profile: `/{usercode}/profile`
   - Portfolio: `/{usercode}/portfolio`

2. **Shared with Group**
   - Home: `/{usercode}/{groupcode}` (e.g., `/christine/bp`)
   - Contact: `/{usercode}/{groupcode}/contact` (e.g., `/christine/bp/contact`)
   - Profile: `/{usercode}/{groupcode}/profile` (e.g., `/christine/bp/profile`)
   - Portfolio: `/{usercode}/{groupcode}/portfolio` (e.g., `/christine/bp/portfolio`)

3. **CMS/Editor**
   - Dashboard: `/studio` or `/{usercode}/studio`

### Group Codes

- `hp` = High Potential
- `bp` = Business Partner
- `lp` = Low Potential

## How It Works

### 1. URL Parsing
The `parseProfileUrl()` function extracts three pieces of information from any URL:
- `userCode`: Identifies whose profile is being viewed
- `group`: Identifies which contact group the viewer belongs to (if any)
- `screen`: Identifies which screen to show (home/contact/profile/portfolio)

### 2. Navigation Preservation
When users navigate between screens, the system:
- Keeps the `userCode` from the current URL
- Keeps the `group` from the current URL
- Updates only the `screen` portion

**Example Flow:**
```
User visits: /christine/bp
  → Views home screen with filtered data (business-partner group settings)

User clicks Contact:
  → Navigates to: /christine/bp/contact
  → Still shows filtered data for business-partner group

User clicks Profile:
  → Navigates to: /christine/bp/profile
  → Still shows filtered data for business-partner group
```

### 3. Data Filtering
The `loadFilteredBusinessCardData()` function:
1. Reads the current pathname
2. Extracts the `group` from the URL
3. Loads group visibility settings
4. Filters out fields that the group shouldn't see
5. Returns the filtered data

**Example:**
```javascript
// URL: /christine/bp/contact
const data = loadFilteredBusinessCardData();
// Returns data with only fields visible to 'business-partner' group
```

### 4. Root URL Redirect
When users access the root URL `/`:
- The app automatically redirects to `/{usercode}`
- This ensures the URL always contains context

## Implementation Details

### Key Files

1. **`/utils/user-code.ts`**
   - `parseProfileUrl()`: Parses URLs to extract userCode, group, and screen
   - `buildProfileUrl()`: Builds URLs with proper structure
   - `getUserCode()`: Gets or generates user's unique code

2. **`/utils/filtered-data-loader.ts`**
   - `loadFilteredBusinessCardData()`: Loads and filters data based on URL group context
   - `getCurrentViewingGroup()`: Extracts group from current URL

3. **`/App.tsx`**
   - Routing logic: Detects URL changes and updates screens
   - Navigation functions: Preserve userCode and group when navigating
   - Root redirect: Ensures proper URL structure

### Navigation Functions

All navigation functions now preserve context:

```javascript
const navigateToContact = () => {
  const { userCode, group } = routeInfo;
  const path = buildProfileUrl({ 
    userCode: userCode || undefined, 
    group, 
    screen: 'contact' 
  });
  navigateTo(path);
};
```

## Testing URLs

### Test Scenarios

1. **Owner viewing their own profile:**
   - Visit: `/christine` → See full profile
   - Click Contact → Navigate to `/christine/contact`
   - All fields visible

2. **Business partner viewing profile:**
   - Visit: `/christine/bp` → See filtered profile
   - Click Contact → Navigate to `/christine/bp/contact`
   - Only fields marked for "business-partner" visible

3. **High potential client viewing profile:**
   - Visit: `/christine/hp` → See filtered profile
   - Click Portfolio → Navigate to `/christine/hp/portfolio`
   - Only fields marked for "high-potential" visible

4. **Public viewer (no group):**
   - Visit: `/christine` → See full profile
   - Click Profile → Navigate to `/christine/profile`
   - All fields visible (no group filtering)

## Benefits

✅ **Context Preserved**: Group visibility settings stay active throughout navigation  
✅ **Shareable URLs**: Each screen has a unique URL that can be bookmarked/shared  
✅ **Back Button Works**: Browser back/forward buttons work correctly  
✅ **Privacy-Friendly**: Group code in URL clearly indicates filtered view  
✅ **Clean URLs**: Short group codes keep URLs concise