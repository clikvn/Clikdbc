import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "../../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Upload, Edit2, Trash2 } from "lucide-react";
import { FullScreenImagePositioner } from "../FullScreenImagePositioner";
import { AvatarImagePositioner } from "../AvatarImagePositioner";
import { BusinessCardData, ProfileImageData } from "../../../types/business-card";
import { parseProfileImage, calculateAvatarScaleFactor } from "../../../utils/profile-image-utils";
import { validateBackgroundImage, validateAvatarImage } from "../../../utils/file-utils";
import { uploadBackgroundImage, uploadAvatarImage, deleteImageFromStorage } from "../../../utils/supabase-storage";
import { toast } from "sonner";
const imgImg = "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcmlvciUyMGRlc2lnbiUyMG1vZGVybiUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzYzNTE3NzEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

interface HomeFormProps {
  data: BusinessCardData['personal'];
  onChange: (data: BusinessCardData['personal']) => void;
  onFieldFocus?: (field: { label: string; value: string; onApply: (value: string) => void }) => void;
  userCode?: string | null; // User code for organizing image uploads
}

export function HomeForm({ data, onChange, onFieldFocus, userCode }: HomeFormProps) {
  const form = useForm({
    defaultValues: data,
    values: data,
  });

  const [showBackgroundPositioner, setShowBackgroundPositioner] = useState(false);
  const [showAvatarPositioner, setShowAvatarPositioner] = useState(false);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof BusinessCardData['personal'], value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };


  // Parse background image data
  const backgroundImageData = parseProfileImage(data.profileImage || '');
  const backgroundImageUrl = backgroundImageData?.imageUrl || "";
  const backgroundPosition = backgroundImageData?.position || { x: 0, y: 0, scale: 1 };

  // Parse avatar image data
  const avatarImageData = parseProfileImage(data.avatarImage || '');
  const avatarImageUrl = avatarImageData?.imageUrl || "";
  const avatarPosition = avatarImageData?.position || { x: 0, y: 0, scale: 1 };

  // Background image handlers
  const handleBackgroundFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB for background)
    const validationError = validateBackgroundImage(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Check userCode for organizing uploads
    if (!userCode) {
      toast.error('User not authenticated. Please log in.');
      return;
    }

    // Upload to Supabase Storage
    toast.loading('Uploading background image...', { id: 'upload-bg' });
    
    const result = await uploadBackgroundImage(file, userCode);
    
    if ('error' in result) {
      toast.error(`Failed to upload image: ${result.error}`, { id: 'upload-bg' });
      return;
    }

    // Delete old image if it exists and is from Supabase Storage
    const currentImageData = parseProfileImage(data.profileImage || '');
    if (currentImageData?.imageUrl && !currentImageData.imageUrl.startsWith('data:image')) {
      await deleteImageFromStorage(currentImageData.imageUrl);
    }

    // Create ProfileImageData with Storage URL
    const newData: ProfileImageData = {
      imageUrl: result.url,
      position: { x: 0, y: 0, scale: 1 }
    };
    
    handleChange('profileImage', JSON.stringify(newData));
    toast.success('Background image uploaded successfully!', { id: 'upload-bg' });
    
    // Auto-open positioner after upload
    setTimeout(() => setShowBackgroundPositioner(true), 100);
  };

  const handleSaveBackgroundPosition = (position: { x: number; y: number; scale: number }) => {
    const newData: ProfileImageData = {
      imageUrl: backgroundImageUrl,
      position
    };
    handleChange('profileImage', JSON.stringify(newData));
  };

  const handleRemoveBackgroundImage = async () => {
    // Delete from Supabase Storage if it's a Storage URL
    if (backgroundImageUrl && !backgroundImageUrl.startsWith('data:image')) {
      const result = await deleteImageFromStorage(backgroundImageUrl);
      if (!result.success) {
        console.warn('Failed to delete background image from storage:', result.error);
        // Continue with clearing data even if deletion fails
      }
    }
    
    handleChange('profileImage', '');
  };

  // Avatar image handlers
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB for avatar)
    const validationError = validateAvatarImage(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Check userCode for organizing uploads
    if (!userCode) {
      toast.error('User not authenticated. Please log in.');
      return;
    }

    // Upload to Supabase Storage
    toast.loading('Uploading avatar image...', { id: 'upload-avatar' });
    
    const result = await uploadAvatarImage(file, userCode);
    
    if ('error' in result) {
      toast.error(`Failed to upload image: ${result.error}`, { id: 'upload-avatar' });
      return;
    }

    // Delete old image if it exists and is from Supabase Storage
    const currentImageData = parseProfileImage(data.avatarImage || '');
    if (currentImageData?.imageUrl && !currentImageData.imageUrl.startsWith('data:image')) {
      await deleteImageFromStorage(currentImageData.imageUrl);
    }

    // Create ProfileImageData with Storage URL
    const newData: ProfileImageData = {
      imageUrl: result.url,
      position: { x: 0, y: 0, scale: 1 }
    };
    
    handleChange('avatarImage', JSON.stringify(newData));
    toast.success('Avatar image uploaded successfully!', { id: 'upload-avatar' });
    
    // Auto-open positioner after upload
    setTimeout(() => setShowAvatarPositioner(true), 100);
  };

  const handleSaveAvatarPosition = (position: { x: number; y: number; scale: number }) => {
    const newData: ProfileImageData = {
      imageUrl: avatarImageUrl,
      position
    };
    handleChange('avatarImage', JSON.stringify(newData));
  };

  const handleRemoveAvatarImage = async () => {
    // Delete from Supabase Storage if it's a Storage URL
    if (avatarImageUrl && !avatarImageUrl.startsWith('data:image')) {
      const result = await deleteImageFromStorage(avatarImageUrl);
      if (!result.success) {
        console.warn('Failed to delete avatar image from storage:', result.error);
        // Continue with clearing data even if deletion fails
      }
    }
    
    handleChange('avatarImage', '');
  };

  return (
    <>
      <div className="space-y-5 md:space-y-6">
        {/* Main Information Section */}
        <Card className="border-[#e4e4e7] shadow-sm gap-3">
          <CardContent className="px-4 md:px-6 pb-5 md:pb-6 pt-5 md:pt-6">
            <Form {...form}>
              <div className="grid gap-4 md:gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange('name', e.target.value);
                          }}
                          placeholder="Enter your full name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange('title', e.target.value);
                          }}
                          placeholder="e.g., Interior Designer"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange('businessName', e.target.value);
                          }}
                          placeholder="e.g., Design Solutions"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange('bio', e.target.value);
                          }}
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Background Image Section */}
        <Card className="border-[#e4e4e7] shadow-sm gap-3">
          <CardContent className="px-4 md:px-6 pb-5 md:pb-6 pt-5 md:pt-6">
            <div className="space-y-4">
              <div>
                <Label>Home Background Image</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload and position the background image for your home screen
                </p>
              </div>

              {backgroundImageUrl ? (
                <div className="space-y-3">
                  {/* Image Preview */}
                  <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden">
                    <img
                      src={backgroundImageUrl}
                      alt="Background preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBackgroundPositioner(true)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Position
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => backgroundFileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveBackgroundImage}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => backgroundFileInputRef.current?.click()}
                  className="w-full h-32 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm">Upload Background Image</span>
                  </div>
                </Button>
              )}

              <input
                ref={backgroundFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Avatar Image Section */}
        <Card className="border-[#e4e4e7] shadow-sm gap-3">
          <CardContent className="px-4 md:px-6 pb-5 md:pb-6 pt-5 md:pt-6">
            <div className="space-y-4">
              <div>
                <Label>Avatar Image</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload and position the image for your circular avatar
                </p>
              </div>

              {avatarImageUrl ? (
                <div className="space-y-3">
                  {/* Avatar Preview - Matches HomeProfileCard structure exactly */}
                  <div className="relative mx-auto rounded-[100px] shrink-0 size-[120px] overflow-hidden">
                    {/* Viewport-sized container scaled to fit cropped area in 120px circle */}
                    {(() => {
                      const scaleFactor = calculateAvatarScaleFactor();
                      return (
                        <div className="absolute inset-0 overflow-hidden rounded-[100px]" style={{
                          width: '100vw',
                          height: '100vh',
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) scale(${scaleFactor})`,
                          transformOrigin: 'center center'
                        }}>
                          <img
                            src={avatarImageUrl}
                            alt="Avatar preview"
                            className="absolute h-full w-full object-contain"
                            style={{
                              transform: `translate(${avatarPosition.x}px, ${avatarPosition.y}px) scale(${avatarPosition.scale})`,
                              transformOrigin: 'center center'
                            }}
                          />
                        </div>
                      );
                    })()}
                    {/* Border - matches HomeProfileCard exactly */}
                    <div aria-hidden="true" className="absolute border-4 border-solid border-white/30 inset-[-4px] pointer-events-none rounded-[108px]" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAvatarPositioner(true)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Position
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => avatarFileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatarImage}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="w-full h-32 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm">Upload Avatar Image</span>
                  </div>
                </Button>
              )}

              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full-Screen Image Positioner for Background */}
      {showBackgroundPositioner && backgroundImageUrl && (
        <FullScreenImagePositioner
          imageUrl={backgroundImageUrl}
          initialPosition={backgroundPosition}
          profileName={data.name}
          profileTitle={data.title}
          onSave={handleSaveBackgroundPosition}
          onClose={() => setShowBackgroundPositioner(false)}
        />
      )}

      {/* Avatar Image Positioner */}
      {showAvatarPositioner && avatarImageUrl && (
        <AvatarImagePositioner
          imageUrl={avatarImageUrl}
          initialPosition={avatarPosition}
          profileName={data.name || "Your Name"}
          profileTitle={data.title || "Your Title"}
          onSave={handleSaveAvatarPosition}
          onClose={() => setShowAvatarPositioner(false)}
        />
      )}
    </>
  );
}
