import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Plus, Mic, Loader2, MessageSquare, Trash2, X, Edit } from "lucide-react";
import { toast } from "sonner@2.0.3";
import svgPaths from "../../imports/svg-45drj5ad22";
import { 
  getChatKitConfigWithContext, 
  isChatKitConfigured,
  getCurrentModel,
  isUsingWorkflow,
  getWorkflowId
} from "../../utils/openai-chatkit-config";
import {
  getThread,
  updateThreadMessages,
  getCurrentThreadId,
} from "../../utils/conversation-storage";
import { ConversationThread } from "./ConversationThreads";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface AIAgentProps {
  fieldLabel: string;
  currentValue: string;
  onApply: (value: string) => void;
  initialMessage?: string;
  threadId?: string | null;
  onThreadUpdate?: () => void;
  // Thread management props
  threads?: ConversationThread[];
  currentThreadId?: string | null;
  onSelectThread?: (threadId: string) => void;
  onNewThread?: () => void;
  onDeleteThread?: (threadId: string) => void;
  // Show menu button
  showThreadsMenu?: boolean;
  onThreadsMenuClick?: () => void;
  // External control of threads panel
  threadsOpen?: boolean;
  onThreadsOpenChange?: (open: boolean) => void;
}

/**
 * AI Assistant using OpenAI Responses API
 * 
 * This component uses OpenAI's modern Responses API (simpler than Assistants API)
 * with fallback to Chat Completions for compatibility.
 */
export function AIAssistant({ 
  fieldLabel, 
  currentValue, 
  onApply, 
  initialMessage, 
  threadId, 
  onThreadUpdate,
  threads = [],
  currentThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  showThreadsMenu = true,
  onThreadsMenuClick,
  threadsOpen = false,
  onThreadsOpenChange
}: AIAgentProps) {
  const [inputValue, setInputValue] = useState(initialMessage || "");
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist conversation history per field in localStorage
  const storageKey = `ai-conversation-${fieldLabel.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Initialize messages from localStorage or empty array
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('[AI Agent] Failed to load conversation history:', error);
    }
    return [];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('[AI Agent] Failed to save conversation history:', error);
    }
  }, [messages, storageKey]);

  // Check if API is configured
  useEffect(() => {
    setApiConfigured(isChatKitConfigured());
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set initial message if provided
  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      setInputValue(initialMessage);
    }
  }, [initialMessage]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight (content height)
      const newHeight = Math.min(textarea.scrollHeight, 150); // Max 150px
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const getFieldType = (label: string): string => {
    const lower = label.toLowerCase();
    if (lower.includes('bio') || lower.includes('about')) return 'bio';
    if (lower.includes('title') && lower.includes('professional')) return 'title';
    if (lower.includes('experience') && lower.includes('description')) return 'experience';
    if (lower.includes('description')) return 'description';
    if (lower.includes('name')) return 'name';
    if (lower.includes('location')) return 'location';
    return 'description';
  };
  
  const fieldType = getFieldType(fieldLabel);

  // Generate context-aware suggestion buttons
  const getSuggestionButtons = () => {
    if (fieldType === 'bio') {
      return [
        `Help me write a compelling bio`,
        `What makes a great ${fieldLabel.toLowerCase()}?`
      ];
    }
    if (fieldType === 'title') {
      return [
        `Suggest professional titles for me`,
        `How to create an impactful title?`
      ];
    }
    if (fieldType === 'description') {
      return [
        `Help me describe this project`,
        `What details should I include?`
      ];
    }
    if (fieldType === 'experience') {
      return [
        `How to showcase my experience?`,
        `What achievements should I highlight?`
      ];
    }
    return [
      `Help me with this ${fieldLabel.toLowerCase()}`,
      `Give me suggestions for this field`
    ];
  };

  const suggestionButtons = getSuggestionButtons();

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  /**
   * Send message using OpenAI Responses API (with Chat Completions fallback)
   */
  const handleSend = async () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!apiConfigured) {
      toast.error("OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.");
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue("");
    
    // Reset textarea height to default
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    setIsLoading(true);

    // Add user message to UI immediately
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Get configuration with field context
      const config = getChatKitConfigWithContext(fieldLabel, currentValue);
      const useResponsesAPI = isUsingWorkflow();
      
      console.log('[AI Agent] Sending message');
      console.log('[AI Agent] Mode:', useResponsesAPI ? 'Responses API' : 'Chat Completions');
      console.log('[AI Agent] Model:', config.model);
      console.log('[AI Agent] Conversation history:', messages.length, 'previous messages');
      
      // Build messages array with conversation history and field context
      const apiMessages = [
        { role: 'system' as const, content: config.systemPrompt || '' },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
        { 
          role: 'user' as const, 
          content: `Field: ${fieldLabel}\nCurrent Value: ${currentValue || '(empty)'}\n\nUser Request: ${userMessage}`
        }
      ];
      
      console.log('[AI Agent] Total messages in API request:', apiMessages.length, '(1 system +', messages.length, 'history + 1 current)');

      let response;
      
      if (useResponsesAPI) {
        // RESPONSES API MODE: Modern OpenAI Responses API
        console.log('[Responses API] Sending request with', apiMessages.length, 'messages');
        
        response = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
            'OpenAI-Beta': 'responses=v1'
          },
          body: JSON.stringify({
            model: config.model,
            messages: apiMessages,
            temperature: config.temperature,
            max_tokens: 1000
          })
        });
      } else {
        // CHAT COMPLETIONS MODE: Standard Chat Completions API (fallback)
        console.log('[Chat Completions] Sending request');
        
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.model,
            messages: apiMessages,
            temperature: config.temperature,
            max_tokens: 1000
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[AI Agent] API error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your VITE_OPENAI_API_KEY.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Check your OpenAI account status and billing.');
        } else if (response.status === 404 && useResponsesAPI) {
          throw new Error('Responses API not available. Falling back to Chat Completions in next request.');
        } else {
          throw new Error(`API request failed: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Extract message - both APIs use same response format (choices array)
      const assistantMessage = data.choices?.[0]?.message?.content;
      
      if (!assistantMessage) {
        console.error('[AI Agent] Response:', data);
        throw new Error('No response received from AI');
      }
      
      console.log('[AI Agent] Received response');
      
      // Add assistant response to UI
      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessage,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, newAssistantMessage]);
      
    } catch (error: any) {
      console.error('[AI Agent] Error:', error);
      toast.error(error.message || 'Failed to get response from AI Agent');
      
      // Remove the user message if the request failed
      setMessages(prev => prev.filter(m => m.id !== newUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (content: string) => {
    onApply(content);
    toast.success("Applied suggestion to field");
  };

  const handleClearConversation = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
    toast.success("Conversation cleared");
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const sortedThreads = [...threads].sort((a, b) => b.timestamp - a.timestamp);

  const handleThreadsMenuClick = () => {
    if (onThreadsMenuClick) {
      onThreadsMenuClick();
    } else if (onThreadsOpenChange) {
      onThreadsOpenChange(!threadsOpen);
    }
  };

  const handleCloseThreads = () => {
    if (onThreadsOpenChange) {
      onThreadsOpenChange(false);
    }
  };

  return (
    <div className="flex-1 flex relative min-h-0 h-full overflow-hidden w-full">
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-[#f5f4ee] min-h-0 h-full w-full">
        {/* Main conversation area */}
        <div className="flex-1 flex flex-col px-4 pb-0 pt-4 overflow-y-auto min-h-0 overscroll-contain touch-pan-y">
          {messages.length === 0 ? (
            // Empty state
            <div className="flex-1 flex flex-col items-center justify-center px-8">

            </div>
          ) : (
            // Messages
            <div className="space-y-6 p-[0px]">
              {/* Clear conversation button at top */}
              <div className="flex justify-center pt-2 pb-1">
                {/* Clear conversation button removed */}
              </div>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 mr-3 mt-1">
                      {/* Avatar removed */}
                    </div>
                  )}
                  
                  <div className={message.role === 'user' ? 'max-w-[85%]' : 'flex-1'}>
                    <div
                      className={`${
                        message.role === 'user'
                          ? 'rounded-[20px] px-4 py-3 bg-[#ebebeb] text-[#3d3929] ml-auto w-fit'
                          : 'text-[#3d3929]'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    
                    {/* Action icons for assistant messages */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-2 ml-0">
                        <button
                          onClick={() => handleApplySuggestion(message.content)}
                          className="p-1.5 hover:bg-[#ebebeb] rounded-lg transition-colors group"
                          aria-label="Copy"
                          title="Copy to clipboard"
                        >
                          <svg className="w-4 h-4 text-[#83827d] group-hover:text-[#3d3929]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-[#ebebeb] rounded-lg transition-colors group"
                          aria-label="Like"
                        >
                          <svg className="w-4 h-4 text-[#83827d] group-hover:text-[#3d3929]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-[#ebebeb] rounded-lg transition-colors group"
                          aria-label="Dislike"
                        >
                          <svg className="w-4 h-4 text-[#83827d] group-hover:text-[#3d3929]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-[#ebebeb] rounded-lg transition-colors group"
                          aria-label="Share"
                        >
                          <svg className="w-4 h-4 text-[#83827d] group-hover:text-[#3d3929]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            const messageIndex = messages.findIndex(m => m.id === message.id);
                            if (messageIndex > 0) {
                              handleSendMessage(messages[messageIndex - 1].content, true);
                            }
                          }}
                          className="p-1.5 hover:bg-[#ebebeb] rounded-lg transition-colors group"
                          aria-label="Regenerate"
                        >
                          <svg className="w-4 h-4 text-[#83827d] group-hover:text-[#3d3929]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M1 4v6h6M23 20v-6h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-[#ebebeb] rounded-lg transition-colors group"
                          aria-label="More"
                        >
                          <svg className="w-4 h-4 text-[#83827d] group-hover:text-[#3d3929]" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="1.5"/>
                            <circle cx="19" cy="12" r="1.5"/>
                            <circle cx="5" cy="12" r="1.5"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c96442] to-[#b5583b] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 text-[#83827d] animate-spin" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom section with suggestions and input */}
        <div className="bg-[#f5f4ee] shrink-0 px-[8px] sm:px-[12px] pt-[8px] pb-[6px] pb-safe">


          {/* Input bar */}
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full max-w-full">
            {/* Plus button */}
            <div className="bg-[#faf9f5] relative rounded-[24px] shrink-0 size-[40px] hover:bg-[#f0efe8] transition-colors" style={{ cursor: 'pointer' }}>
              <div aria-hidden="true" className="absolute border border-[#dad9d4] border-solid inset-0 pointer-events-none rounded-[24px]" />
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center p-px relative size-full">
                <Plus className="w-[16px] h-[16px] text-[#3d3d3a]" strokeWidth={1.33} />
              </div>
            </div>

            {/* Input container */}
            <div className="basis-0 bg-[#faf9f5] grow min-h-px min-w-0 relative rounded-[24px] shrink-0">
              <div aria-hidden="true" className="absolute border border-[#dad9d4] border-solid inset-0 pointer-events-none rounded-[24px]" />
              <div className="flex flex-row items-center size-full">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] items-center pl-[13px] pr-[5px] py-[5px] relative w-full">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'end' });
                      }, 300);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !isLoading) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="What's in your mind?"
                    disabled={isLoading}
                    rows={1}
                    className="basis-0 grow min-h-px min-w-0 bg-transparent outline-none font-['Arial:Regular',sans-serif] leading-[21px] not-italic relative shrink text-[#7a776c] text-[14px] placeholder:text-[#7a776c] disabled:opacity-50 resize-none overflow-hidden"
                  />
                  
                  {/* Mic and Send button container */}
                  <div className="h-[32px] relative shrink-0 w-[68px] flex-shrink-0">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[32px] items-center relative w-full">
                      {/* Mic button */}
                      <button 
                        className="bg-[#faf9f5] relative rounded-[2.23696e+07px] shrink-0 size-[24px] hover:bg-[#ebebeb]/30 transition-colors" 
                        disabled={isLoading}
                      >
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-full">
                          <MicIcon />
                        </div>
                      </button>

                      {/* AI Send button */}
                      <button 
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                        className="basis-0 bg-[#c96442] grow h-[32px] min-h-px min-w-px relative rounded-[24px] shrink-0 hover:bg-[#b5583b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                      >
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[32px] items-center justify-center relative w-full">
                          {isLoading ? (
                            <Loader2 className="w-[16px] h-[16px] text-white animate-spin" />
                          ) : (
                            <SendIcon />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M8 12.6667V14.6667" id="Vector" stroke="var(--stroke-0, #3D3D3A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p4f72080} id="Vector_2" stroke="var(--stroke-0, #3D3D3A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1c53e800} id="Vector_3" stroke="var(--stroke-0, #3D3D3A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function SendIcon() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_20_948)" id="Icon">
          <path d={svgPaths.p340d8400} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
          <path d="M13.3333 2V4.66667" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
          <path d="M14.6667 3.33333H12" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
          <path d="M2.66667 11.3333V12.6667" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
          <path d="M3.33333 12H2" id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
        </g>
        <defs>
          <clipPath id="clip0_20_948">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}