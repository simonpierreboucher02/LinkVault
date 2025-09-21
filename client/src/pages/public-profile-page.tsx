import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Github, Twitter, Linkedin, Mail, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicProfile {
  username: string;
  bio?: string;
  profilePicture?: string;
  themeColor?: string;
  links: {
    id: string;
    title: string;
    url: string;
    icon: string;
  }[];
}

const getIconComponent = (icon: string) => {
  switch (icon) {
    case "fab fa-github":
      return Github;
    case "fab fa-twitter":
      return Twitter;
    case "fab fa-linkedin":
      return Linkedin;
    case "fas fa-envelope":
      return Mail;
    default:
      return Globe;
  }
};

export default function PublicProfilePage() {
  const [match, params] = useRoute("/u/:username");
  const username = params?.username;

  const { data: profile, isLoading, error, refetch } = useQuery<PublicProfile>({
    queryKey: ["/api/profile", username],
    enabled: !!username,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (user not found)
      if ((error as Error)?.message?.startsWith('404:')) return false;
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });

  if (!username || !match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Profile</h1>
            <p className="text-muted-foreground">The profile URL is not valid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    // For fetch-based errors, check the error message format "404: ..."
    const is404 = (error as Error)?.message?.startsWith('404:');
    
    if (is404) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
              <p className="text-muted-foreground">
                The user @{username} could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Other errors (network, server, etc.)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              We couldn't load this profile. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              data-testid="button-retry"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const themeColor = profile.themeColor || "#8B5CF6";

  return (
    <div className="min-h-screen bg-background" style={{ "--theme-color": themeColor } as any}>
      <div className="max-w-md mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="text-center mb-8" data-testid="profile-header">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
            <AvatarImage src={profile.profilePicture} alt={profile.username} />
            <AvatarFallback className="text-2xl font-bold">
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-foreground" data-testid="profile-username">
            @{profile.username}
          </h1>
          {profile.bio && (
            <p className="text-muted-foreground mt-2" data-testid="profile-bio">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-4" data-testid="profile-links">
          {profile.links.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No links yet</h3>
                <p className="text-muted-foreground">
                  This user hasn't added any links to their profile.
                </p>
              </CardContent>
            </Card>
          ) : (
            profile.links.map((link) => {
              const IconComponent = getIconComponent(link.icon);
              
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                  data-testid={`profile-link-${link.id}`}
                >
                  <Card className="hover:bg-accent transition-colors cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center space-x-3">
                        <IconComponent className="text-primary h-5 w-5" />
                        <span className="font-medium text-card-foreground flex-1 text-center">
                          {link.title}
                        </span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="text-primary font-medium">LinkVault</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Created by{' '}
            <a 
              href="https://minimalauth.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              MinimalAuth.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
