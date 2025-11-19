import React, { useRef, useEffect } from "react";
import { useForm } from "react-hook-form@7.55.0";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../ui/form";
import { Textarea } from "../../ui/textarea";
import { FileText, MapPin, Award, Briefcase, Languages, ShieldCheck, Sparkles } from "lucide-react";
import { BusinessCardData, VisibilityGroup } from "../../../types/business-card";
import { FieldVisibilityPopover } from "../FieldVisibilityPopover";
import { EditableFieldLabel } from "../EditableFieldLabel";

interface ProfileFormProps {
  personal: BusinessCardData['personal'];
  profile: BusinessCardData['profile'];
  customLabels?: BusinessCardData['customLabels'];
  onPersonalChange: (data: BusinessCardData['personal']) => void;
  onProfileChange: (data: BusinessCardData['profile']) => void;
  onCustomLabelChange?: (labelKey: string, value: string) => void;
  onFieldFocus?: (field: { label: string; value: string; onApply: (value: string) => void; initialMessage?: string }) => void;
}

const visibilityGroups: VisibilityGroup[] = ['Public', 'Private', 'Business', 'Personal'];

export function ProfileForm({ personal, profile, customLabels, onPersonalChange, onProfileChange, onCustomLabelChange, onFieldFocus }: ProfileFormProps) {
  const profileForm = useForm({
    defaultValues: profile,
    values: profile,
  });

  // Refs for all textareas
  const aboutRef = useRef<HTMLTextAreaElement>(null);
  const serviceAreasRef = useRef<HTMLTextAreaElement>(null);
  const specialtiesRef = useRef<HTMLTextAreaElement>(null);
  const experienceRef = useRef<HTMLTextAreaElement>(null);
  const languagesRef = useRef<HTMLTextAreaElement>(null);
  const certificationsRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize function
  const autoResize = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  // Auto-resize all textareas on mount and when values change
  useEffect(() => {
    autoResize(aboutRef.current);
    autoResize(serviceAreasRef.current);
    autoResize(specialtiesRef.current);
    autoResize(experienceRef.current);
    autoResize(languagesRef.current);
    autoResize(certificationsRef.current);
  }, [
    profile.about.value,
    profile.serviceAreas.value,
    profile.specialties.value,
    profile.experience.value,
    profile.languages.value,
    profile.certifications.value
  ]);

  const handleProfileChange = (field: keyof BusinessCardData['profile'], value: string) => {
    onProfileChange({
      ...profile,
      [field]: {
        ...profile[field],
        value
      }
    });
  };

  const handleGroupsChange = (field: keyof BusinessCardData['profile'], groups: VisibilityGroup[]) => {
    onProfileChange({
      ...profile,
      [field]: {
        ...profile[field],
        groups
      }
    });
  };

  const toggleGroup = (field: keyof BusinessCardData['profile'], group: VisibilityGroup) => {
    const currentGroups = profile[field].groups;
    const newGroups = currentGroups.includes(group)
      ? currentGroups.filter(g => g !== group)
      : [...currentGroups, group];
    handleGroupsChange(field, newGroups);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* About */}
      <Card className="border-[#e4e4e7] shadow-sm gap-3">
        <CardHeader className="px-4 md:px-6 md:pt-6 pb-[0px] pt-[16px] pr-[16px] pl-[16px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0a0a0a]" />
              <CardTitle className="text-lg">
                <EditableFieldLabel
                  value={customLabels?.['profile.about'] || 'About'}
                  onSave={(value) => onCustomLabelChange?.('profile.about', value)}
                />
              </CardTitle>
            </div>
            <FieldVisibilityPopover fieldPath="profile.about" />
          </div>
          <p className="text-sm text-[#71717a] m-[0px]">Tell people about yourself and your expertise</p>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-5 md:pb-6">
          <Form {...profileForm}>
            <FormField
              control={profileForm.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        ref={aboutRef}
                        value={profile.about.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handleProfileChange('about', e.target.value);
                          autoResize(e.target);
                        }}
                        placeholder="Tell about yourself, your expertise, and what you do..."
                        rows={1}
                        className="resize-none pr-10 min-h-[60px] overflow-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const label = customLabels?.['profile.about'] || 'About';
                          const reviewMessage = profile.about.value 
                            ? `Please review "${profile.about.value}" for my ${label} section`
                            : `Help me write content for my ${label} section`;
                          onFieldFocus?.({
                            label,
                            value: profile.about.value,
                            onApply: (value) => handleProfileChange('about', value),
                            initialMessage: reviewMessage
                          });
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[#f4f4f5] transition-colors"
                        title="Get AI help"
                      >
                        <Sparkles className="w-4 h-4 text-[#71717a]" />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Service Areas */}
      <Card className="border-[#e4e4e7] shadow-sm gap-3">
        <CardHeader className="px-4 md:px-6 md:pt-6 pb-[0px] pt-[12px] pr-[16px] pl-[16px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0a0a0a]" />
              <CardTitle className="text-lg">
                <EditableFieldLabel
                  value={customLabels?.['profile.serviceAreas'] || 'Service Areas'}
                  onSave={(value) => onCustomLabelChange?.('profile.serviceAreas', value)}
                />
              </CardTitle>
            </div>
            <FieldVisibilityPopover fieldPath="profile.serviceAreas" />
          </div>
          <p className="text-sm text-[#71717a] m-[0px]">Geographic areas where you provide services</p>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-5 md:pb-6">
          <Form {...profileForm}>
            <FormField
              control={profileForm.control}
              name="serviceAreas"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        ref={serviceAreasRef}
                        value={profile.serviceAreas.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handleProfileChange('serviceAreas', e.target.value);
                          autoResize(e.target);
                        }}
                        placeholder="e.g., Hanoi • Ha Tay • Hoa Binh • Bac Ninh"
                        rows={1}
                        className="resize-none pr-10 min-h-[60px] overflow-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const label = customLabels?.['profile.serviceAreas'] || 'Service Areas';
                          const reviewMessage = profile.serviceAreas.value 
                            ? `Please review "${profile.serviceAreas.value}" for my ${label} section`
                            : `Help me write content for my ${label} section`;
                          onFieldFocus?.({
                            label,
                            value: profile.serviceAreas.value,
                            onApply: (value) => handleProfileChange('serviceAreas', value),
                            initialMessage: reviewMessage
                          });
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[#f4f4f5] transition-colors"
                        title="Get AI help"
                      >
                        <Sparkles className="w-4 h-4 text-[#71717a]" />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card className="border-[#e4e4e7] shadow-sm gap-3">
        <CardHeader className="px-4 md:px-6 md:pt-6 pb-[0px] pt-[16px] pr-[16px] pl-[16px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0a0a0a]" />
              <CardTitle className="text-lg">
                <EditableFieldLabel
                  value={customLabels?.['profile.specialties'] || 'Specialties'}
                  onSave={(value) => onCustomLabelChange?.('profile.specialties', value)}
                />
              </CardTitle>
            </div>
            <FieldVisibilityPopover fieldPath="profile.specialties" />
          </div>
          <p className="text-sm text-[#71717a] m-[0px]">Your areas of expertise and specialization</p>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-5 md:pb-6">
          <Form {...profileForm}>
            <FormField
              control={profileForm.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        ref={specialtiesRef}
                        value={profile.specialties.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handleProfileChange('specialties', e.target.value);
                          autoResize(e.target);
                        }}
                        placeholder="e.g., Buyer's Agent • Seller's Agent • Resale • Apartment"
                        rows={1}
                        className="resize-none pr-10 min-h-[60px] overflow-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const label = customLabels?.['profile.specialties'] || 'Specialties';
                          const reviewMessage = profile.specialties.value 
                            ? `Please review "${profile.specialties.value}" for my ${label} section`
                            : `Help me write content for my ${label} section`;
                          onFieldFocus?.({
                            label,
                            value: profile.specialties.value,
                            onApply: (value) => handleProfileChange('specialties', value),
                            initialMessage: reviewMessage
                          });
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[#f4f4f5] transition-colors"
                        title="Get AI help"
                      >
                        <Sparkles className="w-4 h-4 text-[#71717a]" />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="border-[#e4e4e7] shadow-sm gap-3">
        <CardHeader className="px-4 md:px-6 md:pt-6 pb-[0px] pt-[16px] pr-[16px] pl-[16px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#0a0a0a]" />
              <CardTitle className="text-lg">
                <EditableFieldLabel
                  value={customLabels?.['profile.experience'] || 'Experience'}
                  onSave={(value) => onCustomLabelChange?.('profile.experience', value)}
                />
              </CardTitle>
            </div>
            <FieldVisibilityPopover fieldPath="profile.experience" />
          </div>
          <p className="text-sm text-[#71717a] m-[0px]">Your professional work experience and background</p>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-5 md:pb-6">
          <Form {...profileForm}>
            <FormField
              control={profileForm.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        ref={experienceRef}
                        value={profile.experience.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handleProfileChange('experience', e.target.value);
                          autoResize(e.target);
                        }}
                        placeholder="Describe your professional experience and background..."
                        rows={1}
                        className="resize-none pr-10 min-h-[60px] overflow-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const label = customLabels?.['profile.experience'] || 'Experience';
                          const reviewMessage = profile.experience.value 
                            ? `Please review "${profile.experience.value}" for my ${label} section`
                            : `Help me write content for my ${label} section`;
                          onFieldFocus?.({
                            label,
                            value: profile.experience.value,
                            onApply: (value) => handleProfileChange('experience', value),
                            initialMessage: reviewMessage
                          });
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[#f4f4f5] transition-colors"
                        title="Get AI help"
                      >
                        <Sparkles className="w-4 h-4 text-[#71717a]" />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card className="border-[#e4e4e7] shadow-sm gap-3">
        <CardHeader className="px-4 md:px-6 md:pt-6 pb-[0px] pt-[16px] pr-[16px] pl-[16px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-[#0a0a0a]" />
              <CardTitle className="text-lg">
                <EditableFieldLabel
                  value={customLabels?.['profile.languages'] || 'Languages'}
                  onSave={(value) => onCustomLabelChange?.('profile.languages', value)}
                />
              </CardTitle>
            </div>
            <FieldVisibilityPopover fieldPath="profile.languages" />
          </div>
          <p className="text-sm text-[#71717a] m-[0px]">Languages you speak and communicate in</p>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-5 md:pb-6">
          <Form {...profileForm}>
            <FormField
              control={profileForm.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        ref={languagesRef}
                        value={profile.languages.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handleProfileChange('languages', e.target.value);
                          autoResize(e.target);
                        }}
                        placeholder="e.g., Vietnamese • English • Korean"
                        rows={1}
                        className="resize-none pr-10 min-h-[60px] overflow-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const label = customLabels?.['profile.languages'] || 'Languages';
                          const reviewMessage = profile.languages.value 
                            ? `Please review "${profile.languages.value}" for my ${label} section`
                            : `Help me write content for my ${label} section`;
                          onFieldFocus?.({
                            label,
                            value: profile.languages.value,
                            onApply: (value) => handleProfileChange('languages', value),
                            initialMessage: reviewMessage
                          });
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[#f4f4f5] transition-colors"
                        title="Get AI help"
                      >
                        <Sparkles className="w-4 h-4 text-[#71717a]" />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="border-[#e4e4e7] shadow-sm gap-3">
        <CardHeader className="px-4 md:px-6 md:pt-6 pb-[0px] pt-[16px] pr-[16px] pl-[16px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0a0a0a]" />
              <CardTitle className="text-lg">
                <EditableFieldLabel
                  value={customLabels?.['profile.certifications'] || 'Certifications'}
                  onSave={(value) => onCustomLabelChange?.('profile.certifications', value)}
                />
              </CardTitle>
            </div>
            <FieldVisibilityPopover fieldPath="profile.certifications" />
          </div>
          <p className="text-sm text-[#71717a] m-[0px]">Professional certifications and licenses you hold</p>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-5 md:pb-6">
          <Form {...profileForm}>
            <FormField
              control={profileForm.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        ref={certificationsRef}
                        value={profile.certifications.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handleProfileChange('certifications', e.target.value);
                          autoResize(e.target);
                        }}
                        placeholder="e.g., HN-1108"
                        rows={1}
                        className="resize-none pr-10 min-h-[60px] overflow-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const label = customLabels?.['profile.certifications'] || 'Certifications';
                          const reviewMessage = profile.certifications.value 
                            ? `Please review "${profile.certifications.value}" for my ${label} section`
                            : `Help me write content for my ${label} section`;
                          onFieldFocus?.({
                            label,
                            value: profile.certifications.value,
                            onApply: (value) => handleProfileChange('certifications', value),
                            initialMessage: reviewMessage
                          });
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[#f4f4f5] transition-colors"
                        title="Get AI help"
                      >
                        <Sparkles className="w-4 h-4 text-[#71717a]" />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}