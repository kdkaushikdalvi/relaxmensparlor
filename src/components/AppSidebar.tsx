import { useState } from 'react';
import { Palette, User, Store, Pencil, Check, X, QrCode, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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

const WEBSITE_URL = 'https://relaxmensparlor.lovable.app';

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

        <SidebarSeparator />

        {/* QR Code Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Share Website
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-4">
              <div className="flex flex-col items-center gap-4">
                {/* QR Code Display */}
                <div className="bg-white p-4 rounded-xl shadow-lg border border-primary/20">
                  <QRCodeSVG 
                    value={WEBSITE_URL} 
                    size={160}
                    level="H"
                    includeMargin={false}
                    fgColor="#d97706"
                    bgColor="#ffffff"
                  />
                </div>
                
                {/* URL and Actions */}
                <div className="text-center space-y-2 w-full">
                  <div className="flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">Scan to visit</span>
                  </div>
                  <p className="text-xs text-primary break-all font-mono bg-primary/5 rounded-lg px-3 py-2">
                    {WEBSITE_URL}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => window.open(WEBSITE_URL, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Website
                  </Button>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
