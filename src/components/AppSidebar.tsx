import { useState } from 'react';
import { Palette, User, Store, Pencil, Check, X } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const { profile, updateProfile } = useProfile();
  const [editingField, setEditingField] = useState<'ownerName' | 'businessName' | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = (field: 'ownerName' | 'businessName') => {
    setEditingField(field);
    setEditValue(profile[field]);
  };

  const saveEdit = () => {
    if (editingField && editValue.trim()) {
      updateProfile({ [editingField]: editValue.trim() });
    }
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

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
                <SidebarMenuButton className="flex items-center justify-between w-full hover:bg-accent/10 py-3">
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
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Owner Name</p>
                  {editingField === 'ownerName' ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8 text-green-500 hover:text-green-600">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8 text-destructive hover:text-destructive/80">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{profile.ownerName}</p>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => startEditing('ownerName')} 
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Name */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Business Name</p>
                  {editingField === 'businessName' ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8 text-green-500 hover:text-green-600">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8 text-destructive hover:text-destructive/80">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{profile.businessName}</p>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => startEditing('businessName')} 
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
