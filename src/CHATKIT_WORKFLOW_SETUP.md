# 🔧 ChatKit Workflow Setup Guide

Complete guide for using OpenAI Workflows with your AI Agent App.

---

## 📖 What Are ChatKit Workflows?

**ChatKit Workflows** let you create custom AI agents in the OpenAI platform with:
- ✨ Pre-configured instructions and behavior
- 🧠 Custom knowledge bases
- 🔧 Specialized tools and capabilities
- 📊 Structured conversation flows

Instead of using the generic Chat Completions API, you reference your pre-built workflow by ID.

---

## 🎯 Two Modes Available

### Mode 1: Chat Completions (Default) ✅
**Current default if no workflow ID is set**

- Uses: `gpt-4o-mini` model
- Configuration: System prompt in code
- Flexibility: Full control in code

### Mode 2: Workflow (Advanced) 🚀
**Activated when you set `VITE_OPENAI_WORKFLOW_ID`**

- Uses: Your custom workflow from OpenAI platform
- Configuration: Managed in OpenAI dashboard
- Flexibility: Change behavior without code changes

---

## ⚡ Quick Setup

### Step 1: Create Workflow in OpenAI

1. Go to: https://platform.openai.com/
2. Navigate to **Workflows** or **Agents** section
3. Click **Create Workflow** or **Create Agent**
4. Configure your agent:
   - **Name**: Business Card AI Assistant
   - **Instructions**: Customize for business card creation
   - **Model**: Choose your preferred model
   - **Tools**: Add any tools you need
5. **Save** and copy the **Workflow ID**
   - Format: `workflow_abc123xyz...` (long alphanumeric string)

### Step 2: Add to Your `.env` File

```bash
# Your existing API key
VITE_OPENAI_API_KEY=sk-your-api-key-here

# NEW: Add your workflow ID
VITE_OPENAI_WORKFLOW_ID=workflow_abc123xyz456...
```

### Step 3: Restart Development Server

```bash
npm run dev
```

### Step 4: Test It! 🎉

Open browser console (F12):
```javascript
chatKitDebug.printInfo()
// Should show: Mode: Workflow (ID: workflow_...)
```

**Done!** Your AI Agent now uses your custom workflow! 🎊

---

## 🔍 How It Works

### With Workflow ID Set:

```
User Message
   ↓
AIAssistant Component
   ↓
Detects: VITE_OPENAI_WORKFLOW_ID exists
   ↓
POST https://api.openai.com/v1/workflows/runs
   {
     workflow_id: "workflow_abc123...",
     input: {
       message: "Field: Bio, Value: ..., User: Help me write a bio",
       conversation_history: [...]
     }
   }
   ↓
OpenAI Workflow executes with your custom config
   ↓
Response returned to user
```

### Without Workflow ID (Default):

```
User Message
   ↓
AIAssistant Component
   ↓
No workflow ID detected
   ↓
POST https://api.openai.com/v1/chat/completions
   {
     model: "gpt-4o-mini",
     messages: [...],
     temperature: 0.7
   }
   ↓
Standard ChatGPT response
   ↓
Response returned to user
```

---

## 🎨 Workflow Instructions Example

When creating your workflow in OpenAI, here's a recommended instruction set:

```
You are a professional AI assistant specialized in helping users create 
compelling digital business cards.

Your role:
- Help users write engaging professional bios
- Suggest impactful portfolio descriptions
- Craft attention-grabbing headlines
- Improve existing content to be more professional and memorable

Guidelines:
1. Always maintain a professional but friendly tone
2. Keep suggestions concise and actionable
3. Provide 2-3 options when appropriate
4. Consider the specific field context provided
5. Make content ready to use (no placeholders)

Input Format:
You'll receive messages with:
- Field: The specific field being edited (e.g., "Bio", "Portfolio Description")
- Current Value: The user's existing text (if any)
- User Request: What the user wants help with

Output Format:
Provide clear, ready-to-use suggestions that can be directly applied to the field.
```

---

## ⚙️ Configuration Options

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key |
| `VITE_OPENAI_WORKFLOW_ID` | ⭕ Optional | Workflow ID (enables workflow mode) |

### Auto-Detection

The app automatically detects which mode to use:

```typescript
// In openai-chatkit-config.ts
const OPENAI_WORKFLOW_ID = import.meta.env.VITE_OPENAI_WORKFLOW_ID || '';
useWorkflow: !!OPENAI_WORKFLOW_ID, // Auto-enables if set
```

---

## 🧪 Testing Your Workflow

### 1. Check Configuration

```javascript
// Open browser console (F12)
chatKitDebug.printInfo()

// Should show:
// ✅ Configuration looks good!
// Mode: Workflow (ID: workflow_abc123...)
```

### 2. Test Connection

```javascript
chatKitDebug.testDetailed()

// Will test your workflow connection
```

### 3. Test in App

1. Go to `/my_profile`
2. Click AI icon next to any field
3. Send a message
4. Should get response from your custom workflow! 🎉

---

## 🔄 Switching Modes

### To Use Workflow Mode:
```bash
# .env
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_WORKFLOW_ID=workflow_abc123...
```
Then restart server.

### To Use Chat Completions Mode:
```bash
# .env
VITE_OPENAI_API_KEY=sk-...
# VITE_OPENAI_WORKFLOW_ID=  # Comment out or remove
```
Then restart server.

### Verify Current Mode:
```javascript
chatKitDebug.printInfo()
// Shows: "Mode: Workflow" or "Mode: Chat Completions"
```

---

## 💰 Cost Comparison

### Chat Completions Mode (Default)
- **Model**: gpt-4o-mini
- **Cost**: ~$0.0003 per message
- **Predictable**: Same cost every time

### Workflow Mode
- **Model**: Depends on workflow configuration
- **Cost**: Varies based on:
  - Model used in workflow
  - Tools/functions called
  - Knowledge base usage
- **Potentially Higher**: If using gpt-4o or tools

💡 **Tip**: Check your workflow settings to understand costs.

---

## 🎯 When to Use Each Mode

### Use Chat Completions (Default) If:
- ✅ You want simple, predictable behavior
- ✅ You prefer to configure in code
- ✅ You want the lowest cost option
- ✅ You don't need advanced features

### Use Workflow Mode If:
- ✅ You want to customize without code changes
- ✅ You need specialized knowledge bases
- ✅ You want to use custom tools/functions
- ✅ You prefer managing config in OpenAI dashboard
- ✅ You want more sophisticated AI behavior

---

## 🔧 Advanced Configuration

### Custom Field Context

The workflow receives field context automatically:

```typescript
// In AIAssistant.tsx
const contextualMessage = `
Field: ${fieldLabel}
Current Value: ${currentValue || '(empty)'}

User Request: ${userMessage}
`;

// Sent to workflow as:
{
  workflow_id: "workflow_...",
  input: {
    message: contextualMessage,
    conversation_history: [...]
  }
}
```

### Accessing in Workflow

In your workflow instructions, reference:
- **{{input.message}}** - The full contextual message
- **{{input.conversation_history}}** - Previous messages

---

## 🐛 Troubleshooting

### "No response received from workflow"

**Check**:
1. Workflow ID is correct
2. Workflow is active in OpenAI platform
3. API key has access to workflows

**Debug**:
```javascript
chatKitDebug.testDetailed()
```

### Workflow Returns Unexpected Format

**Check console logs**:
```javascript
// Look for:
[ChatKit] Workflow response: {...}
```

**Common issues**:
- Workflow output structure changed
- Workflow not returning expected format

**Fix**: Update response extraction in `AIAssistant.tsx`

### API Error 404 (Not Found)

**Possible causes**:
- Workflow ID doesn't exist
- Workflow was deleted
- Typo in workflow ID

**Fix**: Verify workflow ID in OpenAI platform

---

## 📊 Monitoring Usage

### In OpenAI Dashboard

1. Go to: https://platform.openai.com/usage
2. Filter by:
   - **API Type**: Workflows
   - **Workflow ID**: Your workflow ID
3. View:
   - Number of runs
   - Token usage
   - Cost breakdown

---

## 🔒 Security Considerations

### API Key Protection
- ✅ Keep API key in `.env`
- ✅ Add `.env` to `.gitignore`
- ✅ Never commit API keys

### Workflow ID
- ✅ Safe to commit (not sensitive)
- ℹ️ Workflow ID is not secret
- ⚠️ But others need your API key to use it

---

## 📚 Examples

### Example 1: Basic Workflow

```bash
# .env
VITE_OPENAI_API_KEY=sk-proj-abc123...
VITE_OPENAI_WORKFLOW_ID=workflow_xyz789...
```

**Workflow Settings** (in OpenAI platform):
- **Model**: gpt-4o-mini
- **Instructions**: "Help users write professional business card content..."
- **Temperature**: 0.7

### Example 2: Advanced Workflow with Tools

```bash
# .env
VITE_OPENAI_API_KEY=sk-proj-abc123...
VITE_OPENAI_WORKFLOW_ID=workflow_advanced123...
```

**Workflow Settings**:
- **Model**: gpt-4o
- **Instructions**: Custom business card expert persona
- **Tools**: Web search, code interpreter
- **Knowledge Base**: Business writing guidelines
- **Temperature**: 0.8

---

## 🎓 Best Practices

### 1. Start Simple
Begin with Chat Completions mode, then upgrade to Workflow when needed.

### 2. Version Your Workflows
Create multiple workflows for different use cases:
- `workflow_bio_expert` - Specializes in bios
- `workflow_portfolio_writer` - For portfolio descriptions
- `workflow_general_helper` - General assistance

### 3. Test Before Deploying
Always test workflow changes in dev environment first.

### 4. Monitor Costs
Set up usage alerts in OpenAI dashboard.

### 5. Document Your Workflows
Keep track of:
- Workflow IDs
- Purpose
- Configuration
- Last updated date

---

## 🔄 Migration Guide

### From Chat Completions to Workflow

**Before**:
```bash
# .env
VITE_OPENAI_API_KEY=sk-...
```

**After**:
```bash
# .env
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_WORKFLOW_ID=workflow_...  # Added
```

**Steps**:
1. Create workflow in OpenAI platform
2. Copy instructions from `openai-chatkit-config.ts` → systemPrompt
3. Add workflow ID to `.env`
4. Restart server
5. Test with `chatKitDebug.testDetailed()`

**Benefits**:
- ✅ No code changes needed
- ✅ Can update behavior without redeploying
- ✅ Access to advanced features

---

## 📞 Support

### Resources
- **Workflows Docs**: https://platform.openai.com/docs/guides/workflows
- **ChatKit Docs**: https://platform.openai.com/docs/guides/chatkit
- **API Reference**: https://platform.openai.com/docs/api-reference

### Debug Commands
```javascript
chatKitDebug.printInfo()        // Check mode
chatKitDebug.testDetailed()     // Test connection
isUsingWorkflow()               // Check if workflow mode active
getWorkflowId()                 // Get current workflow ID
```

---

## ✅ Checklist

- [ ] Created workflow in OpenAI platform
- [ ] Copied workflow ID
- [ ] Added `VITE_OPENAI_WORKFLOW_ID` to `.env`
- [ ] Restarted development server
- [ ] Ran `chatKitDebug.printInfo()` - shows "Workflow" mode
- [ ] Tested in AI Agent App
- [ ] Workflow responds correctly
- [ ] Monitored usage in OpenAI dashboard

---

## 🎉 You're Done!

Your AI Agent App now uses your **custom ChatKit Workflow**!

Every AI interaction now goes through your workflow with:
- ✅ Your custom instructions
- ✅ Your chosen model
- ✅ Your specialized tools
- ✅ Your knowledge base

**Enjoy your enhanced AI Agent!** 🚀

---

**Last Updated**: November 4, 2025  
**Mode**: ChatKit Workflows  
**Status**: Production Ready ✅
