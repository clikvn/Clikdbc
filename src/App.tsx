import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

// TypeScript declarations for visualViewport API
declare global {
  interface Window {
    visualViewport?: {
      height: number;
      width: number;
      addEventListener: (event: string, handler: () => void) => void;
      removeEventListener: (event: string, handler: () => void) => void;
    };
  }
}
import svgPaths from "./imports/svg-ryed6k4ibx";
const imgImg = "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcmlvciUyMGRlc2lnbiUyMG1vZGVybiUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzYzNTE3NzEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
import Contact from "./imports/Contact";
import contactSvgPaths from "./imports/svg-1txqd1yzsg";
import profileSvgPaths from "./imports/svg-i5dwj49pkv";
import portfolioSvgPaths from "./imports/svg-si0rv80jbp";
import { Copy, Check, Play, Pause, Eye, Hand, MoveHorizontal, Maximize, X, ChevronLeft, ChevronRight, Expand, Home, User, Briefcase, Mail, Sparkles, CreditCard, FileText, LogOut, LogIn, Bot, Plus, MessageSquare, Trash2, Share2, BarChart3 } from "lucide-react";
import { AspectRatio } from "./components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./components/ui/sheet";
import { CMSDashboard } from "./components/cms/CMSDashboard";
import { BusinessCardStudio } from "./components/cms/BusinessCardStudio";
import { loadBusinessCardData, userExists, ensureDefaultUserExists } from "./utils/storage";
import { loadFilteredBusinessCardData } from "./utils/filtered-data-loader";
import { BusinessCardData, messagingUrlPatterns, socialChannelUrlPatterns, PortfolioCategory, PortfolioItem } from "./types/business-card";
import { parseProfileImage } from "./utils/profile-image-utils";
import { calculateBackgroundImagePosition } from "./utils/home-background-positioning";
import "./utils/openai-test"; // Load OpenAI test utility for console testing
import "./utils/openai-debug"; // Load OpenAI debug utility for console testing
import "./utils/openai-status-display"; // Show OpenAI status on page load
import { AIAssistant } from "./components/cms/AIAssistant";
import { ConversationThread } from "./components/cms/ConversationThreads";
import { 
  getAllThreads, 
  createThread, 
  deleteThread, 
  getThreadsSummary, 
  getCurrentThreadId,
  setCurrentThreadId 
} from "./utils/conversation-storage";
import { copyWithToast } from "./utils/clipboard-utils";
import { parseProfileUrl, buildProfileUrl, buildCMSUrl, getUserCode } from "./utils/user-code";
import { useFilteredBusinessCardData } from "./hooks/useFilteredBusinessCardData";
import { useIsFieldVisible } from "./hooks/useFieldVisibility";
import { useAnalyticsTracking } from "./hooks/useAnalytics";
import { trackPageView } from "./utils/analytics";

function HomeBackgroundImage() {
  const data = useFilteredBusinessCardData();

  // Parse profile image data
  const profileImageData = parseProfileImage(data?.personal.profileImage || '');
  const imageUrl = profileImageData?.imageUrl || imgImg;
  const bgPosition = calculateBackgroundImagePosition(profileImageData);

  return (
    <div className="relative shrink-0 w-full overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }} data-name="home-background-image">
      <div className="absolute bottom-0 left-0 right-0 top-0" data-name="img">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0">
            <img 
              alt="" 
              className="absolute h-full w-full object-contain" 
              src={imageUrl}
              style={{
                transform: bgPosition.transform,
                transformOrigin: bgPosition.transformOrigin
              }}
            />
          </div>
          <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-b from-transparent to-[#c96442]" style={{ height: 'min(550px, calc(var(--vh, 1vh) * 70))' }} />
        </div>
      </div>
    </div>
  );
}

function SubTitle({ title, businessName }: { title: string; businessName: string }) {
  return (
    <div className="box-border content-stretch flex gap-[16px] items-center pb-0 pt-[8px] px-0 relative shrink-0 w-full" data-name="sub-title">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-slate-50 overflow-hidden">
        <p className="leading-[20px] truncate">{title}</p>
      </div>
      {businessName && (
        <div className="flex gap-[6px] items-center">
          <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Building Icon">
            <div className="absolute inset-[8.33%]" data-name="Vector (Stroke)">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 13V3C2 2.44772 2.44772 2 3 2H7C7.55228 2 8 2.44772 8 3V5H11C11.5523 5 12 5.44772 12 6V13M2 13H12M2 13H1M12 13H13M4 5H6M4 7H6M4 9H6M9 7H11M9 9H11M9 11H11" stroke="#F8FAFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-slate-50">
            <p className="leading-[20px] whitespace-pre">{businessName}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook to calculate optimal font size for name based on available space
function useNameFontSize(cardHeight: number, cardWidth: number, name: string) {
  const [fontSize, setFontSize] = useState(24);
  const [nameLines, setNameLines] = useState(1);
  
  useEffect(() => {
    if (!name || cardHeight === 0 || cardWidth === 0) return;
    
    // Calculate constraints based on cardHeight breakpoints
    let nameHeight: number;
    let nameWidth: number;
    let maxLines: number;
    
    if (cardHeight < 320) {
      nameHeight = cardHeight - 272;
      nameWidth = cardWidth - 48;
      maxLines = 1;
    } else if (cardHeight < 350) {
      nameHeight = cardHeight - 290;
      nameWidth = cardWidth - 48;
      maxLines = 1;
    } else if (cardHeight < 400) {
      nameHeight = cardHeight - 308;
      nameWidth = cardWidth - 48;
      maxLines = 2;
    } else {
      nameHeight = cardHeight - 326;
      nameWidth = cardWidth - 48;
      maxLines = 2;
    }
    
    // Ensure positive values
    nameHeight = Math.max(nameHeight, 10);
    nameWidth = Math.max(nameWidth, 50);
    
    // Create canvas for text measurement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Find the largest font size that fits
    let optimalSize = 24;
    const minSize = 12;
    const maxSize = 60;
    
    for (let testSize = maxSize; testSize >= minSize; testSize -= 1) {
      ctx.font = `bold ${testSize}px Inter`;
      const metrics = ctx.measureText(name);
      const textWidth = metrics.width;
      
      // Calculate line height (1.17 as specified in the original code)
      const lineHeight = testSize * 1.17;
      
      // Check if text fits in one line
      if (maxLines === 1) {
        if (textWidth <= nameWidth && lineHeight <= nameHeight) {
          optimalSize = testSize;
          setNameLines(1);
          break;
        }
      } else {
        // For 2 lines, check if text fits when wrapped
        const words = name.split(' ');
        let lines = 1;
        let currentLineWidth = 0;
        
        for (const word of words) {
          const wordWidth = ctx.measureText(word + ' ').width;
          if (currentLineWidth + wordWidth > nameWidth) {
            lines++;
            currentLineWidth = wordWidth;
          } else {
            currentLineWidth += wordWidth;
          }
        }
        
        const totalHeight = lineHeight * lines;
        
        if (lines <= maxLines && totalHeight <= nameHeight) {
          optimalSize = testSize;
          setNameLines(lines);
          break;
        }
      }
    }
    
    setFontSize(optimalSize);
    console.log('Name font calculation:', { 
      cardHeight, 
      nameHeight, 
      nameWidth, 
      maxLines, 
      fontSize: optimalSize,
      calculatedLines: nameLines
    });
    
  }, [cardHeight, cardWidth, name]);
  
  return { fontSize, nameLines };
}

function Container({ onNavigateToContact, name, title, businessName, cardHeight, cardWidth }: { 
  onNavigateToContact: () => void; 
  name: string; 
  title: string; 
  businessName: string;
  cardHeight: number;
  cardWidth: number;
}) {
  const { fontSize, nameLines } = useNameFontSize(cardHeight, cardWidth, name);
  
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" style={{ gap: '8px' }} data-name="container">
      <button
        onClick={onNavigateToContact}
        className="overflow-clip relative shrink-0 size-[20px] cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
        data-name="Chevron Icon"
        aria-label="Open contact"
      >
        <div className="absolute inset-[33.33%_20.83%]" data-name="Vector (Stroke)">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7">
            <path clipRule="evenodd" d={svgPaths.p2c9b2300} fill="var(--fill-0, #F8FAFC)" fillRule="evenodd" id="Vector (Stroke)" />
          </svg>
        </div>
      </button>
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-slate-50 tracking-[-0.576px] w-[min-content]">
        <p 
          className="leading-[1.17]"
          style={{
            fontSize: `${fontSize}px`,
            ...(nameLines === 1 ? { whiteSpace: 'nowrap' } : {
              display: '-webkit-box',
              WebkitLineClamp: nameLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word'
            })
          }}
        >
          {name}
        </p>
      </div>
      <SubTitle title={title} businessName={businessName} />
    </div>
  );
}

function HomeNavBar({ onProfileClick, onPortfolioClick, onSaveClick, onShareClick }: {
  onProfileClick: () => void;
  onPortfolioClick: () => void;
  onSaveClick: () => void;
  onShareClick: () => void;
}) {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full h-[72px]" data-name="home-nav-bar">
      <button
        onClick={onProfileClick}
        className="content-stretch flex flex-col gap-[8px] items-center justify-center relative rounded-[12px] shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        data-name="home-nav-profile-button"
      >
        <div className="backdrop-blur-lg backdrop-filter bg-[#e9e6dc] box-border content-stretch flex gap-[8px] items-center justify-center p-[12px] relative rounded-[100px] shrink-0" data-name="Button-Text-Icon-Horizontal">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-name="& I / Action  / account-circle">
            <div className="absolute inset-[8.333%]" data-name="Vector">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p18fcaf00} fill="var(--fill-0, #535146)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-slate-50">
          <p className="leading-[16px] whitespace-pre">Profile</p>
        </div>
      </button>
      <button
        onClick={onPortfolioClick}
        className="content-stretch flex flex-col gap-[8px] items-center justify-center relative rounded-[12px] shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        data-name="home-nav-portfolio-button"
      >
        <div className="backdrop-blur-lg backdrop-filter bg-[#e9e6dc] box-border content-stretch flex gap-[8px] items-center justify-center p-[12px] relative rounded-[100px] shrink-0" data-name="Button-Text-Icon-Horizontal">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon / portfolio">
            <div className="absolute inset-[8.33%]" data-name="Vector">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <g id="Vector">
                  <path clipRule="evenodd" d={svgPaths.pf322100} fill="var(--fill-0, #535146)" fillRule="evenodd" />
                  <path d={svgPaths.p3a254700} fill="var(--fill-0, #535146)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-slate-50">
          <p className="leading-[16px] whitespace-pre">Portfolio</p>
        </div>
      </button>
      <button
        onClick={onSaveClick}
        className="content-stretch flex flex-col gap-[8px] items-center justify-center relative rounded-[12px] shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        data-name="home-nav-save-button"
      >
        <div className="backdrop-blur-lg backdrop-filter bg-[#e9e6dc] box-border content-stretch flex gap-[8px] items-center justify-center p-[12px] relative rounded-[100px] shrink-0" data-name="Button-Text-Icon-Horizontal">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-name="& I / Action  / bookmark-border">
            <div className="absolute inset-[12.5%_20.83%]" data-name="Vector">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 18">
                <path d={svgPaths.p1a4cbf00} fill="var(--fill-0, #535146)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-slate-50">
          <p className="leading-[16px] whitespace-pre">Save</p>
        </div>
      </button>
      <button
        onClick={onShareClick}
        className="content-stretch flex flex-col gap-[8px] items-center justify-center relative rounded-[12px] shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        data-name="home-nav-share-button"
      >
        <div className="backdrop-blur-lg backdrop-filter bg-[#e9e6dc] box-border content-stretch flex gap-[8px] items-center justify-center p-[12px] relative rounded-[100px] shrink-0" data-name="Button-Text-Icon-Horizontal">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-name="& I / Social / share">
            <div className="absolute inset-[8.33%_12.5%_8.67%_12.5%]" data-name="Vector">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
                <path d={svgPaths.p1c8e5000} fill="var(--fill-0, #535146)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-slate-50">
          <p className="leading-[16px] whitespace-pre">Share</p>
        </div>
      </button>
    </div>
  );
}

function HomeContactButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#c96442] h-[48px] relative rounded-[12px] shrink-0 w-full cursor-pointer transition-all hover:bg-[#b85838] active:scale-[0.98]"
      data-name="home-contact-button"
    >
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center p-[12px] relative w-full">
          <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Contact Icon">
            <div className="absolute bottom-[20.83%] left-1/4 right-1/4 top-[62.5%]" data-name="Vector (Stroke)">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 3">
                <path clipRule="evenodd" d={svgPaths.p17e65e00} fill="var(--fill-0, #F8FAFC)" fillRule="evenodd" id="Vector (Stroke)" />
              </svg>
            </div>
            <div className="absolute inset-[12.5%_8.33%_4.17%_8.33%]" data-name="Vector (Stroke)">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                <path clipRule="evenodd" d={svgPaths.p5800fc0} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector (Stroke)" />
              </svg>
            </div>
            <div className="absolute inset-[29.17%_37.5%_45.83%_37.5%]" data-name="Vector (Stroke)">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
                <path clipRule="evenodd" d={svgPaths.p17049100} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector (Stroke)" />
              </svg>
            </div>
            <div className="absolute inset-[4.17%_62.5%_79.17%_29.17%]" data-name="Vector (Stroke)">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 3">
                <path clipRule="evenodd" d={svgPaths.p39029480} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector (Stroke)" />
              </svg>
            </div>
            <div className="absolute inset-[4.17%_29.17%_79.17%_62.5%]" data-name="Vector (Stroke)">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 3">
                <path clipRule="evenodd" d={svgPaths.p39029480} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector (Stroke)" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-slate-50">
            <p className="leading-[20px] whitespace-pre">Contact</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function SaveContactCard({ onClose }: { onClose: () => void }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const data = useFilteredBusinessCardData();

  if (!data) return null;

  const contactInfo = {
    name: data.personal.name,
    position: data.personal.title,
    phone: data.contact.phone.value,
    url: window.location.href,
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      // Try modern clipboard API first with fallback
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          setCopiedField(field);
          toast.success(`${field} copied!`);
          setTimeout(() => setCopiedField(null), 2000);
          return;
        } catch (clipboardErr) {
          console.log('Modern clipboard API blocked, using fallback');
        }
      }
      
      // Fallback method using document.execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopiedField(field);
        toast.success(`${field} copied!`);
        setTimeout(() => setCopiedField(null), 2000);
      } else {
        throw new Error('execCommand copy failed');
      }
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error("Failed to copy");
    }
  };

  const truncateUrl = (url: string, maxLength: number = 30) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="backdrop-blur-lg backdrop-filter bg-[rgba(255,222,207,0.33)] box-border content-stretch flex flex-col h-[472px] items-center justify-between mb-[18px] pb-[24px] pt-[16px] px-[24px] rounded-[24px] w-full pr-[24px] pl-[24px]" data-name="save-contact-card">
      {/* Close button */}
      <button
        onClick={onClose}
        className="overflow-clip relative shrink-0 size-[20px] cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 self-end"
        aria-label="Close"
      >
        <div className="absolute inset-[8%]" data-name="Close Icon">
          <svg className="block size-full" fill="none" viewBox="0 0 16 16">
            <path d="M12 4L4 12M4 4L12 12" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </button>

      {/* Title and Instructions */}
      <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-full">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[32px] text-slate-50 tracking-[-0.384px]">
          <p className="leading-[40px]">Save Contact</p>
        </div>
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-slate-50 text-center">
          <p className="leading-[18px]">Tap to copy each field to your clipboard</p>
        </div>
      </div>

      {/* Contact Fields */}
      <div className="content-stretch flex flex-col gap-[12px] items-center relative rounded-[24px] shrink-0 w-full">
        {/* Name Field */}
        <div className="w-full bg-[rgba(255,255,255,0.15)] backdrop-blur-sm rounded-[12px] flex items-center justify-between px-[12px] py-[8px]">
          <div className="flex flex-col gap-[2px] flex-1">
            <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic text-[10px] text-slate-200">
              <p className="leading-[14px]">Name</p>
            </div>
            <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic text-[14px] text-slate-50">
              <p className="leading-[20px]">{contactInfo.name}</p>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(contactInfo.name, "Name")}
            className="p-[8px] hover:bg-[rgba(255,255,255,0.2)] rounded-[8px] transition-colors"
            aria-label="Copy name"
          >
            {copiedField === "Name" ? (
              <Check className="w-[16px] h-[16px] text-green-300" />
            ) : (
              <Copy className="w-[16px] h-[16px] text-slate-50" />
            )}
          </button>
        </div>

        {/* Position Field */}
        <div className="w-full bg-[rgba(255,255,255,0.15)] backdrop-blur-sm rounded-[12px] flex items-center justify-between px-[12px] py-[8px]">
          <div className="flex flex-col gap-[2px] flex-1">
            <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic text-[10px] text-slate-200">
              <p className="leading-[14px]">Position</p>
            </div>
            <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic text-[14px] text-slate-50">
              <p className="leading-[20px]">{contactInfo.position}</p>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(contactInfo.position, "Position")}
            className="p-[8px] hover:bg-[rgba(255,255,255,0.2)] rounded-[8px] transition-colors"
            aria-label="Copy position"
          >
            {copiedField === "Position" ? (
              <Check className="w-[16px] h-[16px] text-green-300" />
            ) : (
              <Copy className="w-[16px] h-[16px] text-slate-50" />
            )}
          </button>
        </div>

        {/* Phone Field */}
        <div className="w-full bg-[rgba(255,255,255,0.15)] backdrop-blur-sm rounded-[12px] flex items-center justify-between px-[12px] py-[8px]">
          <div className="flex flex-col gap-[2px] flex-1">
            <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic text-[10px] text-slate-200">
              <p className="leading-[14px]">Phone</p>
            </div>
            <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic text-[14px] text-slate-50">
              <p className="leading-[20px]">{contactInfo.phone}</p>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(contactInfo.phone, "Phone")}
            className="p-[8px] hover:bg-[rgba(255,255,255,0.2)] rounded-[8px] transition-colors"
            aria-label="Copy phone"
          >
            {copiedField === "Phone" ? (
              <Check className="w-[16px] h-[16px] text-green-300" />
            ) : (
              <Copy className="w-[16px] h-[16px] text-slate-50" />
            )}
          </button>
        </div>

        {/* URL Field */}
        <div className="w-full bg-[rgba(255,255,255,0.15)] backdrop-blur-sm rounded-[12px] p-[12px] flex items-center justify-between">
          <div className="flex flex-col gap-[2px] flex-1 min-w-0">
            <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic text-[10px] text-slate-200">
              <p className="leading-[14px]">Website</p>
            </div>
            <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic text-[14px] text-slate-50">
              <p className="leading-[20px] truncate">{truncateUrl(contactInfo.url)}</p>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(contactInfo.url, "Website")}
            className="p-[8px] hover:bg-[rgba(255,255,255,0.2)] rounded-[8px] transition-colors shrink-0"
            aria-label="Copy website"
          >
            {copiedField === "Website" ? (
              <Check className="w-[16px] h-[16px] text-green-300" />
            ) : (
              <Copy className="w-[16px] h-[16px] text-slate-50" />
            )}
          </button>
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={onClose}
        className="bg-[#c96442] h-[48px] relative rounded-[12px] shrink-0 w-full cursor-pointer transition-all hover:bg-[#b85838] active:scale-[0.98]"
      >
        <div className="flex flex-row items-center justify-center size-full">
          <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic text-[14px] text-nowrap text-slate-50">
            <p className="leading-[20px] whitespace-pre">Done</p>
          </div>
        </div>
      </button>
    </div>
  );
}

function NavigationMenu({ 
  isOpen, 
  onClose, 
  onNavigateHome, 
  onNavigateContact, 
  onNavigateProfile, 
  onNavigatePortfolio,
  onNavigateToMyProfile,
  currentScreen,
  isAuthenticated,
  onLogin,
  onLogout,
  onNavigateToCMS,
  cmsSection,
  onOpenAIAssistant
}: { 
  isOpen: boolean;
  onClose: () => void;
  onNavigateHome: () => void;
  onNavigateContact: () => void;
  onNavigateProfile: () => void;
  onNavigatePortfolio: () => void;
  onNavigateToMyProfile?: () => void;
  currentScreen: 'home' | 'contact' | 'profile' | 'portfolio';
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  onNavigateToCMS?: (section: string) => void;
  cmsSection?: string | null;
  onOpenAIAssistant?: () => void;
}) {
  const handleNavigation = (navigateFn: () => void) => {
    navigateFn();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] bg-[#faf9f5] border-r border-[#e9e6dc]">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate to different sections of the app
        </SheetDescription>
        
        <div className="flex flex-col px-4 mt-12 gap-1">
          {/* Top Section - Main Navigation */}
          <button
            onClick={() => handleNavigation(onNavigateHome)}
            className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
              currentScreen === 'home' && !cmsSection
                ? 'bg-zinc-100' 
                : 'hover:bg-zinc-50'
            }`}
          >
            <Home className={`w-5 h-5 ${currentScreen === 'home' && !cmsSection ? 'text-neutral-950' : 'text-zinc-500'}`} />
            <span className={currentScreen === 'home' && !cmsSection ? 'text-neutral-950' : 'text-zinc-500'}>Home</span>
          </button>

          <button
            onClick={() => handleNavigation(onNavigateContact)}
            className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
              currentScreen === 'contact' 
                ? 'bg-zinc-100' 
                : 'hover:bg-zinc-50'
            }`}
          >
            <Mail className={`w-5 h-5 ${currentScreen === 'contact' ? 'text-neutral-950' : 'text-zinc-500'}`} />
            <span className={currentScreen === 'contact' ? 'text-neutral-950' : 'text-zinc-500'}>Contact</span>
          </button>

          <button
            onClick={() => handleNavigation(onNavigateProfile)}
            className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
              currentScreen === 'profile' 
                ? 'bg-zinc-100' 
                : 'hover:bg-zinc-50'
            }`}
          >
            <User className={`w-5 h-5 ${currentScreen === 'profile' ? 'text-neutral-950' : 'text-zinc-500'}`} />
            <span className={currentScreen === 'profile' ? 'text-neutral-950' : 'text-zinc-500'}>Profile</span>
          </button>

          <button
            onClick={() => handleNavigation(onNavigatePortfolio)}
            className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
              currentScreen === 'portfolio' 
                ? 'bg-zinc-100' 
                : 'hover:bg-zinc-50'
            }`}
          >
            <Briefcase className={`w-5 h-5 ${currentScreen === 'portfolio' ? 'text-neutral-950' : 'text-zinc-500'}`} />
            <span className={currentScreen === 'portfolio' ? 'text-neutral-950' : 'text-zinc-500'}>Portfolio</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateToCMS) {
                handleNavigation(() => onNavigateToCMS('ai-chat'));
              }
            }}
            className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
              cmsSection === 'ai-chat'
                ? 'bg-zinc-100' 
                : 'hover:bg-zinc-50'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${cmsSection === 'ai-chat' ? 'text-neutral-950' : 'text-zinc-500'}`} />
            <span className={cmsSection === 'ai-chat' ? 'text-neutral-950' : 'text-zinc-500'}>AI Agent</span>
          </button>

          {/* Separator */}
          <div className="bg-[#dad9d4] h-px my-4" />

          {/* Bottom Section - CMS/Admin */}
          {isAuthenticated ? (
            <button
              onClick={() => {
                if (onLogout) {
                  handleNavigation(onLogout);
                }
              }}
              className="w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors hover:bg-zinc-50"
            >
              <LogOut className="w-5 h-5 text-zinc-500" />
              <span className="text-zinc-500">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (onLogin) {
                  handleNavigation(onLogin);
                }
              }}
              className="w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors hover:bg-zinc-50"
            >
              <LogIn className="w-5 h-5 text-zinc-500" />
              <span className="text-zinc-500">Login</span>
            </button>
          )}

          {isAuthenticated && (
            <>
              <button
                onClick={() => {
                  if (onNavigateToMyProfile) {
                    handleNavigation(onNavigateToMyProfile);
                  }
                }}
                className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
                  !cmsSection && onNavigateToMyProfile
                    ? 'bg-zinc-100'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${!cmsSection && onNavigateToMyProfile ? 'text-neutral-950' : 'text-zinc-500'}`} />
                <span className={!cmsSection && onNavigateToMyProfile ? 'text-neutral-950' : 'text-zinc-500'}>Business Card Studio</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateToCMS) {
                    handleNavigation(() => onNavigateToCMS('home'));
                  }
                }}
                className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
                  cmsSection === 'home'
                    ? 'bg-zinc-100'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <Home className={`w-5 h-5 ${cmsSection === 'home' ? 'text-neutral-950' : 'text-zinc-500'}`} />
                <span className={cmsSection === 'home' ? 'text-neutral-950' : 'text-zinc-500'}>Edit Home</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateToCMS) {
                    handleNavigation(() => onNavigateToCMS('contact'));
                  }
                }}
                className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
                  cmsSection === 'contact'
                    ? 'bg-zinc-100'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <Mail className={`w-5 h-5 ${cmsSection === 'contact' ? 'text-neutral-950' : 'text-zinc-500'}`} />
                <span className={cmsSection === 'contact' ? 'text-neutral-950' : 'text-zinc-500'}>Edit Contact</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateToCMS) {
                    handleNavigation(() => onNavigateToCMS('profile'));
                  }
                }}
                className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
                  cmsSection === 'profile'
                    ? 'bg-zinc-100'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <User className={`w-5 h-5 ${cmsSection === 'profile' ? 'text-neutral-950' : 'text-zinc-500'}`} />
                <span className={cmsSection === 'profile' ? 'text-neutral-950' : 'text-zinc-500'}>Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateToCMS) {
                    handleNavigation(() => onNavigateToCMS('portfolio'));
                  }
                }}
                className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
                  cmsSection === 'portfolio'
                    ? 'bg-zinc-100'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <Briefcase className={`w-5 h-5 ${cmsSection === 'portfolio' ? 'text-neutral-950' : 'text-zinc-500'}`} />
                <span className={cmsSection === 'portfolio' ? 'text-neutral-950' : 'text-zinc-500'}>Edit Portfolio</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateToCMS) {
                    handleNavigation(() => onNavigateToCMS('share'));
                  }
                }}
                className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
                  cmsSection === 'share'
                    ? 'bg-zinc-100'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <Share2 className={`w-5 h-5 ${cmsSection === 'share' ? 'text-neutral-950' : 'text-zinc-500'}`} />
                <span className={cmsSection === 'share' ? 'text-neutral-950' : 'text-zinc-500'}>Share Contact</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateToCMS) {
                    handleNavigation(() => onNavigateToCMS('shareconfig'));
                  }
                }}
                className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
                  cmsSection === 'shareconfig'
                    ? 'bg-zinc-100'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <Share2 className={`w-5 h-5 ${cmsSection === 'shareconfig' ? 'text-neutral-950' : 'text-zinc-500'}`} />
                <span className={cmsSection === 'shareconfig' ? 'text-neutral-950' : 'text-zinc-500'}>Share Config</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateToCMS) {
                    handleNavigation(() => onNavigateToCMS('analytics'));
                  }
                }}
                className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
                  cmsSection === 'analytics'
                    ? 'bg-zinc-100'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <BarChart3 className={`w-5 h-5 ${cmsSection === 'analytics' ? 'text-neutral-950' : 'text-zinc-500'}`} />
                <span className={cmsSection === 'analytics' ? 'text-neutral-950' : 'text-zinc-500'}>Analytics</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateToCMS) {
                    handleNavigation(() => onNavigateToCMS('assistant'));
                  }
                }}
                className={`w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors ${
                  cmsSection === 'assistant'
                    ? 'bg-zinc-100'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <Sparkles className={`w-5 h-5 ${cmsSection === 'assistant' ? 'text-neutral-950' : 'text-zinc-500'}`} />
                <span className={cmsSection === 'assistant' ? 'text-neutral-950' : 'text-zinc-500'}>Edit Assistant</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenAIAssistant) {
                    handleNavigation(onOpenAIAssistant);
                  }
                }}
                className="w-full flex items-center gap-3 h-12 pl-4 rounded-lg transition-colors hover:bg-zinc-50"
              >
                <Sparkles className="w-5 h-5 text-zinc-500" />
                <span className="text-zinc-500">AI Agent</span>
              </button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HomeProfileCard({ onNavigateToContact, onNavigateToProfile, onNavigateToPortfolio }: { 
  onNavigateToContact: () => void; 
  onNavigateToProfile: () => void;
  onNavigateToPortfolio: () => void;
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveCard, setShowSaveCard] = useState(false);
  const data = useFilteredBusinessCardData();
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  // Calculate card dimensions from viewport to avoid circular dependency
  useEffect(() => {
    const updateDimensions = () => {
      // Calculate 50vh directly from viewport instead of measuring the card
      // This prevents circular dependency issues where showing/hiding bio changes card height
      const vh = window.visualViewport?.height || window.innerHeight;
      const calculatedHeight = vh * 0.5;
      setCardHeight(calculatedHeight);
      
      // Calculate card width: screen width - 36px (18px margin on each side)
      const vw = window.visualViewport?.width || window.innerWidth;
      const calculatedWidth = vw - 36;
      setCardWidth(calculatedWidth);
      
      console.log('Calculated card dimensions:', { 
        height: calculatedHeight, 
        width: calculatedWidth,
        viewport: { vh, vw }
      });
    };

    // Initial measurement
    updateDimensions();
    
    // Update on window resize
    window.addEventListener('resize', updateDimensions);
    
    // Update when visual viewport changes (mobile browser chrome)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateDimensions);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateDimensions);
      }
    };
  }, []);

  // Calculate BioLines based on cardHeight breakpoints
  const calculateBioLines = (height: number): number => {
    if (height < 320) return 0;
    if (height < 350) return 1;
    if (height < 400) return 2;
    return 3; // height >= 400px
  };

  const bioLines = calculateBioLines(cardHeight);
  const shouldShowBio = bioLines > 0;
  
  // Debug logging
  console.log('Bio debug:', { cardHeight, bioLines, shouldShowBio });

  if (!data) return null;

  const handleProfileClick = () => {
    onNavigateToProfile();
  };

  const handlePortfolioClick = () => {
    onNavigateToPortfolio();
  };

  const handleSaveClick = () => {
    // Generate vCard for download
    const { personal, professional, social } = data;
    
    // Create vCard content
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${personal.name || 'Digital Business Card'}`,
      personal.email ? `EMAIL:${personal.email}` : '',
      personal.phone ? `TEL:${personal.phone}` : '',
      professional?.position ? `TITLE:${professional.position}` : '',
      professional?.company ? `ORG:${professional.company}` : '',
      personal.bio ? `NOTE:${personal.bio}` : '',
      `URL:${window.location.origin}${buildProfileUrl(getUserCode())}`,
      'END:VCARD'
    ].filter(line => line && !line.endsWith(':')).join('\n');

    // Create and download vCard file
    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${personal.name || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Contact card downloaded');
  };

  const handleShareClick = async () => {
    const shareTitle = `${data.personal.name} - ${data.personal.title}`;
    const shareText = `Check out ${data.personal.name}'s profile`;
    
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: window.location.href,
      }).catch(() => {
        toast.info("Share cancelled");
      });
    } else {
      try {
        // Try modern clipboard API first with fallback
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard");
            return;
          } catch (clipboardErr) {
            console.log('Modern clipboard API blocked, using fallback');
          }
        }
        
        // Fallback for when clipboard API is not available
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success("Link copied to clipboard");
        } else {
          throw new Error('execCommand copy failed');
        }
      } catch (err) {
        console.error('Copy failed:', err);
        toast.error("Failed to copy link");
      }
    }
  };

  if (showSaveCard) {
    return <SaveContactCard onClose={() => setShowSaveCard(false)} />;
  }

  return (
    <div ref={cardRef} className="backdrop-blur-lg backdrop-filter bg-[rgba(255,222,207,0.33)] box-border content-stretch flex flex-col items-center justify-between mb-[16px] rounded-[24px] w-full" style={{ height: 'calc(var(--vh, 1vh) * 50)', paddingTop: '16px', paddingBottom: '24px', paddingLeft: '24px', paddingRight: '24px' }} data-name="home-profile-card">
      <Container 
        onNavigateToContact={onNavigateToContact}
        name={data.personal.name}
        title={data.personal.title}
        businessName={data.personal.businessName}
        cardHeight={cardHeight}
        cardWidth={cardWidth}
      />
      {shouldShowBio && data.personal.bio && (
        <div className="content-stretch flex flex-col items-center relative rounded-[24px] shrink-0 w-full" style={{ gap: 'clamp(14px, calc(var(--vh, 1vh) * 2), 16px)' }} data-name="home-profile-description-text">
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center not-italic relative shrink-0 text-[14px] text-slate-50 w-full">
            <p 
              className="leading-[18px]"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: bioLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {data.personal.bio}
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-[16px] w-full shrink-0" data-name="button-block">
        <HomeNavBar
          onProfileClick={handleProfileClick}
          onPortfolioClick={handlePortfolioClick}
          onSaveClick={handleSaveClick}
          onShareClick={handleShareClick}
        />
        <HomeContactButton onClick={onNavigateToContact} />
      </div>
    </div>
  );
}

function Gradient({ onNavigateToContact, onNavigateToProfile, onNavigateToPortfolio }: { 
  onNavigateToContact: () => void; 
  onNavigateToProfile: () => void;
  onNavigateToPortfolio: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-end justify-center" data-name="Gradient">
      <div className="w-full max-w-[500px] px-[16px]">
        <HomeProfileCard 
          onNavigateToContact={onNavigateToContact} 
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToPortfolio={onNavigateToPortfolio}
        />
      </div>
    </div>
  );
}

function ContactScreen({ onBack, onMenuClick, onAIClick }: { onBack: () => void; onMenuClick: () => void; onAIClick?: () => void }) {
  return (
    <div className="bg-[#faf9f5] w-full overflow-auto" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      <div className="w-full max-w-[500px] mx-auto">
        <div className="bg-[#faf9f5] content-stretch flex flex-col gap-[8px] items-start relative w-full" data-name="Contact">
          <ContactHeaderWithBack onBack={onBack} onMenuClick={onMenuClick} />
          <Share onAIClick={onAIClick} />
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ onBack, onMenuClick }: { onBack: () => void; onMenuClick: () => void }) {
  return (
    <div className="bg-[#faf9f5] w-full overflow-auto" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      <div className="w-full max-w-[500px] mx-auto">
        <div className="bg-[#faf9f5] content-stretch flex flex-col items-start relative w-full" data-name="Profile">
          <ProfileHeaderWithBack onBack={onBack} onMenuClick={onMenuClick} />
          <ProfileCredentials />
        </div>
      </div>
    </div>
  );
}

function PortfolioScreen({ onBack, onMenuClick }: { onBack: () => void; onMenuClick: () => void }) {
  return (
    <div className="bg-[#faf9f5] w-full overflow-auto" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      <div className="w-full max-w-[500px] mx-auto">
        <div className="bg-[#faf9f5] content-stretch flex flex-col items-start relative w-full" data-name="Portfolio">
          <PortfolioHeaderWithBack onBack={onBack} onMenuClick={onMenuClick} />
          <PortfolioListing />
        </div>
      </div>
    </div>
  );
}

function ContactHeaderWithBack({ onBack, onMenuClick }: { onBack: () => void; onMenuClick: () => void }) {
  return (
    <div className="bg-[#faf9f5] box-border content-stretch flex gap-[12px] items-center justify-center px-[24px] py-[8px] relative shrink-0 w-full" data-name="contact-header">
      <button
        onClick={onBack}
        className="overflow-clip relative shrink-0 size-[24px] cursor-pointer transition-transform hover:scale-110 active:scale-95"
        data-name="Back Icon"
        aria-label="Back to home"
      >
        <div className="absolute inset-[20.83%_33.33%]" data-name="Vector (Stroke)">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 14">
            <path clipRule="evenodd" d={contactSvgPaths.p1656a400} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
          </svg>
        </div>
      </button>
      <Logo />
      <MenuIcon onClick={onMenuClick} />
    </div>
  );
}

function ProfileHeaderWithBack({ onBack, onMenuClick }: { onBack: () => void; onMenuClick: () => void }) {
  return (
    <div className="bg-[#faf9f5] box-border content-stretch flex gap-[12px] items-center justify-center px-[24px] py-[8px] relative shrink-0 w-full" data-name="profile-header">
      <button
        onClick={onBack}
        className="overflow-clip relative shrink-0 size-[24px] cursor-pointer transition-transform hover:scale-110 active:scale-95"
        data-name="Back Icon"
        aria-label="Back to home"
      >
        <div className="absolute inset-[20.83%_33.33%]" data-name="Vector (Stroke)">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 14">
            <path clipRule="evenodd" d={profileSvgPaths.p1656a400} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
          </svg>
        </div>
      </button>
      <ProfileLogo />
      <ProfileMenuIcon onClick={onMenuClick} />
    </div>
  );
}

function ProfileLogo() {
  return (
    <div className="basis-0 content-stretch flex grow h-[48px] items-center justify-center min-h-px min-w-px relative shrink-0" data-name="logo">
      <div className="basis-0 flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#535146] text-[20px] tracking-[-0.1px]">
        <p className="leading-[28px]">Profile</p>
      </div>
    </div>
  );
}

function ProfileMenuIcon({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="overflow-clip relative shrink-0 size-[24px] cursor-pointer transition-transform hover:scale-110 active:scale-95"
      data-name="Menu Icon"
      aria-label="Open menu"
    >
      <div className="absolute inset-[45.83%_12.5%]" data-name="Vector (Stroke)">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
          <path clipRule="evenodd" d={profileSvgPaths.p1ed66800} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
        </svg>
      </div>
      <div className="absolute inset-[20.83%_12.5%_70.83%_12.5%]" data-name="Vector (Stroke)">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
          <path clipRule="evenodd" d={profileSvgPaths.p1ed66800} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
        </svg>
      </div>
      <div className="absolute inset-[70.83%_12.5%_20.83%_12.5%]" data-name="Vector (Stroke)">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
          <path clipRule="evenodd" d={profileSvgPaths.p1ed66800} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
        </svg>
      </div>
    </button>
  );
}

function PortfolioHeaderWithBack({ onBack, onMenuClick }: { onBack: () => void; onMenuClick: () => void }) {
  return (
    <div className="bg-[#faf9f5] box-border content-stretch flex gap-[12px] items-center justify-center px-[24px] py-[8px] relative shrink-0 w-full" data-name="portfolio-header">
      <button
        onClick={onBack}
        className="overflow-clip relative shrink-0 size-[24px] cursor-pointer transition-transform hover:scale-110 active:scale-95"
        data-name="Back Icon"
        aria-label="Back to home"
      >
        <div className="absolute inset-[20.83%_33.33%]" data-name="Vector (Stroke)">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 14">
            <path clipRule="evenodd" d={portfolioSvgPaths.p1656a400} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
          </svg>
        </div>
      </button>
      <PortfolioLogo />
      <PortfolioMenuIcon onClick={onMenuClick} />
    </div>
  );
}

function PortfolioLogo() {
  return (
    <div className="basis-0 content-stretch flex grow h-[48px] items-center justify-center min-h-px min-w-px relative shrink-0" data-name="logo">
      <div className="basis-0 flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#535146] text-[20px] tracking-[-0.1px]">
        <p className="leading-[28px]">Portfolio</p>
      </div>
    </div>
  );
}

function PortfolioMenuIcon({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="overflow-clip relative shrink-0 size-[24px] cursor-pointer transition-transform hover:scale-110 active:scale-95"
      data-name="Menu Icon"
      aria-label="Open menu"
    >
      <div className="absolute inset-[45.83%_12.5%]" data-name="Vector (Stroke)">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
          <path clipRule="evenodd" d={portfolioSvgPaths.p1ed66800} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
        </svg>
      </div>
      <div className="absolute inset-[20.83%_12.5%_70.83%_12.5%]" data-name="Vector (Stroke)">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
          <path clipRule="evenodd" d={portfolioSvgPaths.p1ed66800} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
        </svg>
      </div>
      <div className="absolute inset-[70.83%_12.5%_20.83%_12.5%]" data-name="Vector (Stroke)">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
          <path clipRule="evenodd" d={portfolioSvgPaths.p1ed66800} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
        </svg>
      </div>
    </button>
  );
}

function ProfileCredentials() {
  const data = useFilteredBusinessCardData();

  if (!data) return null;

  // Split name for display (first name on first line, last name on second)
  const nameParts = data.personal.name.split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || data.personal.name;
  const lastName = nameParts[nameParts.length - 1];

  return (
    <div className="box-border content-stretch flex flex-col gap-[8px] items-center pb-[16px] pt-[0px] px-[24px] relative shrink-0 w-full pr-[24px] pl-[24px]" data-name="credentials">
      <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0 w-full" data-name="widget-elements-title">
        <div className="box-border content-stretch flex gap-[8px] items-start px-0 relative shrink-0 w-full py-[8px] pt-[8px] pr-[0px] pb-[0px] pl-[0px]" data-name="title">
          <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[36px] not-italic relative shrink-0 text-[#535146] text-[30px] text-nowrap tracking-[-0.225px] whitespace-pre">
            {nameParts.length > 1 ? (
              <>
                <p className="mb-0">{firstName}</p>
                <p>{lastName}</p>
              </>
            ) : (
              <p>{data.personal.name}</p>
            )}
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-[4px] items-start pb-[8px] pt-0 px-0 relative shrink-0 w-full" data-name="widget-elements-title">
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="title">
          <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[18px] text-nowrap">
            <p className="leading-[28px] whitespace-pre">{data.personal.title}</p>
          </div>
        </div>
      </div>
      {data.profile.about.value && (
        <div className="box-border content-stretch flex flex-col gap-[4px] items-start px-0 py-[8px] relative shrink-0 w-full" data-name="widget-elements-title">
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="title">
            <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[16px] text-nowrap">
              <p className="leading-[24px] whitespace-pre">{(data.customLabels?.['profile.about'] || 'ABOUT').toUpperCase()}</p>
            </div>
          </div>
          <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[20px] not-italic relative shrink-0 text-[#83827d] text-[14px] w-full">
            <p className="mb-0">{data.profile.about.value}</p>
          </div>
        </div>
      )}
      {data.profile.serviceAreas.value && (
        <div className="box-border content-stretch flex flex-col gap-[4px] items-start px-0 py-[8px] relative shrink-0 w-full" data-name="widget-elements-title">
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="title">
            <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[16px] text-nowrap">
              <p className="leading-[24px] whitespace-pre">{(data.customLabels?.['profile.serviceAreas'] || 'SERVICE AREAS').toUpperCase()}</p>
            </div>
          </div>
          <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#83827d] text-[14px] w-full">
            <p className="leading-[20px]">{data.profile.serviceAreas.value}</p>
          </div>
        </div>
      )}
      {data.profile.specialties.value && (
        <div className="box-border content-stretch flex flex-col gap-[4px] items-start px-0 py-[8px] relative shrink-0 w-full" data-name="widget-elements-title">
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="title">
            <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[16px] text-nowrap">
              <p className="leading-[24px] whitespace-pre">{(data.customLabels?.['profile.specialties'] || 'SPECIALTIES').toUpperCase()}</p>
            </div>
          </div>
          <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#83827d] text-[14px] w-full">
            <p className="leading-[20px]">{data.profile.specialties.value}</p>
          </div>
        </div>
      )}
      {data.profile.experience.value && (
        <div className="box-border content-stretch flex flex-col gap-[4px] items-start px-0 py-[8px] relative shrink-0 w-full" data-name="widget-elements-title">
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="title">
            <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[16px] text-nowrap">
              <p className="leading-[24px] whitespace-pre">{(data.customLabels?.['profile.experience'] || 'EXPERIENCE').toUpperCase()}</p>
            </div>
          </div>
          <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[20px] not-italic relative shrink-0 text-[#83827d] text-[14px] w-full">
            <p className="mb-0">{data.profile.experience.value}</p>
          </div>
        </div>
      )}
      {data.profile.languages.value && (
        <div className="box-border content-stretch flex flex-col gap-[4px] items-start px-0 py-[8px] relative shrink-0 w-full" data-name="widget-elements-title">
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="title">
            <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[16px] text-nowrap">
              <p className="leading-[24px] whitespace-pre">{(data.customLabels?.['profile.languages'] || 'LANGUAGES').toUpperCase()}</p>
            </div>
          </div>
          <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#83827d] text-[14px] w-full">
            <p className="leading-[20px]">{data.profile.languages.value}</p>
          </div>
        </div>
      )}
      {data.profile.certifications.value && (
        <div className="box-border content-stretch flex flex-col gap-[4px] items-start px-0 py-[8px] relative shrink-0 w-full" data-name="widget-elements-title">
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="title">
            <div className="flex flex-col font-['Be_Vietnam_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[16px] text-nowrap">
              <p className="leading-[24px] whitespace-pre">{(data.customLabels?.['profile.certifications'] || 'CERTIFICATIONS').toUpperCase()}</p>
            </div>
          </div>
          <div className="flex flex-col font-['Be_Vietnam_Pro:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#83827d] text-[14px] w-full">
            <p className="leading-[20px]">{data.profile.certifications.value}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <div className="basis-0 content-stretch flex grow h-[48px] items-center justify-center min-h-px min-w-px relative shrink-0" data-name="logo">
      <div className="basis-0 flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#535146] text-[20px] tracking-[-0.1px]">
        <p className="leading-[28px]">Contact</p>
      </div>
    </div>
  );
}

function MenuIcon({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="overflow-clip relative shrink-0 size-[24px] cursor-pointer transition-transform hover:scale-110 active:scale-95"
      data-name="Menu Icon"
      aria-label="Open menu"
    >
      <div className="absolute inset-[45.83%_12.5%]" data-name="Vector (Stroke)">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
          <path clipRule="evenodd" d={contactSvgPaths.p1ed66800} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
        </svg>
      </div>
      <div className="absolute inset-[20.83%_12.5%_70.83%_12.5%]" data-name="Vector (Stroke)">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
          <path clipRule="evenodd" d={contactSvgPaths.p1ed66800} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
        </svg>
      </div>
      <div className="absolute inset-[70.83%_12.5%_20.83%_12.5%]" data-name="Vector (Stroke)">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
          <path clipRule="evenodd" d={contactSvgPaths.p1ed66800} fill="var(--fill-0, #535146)" fillRule="evenodd" id="Vector (Stroke)" />
        </svg>
      </div>
    </button>
  );
}

function Share({ onAIClick }: { onAIClick?: () => void }) {
  const data = useFilteredBusinessCardData();

  if (!data) return null;

  // Parse avatar image data (separate from background)
  const avatarImageData = parseProfileImage(data.personal.avatarImage || data.personal.profileImage); // Fallback to profileImage for backward compatibility
  const imageUrl = avatarImageData?.imageUrl || "";
  const avatarPosition = avatarImageData?.position || { x: 0, y: 0, scale: 1 };

  return (
    <div className="box-border content-stretch flex flex-col gap-[24px] items-center p-[24px] relative rounded-tl-[24px] rounded-tr-[24px] shrink-0 w-full" data-name="share">
      <div className="relative rounded-[100px] shrink-0 size-[120px]" data-name="avatar">
        <div className="overflow-clip relative rounded-[inherit] size-[120px]">
          <div className="absolute inset-0 rounded-[100px]" data-name="img">
            <div className="absolute overflow-hidden pointer-events-none rounded-[100px]" style={{
              width: '100vw',
              height: '100vh',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) scale(0.75)',
              transformOrigin: 'center center'
            }}>
              <img 
                alt="Profile" 
                className="absolute h-full w-full object-contain" 
                src={imageUrl || imgImg}
                style={{
                  transform: `translate(${avatarPosition.x}px, ${avatarPosition.y}px) scale(${avatarPosition.scale})`,
                  transformOrigin: 'center center'
                }}
              />
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border-8 border-solid border-white inset-[-8px] pointer-events-none rounded-[108px]" />
      </div>
      <Headline name={data.personal.name} title={data.personal.title} />
      <CallToAction onAIClick={onAIClick} />
    </div>
  );
}

function Headline({ name, title }: { name: string; title: string }) {
  return (
    <div className="relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full" data-name="headline">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-center px-[24px] py-0 relative w-full">
          <TitleContact name={name} title={title} />
        </div>
      </div>
    </div>
  );
}

function TitleContact({ name, title }: { name: string; title: string }) {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-full" data-name="title">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[24px] text-center tracking-[-0.144px] w-full">
        <p className="leading-[32px]">{name}</p>
      </div>
      <SubTitleContact title={title} />
    </div>
  );
}

function SubTitleContact({ title }: { title: string }) {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0 w-full" data-name="sub-title">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#83827d] text-[14px] text-nowrap">
        <p className="leading-[20px] whitespace-pre">{title}</p>
      </div>
    </div>
  );
}

function CallToAction({ onAIClick }: { onAIClick?: () => void }) {
  const data = useFilteredBusinessCardData();

  if (!data) return null;

  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="call to action">
      <ButtonMain phone={data.contact.phone.value} email={data.contact.email.value} onAIClick={onAIClick} />
      <Other />
    </div>
  );
}

function ButtonMain({ phone, email, onAIClick }: { phone: string; email: string; onAIClick?: () => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="button main">
      <AIButton onClick={onAIClick} />
      <Btn phone={phone} email={email} />
    </div>
  );
}

function AIButton({ onClick }: { onClick?: () => void }) {
  const isVisible = useIsFieldVisible('contact.aiAgent');
  const routeInfo = parseProfileUrl();
  const { trackClickEvent } = useAnalyticsTracking(routeInfo.userCode || '', routeInfo.group || '', undefined);
  
  if (!isVisible) return null;
  
  return (
    <button 
      onClick={() => {
        trackClickEvent('aiAgent');
        if (onClick) {
          onClick();
        } else {
          toast.info("AI Agent feature coming soon");
        }
      }}
      className="bg-[#c96442] h-[40px] relative rounded-[8px] shrink-0 w-full cursor-pointer transition-all hover:bg-[#b85838] active:scale-[0.98]" 
      data-name="button"
    >
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[40px] items-center justify-center p-[12px] relative w-full">
          <div className="relative shrink-0 size-[16px]" data-name="AI Agent Icon">
            <div className="absolute bottom-0 left-0 right-[6.67%] top-[6.67%]">
              <div className="absolute inset-[11.6%]" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                  <path d={contactSvgPaths.p1e531580} fill="var(--fill-0, white)" id="Star 1" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-[62.22%] left-[62.21%] right-[0.01%] top-[0]">
              <div className="absolute inset-[11.6%]" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
                  <path d={contactSvgPaths.p1f96fb00} fill="var(--fill-0, white)" id="Star 3" />
                </svg>
              </div>
            </div>
          </div>
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[24px] not-italic relative shrink-0 text-[14px] text-nowrap text-slate-50 whitespace-pre">AI Agent</p>
        </div>
      </div>
    </button>
  );
}

function Btn({ phone, email }: { phone: string; email: string }) {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="btn">
      <PhoneButton phone={phone} />
      <EmailButton email={email} />
    </div>
  );
}

function PhoneButton({ phone }: { phone: string }) {
  const routeInfo = parseProfileUrl();
  const { trackClickEvent } = useAnalyticsTracking(routeInfo.userCode || '', routeInfo.group || '', undefined);
  
  if (!phone) return null; // Don't show button if no phone number
  
  return (
    <button 
      onClick={() => {
        trackClickEvent('contact.phone');
        window.location.href = `tel:${phone}`;
      }}
      className="basis-0 bg-[#e9e6dc] grow h-[40px] min-h-px min-w-px relative rounded-[8px] shrink-0 cursor-pointer transition-all hover:bg-[#d9d6cc] active:scale-[0.98]" 
      data-name="fill"
    >
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[40px] items-center justify-center px-[12px] py-[8px] relative w-full">
          <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Phone Icon">
            <div className="absolute inset-[4.17%_4.17%_4.47%_4.63%]" data-name="Vector (Stroke)">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
                <path d={contactSvgPaths.p369509f0} fill="var(--fill-0, #535146)" id="Vector (Stroke)" />
              </svg>
            </div>
          </div>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535146] text-[14px] text-nowrap whitespace-pre">Phone</p>
        </div>
      </div>
    </button>
  );
}

function EmailButton({ email }: { email: string }) {
  const routeInfo = parseProfileUrl();
  const { trackClickEvent } = useAnalyticsTracking(routeInfo.userCode || '', routeInfo.group || '', undefined);
  
  if (!email) return null; // Don't show button if no email
  
  return (
    <button 
      onClick={() => {
        trackClickEvent('contact.email');
        window.location.href = `mailto:${email}`;
      }}
      className="basis-0 bg-[#e9e6dc] grow h-[40px] min-h-px min-w-px relative rounded-[8px] shrink-0 cursor-pointer transition-all hover:bg-[#d9d6cc] active:scale-[0.98]" 
      data-name="fill"
    >
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[40px] items-center justify-center px-[12px] py-[8px] relative w-full">
          <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Email Icon">
            <div className="absolute inset-[12.5%_4.17%]" data-name="Vector (Stroke)">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 12">
                <path d={contactSvgPaths.p28e15500} fill="var(--fill-0, #535146)" id="Vector (Stroke)" />
              </svg>
            </div>
            <div className="absolute inset-[25%_4.17%_41.68%_4.17%]" data-name="Vector (Stroke)">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 6">
                <path d={contactSvgPaths.p19161100} fill="var(--fill-0, #535146)" id="Vector (Stroke)" />
              </svg>
            </div>
          </div>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535146] text-[14px] text-nowrap whitespace-pre">Email</p>
        </div>
      </div>
    </button>
  );
}

function Other() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="other">
      <Messaging />
      <Channels />
    </div>
  );
}

function Messaging() {
  const data = useFilteredBusinessCardData();

  if (!data) return null;

  const messaging = data.socialMessaging;
  const hasVisibleApps = Object.values(messaging).some(app => app.username);

  if (!hasVisibleApps) return null;

  return (
    <div className="box-border content-stretch flex flex-col gap-[16px] items-start px-0 py-[12px] relative shrink-0 w-full" data-name="messaging">
      <WidgetElementsTitle />
      <SocialMessaging />
    </div>
  );
}

function WidgetElementsTitle() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full" data-name="widget-elements-title">
      <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="title">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[18px] text-nowrap">
          <p className="leading-[28px] whitespace-pre">Social Messaging</p>
        </div>
      </div>
    </div>
  );
}

function SocialMessaging() {
  const data = useFilteredBusinessCardData();

  if (!data) return null;

  const messaging = data.socialMessaging;
  const visibleApps = [
    { key: 'zalo', icon: 'zalo', label: 'Zalo', svgPath: contactSvgPaths.p3c0f7800, url: messagingUrlPatterns.zalo(messaging.zalo.username), config: messaging.zalo },
    { key: 'messenger', icon: 'messenger', label: 'Messenger', svgPath: contactSvgPaths.p28c7e780, url: messagingUrlPatterns.messenger(messaging.messenger.username), config: messaging.messenger },
    { key: 'telegram', icon: 'telegram', label: 'Telegram', svgPath: contactSvgPaths.p17afbb00, url: messagingUrlPatterns.telegram(messaging.telegram.username), config: messaging.telegram },
    { key: 'whatsapp', icon: 'whatsapp', label: 'Whatsapp', svgPath: contactSvgPaths.p1d96e40, url: messagingUrlPatterns.whatsapp(messaging.whatsapp.username), config: messaging.whatsapp },
    { key: 'kakao', icon: 'kakao', label: 'Kakao', svgPath: contactSvgPaths.p1b2b5d00, url: messagingUrlPatterns.kakao(messaging.kakao.username), config: messaging.kakao },
    { key: 'discord', icon: 'discord', label: 'Discord', svgPath: contactSvgPaths.p2dbd7c00, url: messagingUrlPatterns.discord(messaging.discord.username), config: messaging.discord },
    { key: 'wechat', icon: 'wechat', label: 'Wechat', svgPath: contactSvgPaths.p13598400, url: messagingUrlPatterns.wechat(messaging.wechat.username), config: messaging.wechat },
  ].filter(app => app.config.username);

  if (visibleApps.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-[16px] w-full" data-name="connect">
      {visibleApps.map(app => (
        <SocialButton key={app.key} icon={app.icon} label={app.label} svgPath={app.svgPath} url={app.url} target={`socialMessaging.${app.key}` as any} />
      ))}
    </div>
  );
}

function SocialButton({ icon, label, svgPath, url, target }: { icon: string; label: string; svgPath?: string; url?: string; target?: string }) {
  const routeInfo = parseProfileUrl();
  const { trackClickEvent } = useAnalyticsTracking(routeInfo.userCode || '', routeInfo.group || '', undefined);
  
  return (
    <button 
      onClick={() => {
        if (target) {
          trackClickEvent(target as any);
        }
        if (url) {
          window.location.href = url;
        } else {
          toast.info(`Opening ${label}`);
        }
      }}
      className="content-stretch flex flex-col gap-[4px] items-center justify-center relative rounded-[12px] shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95" 
      data-name="Button-Text-Icon-Vertical"
    >
      <div className="backdrop-blur-lg backdrop-filter bg-[#e9e6dc] box-border content-stretch flex gap-[8px] items-center justify-center p-[12px] relative rounded-[100px] shrink-0" data-name="Button-Text-Icon-Horizontal">
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name={`social / ${icon}`}>
          {svgPath && (
            <div className="absolute inset-[8.33%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPath} fill="var(--fill-0, #535146)" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#535146] text-[12px] text-nowrap whitespace-pre">{label}</p>
    </button>
  );
}

function Channels() {
  const data = useFilteredBusinessCardData();

  if (!data) return null;

  const channels = data.socialChannels;
  const hasVisibleChannels = Object.values(channels).some(channel => channel.username);

  if (!hasVisibleChannels) return null;

  return (
    <div className="box-border content-stretch flex flex-col gap-[16px] items-start px-0 py-[12px] relative shrink-0 w-full" data-name="channels">
      <WidgetElementsTitleChannels />
      <SocialChannels />
    </div>
  );
}

function WidgetElementsTitleChannels() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full" data-name="widget-elements-title">
      <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="title">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[18px] text-nowrap">
          <p className="leading-[28px] whitespace-pre">Social Channels</p>
        </div>
      </div>
    </div>
  );
}

function SocialChannels() {
  const data = useFilteredBusinessCardData();

  if (!data) return null;

  const channels = data.socialChannels;
  const visibleChannels = [
    { key: 'facebook', icon: 'facebook', label: 'Facebook', svgPath: contactSvgPaths.pbab2f00, url: socialChannelUrlPatterns.facebook(channels.facebook.username), config: channels.facebook },
    { key: 'linkedin', icon: 'linkedin', label: 'Linkedin', svgPath: contactSvgPaths.p3dcb5200, url: socialChannelUrlPatterns.linkedin(channels.linkedin.username), config: channels.linkedin },
    { key: 'twitter', icon: 'twitter', label: 'Twitter', svgPath: contactSvgPaths.pc49a000, url: socialChannelUrlPatterns.twitter(channels.twitter.username), config: channels.twitter },
    { key: 'youtube', icon: 'youtube', label: 'Youtube', svgPath: contactSvgPaths.p39d046f0, url: socialChannelUrlPatterns.youtube(channels.youtube.username), config: channels.youtube },
    { key: 'tiktok', icon: 'tiktok', label: 'Tiktok', svgPath: contactSvgPaths.p15734100, url: socialChannelUrlPatterns.tiktok(channels.tiktok.username), config: channels.tiktok },
  ].filter(channel => channel.config.username);

  if (visibleChannels.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-[16px] w-full" data-name="connect">
      {visibleChannels.map(channel => (
        <SocialButton key={channel.key} icon={channel.icon} label={channel.label} svgPath={channel.svgPath} url={channel.url} target={`socialChannels.${channel.key}` as any} />
      ))}
    </div>
  );
}

function PortfolioListing() {
  const data = useFilteredBusinessCardData();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    // Set first category as default if available
    if (data && data.portfolioCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(data.portfolioCategories[0].id);
    }
  }, [data, selectedCategoryId]);

  if (!data) return null;

  return (
    <div className="box-border content-stretch flex flex-col gap-[16px] items-start px-[24px] py-0 relative w-full">
      <div className="h-[56px] overflow-x-auto overflow-y-clip relative shrink-0 w-full" data-name="nav-menu-slider">
        <PortfolioSlider 
          categories={data.portfolioCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </div>
      <PortfolioList 
        portfolioItems={data.portfolio}
        selectedCategoryId={selectedCategoryId}
      />
    </div>
  );
}

function PortfolioSlider({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory 
}: { 
  categories: PortfolioCategory[]; 
  selectedCategoryId: string | null; 
  onSelectCategory: (id: string) => void;
}) {
  if (categories.length === 0) {
    return (
      <div className="absolute content-stretch flex gap-[8px] inset-0 items-center justify-center" data-name="slider">
        <div className="text-zinc-500">No categories available</div>
      </div>
    );
  }

  return (
    <div className="absolute content-stretch flex gap-[8px] inset-0 items-center" data-name="slider">
      {categories.map((category) => (
        <PortfolioCategory 
          key={category.id}
          name={category.name}
          isActive={selectedCategoryId === category.id}
          onClick={() => onSelectCategory(category.id)}
        />
      ))}
    </div>
  );
}

function PortfolioCategory({ name, isActive, onClick }: { name: string; isActive: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="basis-0 content-stretch flex flex-col grow h-full items-center justify-center min-h-px min-w-px relative shrink-0" 
      data-name="category"
    >
      <div className="basis-0 box-border content-stretch flex gap-[8px] grow items-center justify-center min-h-px min-w-px overflow-clip relative rounded-[12px] shrink-0 px-[12px] py-[8px]" data-name="Button-Text">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#535146] text-[18px] text-center text-nowrap">
          <p className="leading-[28px] whitespace-pre">{name}</p>
        </div>
      </div>
      {isActive ? <PortfolioActive /> : <PortfolioActiveInactive />}
    </button>
  );
}

function PortfolioActive() {
  return (
    <div className="bg-[#535146] h-[4px] relative rounded-[100px] shrink-0 w-full" data-name="active">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="h-[4px] w-full" />
      </div>
    </div>
  );
}

function PortfolioActiveInactive() {
  return (
    <div className="h-[4px] relative rounded-[100px] shrink-0 w-full" data-name="active">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="h-[4px] w-full" />
      </div>
    </div>
  );
}

function PortfolioList({ 
  portfolioItems, 
  selectedCategoryId 
}: { 
  portfolioItems: PortfolioItem[]; 
  selectedCategoryId: string | null;
}) {
  // Filter items by selected category
  const filteredItems = selectedCategoryId 
    ? portfolioItems.filter(item => item.categoryId === selectedCategoryId)
    : portfolioItems;

  if (filteredItems.length === 0) {
    return (
      <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full py-12">
        <p className="text-zinc-500">No portfolio items in this category</p>
      </div>
    );
  }

  // Placeholder image for items without images
  const placeholderImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full pb-[16px] pt-[0px] pr-[0px] pl-[0px]" data-name="list">
      {filteredItems.map((item) => {
        // Determine the type for the UI component
        let displayType: 'image' | 'video' | 'virtual-tour' = 'image';
        let displayImages: string[] = [];
        
        if (item.type === 'images' && item.images && item.images.length > 0) {
          displayType = 'image';
          displayImages = item.images;
        } else if (item.type === 'video') {
          displayType = 'video';
          // Use first image as thumbnail or placeholder
          displayImages = item.images && item.images.length > 0 ? [item.images[0]] : [placeholderImage];
        } else if (item.type === 'virtual-tour') {
          displayType = 'virtual-tour';
          // Use first image as thumbnail or placeholder
          displayImages = item.images && item.images.length > 0 ? [item.images[0]] : [placeholderImage];
        }

        // Fallback to placeholder if no images
        if (displayImages.length === 0) {
          displayImages = [placeholderImage];
        }

        return (
          <PortfolioItemDisplay
            key={item.id}
            itemId={item.id}
            type={displayType}
            images={displayImages}
            title={item.title}
            details={item.description}
            videoUrl={item.videoUrl}
            tourUrl={item.tourUrl}
          />
        );
      })}
    </div>
  );
}

function PortfolioItemDisplay({ 
  itemId,
  type = 'image', 
  images, 
  title, 
  details,
  videoUrl: customVideoUrl,
  tourUrl: customTourUrl
}: { 
  itemId: string;
  type?: 'image' | 'video' | 'virtual-tour'; 
  images: string[]; 
  title: string; 
  details: string;
  videoUrl?: string;
  tourUrl?: string;
}) {
  const routeInfo = parseProfileUrl();
  const { trackClickEvent } = useAnalyticsTracking(routeInfo.userCode || '', routeInfo.group || '', undefined);
  
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isVirtualTourOpen, setIsVirtualTourOpen] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isImageFullscreen, setIsImageFullscreen] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const totalDuration = 45; // Mock duration in seconds
  
  // Touch handling for swipe navigation
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  
  // Get current image
  const imgSrc = images[currentImageIndex] || images[0];
  
  // Use custom URLs or fallback to demo URLs
  const videoUrl = customVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const virtualTourUrl = customTourUrl || "https://my.matterport.com/show/?m=SxQL3iGyoDo";
  
  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (isFullscreen || isImageFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isFullscreen, isImageFullscreen]);
  
  const nextImage = () => {
    if (type === 'image' && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };
  
  const previousImage = () => {
    if (type === 'image' && images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };
  
  const handleImageFullscreen = () => {
    // Track image open
    trackClickEvent('portfolio.imageOpen');
    setIsImageFullscreen(true);
  };
  
  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    // Prevent default scrolling while swiping
    if (Math.abs((touchStart || 0) - e.targetTouches[0].clientX) > 10) {
      e.preventDefault();
    }
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      previousImage();
    }
    
    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        // Track video play
        trackClickEvent('portfolio.videoPlay');
        
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error("Play was prevented:", error);
              setIsPlaying(false);
            });
        }
      }
    }
  };
  
  const handleFullscreen = () => {
    // Use custom fullscreen modal (permissions policy prevents native fullscreen in this environment)
    setIsFullscreen(true);
  };
  
  const handleVirtualTourClick = () => {
    if (type === 'virtual-tour') {
      // Track virtual tour open
      trackClickEvent('portfolio.virtualTourOpen');
      setIsVirtualTourOpen(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="content-stretch flex flex-col gap-[8px] items-start relative rounded-[24px] shrink-0 w-full" data-name="item">
        <div 
          className={`overflow-clip relative rounded-[16px] shrink-0 w-full ${type === 'virtual-tour' ? 'cursor-pointer' : ''}`} 
          data-name="IMG"
          onClick={handleVirtualTourClick}
          onTouchStart={type === 'image' && images.length > 1 ? onTouchStart : undefined}
          onTouchMove={type === 'image' && images.length > 1 ? onTouchMove : undefined}
          onTouchEnd={type === 'image' && images.length > 1 ? onTouchEnd : undefined}
          style={type === 'image' && images.length > 1 ? { touchAction: 'pan-y' } : undefined}
        >
          <AspectRatio ratio={16 / 9} className="w-full">
            {type === 'video' ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                src={videoUrl}
                poster={imgSrc}
                playsInline
                preload="metadata"
                onTimeUpdate={(e) => setCurrentTime(Math.floor(e.currentTarget.currentTime))}
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={imgSrc} />
            )}
          </AspectRatio>
          

        
        {/* Image carousel indicator */}
        {type === 'image' && (
          <div className="absolute bottom-0 box-border content-stretch flex flex-col gap-[8px] items-center justify-end left-0 p-[8px] right-0 z-10" data-name="bottom">
            <div className="flex gap-1.5 items-center justify-center">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className="transition-all"
                  aria-label={`Go to image ${index + 1}`}
                >
                  <div 
                    className={`rounded-full bg-white transition-all ${
                      index === currentImageIndex 
                        ? 'w-3 h-3 opacity-100' 
                        : 'w-2 h-2 opacity-50 hover:opacity-75'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Fullscreen icon for images */}
        {type === 'image' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleImageFullscreen();
            }}
            className="absolute bottom-2 right-2 z-20 text-white hover:scale-110 transition-transform active:scale-95 p-1.5"
            aria-label="View fullscreen"
          >
            <Maximize className="w-5 h-5 drop-shadow-lg" />
          </button>
        )}
        
        {/* Video controls */}
        {type === 'video' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 z-10" data-name="video-controls">
            <div className="flex flex-col gap-1">
              {/* Timeline bar */}
              <div className="relative h-0.5 bg-white/30 rounded-full overflow-hidden cursor-pointer">
                <div 
                  className="absolute h-full bg-white rounded-full transition-all"
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>
              
              {/* Control buttons and time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={togglePlay}
                    className="text-white hover:scale-110 transition-transform active:scale-95"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 fill-white" />
                    )}
                  </button>
                  <span className="text-white text-xs font-medium">
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </span>
                </div>
                <button 
                  onClick={handleFullscreen}
                  className="p-1.5 hover:scale-110 transition-transform active:scale-95"
                >
                  <Maximize className="w-5 h-5 text-white drop-shadow-lg" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Virtual tour indicator */}
        {type === 'virtual-tour' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" data-name="virtual-tour-overlay">
            <motion.div
              animate={{
                x: [-12, 12, -12],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Hand className="w-6 h-6 text-white drop-shadow-lg" />
            </motion.div>
          </div>
        )}
      </div>
      
      <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="title">
        <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0" data-name="txt">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="title">
            <div className="basis-0 flex flex-col font-['Inter:Medium',sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#535146] text-[16px] text-nowrap">
              <p className="[white-space-collapse:collapse] leading-[24px] overflow-ellipsis overflow-hidden">{title}</p>
            </div>
          </div>
          <p className="font-['Arial:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#83827d] text-[14px] w-full overflow-hidden text-ellipsis whitespace-nowrap">{details}</p>
        </div>
      </div>
    </div>
    
    {/* Fullscreen Video Modal */}
    {type === 'video' && isFullscreen && (
      <div 
        className="fixed inset-0 z-[99999] bg-black flex flex-col"
        style={{ 
          width: '100vw',
          height: '100dvh',
          position: 'fixed',
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          touchAction: 'none'
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 z-[100000] text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all"
          style={{ position: 'fixed' }}
          aria-label="Close fullscreen"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Video player */}
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ 
            width: '100vw',
            height: '100dvh'
          }}
        >
          <video
            className="max-w-full max-h-full"
            src={videoUrl}
            controls
            controlsList="nodownload"
            autoPlay
            playsInline
            preload="metadata"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#000'
            }}
          />
        </div>
      </div>
    )}
    
    {/* Image Fullscreen Modal */}
    {type === 'image' && isImageFullscreen && (
      <div 
        className="fixed inset-0 z-[99999] bg-black flex flex-col"
        style={{ 
          width: '100vw',
          height: '100vh',
          minHeight: '-webkit-fill-available',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 0,
          padding: 0,
          touchAction: images.length > 1 ? 'pan-y' : 'auto',
          overflow: 'hidden'
        }}
        onTouchStart={images.length > 1 ? onTouchStart : undefined}
        onTouchMove={images.length > 1 ? onTouchMove : undefined}
        onTouchEnd={images.length > 1 ? onTouchEnd : undefined}
      >
        {/* Close button */}
        <button
          onClick={() => setIsImageFullscreen(false)}
          className="absolute top-4 right-4 z-[100000] text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all"
          style={{ position: 'fixed' }}
          aria-label="Close fullscreen"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Image */}
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ 
            width: '100vw',
            height: '100vh',
            minHeight: '-webkit-fill-available'
          }}
        >
          <img
            src={imgSrc}
            alt=""
            className="max-w-full max-h-full pointer-events-none"
            style={{ 
              width: 'auto',
              height: 'auto',
              maxWidth: '100vw',
              maxHeight: '100vh',
              objectFit: 'contain'
            }}
          />
        </div>
        
        {/* Carousel indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 z-[100000]" style={{ position: 'fixed' }}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className="transition-all"
                aria-label={`Go to image ${index + 1}`}
              >
                <div 
                  className={`rounded-full bg-white transition-all ${
                    index === currentImageIndex 
                      ? 'w-4 h-4 opacity-100' 
                      : 'w-3 h-3 opacity-50 hover:opacity-75'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    )}
    
    {/* Virtual Tour Dialog */}
    {type === 'virtual-tour' && (
      <Dialog open={isVirtualTourOpen} onOpenChange={setIsVirtualTourOpen}>
        <DialogContent className="max-w-[100vw] w-full p-0 bg-black border-0 [&>button[class*='ring-offset']]:hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }} aria-describedby={undefined}>
          <DialogTitle className="sr-only">360° Virtual Tour</DialogTitle>
          <button
            onClick={() => setIsVirtualTourOpen(false)}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full h-full">
            <iframe
              src={virtualTourUrl}
              className="w-full h-full border-0"
              title="360° Virtual Tour"
              allow="accelerometer; gyroscope; fullscreen"
            />
          </div>
        </DialogContent>
      </Dialog>
    )}
  </>
  );
}

function PortfolioScrollPage() {
  return (
    <div className="h-[6px] relative shrink-0 w-[50px]" data-name="scroll page">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 6">
        <g id="scroll page">
          <circle cx="2" cy="3" fill="var(--fill-0, white)" fillOpacity="0.48" id="Ellipse 90" r="2" />
          <circle cx="13" cy="3" fill="var(--fill-0, white)" fillOpacity="0.48" id="Ellipse 91" r="3" />
          <circle cx="25" cy="3" fill="var(--fill-0, white)" id="Ellipse 92" r="3" />
          <circle cx="37" cy="3" fill="var(--fill-0, white)" fillOpacity="0.48" id="Ellipse 92_2" r="3" />
          <circle cx="48" cy="3" fill="var(--fill-0, white)" fillOpacity="0.48" id="Ellipse 93" r="2" />
        </g>
      </svg>
    </div>
  );
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'contact' | 'profile' | 'portfolio'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Calculate and set actual viewport height (accounting for mobile browser chrome)
  useEffect(() => {
    const setVH = () => {
      // Use visualViewport API when available (more accurate on mobile)
      const height = window.visualViewport 
        ? window.visualViewport.height 
        : window.innerHeight;
      
      // Set CSS custom property: 1vh = 1% of actual visible viewport height
      const vh = height * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set on mount
    setVH();

    // Update on resize, orientation change, and visual viewport changes
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    // Handle iOS Safari address bar show/hide
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVH);
      window.visualViewport.addEventListener('scroll', setVH);
    }

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setVH);
        window.visualViewport.removeEventListener('scroll', setVH);
      }
    };
  }, []);

  // Ensure default user exists on app mount
  useEffect(() => {
    ensureDefaultUserExists();
  }, []);

  // Parse route to determine screen and context
  const routeInfo = parseProfileUrl(currentRoute);
  
  // Redirect root URL or non-existent users to default user (myclik)
  useEffect(() => {
    const DEFAULT_USER = 'myclik';
    
    // Check if we're at root path
    if (currentRoute === '/') {
      const path = buildProfileUrl({ userCode: DEFAULT_USER, screen: 'home' });
      window.history.replaceState({}, '', path);
      setCurrentRoute(path);
      return;
    }
    
    // Check if user exists (for both CMS and regular routes)
    if (routeInfo.userCode) {
      // Check if this user exists in storage
      if (!userExists(routeInfo.userCode)) {
        console.log(`[App] User '${routeInfo.userCode}' does not exist, redirecting to default user '${DEFAULT_USER}'`);
        
        // Redirect to default user, preserving route type (CMS or regular)
        let path: string;
        if (routeInfo.isCMS) {
          path = buildCMSUrl(DEFAULT_USER);
        } else {
          path = buildProfileUrl({ userCode: DEFAULT_USER, screen: routeInfo.screen || 'home' });
        }
        
        window.history.replaceState({}, '', path);
        setCurrentRoute(path);
      }
    }
  }, [currentRoute, routeInfo.userCode, routeInfo.isCMS, routeInfo.screen]);
  
  // Update currentScreen based on URL when route changes
  useEffect(() => {
    if (routeInfo.screen) {
      setCurrentScreen(routeInfo.screen);
    } else if (routeInfo.userCode && !routeInfo.isCMS) {
      // If we have a userCode but no screen specified, default to home
      setCurrentScreen('home');
    }
  }, [currentRoute, routeInfo.screen, routeInfo.userCode, routeInfo.isCMS]);
  
  // Track page views when screen changes (for business card views only, not CMS)
  useEffect(() => {
    if (routeInfo.userCode && !routeInfo.isCMS && routeInfo.shareCode) {
      const pageMap: Record<string, 'page.home' | 'page.contact' | 'page.profile' | 'page.portfolio'> = {
        'home': 'page.home',
        'contact': 'page.contact',
        'profile': 'page.profile',
        'portfolio': 'page.portfolio',
      };
      
      const page = pageMap[currentScreen];
      if (page) {
        trackPageView(
          routeInfo.userCode,
          routeInfo.shareCode,
          page,
          routeInfo.contactId
        );
      }
    }
  }, [currentScreen, routeInfo.userCode, routeInfo.shareCode, routeInfo.contactId, routeInfo.isCMS]);

  // Listen for route changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
      // Dispatch custom event to notify components of route change
      window.dispatchEvent(new Event('routechange'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    // Dispatch custom event to notify components of route change
    window.dispatchEvent(new Event('routechange'));
  };

  const navigateToContact = () => {
    const { userCode, group } = routeInfo;
    const path = buildProfileUrl({ userCode: userCode || undefined, group, screen: 'contact' });
    navigateTo(path);
  };

  const navigateToProfile = () => {
    const { userCode, group } = routeInfo;
    const path = buildProfileUrl({ userCode: userCode || undefined, group, screen: 'profile' });
    navigateTo(path);
  };

  const navigateToPortfolio = () => {
    const { userCode, group } = routeInfo;
    const path = buildProfileUrl({ userCode: userCode || undefined, group, screen: 'portfolio' });
    navigateTo(path);
  };

  const navigateToHome = () => {
    const { userCode, group } = routeInfo;
    const path = buildProfileUrl({ userCode: userCode || undefined, group, screen: 'home' });
    navigateTo(path);
  };

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // CMS Route Handling
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cmsSection, setCmsSection] = useState<string | null>(routeInfo.cmsSection);

  // AI Agent state for business card screens
  const [aiAgentOpen, setAIAgentOpen] = useState(false);
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [currentThreadId, setCurrentThreadIdState] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
    const savedThreadId = getCurrentThreadId();
    setCurrentThreadIdState(savedThreadId);
  }, []);

  const loadThreads = () => {
    const threadsSummary = getThreadsSummary();
    setThreads(threadsSummary);
  };

  const handleNewThread = () => {
    const newThread = createThread();
    setCurrentThreadIdState(newThread.id);
    loadThreads();
    setThreadsOpen(false);
    toast.success("New conversation started");
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadIdState(threadId);
    setCurrentThreadId(threadId);
    setThreadsOpen(false);
    toast.success("Conversation loaded");
  };

  const handleDeleteThread = (threadId: string) => {
    deleteThread(threadId);
    if (currentThreadId === threadId) {
      setCurrentThreadIdState(null);
    }
    loadThreads();
    toast.success("Conversation deleted");
  };

  const handleThreadUpdate = () => {
    loadThreads();
  };

  const handleApplySuggestion = async (value: string) => {
    await copyWithToast(
      value, 
      toast, 
      "Copied to clipboard! You can paste it into any field.",
      "Unable to copy to clipboard. Please copy manually."
    );
  };

  // AI Agent handling
  const handleOpenAIAssistant = () => {
    if (routeInfo.isCMS) {
      // If already in CMS, trigger the AI Agent directly
      if (typeof window !== 'undefined' && (window as any).__openAIAssistant) {
        (window as any).__openAIAssistant();
      }
    } else {
      // Navigate to CMS first, then open AI Agent
      const cmsUrl = buildCMSUrl(getUserCode());
      navigateTo(cmsUrl);
      // Set a flag to open AI Agent after navigation
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).__openAIAssistant) {
          (window as any).__openAIAssistant();
        }
      }, 100);
    }
  };

  if (routeInfo.isCMS) {
    // Show Business Card Studio overview if no section is selected
    if (!cmsSection) {
      const data = loadBusinessCardData(routeInfo.userCode || undefined);
      return (
        <>
          <BusinessCardStudio
            onNavigateToSection={(section) => {
              setCmsSection(section);
              navigateTo(buildCMSUrl(getUserCode(), section));
            }}
            onNavigateHome={navigateToHome}
            onMenuClick={openMenu}
            onAIClick={handleOpenAIAssistant}
            profileImage={data.personal.profileImage}
            profileName={data.personal.name}
          />
          <NavigationMenu
            isOpen={isMenuOpen}
            onClose={closeMenu}
            onNavigateHome={navigateToHome}
            onNavigateContact={navigateToContact}
            onNavigateProfile={navigateToProfile}
            onNavigatePortfolio={navigateToPortfolio}
            onNavigateToMyProfile={() => navigateTo(buildCMSUrl(getUserCode()))}
            currentScreen="home"
            isAuthenticated={true}
            onLogin={() => navigateTo(buildCMSUrl(getUserCode()))}
            onLogout={() => {
              setCmsSection(null);
              // Navigate to own profile home, not currently viewed profile
              const path = buildProfileUrl({ userCode: getUserCode(), screen: 'home' });
              navigateTo(path);
            }}
            onNavigateToCMS={(section) => {
              setCmsSection(section);
              navigateTo(buildCMSUrl(getUserCode(), section));
            }}
            cmsSection={null}
            onOpenAIAssistant={handleOpenAIAssistant}
          />
        </>
      );
    }

    // Show specific section in CMSDashboard
    return (
      <>
        <CMSDashboard
          activeSection={cmsSection}
          onLogout={() => {
            setCmsSection(null);
            // Navigate to own profile home, not currently viewed profile
            const path = buildProfileUrl({ userCode: getUserCode(), screen: 'home' });
            navigateTo(path);
          }}
          onNavigateHome={navigateToHome}
          onNavigateToStudio={() => setCmsSection(null)}
          onMenuClick={openMenu}
          onOpenAIAssistant={handleOpenAIAssistant}
        />
        <NavigationMenu
          isOpen={isMenuOpen}
          onClose={closeMenu}
          onNavigateHome={navigateToHome}
          onNavigateContact={navigateToContact}
          onNavigateProfile={navigateToProfile}
          onNavigatePortfolio={navigateToPortfolio}
          onNavigateToMyProfile={() => {
            setCmsSection(null);
            navigateTo(buildCMSUrl(getUserCode()));
          }}
          currentScreen="home"
          isAuthenticated={true}
          onLogin={() => navigateTo(buildCMSUrl(getUserCode()))}
          onLogout={() => {
            setCmsSection(null);
            // Navigate to own profile home, not currently viewed profile
            const path = buildProfileUrl({ userCode: getUserCode(), screen: 'home' });
            navigateTo(path);
          }}
          onNavigateToCMS={(section) => {
            setCmsSection(section);
          }}
          cmsSection={cmsSection}
          onOpenAIAssistant={handleOpenAIAssistant}
        />
      </>
    );
  }

  if (currentScreen === 'contact') {
    return (
      <>
        <ContactScreen onBack={navigateToHome} onMenuClick={openMenu} onAIClick={() => setAIAgentOpen(true)} />
        <NavigationMenu
          isOpen={isMenuOpen}
          onClose={closeMenu}
          onNavigateHome={navigateToHome}
          onNavigateContact={navigateToContact}
          onNavigateProfile={navigateToProfile}
          onNavigatePortfolio={navigateToPortfolio}
          onNavigateToMyProfile={() => navigateTo(buildCMSUrl(getUserCode()))}
          currentScreen={currentScreen}
          isAuthenticated={true}
          onLogin={() => navigateTo(buildCMSUrl(getUserCode()))}
          onLogout={() => {
            setCmsSection(null);
            // Navigate to own profile home, not currently viewed profile
            const path = buildProfileUrl({ userCode: getUserCode(), screen: 'home' });
            navigateTo(path);
          }}
          onNavigateToCMS={(section) => {
            setCmsSection(section);
            navigateTo(buildCMSUrl(getUserCode(), section));
          }}
          cmsSection={null}
          onOpenAIAssistant={handleOpenAIAssistant}
        />
        
        {/* AI Agent Sheet */}
        <Sheet open={aiAgentOpen} onOpenChange={setAIAgentOpen}>
          <SheetContent side="right" className="w-full sm:max-w-[390px] p-0 bg-[#f5f4ee] [&>button]:hidden">
            <SheetTitle className="sr-only">AI Agent</SheetTitle>
            <SheetDescription className="sr-only">
              Get AI assistance for writing and improving your business card content
            </SheetDescription>
            <div className="flex flex-col h-full relative">
              {/* Header */}
              <div className="h-[46px] shrink-0 relative z-20 border-b border-[#ebebeb]">
                <div className="flex h-[46px] items-center justify-between px-[12px]">
                  {/* Menu icon */}
                  <button onClick={() => setThreadsOpen(true)} className="shrink-0 size-[24px]" aria-label="Menu">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <path d="M4 12H20" stroke="#3D3D3A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M4 18H20" stroke="#3D3D3A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M4 6H20" stroke="#3D3D3A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                  
                  {/* Title */}
                  <div className="flex-1 text-center">
                    <p className="leading-[20px] text-[#3d3929] text-sm text-[16px] font-medium">
                      AI Agent
                    </p>
                  </div>
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setAIAgentOpen(false)}
                    className="shrink-0 size-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#ebebeb]/30 transition-colors" 
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-[#83827d]" strokeWidth={1.67} />
                  </button>
                </div>
              </div>

              {/* AI Assistant Component */}
              <AIAssistant
                fieldLabel="Business Card Content"
                currentValue=""
                onApply={handleApplySuggestion}
                threadId={currentThreadId}
                onThreadUpdate={handleThreadUpdate}
                threads={threads}
                currentThreadId={currentThreadId}
                onSelectThread={handleSelectThread}
                onNewThread={handleNewThread}
                onDeleteThread={handleDeleteThread}
              />

              {/* Threads Sidebar Overlay - Full Height */}
              <div 
                className={`absolute inset-0 w-full sm:w-[280px] bg-[#faf9f5] border-r border-[#dad9d4] z-30 transition-transform duration-300 ${
                  threadsOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex h-[46px] items-center justify-between px-[12px] border-b border-[#dad9d4]">
                    {/* New Chat Button */}
                    <button
                      onClick={() => {
                        handleNewThread();
                        setThreadsOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#ebebeb]/50 rounded-lg transition-colors"
                      aria-label="New chat"
                    >
                      <div className="w-6 h-6 bg-[#c96442] rounded-full flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm text-[#3d3d3a]">New chat</span>
                    </button>
                    
                    {/* Close Button */}
                    <button
                      onClick={() => setThreadsOpen(false)}
                      className="shrink-0 size-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#ebebeb]/30 transition-colors"
                      aria-label="Close sidebar"
                    >
                      <X className="w-5 h-5 text-[#83827d]" strokeWidth={1.67} />
                    </button>
                  </div>

                  {/* Navigation Menu */}
                  <div className="px-2 py-3 border-b border-[#dad9d4]">
                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-[#ebebeb]/50 text-[#3d3d3a] text-sm transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>Chats</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#ebebeb]/30 text-[#7a776c] text-sm transition-colors">
                        <Sparkles className="w-4 h-4" />
                        <span>Projects</span>
                      </button>
                    </div>
                  </div>

                  {/* Recents Section */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-3 py-2">
                      <h3 className="text-xs text-[#7a776c] px-2 mb-2">Recents</h3>
                      {threads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                          <MessageSquare className="w-8 h-8 text-[#83827d] mb-2 opacity-50" />
                          <p className="text-xs text-[#83827d]">No conversations yet</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {[...threads].sort((a, b) => b.timestamp - a.timestamp).map((thread) => (
                            <div
                              key={thread.id}
                              className={`group relative rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                                currentThreadId === thread.id
                                  ? "bg-[#ebebeb]/70"
                                  : "hover:bg-[#ebebeb]/30"
                              }`}
                              onClick={() => {
                                handleSelectThread(thread.id);
                                setThreadsOpen(false);
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0 flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-[#7a776c] flex-shrink-0" />
                                  <span className="text-sm text-[#3d3d3a] truncate">
                                    {thread.title}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteThread(thread.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#ebebeb]/50 rounded flex-shrink-0"
                                  aria-label="Delete conversation"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#7a776c]" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  if (currentScreen === 'profile') {
    return (
      <>
        <ProfileScreen onBack={navigateToHome} onMenuClick={openMenu} />
        <NavigationMenu
          isOpen={isMenuOpen}
          onClose={closeMenu}
          onNavigateHome={navigateToHome}
          onNavigateContact={navigateToContact}
          onNavigateProfile={navigateToProfile}
          onNavigatePortfolio={navigateToPortfolio}
          onNavigateToMyProfile={() => navigateTo(buildCMSUrl(getUserCode()))}
          currentScreen={currentScreen}
          isAuthenticated={true}
          onLogin={() => navigateTo(buildCMSUrl(getUserCode()))}
          onLogout={() => {
            setCmsSection(null);
            // Navigate to own profile home, not currently viewed profile
            const path = buildProfileUrl({ userCode: getUserCode(), screen: 'home' });
            navigateTo(path);
          }}
          onNavigateToCMS={(section) => {
            setCmsSection(section);
            navigateTo(buildCMSUrl(getUserCode(), section));
          }}
          cmsSection={null}
          onOpenAIAssistant={handleOpenAIAssistant}
        />
      </>
    );
  }

  if (currentScreen === 'portfolio') {
    return (
      <>
        <PortfolioScreen onBack={navigateToHome} onMenuClick={openMenu} />
        <NavigationMenu
          isOpen={isMenuOpen}
          onClose={closeMenu}
          onNavigateHome={navigateToHome}
          onNavigateContact={navigateToContact}
          onNavigateProfile={navigateToProfile}
          onNavigatePortfolio={navigateToPortfolio}
          onNavigateToMyProfile={() => navigateTo(buildCMSUrl(getUserCode()))}
          currentScreen={currentScreen}
          isAuthenticated={true}
          onLogin={() => navigateTo(buildCMSUrl(getUserCode()))}
          onLogout={() => {
            setCmsSection(null);
            // Navigate to own profile home, not currently viewed profile
            const path = buildProfileUrl({ userCode: getUserCode(), screen: 'home' });
            navigateTo(path);
          }}
          onNavigateToCMS={(section) => {
            setCmsSection(section);
            navigateTo(buildCMSUrl(getUserCode(), section));
          }}
          cmsSection={null}
          onOpenAIAssistant={handleOpenAIAssistant}
        />
      </>
    );
  }

  return (
    <div className="bg-[#c96442] w-full overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      <div className="relative w-full h-full">
        <HomeBackgroundImage />
        <Gradient 
          onNavigateToContact={navigateToContact} 
          onNavigateToProfile={navigateToProfile}
          onNavigateToPortfolio={navigateToPortfolio}
        />
      </div>
    </div>
  );
}
