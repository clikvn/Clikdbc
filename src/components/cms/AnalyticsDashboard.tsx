import { useState, useMemo } from 'react';
import { Eye, MousePointerClick, Users, Share2, Home, User, Briefcase, Mail, Phone, Calendar, MapPin, Link2, MessageCircle, ChevronDown, Search, X, ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { useAnalyticsDashboard } from '../../hooks/useAnalytics';
import { getUserCode } from '../../utils/user-code';
import { loadContacts } from '../../utils/contact-storage';
import { loadCustomGroups } from '../../utils/custom-groups';
import { AnalyticsPeriod, AnalyticsFilters } from '../../types/analytics';
import { loadBusinessCardData } from '../../utils/business-card-storage';

// Compact Metric Tile
function MetricTile({ 
  icon: Icon, 
  label, 
  value,
  iconColor = 'text-purple-600',
  iconBg = 'bg-purple-50'
}: { 
  icon: any; 
  label: string; 
  value: string | number;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl truncate">{value}</div>
          <div className="text-xs text-muted-foreground truncate">{label}</div>
        </div>
      </div>
    </Card>
  );
}

// Page Stats Block
function PageStatsBlock({
  icon: Icon,
  title,
  pageViews,
  elements,
  showElements = true
}: {
  icon: any;
  title: string;
  pageViews: number;
  elements: { label: string; clicks: number }[];
  showElements?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-foreground" />
        <h3>{title}</h3>
        <span className="ml-auto text-sm text-muted-foreground">{pageViews} views</span>
      </div>
      
      {showElements && elements.length > 0 ? (
        <div className="space-y-2">
          {elements.map((element, index) => {
            // Get icon based on element label - improved matching
            const getElementIcon = (label: string) => {
              const lower = label.toLowerCase();
              // Phone
              if (lower === 'phone' || lower.includes('call')) return Phone;
              // Email
              if (lower === 'email' || lower.includes('mail')) return Mail;
              // Messaging apps
              if (lower === 'whatsapp') return MessageCircle;
              if (lower === 'telegram') return MessageCircle;
              if (lower === 'messenger') return MessageCircle;
              if (lower === 'zalo') return MessageCircle;
              if (lower === 'kakao') return MessageCircle;
              if (lower === 'discord') return MessageCircle;
              if (lower === 'wechat') return MessageCircle;
              // Location/Address
              if (lower === 'location' || lower === 'address' || lower.includes('map')) return MapPin;
              // Save Contact
              if (lower === 'save contact') return User;
              // Social channels
              if (lower === 'facebook' || lower === 'linkedin' || lower === 'twitter' || lower === 'youtube' || lower === 'tiktok') return Link2;
              // Calendar
              if (lower.includes('calendar') || lower.includes('schedule')) return Calendar;
              // Portfolio
              if (lower.includes('portfolio') || lower.includes('work') || lower.includes('next') || lower.includes('previous')) return Briefcase;
              // Profile/About
              if (lower.includes('profile') || lower.includes('about')) return User;
              // Default
              return MousePointerClick;
            };
            
            const ElementIcon = getElementIcon(element.label);
            
            return (
              <div key={index} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                <div className="flex items-center gap-2 text-foreground truncate flex-1">
                  <ElementIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{element.label}</span>
                </div>
                <span className="text-foreground ml-2 flex-shrink-0">{element.clicks} Cliks</span>
              </div>
            );
          })}
        </div>
      ) : showElements && elements.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No interactions yet</p>
      ) : null}
    </Card>
  );
}

// Format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function AnalyticsDashboard() {
  const userCode = getUserCode();
  const profile = loadBusinessCardData();
  const contacts = useMemo(() => loadContacts(), []);
  const groups = useMemo(() => loadCustomGroups(), []);
  
  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: '7d',
  });
  
  const [isContactSearchOpen, setIsContactSearchOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  
  const { dashboard, isLoading } = useAnalyticsDashboard(userCode, filters, contacts);

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!contactSearchQuery) return contacts;
    const query = contactSearchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.name?.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query)
    );
  }, [contacts, contactSearchQuery]);

  // Get selected contact name
  const selectedContactName = useMemo(() => {
    if (!filters.contactEmail) return null;
    const contact = contacts.find(c => c.email === filters.contactEmail);
    return contact ? (contact.name || contact.email) : null;
  }, [filters.contactEmail, contacts]);

  // Handle contact selection
  const handleSelectContact = (email: string) => {
    setFilters(prev => ({ ...prev, contactEmail: email }));
    setIsContactSearchOpen(false);
    setContactSearchQuery('');
  };

  // Clear contact filter
  const handleClearContact = () => {
    setFilters(prev => ({ ...prev, contactEmail: undefined }));
  };

  // Calculate engagement contacts (unique contacts who clicked something)
  const engagementContacts = useMemo(() => {
    if (!dashboard) return 0;
    const uniqueContacts = new Set<string>();
    dashboard.contactBreakdown.forEach(contact => {
      if (contact.metrics.totalClicks > 0) {
        uniqueContacts.add(contact.contactEmail || contact.contactName);
      }
    });
    return uniqueContacts.size;
  }, [dashboard]);

  // Calculate new shares (contacts added in this period)
  const newShares = useMemo(() => {
    if (!dashboard) return 0;
    return dashboard.contactBreakdown.length;
  }, [dashboard]);

  // Get all available elements for each screen from business card data
  const getAllScreenElements = useMemo(() => {
    const elements: Record<string, { label: string; type: string }[]> = {
      home: [],
      contact: [],
      profile: [],
      portfolio: []
    };

    // Home Screen elements
    if (profile.contact.phone.value) {
      elements.home.push({ label: 'Phone', type: 'phone' });
    }
    if (profile.contact.email.value) {
      elements.home.push({ label: 'Email', type: 'email' });
    }
    if (profile.socialMessaging.whatsapp.username) {
      elements.home.push({ label: 'WhatsApp', type: 'whatsapp' });
    }
    if (profile.contact.address.value) {
      elements.home.push({ label: 'Location', type: 'location' });
    }
    // Add a generic website/link button (common on home screens)
    elements.home.push({ label: 'Save Contact', type: 'save' });

    // Contact Screen elements
    if (profile.contact.phone.value) {
      elements.contact.push({ label: 'Phone', type: 'phone' });
    }
    if (profile.contact.email.value) {
      elements.contact.push({ label: 'Email', type: 'email' });
    }
    if (profile.contact.address.value) {
      elements.contact.push({ label: 'Address', type: 'location' });
    }
    
    // Messaging apps
    if (profile.socialMessaging.whatsapp.username) {
      elements.contact.push({ label: 'WhatsApp', type: 'whatsapp' });
    }
    if (profile.socialMessaging.telegram.username) {
      elements.contact.push({ label: 'Telegram', type: 'telegram' });
    }
    if (profile.socialMessaging.messenger.username) {
      elements.contact.push({ label: 'Messenger', type: 'messenger' });
    }
    if (profile.socialMessaging.zalo.username) {
      elements.contact.push({ label: 'Zalo', type: 'zalo' });
    }
    if (profile.socialMessaging.kakao.username) {
      elements.contact.push({ label: 'Kakao', type: 'kakao' });
    }
    if (profile.socialMessaging.discord.username) {
      elements.contact.push({ label: 'Discord', type: 'discord' });
    }
    if (profile.socialMessaging.wechat.username) {
      elements.contact.push({ label: 'WeChat', type: 'wechat' });
    }

    // Social channels
    if (profile.socialChannels.facebook.username) {
      elements.contact.push({ label: 'Facebook', type: 'facebook' });
    }
    if (profile.socialChannels.linkedin.username) {
      elements.contact.push({ label: 'LinkedIn', type: 'linkedin' });
    }
    if (profile.socialChannels.twitter.username) {
      elements.contact.push({ label: 'Twitter', type: 'twitter' });
    }
    if (profile.socialChannels.youtube.username) {
      elements.contact.push({ label: 'YouTube', type: 'youtube' });
    }
    if (profile.socialChannels.tiktok.username) {
      elements.contact.push({ label: 'TikTok', type: 'tiktok' });
    }

    // Profile Screen elements
    if (profile.profile.about.value) {
      elements.profile.push({ label: 'About', type: 'about' });
    }
    if (profile.profile.serviceAreas.value) {
      elements.profile.push({ label: 'Service Areas', type: 'service' });
    }
    if (profile.profile.specialties.value) {
      elements.profile.push({ label: 'Specialties', type: 'specialties' });
    }
    if (profile.profile.experience.value) {
      elements.profile.push({ label: 'Experience', type: 'experience' });
    }
    if (profile.profile.languages.value) {
      elements.profile.push({ label: 'Languages', type: 'languages' });
    }
    if (profile.profile.certifications.value) {
      elements.profile.push({ label: 'Certifications', type: 'certifications' });
    }

    // Portfolio Screen elements
    if (profile.portfolio && profile.portfolio.length > 0) {
      profile.portfolio.forEach((item, index) => {
        elements.portfolio.push({ 
          label: item.title || `Portfolio Item ${index + 1}`, 
          type: 'portfolio-item' 
        });
      });
    }
    // Add navigation if there are multiple items
    if (profile.portfolio && profile.portfolio.length > 1) {
      elements.portfolio.push({ label: 'Next/Previous', type: 'navigation' });
    }

    return elements;
  }, [profile]);

  // Get page-specific stats with all elements (even 0 clicks)
  const getPageStats = (screenId: string) => {
    const allElements = getAllScreenElements[screenId] || [];
    
    // If no dashboard data, return all elements with 0 clicks
    if (!dashboard || !dashboard.pageBreakdown) {
      return { 
        views: 0, 
        elements: allElements.map(el => ({ label: el.label, clicks: 0 }))
      };
    }
    
    const pageData = dashboard.pageBreakdown.find(p => p.screenId === screenId);
    const views = pageData?.metrics.totalViews || 0;
    
    // Create a map of clicked elements
    const clickedElements = new Map<string, number>();
    if (pageData) {
      pageData.topElements.forEach(el => {
        clickedElements.set(el.label.toLowerCase(), el.count);
      });
    }
    
    // Merge all elements with click data
    const elements = allElements.map(el => {
      const clicks = clickedElements.get(el.label.toLowerCase()) || 0;
      return { label: el.label, clicks };
    });
    
    return { views, elements };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md px-4">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <h3 className="mb-2">No Analytics Data</h3>
          <p className="text-sm text-muted-foreground">
            Start sharing your profile to see analytics data here.
          </p>
        </div>
      </div>
    );
  }

  const { overallMetrics } = dashboard;
  const homeStats = getPageStats('home');
  const contactStats = getPageStats('contact');
  const profileStats = getPageStats('profile');
  const portfolioStats = getPageStats('portfolio');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-3">
        {/* User Profile Link */}
        <button
          onClick={() => window.location.href = `/${userCode}`}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors w-full"
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={profile.avatar} alt={profile.fullName} />
            <AvatarFallback>
              {profile.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <div className="truncate">{profile.fullName || 'Your Profile'}</div>
            <div className="text-sm text-muted-foreground">View Clik Card</div>
          </div>
          <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </button>
        
        {/* Performance Title */}
        <h1 className="text-xl">Performance</h1>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
          {/* Time Period Filter */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Time Period</label>
            <Select 
              value={filters.period} 
              onValueChange={(value: AnalyticsPeriod) => setFilters(prev => ({ ...prev, period: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group Filter */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Group</label>
            <Select 
              value={filters.groupId || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                groupId: value === 'all' ? undefined : value 
              }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {groups.map(group => {
                  const IconComponent = (LucideIcons as any)[group.icon];
                  return (
                    <SelectItem key={group.id} value={group.id}>
                      <span className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                        {group.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Search Button */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Contact</label>
            {selectedContactName ? (
              <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-card min-w-[200px]">
                <span className="text-sm flex-1 truncate">{selectedContactName}</span>
                <button
                  onClick={handleClearContact}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-10 h-9 p-0 justify-center"
                onClick={() => setIsContactSearchOpen(true)}
              >
                <Search className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Contact Search Dialog */}
      <Dialog open={isContactSearchOpen} onOpenChange={setIsContactSearchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Search Contact</DialogTitle>
            <DialogDescription>Find a contact to filter analytics by.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-1">
              {filteredContacts.length > 0 ? (
                <>
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, contactEmail: undefined }));
                      setIsContactSearchOpen(false);
                      setContactSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-md hover:bg-accent transition-colors"
                  >
                    <div>All Contacts</div>
                    <div className="text-xs text-muted-foreground">Show analytics for everyone</div>
                  </button>
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.email}
                      onClick={() => handleSelectContact(contact.email)}
                      className="w-full text-left px-3 py-2.5 rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="truncate">{contact.name || contact.email}</div>
                      {contact.name && (
                        <div className="text-xs text-muted-foreground truncate">{contact.email}</div>
                      )}
                    </button>
                  ))}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No contacts found</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overall Stats - 4 Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricTile
          icon={Eye}
          label="Total Views"
          value={formatNumber(overallMetrics.totalViews)}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <MetricTile
          icon={MousePointerClick}
          label="Total Clicks"
          value={formatNumber(overallMetrics.totalClicks)}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <MetricTile
          icon={Users}
          label="Engaged Contacts"
          value={formatNumber(engagementContacts)}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <MetricTile
          icon={Share2}
          label="New Shares"
          value={formatNumber(newShares)}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
      </div>

      {/* Page Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PageStatsBlock
          icon={Home}
          title="Home Screen"
          pageViews={homeStats.views}
          elements={homeStats.elements}
        />
        <PageStatsBlock
          icon={Mail}
          title="Contact Screen"
          pageViews={contactStats.views}
          elements={contactStats.elements}
        />
        <PageStatsBlock
          icon={User}
          title="Profile Screen"
          pageViews={profileStats.views}
          elements={profileStats.elements}
          showElements={false}
        />
        <PageStatsBlock
          icon={Briefcase}
          title="Portfolio Screen"
          pageViews={portfolioStats.views}
          elements={portfolioStats.elements}
        />
      </div>

      {/* Top Contact Methods */}
      {overallMetrics.topContactMethods.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Top Contact Methods
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overallMetrics.topContactMethods.slice(0, 6).map((method, index) => {
              const getIcon = (target: string) => {
                const lower = target.toLowerCase();
                if (lower.includes('phone')) return { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' };
                if (lower.includes('email')) return { icon: Mail, color: 'text-red-600', bg: 'bg-red-50' };
                if (lower.includes('whatsapp')) return { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50' };
                if (lower.includes('calendar')) return { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' };
                if (lower.includes('location')) return { icon: MapPin, color: 'text-orange-600', bg: 'bg-orange-50' };
                return { icon: Link2, color: 'text-muted-foreground', bg: 'bg-muted' };
              };
              const iconData = getIcon(method.target);
              const Icon = iconData.icon;

              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`w-10 h-10 rounded-lg ${iconData.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconData.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{method.label}</div>
                    <div className="text-xs text-muted-foreground">{method.count} clicks</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}