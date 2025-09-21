import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, passwordResetSchema } from "@shared/schema";
import { z } from "zod";
import { Shield, Key, ArrowLeft, UserPlus, LogIn, Lock } from "lucide-react";
import RecoveryKeyModal from "@/components/recovery-key-modal";

const loginSchema = insertUserSchema;
const signupSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ResetFormData = z.infer<typeof passwordResetSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, resetPasswordMutation } = useAuth();
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetRecoveryKey, setResetRecoveryKey] = useState("");
  const [pendingUser, setPendingUser] = useState<any>(null);

  // Set SEO metadata
  useEffect(() => {
    const isReset = showPasswordReset;
    const title = isReset ? "Reset Password - LinkVault" : "Sign In - LinkVault";
    const description = isReset 
      ? "Reset your LinkVault password using your recovery key. Secure and private password recovery."
      : "Sign in to your LinkVault account or create a new privacy-first link in bio page. No email required.";
    
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
    ];

    ogTags.forEach(({ property, content }) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (ogTag) {
        ogTag.setAttribute('content', content);
      } else {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        ogTag.setAttribute('content', content);
        document.head.appendChild(ogTag);
      }
    });
  }, [showPasswordReset]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { username: "", recoveryKey: "", newPassword: "" },
  });

  // Redirect to dashboard if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const handleLogin = async (data: LoginFormData) => {
    await loginMutation.mutateAsync(data);
  };

  const handleSignup = async (data: SignupFormData) => {
    const result = await registerMutation.mutateAsync({
      username: data.username,
      password: data.password,
    });
    
    if (result?.recoveryKey) {
      setRecoveryKey(result.recoveryKey);
      setPendingUser(result.user);
      setShowRecoveryModal(true);
    }
  };

  const handlePasswordReset = async (data: ResetFormData) => {
    const result = await resetPasswordMutation.mutateAsync(data);
    
    if (result?.newRecoveryKey) {
      setResetRecoveryKey(result.newRecoveryKey);
      setShowRecoveryModal(true);
      setShowPasswordReset(false);
    }
  };

  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Button
              variant="ghost"
              onClick={() => setShowPasswordReset(false)}
              className="mb-8 text-muted-foreground hover:text-foreground"
              data-testid="button-back-to-login"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
            
            <Card className="card-floating border-border/50">
              <CardHeader className="text-center pb-8">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Key className="text-white h-10 w-10" />
                </div>
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                <CardDescription className="text-base">
                  Use your recovery key to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-username">Username</Label>
                    <Input
                      id="reset-username"
                      data-testid="input-reset-username"
                      placeholder="johndoe"
                      {...resetForm.register("username")}
                    />
                    {resetForm.formState.errors.username && (
                      <p className="text-sm text-destructive mt-1">
                        {resetForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="recovery-key">Recovery Key</Label>
                    <Input
                      id="recovery-key"
                      data-testid="input-recovery-key"
                      placeholder="RK-XXXX-XXXX-XXXX..."
                      {...resetForm.register("recoveryKey")}
                    />
                    {resetForm.formState.errors.recoveryKey && (
                      <p className="text-sm text-destructive mt-1">
                        {resetForm.formState.errors.recoveryKey.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      data-testid="input-new-password"
                      placeholder="••••••••"
                      {...resetForm.register("newPassword")}
                    />
                    {resetForm.formState.errors.newPassword && (
                      <p className="text-sm text-destructive mt-1">
                        {resetForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={resetPasswordMutation.isPending}
                    data-testid="button-reset-password"
                  >
                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Right side - Hero */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          <div className="flex items-center justify-center p-12 relative">
            <div className="text-center max-w-lg">
              <div className="bg-gradient-to-br from-primary to-primary/80 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-brand-lg">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gradient mb-6">
                Secure Recovery
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Your recovery key is the only way to regain access to your account. Keep it safe!
              </p>
              <div className="glass p-6 rounded-xl border border-border/50">
                <div className="flex items-center justify-center space-x-3 text-muted-foreground">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="font-medium">End-to-end encrypted recovery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                  <div className="w-5 h-5 border-2 border-white rounded-full"></div>
                </div>
                <span className="text-3xl font-bold text-gradient">LinkVault</span>
              </div>
              <p className="text-lg text-muted-foreground">Privacy-first link in bio</p>
            </div>

            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-12" data-testid="tabs-auth">
                <TabsTrigger value="login" data-testid="tab-login" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" data-testid="tab-signup" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card className="card-floating border-border/50">
                  <CardHeader className="pb-8">
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription className="text-base">
                      Enter your credentials to continue to your dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <div>
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          data-testid="input-login-username"
                          placeholder="johndoe"
                          {...loginForm.register("username")}
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-destructive mt-1">
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          data-testid="input-login-password"
                          placeholder="••••••••"
                          {...loginForm.register("password")}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-destructive mt-1">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-sign-in"
                      >
                        {loginMutation.isPending ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                    
                    <div className="mt-4 text-center">
                      <Button
                        variant="link"
                        onClick={() => setShowPasswordReset(true)}
                        className="text-sm"
                        data-testid="button-forgot-password"
                      >
                        Forgot password? Use recovery key
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="signup">
                <Card className="card-floating border-border/50">
                  <CardHeader className="pb-8">
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription className="text-base">
                      Get started with your privacy-first link hub.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                      <div>
                        <Label htmlFor="signup-username">Username</Label>
                        <Input
                          id="signup-username"
                          data-testid="input-signup-username"
                          placeholder="johndoe"
                          {...signupForm.register("username")}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This will be your public URL: linkvault.app/u/johndoe
                        </p>
                        {signupForm.formState.errors.username && (
                          <p className="text-sm text-destructive mt-1">
                            {signupForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          data-testid="input-signup-password"
                          placeholder="••••••••"
                          {...signupForm.register("password")}
                        />
                        {signupForm.formState.errors.password && (
                          <p className="text-sm text-destructive mt-1">
                            {signupForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          data-testid="input-confirm-password"
                          placeholder="••••••••"
                          {...signupForm.register("confirmPassword")}
                        />
                        {signupForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-destructive mt-1">
                            {signupForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-create-account"
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right side - Hero */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          <div className="flex items-center justify-center p-12 relative">
            <div className="text-center max-w-lg">
              <div className="bg-gradient-to-br from-primary to-primary/80 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-brand-lg">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gradient mb-6">
                Privacy-First Design
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                No email required. No data tracking. Just a simple username and password to get started.
              </p>
              <div className="space-y-4">
                <div className="glass p-4 rounded-xl border border-border/50">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Key className="h-5 w-5 text-primary" />
                    <span className="font-medium">Secure recovery key system</span>
                  </div>
                </div>
                <div className="glass p-4 rounded-xl border border-border/50">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-medium">Zero tracking guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecoveryKeyModal
        isOpen={showRecoveryModal}
        onClose={() => {
          setShowRecoveryModal(false);
          setPendingUser(null);
        }}
        recoveryKey={recoveryKey || resetRecoveryKey}
        isPasswordReset={!!resetRecoveryKey}
        userToLogin={pendingUser}
      />
    </>
  );
}
