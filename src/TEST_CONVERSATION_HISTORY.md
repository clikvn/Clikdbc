# 🧪 Test Conversation History

Quick test to verify conversation history is working!

---

## ✅ Quick Test (2 minutes)

### Step 1: Start a Conversation

1. Go to: http://localhost:5173/my_profile
2. Click the AI ✨ icon next to "Bio" field
3. Send message: **"Help me write a bio"**
4. Wait for AI response
5. ✅ You should get a helpful response

### Step 2: Continue the Conversation

6. Send message: **"Make it more professional"**
7. Wait for AI response
8. ✅ AI should refine based on previous context

### Step 3: Test Persistence

9. **Close the AI Agent drawer** (click X or outside)
10. **Reopen** the AI Agent for "Bio" field
11. ✅ **BOTH previous messages should still be there!**

### Step 4: Test Clear

12. Click **"Clear conversation"** button at top
13. ✅ All messages disappear
14. ✅ Toast notification: "Conversation cleared"

---

## 🔍 What to Check in Console

Open browser console (F12) and look for:

### When Opening AI Agent:
```
[AI Agent] Loaded N messages from conversation history
```

### When Sending Message:
```
[AI Agent] Sending message
[AI Agent] Conversation history: 2 previous messages
[AI Agent] Total messages in API request: 4 (1 system + 2 history + 1 current)
```

**If you see these logs** → ✅ Conversation history is working!

---

## 🎯 Advanced Test: Per-Field Isolation

### Test Different Fields Have Different Conversations:

1. **Bio conversation**:
   - Open AI Agent for "Bio"
   - Send: "I'm a software engineer"
   - AI responds

2. **Title conversation**:
   - Open AI Agent for "Professional Title"
   - Send: "Suggest a title"
   - AI responds (different conversation!)

3. **Verify isolation**:
   - Go back to "Bio" AI Agent
   - ✅ Should show "I'm a software engineer" conversation
   - Go to "Title" AI Agent
   - ✅ Should show "Suggest a title" conversation

**Result**: Each field has its own separate conversation! ✅

---

## 🐛 If Something's Wrong

### Conversation not saving?

**Check console for errors**:
```javascript
[AI Agent] Failed to save conversation history: [error]
```

**Possible causes**:
- localStorage disabled
- Private/incognito mode
- localStorage full

### Conversation not loading?

**Check console**:
```javascript
[AI Agent] Failed to load conversation history: [error]
```

**Try**:
- Refresh page
- Clear browser cache
- Check localStorage in DevTools

### Want to manually check localStorage?

**Console command**:
```javascript
// View all AI conversations
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('ai-conversation-')) {
    console.log(key, JSON.parse(localStorage[key]));
  }
});
```

---

## ✅ Expected Behavior

### ✅ Working Correctly If:

- [x] Messages persist when closing/reopening AI Agent
- [x] AI responses reference previous messages
- [x] Each field has separate conversation
- [x] "Clear conversation" button removes all messages
- [x] Console logs show conversation history count
- [x] New messages auto-save to localStorage

### ❌ Not Working If:

- [ ] Messages disappear when reopening
- [ ] AI doesn't remember previous context
- [ ] All fields share same conversation
- [ ] Clear button doesn't work
- [ ] Console shows 0 previous messages (when there should be some)

---

## 🎉 Success Criteria

**You know it's working when**:

1. **Persistence**: Messages remain after closing/reopening ✅
2. **Context**: AI references previous messages ✅
3. **Isolation**: Each field has separate history ✅
4. **Clearable**: Can start fresh anytime ✅
5. **Console logs**: Show correct message counts ✅

**If all 5 pass** → 🎊 Conversation history is working perfectly!

---

## 📝 Example Successful Test

```
Step 1:
  User: "Help me write a bio"
  AI: "I'd be happy to help! What's your profession?"

Step 2:
  User: "Software engineer"
  AI: "Here's a professional bio for a software engineer: ..."

Step 3: Close and reopen AI Agent
  ✅ Both messages above are still visible!

Step 4: Continue
  User: "Make it more technical"
  AI: "Here's a more technical version: ..." 
      [AI remembers you're a software engineer!]

Step 5: Check console
  [AI Agent] Conversation history: 4 previous messages
  ✅ Correct count!
```

---

**Test Status**: Ready to run  
**Duration**: 2 minutes  
**Difficulty**: Easy  

**Go ahead and test it now!** 🚀
