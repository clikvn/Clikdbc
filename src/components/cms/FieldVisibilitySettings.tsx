import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import { 
  ALL_SHAREABLE_FIELDS, 
  FIELD_LABELS, 
  loadGroupShareSettings, 
  saveGroupShareSettings,
  DEFAULT_VISIBLE_FIELDS
} from "../../utils/group-share-settings";
import { GroupShareSettings } from "../../types/business-card";
import { Eye, EyeOff, RotateCcw, Check, Save, AlertCircle, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { loadCustomGroups, getColorClasses, CustomGroup } from "../../utils/custom-groups";
import * as LucideIcons from "lucide-react";

// Preset templates
const VISIBILITY_PRESETS = {
  minimal: {
    name: "Minimal",
    description: "Only essential contact info",
    fields: ["personal.name", "contact.email", "contact.phone"],
  },
  professional: {
    name: "Professional",
    description: "Business profile with key details",
    fields: [
      "personal.name", "personal.title", "personal.company",
      "contact.email", "contact.phone", "contact.website",
      "socialChannels.linkedin", "profile.bio"
    ],
  },
  social: {
    name: "Social",
    description: "Focus on social connections",
    fields: [
      "personal.name", "contact.email",
      "socialMessaging.whatsapp", "socialMessaging.telegram",
      "socialChannels.instagram", "socialChannels.twitter",
      "socialChannels.facebook", "profile.bio"
    ],
  },
  complete: {
    name: "Full Access",
    description: "All available information",
    fields: ALL_SHAREABLE_FIELDS,
  },
};

export function FieldVisibilitySettings() {
  const [settings, setSettings] = useState<GroupShareSettings>(loadGroupShareSettings());
  const [groups, setGroups] = useState<CustomGroup[]>(loadCustomGroups());
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>(['public']);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loaded = loadGroupShareSettings();
    setSettings(loaded);
    setGroups(loadCustomGroups());
  }, []);

  // Ensure we have settings for all groups
  useEffect(() => {
    const currentSettings = { ...settings };
    let needsUpdate = false;

    groups.forEach(group => {
      if (!currentSettings[group.id]) {
        currentSettings[group.id] = [...DEFAULT_VISIBLE_FIELDS];
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      setSettings(currentSettings);
      saveGroupShareSettings(currentSettings);
    }
  }, [groups]);

  const handleToggleField = (groupId: string, fieldPath: string) => {
    const groupFields = [...(settings[groupId] || [])];
    const index = groupFields.indexOf(fieldPath);
    
    if (index > -1) {
      groupFields.splice(index, 1);
    } else {
      groupFields.push(fieldPath);
    }
    
    const newSettings = {
      ...settings,
      [groupId]: groupFields,
    };
    
    setSettings(newSettings);
    saveGroupShareSettings(newSettings); // Save immediately
    window.dispatchEvent(new CustomEvent('groupShareSettingsChanged')); // Notify other components
    setHasChanges(true);
  };

  const handleSave = () => {
    saveGroupShareSettings(settings);
    window.dispatchEvent(new CustomEvent('groupShareSettingsChanged')); // Notify other components
    setHasChanges(false);
    toast.success("Field visibility settings saved successfully");
  };

  const handleSelectAll = (groupId: string) => {
    const newSettings = {
      ...settings,
      [groupId]: [...ALL_SHAREABLE_FIELDS],
    };
    setSettings(newSettings);
    saveGroupShareSettings(newSettings); // Save immediately
    window.dispatchEvent(new CustomEvent('groupShareSettingsChanged')); // Notify other components
    setHasChanges(true);
  };

  const handleDeselectAll = (groupId: string) => {
    const newSettings = {
      ...settings,
      [groupId]: [],
    };
    setSettings(newSettings);
    saveGroupShareSettings(newSettings); // Save immediately
    window.dispatchEvent(new CustomEvent('groupShareSettingsChanged')); // Notify other components
    setHasChanges(true);
  };

  const toggleExpanded = (groupId: string) => {
    setExpandedGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isFieldVisible = (groupId: string, fieldPath: string): boolean => {
    return settings[groupId]?.includes(fieldPath) || false;
  };

  const getVisibleCount = (groupId: string): number => {
    return settings[groupId]?.length || 0;
  };

  const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  // Group fields by category
  const fieldsByCategory: Record<string, string[]> = {
    'Personal Information': ALL_SHAREABLE_FIELDS.filter(f => f.startsWith('personal.')),
    'Contact Information': ALL_SHAREABLE_FIELDS.filter(f => f.startsWith('contact.')),
    'Social Messaging': ALL_SHAREABLE_FIELDS.filter(f => f.startsWith('socialMessaging.')),
    'Social Channels': ALL_SHAREABLE_FIELDS.filter(f => f.startsWith('socialChannels.')),
    'Profile Details': ALL_SHAREABLE_FIELDS.filter(f => f.startsWith('profile.')),
    'Portfolio': ALL_SHAREABLE_FIELDS.filter(f => f === 'portfolio'),
  };

  return (
    <div className="space-y-4">
      {/* Unsaved Changes Alert */}
      {hasChanges && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You have unsaved changes. Click "Save Settings" to apply your changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Accordion-style group list */}
      <div className="space-y-3">
        {groups.map((group) => {
          const isExpanded = expandedGroupIds.includes(group.id);
          const colorClasses = getColorClasses(group.color);
          
          return (
            <div key={group.id} className="border rounded-lg overflow-hidden">
              {/* Group Header - Clickable */}
              <button
                onClick={() => toggleExpanded(group.id)}
                className={`w-full flex items-center justify-between gap-3 p-3 transition-all text-left ${
                  isExpanded
                    ? `${colorClasses.bg} ${colorClasses.border} border-b-2`
                    : 'bg-white hover:bg-[#f4f4f5]'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={isExpanded ? colorClasses.text : 'text-[#71717a]'}>
                    {renderIcon(group.icon, 'w-5 h-5')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{group.label}</div>
                    <div className="text-xs text-[#71717a]">
                      {getVisibleCount(group.id)} of {ALL_SHAREABLE_FIELDS.length} fields visible
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={isExpanded ? "default" : "secondary"} className="text-xs">
                    {getVisibleCount(group.id)}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Expanded Content - Field Toggles */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-white">
                  {/* Quick Actions for this group */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(group.id)}
                      className="flex-1"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeselectAll(group.id)}
                      className="flex-1"
                    >
                      <EyeOff className="w-3 h-3 mr-1" />
                      None
                    </Button>
                  </div>

                  {/* Fields by Category */}
                  {Object.entries(fieldsByCategory).map(([category, fields]) => {
                    if (fields.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="text-xs font-medium text-[#71717a] uppercase tracking-wide">
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {fields.map((fieldPath) => {
                            const isVisible = isFieldVisible(group.id, fieldPath);
                            return (
                              <label 
                                key={fieldPath} 
                                htmlFor={`${group.id}-${fieldPath}`}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                                  isVisible 
                                    ? 'bg-[#f4f4f5]' 
                                    : 'hover:bg-[#fafafa]'
                                }`}
                              >
                                <Checkbox
                                  id={`${group.id}-${fieldPath}`}
                                  checked={isVisible}
                                  onCheckedChange={() => handleToggleField(group.id, fieldPath)}
                                  className="h-4 w-4"
                                />
                                <span className="flex-1 text-sm">
                                  {FIELD_LABELS[fieldPath] || fieldPath}
                                </span>
                                {isVisible && (
                                  <Eye className="w-4 h-4 text-[#22c55e]" />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Save Button */}
      {hasChanges && (
        <div className="sticky bottom-4 left-0 right-0 z-10">
          <Card className="shadow-xl border-2 border-[#0a0a0a]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-medium">Unsaved changes</span>
                </div>
                <Button
                  onClick={handleSave}
                  size="lg"
                  className="shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}