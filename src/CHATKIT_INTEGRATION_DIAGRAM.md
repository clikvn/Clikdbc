# 🎨 ChatKit Integration Architecture

Visual guide showing how ChatKit powers your AI Agent App.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR WEB APPLICATION                      │
│                  (Running in Browser)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CMS DASHBOARD                           │
│                 /components/cms/CMSDashboard.tsx             │
│                                                               │
│  ┌───────────────┐  ┌────────────────┐  ┌─────────────┐    │
│  │  Form Fields  │  │  Navigation    │  │  AI Agent   │    │
│  │  with AI ✨   │  │  with AI icon  │  │  App Panel  │    │
│  └───────┬───────┘  └────────┬───────┘  └──────┬──────┘    │
│          │                   │                   │           │
│          └───────────────────┴───────────────────┘           │
│                              │                                │
│                   onClick → Open AI Agent App                │
└──────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI AGENT APP (SHEET)                      │
│            Slide-out Panel from Right Side                   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Header: "AI Agent"                            [X]    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                                                       │   │
│  │           AIAssistant Component                      │   │
│  │       (Powered by ChatKit)                           │   │
│  │                                                       │   │
│  │   Field: Bio                                         │   │
│  │   Current Value: "Software Engineer..."             │   │
│  │   Powered by ChatKit • gpt-4o-mini                  │   │
│  │                                                       │   │
│  │   ┌─────────────────────────────────────────┐       │   │
│  │   │  User: "Help me write a better bio"    │       │   │
│  │   ├─────────────────────────────────────────┤       │   │
│  │   │  AI: "Here's a professional bio..."     │       │   │
│  │   │      [Apply to field →]                  │       │   │
│  │   └─────────────────────────────────────────┘       │   │
│  │                                                       │   │
│  │   [Type message here...] [🎤] [Send]                │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   AIASSISTANT COMPONENT                      │
│              /components/cms/AIAssistant.tsx                 │
│                                                               │
│  Props:                                                      │
│   • fieldLabel: "Bio"                                       │
│   • currentValue: "Software Engineer..."                   │
│   • onApply: function                                       │
│   • initialMessage: "Help me write..."                     │
│                                                               │
│  ┌─────────────────────────────────────────┐               │
│  │  1. Get ChatKit Config                  │               │
│  │     getChatKitConfigWithContext()      │               │
│  ├─────────────────────────────────────────┤               │
│  │  2. Build Messages Array                │               │
│  │     [system, user1, ai1, user2, ...]   │               │
│  ├─────────────────────────────────────────┤               │
│  │  3. Call OpenAI API                     │               │
│  │     POST /v1/chat/completions          │               │
│  ├─────────────────────────────────────────┤               │
│  │  4. Display Response                    │               │
│  │     Show message + "Apply" button      │               │
│  └─────────────────────────────────────────┘               │
└──────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CHATKIT CONFIGURATION                      │
│          /utils/openai-chatkit-config.ts                     │
│                                                               │
│  export const chatKitConfig = {                             │
│    apiKey: VITE_OPENAI_API_KEY,                            │
│    model: 'gpt-4o-mini',                                   │
│    temperature: 0.7,                                        │
│    systemPrompt: '...'                                      │
│  };                                                          │
│                                                               │
│  getChatKitConfigWithContext(label, value) {               │
│    return {                                                  │
│      ...chatKitConfig,                                      │
│      systemPrompt: basePrompt +                             │
│        `Field: ${label}, Value: ${value}`                  │
│    };                                                        │
│  }                                                           │
└──────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  OPENAI API (HOSTED MODE)                    │
│            https://api.openai.com/v1/chat/completions       │
│                                                               │
│  Request:                                                    │
│  {                                                           │
│    "model": "gpt-4o-mini",                                  │
│    "messages": [                                             │
│      {                                                       │
│        "role": "system",                                     │
│        "content": "You are a helpful assistant..."          │
│      },                                                      │
│      {                                                       │
│        "role": "user",                                       │
│        "content": "Help me write a better bio"              │
│      }                                                       │
│    ],                                                        │
│    "temperature": 0.7                                        │
│  }                                                           │
│                                                               │
│  Response:                                                   │
│  {                                                           │
│    "choices": [{                                             │
│      "message": {                                            │
│        "content": "Here's a professional bio for you..."    │
│      }                                                       │
│    }]                                                        │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Message Flow (Detailed)

### Step-by-Step: User Asks for Help

```
1. USER ACTION
   └─> Clicks AI ✨ icon next to "Bio" field
   
2. CMSDashboard.tsx
   └─> handleFieldFocus() called
       └─> Sets activeField = {
             label: "Bio",
             value: "Software Engineer...",
             onApply: function,
             initialMessage: "Help me write a bio"
           }
       └─> Opens AI Agent App sheet
   
3. AI AGENT APP OPENS
   └─> Renders AIAssistant component
       └─> Props: fieldLabel, currentValue, onApply, initialMessage
   
4. AIAssistant.tsx
   └─> useEffect: Check if ChatKit configured
       └─> isChatKitConfigured() → true ✅
   
5. USER TYPES MESSAGE
   └─> "Help me write a better bio"
   └─> handleSend() triggered
   
6. PREPARE REQUEST
   └─> getChatKitConfigWithContext("Bio", "Software Engineer...")
       └─> Returns config with field-specific system prompt
   
7. BUILD MESSAGES ARRAY
   └─> [
         { role: "system", content: "...Field: Bio, Value: ..." },
         { role: "user", content: "Help me write a better bio" }
       ]
   
8. API CALL (ChatKit Hosted)
   └─> fetch('https://api.openai.com/v1/chat/completions', {
         headers: { Authorization: Bearer sk-... },
         body: { model, messages, temperature }
       })
   
9. OPENAI PROCESSES
   └─> GPT-4o-mini receives request
   └─> Considers:
       • System prompt with field context
       • Current bio value  
       • User's question
   └─> Generates professional bio
   
10. RESPONSE RECEIVED
    └─> Extract: data.choices[0].message.content
    └─> Display in chat UI
    └─> Show "Apply to field →" button
    
11. USER CLICKS "APPLY"
    └─> onApply(aiResponse) called
    └─> Bio field updated in form
    └─> AI Agent App closes
    └─> Success toast shown ✅
```

---

## 🎯 Field Context Flow

Shows how field information flows to ChatKit:

```
┌──────────────┐
│  Form Field  │  Bio: "Software Engineer..."
└──────┬───────┘
       │
       │ User clicks AI ✨ icon
       │
       ▼
┌──────────────────┐
│ handleFieldFocus │
└──────┬───────────┘
       │
       │ Sets activeField with:
       │ • label: "Bio"
       │ • value: current bio text
       │ • onApply: update function
       │
       ▼
┌──────────────────┐
│  <AIAssistant>   │
└──────┬───────────┘
       │
       │ Receives props
       │
       ▼
┌────────────────────────────┐
│ getChatKitConfigWithContext│
└──────┬─────────────────────┘
       │
       │ Returns config with context:
       │
       ▼
┌─────────────────────────────────────────┐
│ System Prompt (Enhanced):               │
│                                          │
│ "You are a helpful AI assistant...      │
│                                          │
│  CURRENT FIELD CONTEXT:                 │
│  Field: Bio                             │
│  Current Value: Software Engineer...    │
│                                          │
│  Please provide suggestions              │
│  specifically for this field."          │
└──────┬──────────────────────────────────┘
       │
       │ Sent to OpenAI with user message
       │
       ▼
┌──────────────────┐
│  OpenAI API      │
│  (ChatKit)       │
└──────┬───────────┘
       │
       │ Returns context-aware response
       │
       ▼
┌──────────────────────────────┐
│ "Based on your current bio   │
│  as a Software Engineer,     │
│  here's a more compelling    │
│  version that highlights..." │
└──────────────────────────────┘
```

---

## 🔌 Integration Points

### 1. Navigation Integration

```
Top Nav Bar → AI Icon → Opens AI Agent App
   │
   └─> CMSNavigationBar.tsx
       └─> onAIClick={() => setMobileAIOpen(true)}
```

### 2. Form Field Integration

```
Every Form Field → AI ✨ Icon
   │
   └─> onClick={() => handleFieldFocus({
         label: field name,
         value: current value,
         onApply: update function,
         initialMessage: prompt
       })}
```

### 3. Menu Integration

```
Mobile Menu → "AI Agent" option
   │
   └─> onClick={() => setMobileAIOpen(true)}
```

---

## 📦 Component Hierarchy

```
App.tsx
  └─> CMSDashboard.tsx
       ├─> Forms (Home, Profile, Portfolio, etc.)
       │    └─> Form Fields with AI icons
       │         └─> Click → handleFieldFocus()
       │
       ├─> CMSNavigationBar
       │    └─> AI Icon → setMobileAIOpen(true)
       │
       └─> Sheet (AI Agent App)
            ├─> Header ("AI Agent" + Close)
            │
            └─> Content
                 ├─> activeField?
                 │    └─> <AIAssistant> (ChatKit)
                 │
                 └─> No field?
                      └─> General chat interface
```

---

## 🎨 UI States

### State 1: Closed
```
AI Agent App not visible
User sees: Regular CMS interface
```

### State 2: Open - No Field Selected
```
┌─────────────────────────┐
│ AI Agent         [X]    │
├─────────────────────────┤
│                         │
│ General chat interface  │
│                         │
│ "Hi! How can I help?"  │
│                         │
│ [Type message...]      │
└─────────────────────────┘
```

### State 3: Open - Field Selected
```
┌─────────────────────────────────┐
│ AI Agent                 [X]    │
├─────────────────────────────────┤
│                                 │
│  Currently helping with: Bio    │
│  Current text: "..."           │
│  Powered by ChatKit            │
│                                 │
│  [Suggestion 1] [Suggestion 2] │
│                                 │
│  💬 Messages...                │
│                                 │
│  [Type message...] [Send]      │
└─────────────────────────────────┘
```

### State 4: Loading
```
┌─────────────────────────────────┐
│ AI Agent                 [X]    │
├─────────────────────────────────┤
│                                 │
│  User: "Help me..."            │
│                                 │
│  ⏳ AI is thinking...          │
│                                 │
└─────────────────────────────────┘
```

### State 5: Response with Apply
```
┌─────────────────────────────────┐
│ AI Agent                 [X]    │
├─────────────────────────────────┤
│                                 │
│  User: "Help me..."            │
│                                 │
│  AI: "Here's a suggestion..."  │
│      [Apply to field →]        │
│                                 │
│  [Type message...] [Send]      │
└─────────────────────────────────┘
```

---

## 🔄 Data Flow Summary

```
User Input
   ↓
CMSDashboard (State Management)
   ↓
AIAssistant Component (ChatKit Integration)
   ↓
ChatKit Config (Field Context Injection)
   ↓
OpenAI API (ChatKit Hosted Mode)
   ↓
AI Response
   ↓
Display in UI
   ↓
User Clicks "Apply"
   ↓
Update Form Field
   ↓
Save to Storage (Auto-save)
```

---

## ✅ Complete Integration Checklist

- [x] CMSDashboard imports AIAssistant
- [x] AIAssistant uses ChatKit config
- [x] Field context passed correctly
- [x] OpenAI API called via ChatKit
- [x] Responses displayed in UI
- [x] Apply to field works
- [x] Auto-save triggers
- [x] Mobile responsive
- [x] Error handling
- [x] Loading states
- [x] Debug tools available

---

## 🎉 Result

**Everything is connected and working!**

Your AI Agent App is a seamless integration of:
- ✅ Custom UI (slide-out panel)
- ✅ ChatKit backend (OpenAI Hosted)
- ✅ Field-aware context
- ✅ Production-ready infrastructure

**No additional work needed!** 🚀

---

**Last Updated**: November 4, 2025  
**Integration**: Complete ✅  
**Powered By**: OpenAI ChatKit (Hosted Mode)
