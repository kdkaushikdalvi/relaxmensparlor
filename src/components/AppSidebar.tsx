import { Palette, User, Store } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useProfile } from '@/contexts/ProfileContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { ThemeToggle } from './ThemeToggle';

export function AppSidebar() {
  const { theme } = useTheme();
  const { profile } = useProfile();

  return (
    <Sidebar className="border-r border-primary/20">
      <SidebarHeader className="p-4 border-b border-primary/20">
        <h2 className="text-lg font-display font-semibold text-foreground">Menu</h2>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Theme Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Appearance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center justify-between w-full hover:bg-accent/10">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-primary" />
                    <span>Theme</span>
                  </div>
                  <ThemeToggle />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Profile Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Settings / Profile
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-4 space-y-4">
              {/* Owner Name */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Owner Name</p>
                  <p className="text-sm font-medium text-foreground">{profile.ownerName}</p>
                </div>
              </div>

              {/* Business Name */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Business Name</p>
                  <p className="text-sm font-medium text-foreground">{profile.businessName}</p>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
