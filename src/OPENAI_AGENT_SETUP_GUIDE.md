# 🤖 OpenAI Agent Workflow - Complete Setup Guide

**Goal**: Connect your app to an OpenAI Assistant (Agent) for smarter AI responses

---

## 🎯 Quick Summary

Your app currently uses **Chat Completions** mode (works fine!). To use a custom **OpenAI Assistant** instead, you need to:

1. **Fix the API endpoint** (currently broken - see below)
2. **Create an Assistant** in OpenAI Platform  
3. **Add Assistant ID** to your config

---

## ⚠️ Current Issue

Your "workflow" code is broken because it uses an endpoint that doesn't exist:
```
❌ https://api.openai.com/v1/workflows/runs (404 Error)
```

The correct endpoint is:
```
✅ https://api.openai.com/v1/threads/runs (Assistants API)
```

**See [ASSISTANTS_API_FIX.md](./ASSISTANTS_API_FIX.md) for the code fix!**

---

## 📋 Current State

| Feature | Status | Notes |
|---------|--------|-------|
| Chat Completions Mode | ✅ Working | Uses gpt-4o-mini |
| AI Agent App | ✅ Working | Visual design matches Figma |
| Assistants/Workflow Mode | ❌ Broken | Wrong API endpoint |
| Infrastructure | ✅ Ready | Just needs code fix |

---

## 🛠️ Setup Process

### Step 1: Fix the Code ⚠️ **Required First!**

**Read**: [ASSISTANTS_API_FIX.md](./ASSISTANTS_API_FIX.md)

**What to update**:
- File: `/components/cms/AIAssistant.tsx`
- Change: Update the workflow API calls to use Assistants API
- Time: ~10 minutes

**Why**: The current code tries to use a non-existent endpoint. Must fix before testing.

### Step 2: Create Your Assistant

1. **Go to**: https://platform.openai.com/assistants
2. **Click**: "Create" button
3. **Configure**:
   ```
   Name: Business Card Content Assistant
   
   Instructions:
   You are a professional AI assistant specializing in digital business cards.
   Help users write compelling bios, portfolio descriptions, and headlines.
   Be professional but friendly, concise, and actionable.
   
   Model: gpt-4o-mini
   Temperature: 0.7
   ```
4. **Save** and **copy** the Assistant ID (starts with `asst_`)

### Step 3: Add Assistant ID to Config

1. **Open**: `/utils/openai-chatkit-config.ts`
2. **Find** line 23-24:
   ```typescript
   const OPENAI_WORKFLOW_ID = '';
   ```
3. **Update** to:
   ```typescript
   const OPENAI_WORKFLOW_ID = 'asst_YOUR_ACTUAL_ID_HERE';
   ```

### Step 4: Test It!

1. **Reload** your app
2. **Open console** (F12) and type:
   ```javascript
   chatKitDebug.printInfo()
   ```
3. **Should show**: "Mode: Workflow (ID: asst_...)"
4. **Test in app**: Go to `/my_profile`, click AI icon ✨, send message
5. **Success!** 🎉

---

## 🔄 Two Modes Available

### Mode 1: Chat Completions (Current - Working)

**When**: `OPENAI_WORKFLOW_ID` is empty

**Uses**:
- Model: gpt-4o-mini
- Endpoint: `/chat/completions`
- Cost: ~$0.0003/message
- Config: In code

**Status**: ✅ Works perfectly

### Mode 2: Assistant (After Fix & Setup)

**When**: `OPENAI_WORKFLOW_ID` has an Assistant ID

**Uses**:
- Model: Whatever you configured
- Endpoint: `/threads/runs` (Assistants API)
- Cost: Varies by model
- Config: In OpenAI Platform

**Status**: ⚠️ Needs code fix first

---

## 📊 Decision Matrix

### Stick with Chat Completions If:
- ✅ Current setup works for you
- ✅ You want simplest option
- ✅ You prefer lowest cost
- ✅ You don't need custom knowledge bases

### Switch to Assistant If:
- ✅ You want no-code configuration
- ✅ You need specialized knowledge
- ✅ You want advanced features (tools, files)
- ✅ You prefer managing in OpenAI dashboard

---

## 📁 Documentation Structure

Your project has comprehensive docs:

### Quick Start
- **[WORKFLOW_SETUP_INSTRUCTIONS.md](./WORKFLOW_SETUP_INSTRUCTIONS.md)** - How to add Assistant ID
- **[OPENAI_AGENT_SETUP_GUIDE.md](./OPENAI_AGENT_SETUP_GUIDE.md)** - This file!

### Code Fix (Important!)
- **[ASSISTANTS_API_FIX.md](./ASSISTANTS_API_FIX.md)** - Fix broken API endpoint

### Detailed Guides
- **[CHATKIT_WORKFLOW_SETUP.md](./CHATKIT_WORKFLOW_SETUP.md)** - Complete workflow guide
- **[WORKFLOW_INTEGRATION_COMPLETE.md](./WORKFLOW_INTEGRATION_COMPLETE.md)** - Integration details
- **[WORKFLOW_QUICK_START.md](./WORKFLOW_QUICK_START.md)** - Quick reference

### ChatKit Framework
- **[CHATKIT_README.md](./CHATKIT_README.md)** - ChatKit overview
- **[CHATKIT_QUICK_REFERENCE.md](./CHATKIT_QUICK_REFERENCE.md)** - Reference

---

## 🎓 Understanding the Terms

OpenAI uses different names for the same thing:

| What It's Called | What It Actually Is |
|------------------|---------------------|
| Assistant | Your custom AI agent |
| Agent | Same as Assistant |
| Workflow | Old term for Assistant |
| ChatKit | Framework/approach for building AI chats |

**In your code**:
- Variable: `OPENAI_WORKFLOW_ID` (historical name)
- Value: `asst_abc123...` (Assistant ID)
- API: Assistants API v2

---

## 🔧 Configuration File

**Location**: `/utils/openai-chatkit-config.ts`

**Current setup**:
```typescript
const OPENAI_API_KEY = 'sk-svcacct-...';  // ✅ Set
const OPENAI_WORKFLOW_ID = '';  // ⬜ Empty (using Chat Completions)
```

**To use Assistant**:
```typescript
const OPENAI_API_KEY = 'sk-svcacct-...';  // ✅ Keep same
const OPENAI_WORKFLOW_ID = 'asst_abc123...';  // ✅ Add your ID
```

**Mode detection**:
```typescript
useWorkflow: !!OPENAI_WORKFLOW_ID  // Auto-enables if ID is set
```

---

## 🧪 Testing Commands

Open browser console (F12) and try:

```javascript
// Check current mode
chatKitDebug.printInfo()

// Test API connection
chatKitDebug.testDetailed()

// Check if using assistant
isUsingWorkflow()  // true = assistant mode, false = chat completions

// Get assistant ID
getWorkflowId()  // Returns your assistant ID or undefined
```

---

## 💰 Cost Comparison

### Chat Completions (Current):
- Model: gpt-4o-mini
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens
- Typical message: ~$0.0003

### Assistant (Depends on Configuration):
- Model: Your choice (gpt-4o-mini recommended)
- Cost: Same as model + any tools used
- Typical message: $0.0003 - $0.01+

**Tip**: Stick with gpt-4o-mini in your Assistant for similar costs!

---

## 🚦 Action Plan

### ✅ If Staying with Chat Completions:
1. Do nothing! Already works perfectly.
2. Your AI Agent uses gpt-4o-mini with system prompt.
3. Cost-effective and simple.

### 🔧 If Switching to Assistant:
1. **First**: Fix the code (see [ASSISTANTS_API_FIX.md](./ASSISTANTS_API_FIX.md))
2. **Then**: Create Assistant at https://platform.openai.com/assistants
3. **Finally**: Add Assistant ID to config
4. **Test**: Use the testing commands above

---

## 🐛 Troubleshooting

### "404 Not Found" Error?
- **Cause**: Using old `/workflows/runs` endpoint
- **Fix**: Update code per [ASSISTANTS_API_FIX.md](./ASSISTANTS_API_FIX.md)

### "401 Unauthorized" Error?
- **Cause**: API key issue
- **Fix**: Check `OPENAI_API_KEY` in config

### Still Using Chat Completions?
- **Check**: `chatKitDebug.printInfo()` shows mode
- **Verify**: `OPENAI_WORKFLOW_ID` is not empty
- **Reload**: Page after changing config

### Assistant Not Responding?
- **Verify**: Assistant exists in OpenAI Platform
- **Check**: Assistant ID is correct (starts with `asst_`)
- **Test**: Assistant directly in OpenAI Playground first

---

## 📞 Resources

### OpenAI Platform
- **Assistants**: https://platform.openai.com/assistants
- **API Docs**: https://platform.openai.com/docs/assistants/overview
- **Quickstart**: https://platform.openai.com/docs/assistants/quickstart

### Your Project Docs
- All the `.md` files in your project root
- Comprehensive guides for every aspect

---

## ✅ Checklist

### To Use Chat Completions (Current):
- [x] API key configured
- [x] AI Agent App working
- [x] Visual design matches Figma
- [x] Using gpt-4o-mini
- [ ] Nothing else needed! ✨

### To Use Assistant:
- [ ] Read [ASSISTANTS_API_FIX.md](./ASSISTANTS_API_FIX.md)
- [ ] Update code in `/components/cms/AIAssistant.tsx`
- [ ] Create Assistant in OpenAI Platform
- [ ] Copy Assistant ID
- [ ] Add ID to `/utils/openai-chatkit-config.ts`
- [ ] Reload app
- [ ] Run `chatKitDebug.printInfo()` - shows "Workflow"
- [ ] Test in AI Agent App
- [ ] Success! 🎉

---

## 🎯 Recommendation

**For Now**: Stick with Chat Completions mode
- ✅ Already working perfectly
- ✅ Cost-effective
- ✅ Simple and reliable

**Later**: If you need:
- Custom knowledge bases
- Specialized tools
- No-code configuration
- Then fix the code and switch to Assistant mode

---

## 📝 Summary

1. **Current State**: Using Chat Completions (gpt-4o-mini) - works great!
2. **Assistant Mode**: Available but needs code fix first
3. **To Switch**: 
   - Fix API endpoint ([ASSISTANTS_API_FIX.md](./ASSISTANTS_API_FIX.md))
   - Create Assistant in OpenAI
   - Add Assistant ID to config
4. **Benefit**: No-code configuration, advanced features

---

**Last Updated**: November 5, 2025  
**Status**: Chat Completions Mode Working ✅  
**Assistants Mode**: Code fix needed ([ASSISTANTS_API_FIX.md](./ASSISTANTS_API_FIX.md))  
**Recommendation**: Stay with current setup unless you need Assistant-specific features

---

**Questions?** Check the other documentation files or test with `chatKitDebug` commands!
