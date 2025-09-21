import { useAuth } from "@/hooks/use-auth";
import { Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Key, Palette } from "lucide-react";
import { useEffect } from "react";

export default function LandingPage() {
  const { user } = useAuth();

  // Set SEO metadata
  useEffect(() => {
    document.title = "LinkVault - Privacy-First Link in Bio Platform";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create your personal link hub without sacrificing privacy. No email required, just username and password. Take control with our recovery key system.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Create your personal link hub without sacrificing privacy. No email required, just username and password. Take control with our recovery key system.';
      document.head.appendChild(meta);
    }

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'LinkVault - Privacy-First Link in Bio Platform' },
      { property: 'og:description', content: 'Create your personal link hub without sacrificing privacy. No email required, just username and password.' },
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
  }, []);

  // Redirect to dashboard if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                <div className="w-4 h-4 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-xl font-bold text-gradient">LinkVault</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium" data-testid="link-features">
                Features
              </a>
              <a href="#privacy" className="text-muted-foreground hover:text-foreground transition-colors font-medium" data-testid="link-privacy">
                Privacy
              </a>
              <Link href="/auth" data-testid="link-login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-medium">
                  Login
                </Button>
              </Link>
              <Link href="/auth" data-testid="link-get-started">
                <Button variant="gradient" size="default" className="font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight" data-testid="text-hero-title">
            Your Links, <span className="text-gradient">Your Privacy</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Create your personal link hub without sacrificing privacy. No email required, just username and password. Take control with our recovery key system.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/auth" data-testid="button-create-page">
              <Button variant="gradient" size="xl" className="text-lg px-10 py-4 shadow-brand-lg">
                Create Your Page
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/u/demo" data-testid="button-view-demo">
              <Button variant="outline" size="xl" className="text-lg px-10 py-4">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose LinkVault?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for privacy, designed for simplicity, secured with innovation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-floating bg-background rounded-xl p-8 text-center border border-border/50">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-primary to-primary/80 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-brand">
                  <Shield className="text-white h-10 w-10" />
                </div>
                <div className="absolute -top-2 -right-2 bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                  Core
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Privacy First</h3>
              <p className="text-muted-foreground leading-relaxed">
                No email required. Just username and password. Your data stays yours.
              </p>
            </div>
            <div className="card-floating bg-background rounded-xl p-8 text-center border border-border/50">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-primary to-primary/80 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-brand">
                  <Key className="text-white h-10 w-10" />
                </div>
                <div className="absolute -top-2 -right-2 bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                  Secure
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Recovery Key System</h3>
              <p className="text-muted-foreground leading-relaxed">
                Secure recovery with a unique key. No forgotten email access needed.
              </p>
            </div>
            <div className="card-floating bg-background rounded-xl p-8 text-center border border-border/50">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-primary to-primary/80 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-brand">
                  <Palette className="text-white h-10 w-10" />
                </div>
                <div className="absolute -top-2 -right-2 bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                  Custom
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Customizable</h3>
              <p className="text-muted-foreground leading-relaxed">
                Beautiful themes and full control over your link presentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                  <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                </div>
                <span className="text-xl font-bold text-gradient">LinkVault</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Privacy-first link in bio platform. Your links, your control.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/auth" className="hover:text-foreground transition-colors" data-testid="link-footer-get-started">Get Started</a></li>
                <li><a href="/auth" className="hover:text-foreground transition-colors" data-testid="link-footer-sign-up">Sign Up</a></li>
                <li><a href="https://github.com/features/security" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" data-testid="link-footer-security">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="https://github.com/linkvault/docs" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" data-testid="link-footer-docs">Documentation</a></li>
                <li><a href="mailto:support@linkvault.app" className="hover:text-foreground transition-colors" data-testid="link-footer-help">Help Center</a></li>
                <li><a href="mailto:contact@linkvault.app" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="https://www.privacypolicies.com/live/6b0f1ee9-3e1c-4e1b-9c19-8e9b0a23e3b1" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy Policy</a></li>
                <li><a href="https://www.termsandconditionsgenerator.com/live.php?token=6b0f1ee9-3e1c-4e1b-9c19-8e9b0a23e3b1" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms of Service</a></li>
                <li><a href="https://github.com/linkvault/linkvault" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" data-testid="link-footer-opensource">Open Source</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 LinkVault. All rights reserved.</p>
            <p className="mt-2">
              Created by{' '}
              <a 
                href="https://minimalauth.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:text-primary/80 transition-colors"
                data-testid="link-footer-minimalauth"
              >
                MinimalAuth.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
