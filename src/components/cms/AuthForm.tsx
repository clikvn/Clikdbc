import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../../hooks/useAuth";
// NOTE: getUserProfile removed - tables are dropped
// // NOTE: getUserProfile removed - tables are dropped
// import { getUserProfile } from "../../utils/user-profile";
import { supabase } from "../../lib/supabase";
import { saveUserInfoToSupabase } from "../../utils/user-infos-supabase";
import { loadBusinessCardData, saveBusinessCardData } from "../../utils/storage";

interface AuthFormProps {
  onAuthenticated: () => void;
  initialMode?: "login" | "register" | "reset";
}

export function AuthForm({ onAuthenticated, initialMode = "login" }: AuthFormProps) {
  const { signUp, signIn, resetPassword, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const blurActiveInput = () => {
    if (typeof document === "undefined") return;
    const activeElement = document.activeElement as HTMLElement | null;
    if (
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable)
    ) {
      activeElement.blur();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "reset") {
        // Handle password reset
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message || "Failed to send password reset email");
          return;
        }
        // Success message is shown in resetPassword function
        setMode("login");
        setEmail("");
        return;
      }

      if (mode === "register") {
        // Validate passwords match
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }

        // Validate password length
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }

        // Sign up
        const { error, data: signUpData } = await signUp(email, password);
        
        // If there's an error, check if user was still created (can happen with 422)
        if (error) {
          // Check if user exists despite error - this means account was created
          if (signUpData?.user) {
            console.warn('Signup had error but user was created:', error.message);
            // Continue with registration flow - user was created successfully
          } else {
            // Real error - show it and return
            toast.error(error.message || "Failed to create account");
            setIsLoading(false);
            return;
          }
        }

        // Get user from signup response or current session
        let user = signUpData?.user || null;
        if (!user) {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          user = currentUser;
        }

        if (user) {
          // Create user info in user_infos table
          const userCode = user.id.replace(/-/g, ''); // Use UID without dashes as user_code
          
          // Wait a moment to ensure session is fully established before saving
          // This helps avoid RLS policy issues
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Save name and title to user_infos table (business_name and bio will be empty on registration)
          if (name.trim() || title.trim()) {
            try {
              console.log('Attempting to save user info:', { userCode, name: name.trim(), title: title.trim() });
              const result = await saveUserInfoToSupabase(
                userCode,
                name.trim(),
                title.trim(), // This is professional_title in the database
                '', // business_name - empty on registration
                '' // bio - empty on registration
              );
              
              if (!result.success) {
                console.error("Error saving user info:", result.error);
                toast.error(`Failed to save profile info: ${result.error}. Please update it later.`);
              } else {
                console.log('User info saved successfully');
              }
            } catch (error) {
              console.error("Exception saving user info to user_infos:", error);
              toast.error("Failed to save profile info. Please update it later.");
            }
          } else {
            console.warn('Name or title is empty, skipping user_infos save');
          }
          
          // If session is available (email confirmation disabled), automatically sign in
        if (signUpData?.session) {
          blurActiveInput();
          if (typeof window !== "undefined") {
            sessionStorage.setItem("showHomeSetupPrompt", "true");
          }
            // User is already signed in, call onAuthenticated callback
            toast.success("Account created successfully! You are now signed in.");
            onAuthenticated();
            return;
          }
        }

        // If no session (email confirmation required), switch to login mode
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setTitle("");
        setIsLoading(false);
        return;
      }

      // Login mode
      if (password.length === 0) {
        toast.error("Please enter your password");
        setIsLoading(false);
        return;
      }

      const { error } = await signIn(email, password);
      if (error) {
        // Error message is already shown in AuthContext.signIn via toast
        // Just set loading to false and return
        setIsLoading(false);
        return;
      }

      blurActiveInput();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("showHomeSetupPrompt", "true");
      }

      // On successful login, wait a moment for session to be established
      // Then call the callback which will handle redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Login failed - user not found");
        setIsLoading(false);
        return;
      }

      // Call onAuthenticated callback - this will trigger redirect
      onAuthenticated();
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (mode === "reset") {
      return email.length > 0 && email.includes("@");
    }
    if (mode === "register") {
      return (
        email.length > 0 &&
        email.includes("@") &&
        password.length >= 6 &&
        password === confirmPassword &&
        name.trim().length > 0 &&
        title.trim().length > 0
      );
    }
    // Login mode
    return email.length > 0 && email.includes("@") && password.length > 0;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e9e6dc] to-[#d4cfc0] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-[#535146]/10">
              <Lock className="w-6 h-6 text-[#535146]" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {mode === "register"
              ? "Create Account"
              : mode === "reset"
              ? "Reset Password"
              : "Sign In"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "register"
              ? "Create an account to access your business card CMS"
              : mode === "reset"
              ? "Enter your email to receive a password reset link"
              : "Sign in to access your business card CMS"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isLoading || authLoading}
              />
            </div>

            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    disabled={isLoading || authLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Software Engineer, Designer"
                    required
                    disabled={isLoading || authLoading}
                  />
                </div>
              </>
            )}

            {mode !== "reset" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "register"
                        ? "Create password (min 6 characters)"
                        : "Enter your password"
                    }
                    required
                    minLength={mode === "register" ? 6 : undefined}
                    disabled={isLoading || authLoading}
                  />
                </div>

                {mode === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      minLength={6}
                      disabled={isLoading || authLoading}
                    />
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-[#535146] hover:bg-[#535146]/90"
              disabled={!isFormValid() || isLoading || authLoading}
            >
              {isLoading || authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "register"
                    ? "Creating Account..."
                    : mode === "reset"
                    ? "Sending..."
                    : "Signing In..."}
                </>
              ) : mode === "register" ? (
                "Create Account"
              ) : mode === "reset" ? (
                "Send Reset Link"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-[#535146] hover:underline"
                  disabled={isLoading || authLoading}
                >
                  Forgot password?
                </button>
                <div>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = '/register';
                    }}
                    className="text-[#535146] hover:underline font-medium"
                    disabled={isLoading || authLoading}
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}

            {mode === "register" && (
              <div>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/login';
                  }}
                  className="text-[#535146] hover:underline font-medium"
                  disabled={isLoading || authLoading}
                >
                  Sign in
                </button>
              </div>
            )}

            {mode === "reset" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setEmail("");
                }}
                className="text-[#535146] hover:underline"
                disabled={isLoading || authLoading}
              >
                Back to sign in
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

