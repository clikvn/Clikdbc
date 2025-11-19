# ⚡ Workflow Quick Start

**Get your ChatKit Workflow running in 3 minutes!**

---

## 🎯 What You Need

From OpenAI when you created your workflow/agent:
- ✅ **Workflow ID** (looks like: `workflow_abc123xyz...`)

---

## 🚀 3-Step Setup

### 1️⃣ Add to `.env`

```bash
# Your existing API key
VITE_OPENAI_API_KEY=sk-your-api-key-here

# NEW: Add this line with your workflow ID
VITE_OPENAI_WORKFLOW_ID=workflow_abc123xyz456...
```

### 2️⃣ Restart Server

```bash
npm run dev
```

### 3️⃣ Test It

Open browser console (F12):
```javascript
chatKitDebug.printInfo()
```

Should show:
```
✅ Configuration looks good!
📦 Using: ChatKit Workflow Mode
🔧 Workflow: workflow_abc123...
```

**Done! ✅** Your AI Agent now uses your custom workflow!

---

## 🧪 Test in App

1. Go to `/my_profile`
2. Click AI icon ✨ next to any field
3. Send a message
4. Get response from **your workflow**! 🎉

---

## 🔄 Switch Back to Chat Mode

Want to use regular ChatGPT instead of workflow?

```bash
# In .env, comment out or remove:
# VITE_OPENAI_WORKFLOW_ID=workflow_...
```

Restart server. Done!

---

## 📊 Check Which Mode You're Using

```javascript
// In browser console
chatKitDebug.printInfo()

// Shows:
// "Mode: Workflow" ← Using your workflow
// or
// "Mode: Chat Completions" ← Using standard ChatGPT
```

---

## 🐛 Not Working?

### Error: "No response received from workflow"

**Fix**:
1. Double-check workflow ID is correct
2. Make sure workflow is active in OpenAI platform
3. Verify API key has access to workflows

**Test**:
```javascript
chatKitDebug.testDetailed()
```

### Can't Find Workflow ID?

1. Go to: https://platform.openai.com/
2. Navigate to **Workflows** or **Agents**
3. Find your workflow
4. Copy the ID (usually shows under the name)

---

## 💡 Pro Tips

### Tip 1: Test Both Modes
Try with and without workflow ID to see the difference!

### Tip 2: Multiple Workflows
Create different workflows for different purposes:
- One for bios
- One for portfolio descriptions
- One for general help

Switch between them by changing `VITE_OPENAI_WORKFLOW_ID`

### Tip 3: Update Without Code
Change your workflow settings in OpenAI platform - no code changes needed!

---

## 📚 Learn More

- **Full Guide**: [CHATKIT_WORKFLOW_SETUP.md](./CHATKIT_WORKFLOW_SETUP.md)
- **Workflow Docs**: https://platform.openai.com/docs/guides/workflows

---

## ✅ Checklist

- [ ] Got workflow ID from OpenAI platform
- [ ] Added to `.env` as `VITE_OPENAI_WORKFLOW_ID`
- [ ] Restarted dev server
- [ ] Ran `chatKitDebug.printInfo()`
- [ ] Saw "Workflow Mode" message
- [ ] Tested in AI Agent App
- [ ] Got response from workflow ✨

---

**Need Help?** Run `chatKitDebug.testDetailed()` for detailed diagnostics.

**Status**: Ready to use workflows! 🎊
