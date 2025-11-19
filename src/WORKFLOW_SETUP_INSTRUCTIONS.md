# 🚀 Quick Workflow Setup Instructions

**Goal**: Connect your OpenAI Assistant to the AI Agent in your app

---

## ✅ Current Status

- **Mode**: Chat Completions (using gpt-4o-mini)
- **Workflow**: Not configured yet
- **Infrastructure**: ✅ Ready (workflow support already built-in)

---

## 📝 3-Step Setup

### Step 1: Create Your OpenAI Assistant

1. **Open**: https://platform.openai.com/assistants
2. **Click**: "Create" button
3. **Fill in**:

```
Name: Business Card Content Assistant

Instructions:
You are a professional AI assistant specializing in digital business cards.

Help users write compelling professional bios, engaging portfolio descriptions, 
and impactful headlines. Always maintain a professional but friendly tone, 
keep suggestions concise and actionable, and provide 2-3 options when helpful.

When you receive input, it will include:
- Field: The specific field being edited
- Current Value: Existing text (if any)
- User Request: What they need help with

Provide clear, ready-to-use suggestions that can be directly applied.

Model: gpt-4o-mini
Temperature: 0.7
```

4. **Save** and **copy the Assistant ID** (starts with `asst_`)

### Step 2: Add Assistant ID to Your Code

1. **Open**: `/utils/openai-chatkit-config.ts`
2. **Find** line 23-24:
   ```typescript
   const OPENAI_WORKFLOW_ID = '';  // Currently empty
   ```
3. **Replace** with your Assistant ID:
   ```typescript
   const OPENAI_WORKFLOW_ID = 'asst_YOUR_ID_HERE';
   ```

### Step 3: Test It!

1. **Reload** your app (the config is hardcoded, no server restart needed)
2. **Open browser console** (F12)
3. **Type**: `chatKitDebug.printInfo()`
4. **Should see**:
   ```
   ✅ Configuration looks good!
   Mode: Workflow (ID: asst_...)
   ```

**Done!** Your AI Agent now uses your custom assistant! 🎉

---

## 🧪 Testing Your Workflow

### In the App:
1. Go to `/my_profile` (CMS)
2. Click the AI ✨ icon next to any field
3. Send a message: "Help me write a professional bio"
4. Get response from **your custom assistant**!

### In Console:
```javascript
// Check mode
chatKitDebug.printInfo()

// Test connection
chatKitDebug.testDetailed()

// Check if using workflow
isUsingWorkflow()  // Should return: true

// Get workflow ID
getWorkflowId()  // Should return: 'asst_...'
```

---

## 🔄 Switching Modes

### Use Your Assistant (Workflow Mode):
```typescript
// In /utils/openai-chatkit-config.ts
const OPENAI_WORKFLOW_ID = 'asst_abc123...';  // ✅ Set your ID
```

### Use Chat Completions (Default Mode):
```typescript
// In /utils/openai-chatkit-config.ts
const OPENAI_WORKFLOW_ID = '';  // ⬜ Leave empty
```

No server restart needed - just reload the page!

---

## 🎯 What's an Assistant ID?

When you create an Assistant in OpenAI Platform, you get an ID like:
- `asst_abc123xyz456789...`

This is what you paste into `OPENAI_WORKFLOW_ID`.

**Note**: The documentation sometimes calls these "workflows" or "assistants" - they're the same thing in the ChatKit framework!

---

## 🔍 How It Works

### Without Workflow ID (Current):
```
User → AIAssistant → Chat Completions API → gpt-4o-mini → Response
```

### With Workflow ID (After Setup):
```
User → AIAssistant → Assistants API → Your Custom Assistant → Response
```

Your assistant receives:
- Field context (e.g., "Bio", "Portfolio Description")
- Current value in that field
- User's request
- Previous conversation

---

## 💡 Benefits of Using Your Assistant

✅ **No code changes needed** - Update instructions in OpenAI Platform
✅ **Consistent behavior** - All team members use same assistant
✅ **Advanced features** - Add tools, knowledge bases, file search
✅ **Easy A/B testing** - Switch between different assistants
✅ **Version control** - Create multiple assistants for different purposes

---

## 📊 Endpoint Differences

### Chat Completions (Default):
```
POST https://api.openai.com/v1/chat/completions
Body: { model: "gpt-4o-mini", messages: [...] }
```

### Assistants/Workflow (After Setup):
```
POST https://api.openai.com/v1/assistants/{assistant_id}/threads/runs
Body: { thread_id: "...", message: "..." }
```

**Note**: Your app handles this automatically based on whether `OPENAI_WORKFLOW_ID` is set!

---

## 🐛 Troubleshooting

### "404 Not Found" Error?
- Check Assistant ID is correct
- Verify assistant exists in OpenAI Platform
- Make sure API key has access to assistants

### Still Using Chat Completions?
```javascript
chatKitDebug.printInfo()
// Should show "Workflow" not "Chat Completions"
```
- Check `OPENAI_WORKFLOW_ID` is not empty
- Reload the page
- Check browser console for errors

### Assistant Not Responding Correctly?
- Check assistant instructions in OpenAI Platform
- Make sure model is set (gpt-4o-mini recommended)
- Test assistant directly in OpenAI Playground first

---

## 📚 Resources

- **OpenAI Assistants**: https://platform.openai.com/assistants
- **ChatKit Docs**: https://platform.openai.com/docs/guides/chatkit
- **Assistants API**: https://platform.openai.com/docs/assistants/overview
- **Your Existing Docs**: 
  - [CHATKIT_WORKFLOW_SETUP.md](./CHATKIT_WORKFLOW_SETUP.md) - Detailed guide
  - [WORKFLOW_QUICK_START.md](./WORKFLOW_QUICK_START.md) - Quick reference

---

## ✅ Quick Checklist

- [ ] Created Assistant in OpenAI Platform
- [ ] Copied Assistant ID (starts with `asst_`)
- [ ] Added ID to `/utils/openai-chatkit-config.ts`
- [ ] Reloaded app page
- [ ] Ran `chatKitDebug.printInfo()` - shows "Workflow" mode
- [ ] Tested in AI Agent App - works! 🎉

---

## 🎉 You're Ready!

Once you add your Assistant ID, every AI interaction will use your custom assistant with:
- ✅ Your custom instructions
- ✅ Your chosen model
- ✅ Your specialized configuration
- ✅ Field context automatically included

**Happy building!** 🚀

---

**Last Updated**: November 5, 2025  
**Status**: Ready for Assistant ID  
**Next Step**: Add your Assistant ID from OpenAI Platform
