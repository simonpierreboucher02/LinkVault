import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link as LinkType } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Link, Home, LinkIcon, User, Key, LogOut, ExternalLink, Plus, Edit, Trash2, GripVertical, Eye, MousePointer, Menu, Bell, Settings, ChevronDown, Sparkles, Rocket, Package } from "lucide-react";
import { Link as RouterLink } from "wouter";
import LinkCard from "@/components/link-card";
import AddLinkModal from "@/components/add-link-modal";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type DashboardSection = 'dashboard' | 'links' | 'profile' | 'security';

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [showAddLink, setShowAddLink] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [showRecoveryKeyModal, setShowRecoveryKeyModal] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);

  // Set SEO metadata
  useEffect(() => {
    const sectionTitles = {
      dashboard: 'Dashboard - LinkVault',
      links: 'Manage Links - LinkVault', 
      profile: 'Profile Settings - LinkVault',
      security: 'Security Settings - LinkVault'
    };
    
    document.title = sectionTitles[activeSection];
    
    const description = "Manage your privacy-first link in bio page with LinkVault. Add links, customize your profile, and track engagement.";
    
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
  }, [activeSection]);

  const { data: links = [], isLoading } = useQuery<LinkType[]>({
    queryKey: ["/api/dashboard/links"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      await apiRequest("DELETE", `/api/dashboard/links/${linkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/links"] });
      toast({
        title: "Link deleted",
        description: "Your link has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateRecoveryKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/generate-new-recovery-key");
      return await res.json();
    },
    onSuccess: (data) => {
      setRecoveryKey(data.recoveryKey);
      setShowRecoveryKeyModal(true);
      toast({
        title: "Recovery key generated",
        description: "Save this key securely. It will only be shown once.",
      });
    },
    onError: (err: Error) =>
      toast({ title: "Failed to generate key", description: err.message, variant: "destructive" }),
  });

  const handleDeleteLink = (linkId: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      deleteLinkMutation.mutate(linkId);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Key },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        {/* Modern Collapsible Sidebar */}
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                <div className="w-4 h-4 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-xl font-bold text-gradient">LinkVault</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3">
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveSection(item.id as DashboardSection)}
                      isActive={activeSection === item.id}
                      data-testid={`nav-${item.id}`}
                      className="w-full"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full data-[state=open]:bg-accent" data-testid="user-menu">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-xs font-medium">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">@{user.username}</span>
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" className="w-56" align="end">
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-xs font-medium">
                            {user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">@{user.username}</span>
                          <span className="truncate text-xs text-muted-foreground">LinkVault User</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <RouterLink href={`/u/${user.username}`} target="_blank" className="cursor-pointer">
                        <ExternalLink className="h-4 w-4" />
                        View Public Page
                      </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveSection('profile')}>
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive" data-testid="button-logout">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          {/* Modern Topbar */}
          <header className="sticky top-0 z-10 glass border-b border-border/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground" data-testid="heading-dashboard">
                    {activeSection === 'dashboard' && 'Dashboard'}
                    {activeSection === 'links' && 'Links'}
                    {activeSection === 'profile' && 'Profile'}
                    {activeSection === 'security' && 'Security'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {activeSection === 'dashboard' && 'Overview of your link performance and quick actions'}
                    {activeSection === 'links' && 'Manage and organize your collection of links'}
                    {activeSection === 'profile' && 'Customize your bio and public page appearance'}
                    {activeSection === 'security' && 'Account security and recovery options'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                  <RouterLink href={`/u/${user.username}`} target="_blank" data-testid="button-view-public">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Page
                  </RouterLink>
                </Button>
                <Button 
                  variant="gradient" 
                  size="sm"
                  onClick={() => setShowAddLink(true)}
                  data-testid="button-quick-add-link"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </div>
          </header>

          {/* Content Container */}
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">

          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Links</p>
                        <p className="text-2xl font-bold text-card-foreground" data-testid="stat-total-links">
                          {links.length}
                        </p>
                      </div>
                      <LinkIcon className="text-primary h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Profile Views</p>
                        <p className="text-2xl font-bold text-card-foreground" data-testid="stat-profile-views">
                          0
                        </p>
                      </div>
                      <Eye className="text-primary h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Link Clicks</p>
                        <p className="text-2xl font-bold text-card-foreground" data-testid="stat-link-clicks">
                          0
                        </p>
                      </div>
                      <MousePointer className="text-primary h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center space-x-3 p-4 h-auto justify-start"
                      onClick={() => setShowAddLink(true)}
                      data-testid="button-add-new-link"
                    >
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                        <Plus className="text-primary h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">Add New Link</h3>
                        <p className="text-sm text-muted-foreground">Add a new link to your profile</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-3 p-4 h-auto justify-start"
                      onClick={() => setActiveSection('profile')}
                      data-testid="button-edit-profile"
                    >
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                        <Edit className="text-primary h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">Edit Profile</h3>
                        <p className="text-sm text-muted-foreground">Update your bio and appearance</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Links Section */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Your Links</CardTitle>
                    <Button onClick={() => setShowAddLink(true)} data-testid="button-add-link">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-muted rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : links.length === 0 ? (
                    <div className="text-center py-8" data-testid="empty-links">
                      <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No links yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start building your link collection by adding your first link.
                      </p>
                      <Button onClick={() => setShowAddLink(true)} data-testid="button-add-first-link">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Link
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3" data-testid="links-list">
                      {links.map((link) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          onEdit={() => setEditingLink(link)}
                          onDelete={() => handleDeleteLink(link.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Links Section */}
          {activeSection === 'links' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Manage Your Links</CardTitle>
                  <Button onClick={() => setShowAddLink(true)} data-testid="button-add-link">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : links.length === 0 ? (
                  <div className="text-center py-8" data-testid="empty-links">
                    <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No links yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your link collection by adding your first link.
                    </p>
                    <Button onClick={() => setShowAddLink(true)} data-testid="button-add-first-link">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="links-list">
                    {links.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        onEdit={() => setEditingLink(link)}
                        onDelete={() => handleDeleteLink(link.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <textarea 
                      className="w-full mt-1 p-2 border border-border rounded-md"
                      placeholder="Tell people about yourself..."
                      rows={3}
                      defaultValue={user.bio || ''}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Theme Color</label>
                    <input 
                      type="color" 
                      className="mt-1 h-10 w-20"
                      defaultValue={user.themeColor || '#8B5CF6'}
                    />
                  </div>
                  <Button className="w-full">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Change Password</h3>
                    <div className="space-y-3">
                      <input 
                        type="password" 
                        placeholder="Current password"
                        className="w-full p-2 border border-border rounded-md"
                      />
                      <input 
                        type="password" 
                        placeholder="New password"
                        className="w-full p-2 border border-border rounded-md"
                      />
                      <Button>Update Password</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Recovery Key</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your recovery key allows you to reset your password if you forget it.
                    </p>
                    <Button variant="outline">Generate New Recovery Key</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
            </div>
          </main>
        </SidebarInset>

        <AddLinkModal
          isOpen={showAddLink || !!editingLink}
          onClose={() => {
            setShowAddLink(false);
            setEditingLink(null);
          }}
          link={editingLink}
        />
      </div>
    </SidebarProvider>
  );
}
