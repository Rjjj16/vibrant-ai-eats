import { motion } from "framer-motion";
import { Sparkles, User, LogOut, Crown, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro':
        return { label: 'Pro', color: 'bg-gradient-to-r from-purple-500 to-pink-500' };
      case 'basic':
        return { label: 'Basic', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
      default:
        return { label: 'Free', color: 'bg-muted' };
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <nav className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-display">
            AI <span className="gradient-text">Calorie</span>
          </span>
        </a>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#scanner" className="text-muted-foreground hover:text-foreground transition-colors">Scanner</a>
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  {profile && (
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getPlanBadge(profile.plan).color}`}>
                      {getPlanBadge(profile.plan).label}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => navigate('/history')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Meal History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {profile && (
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-1">Today's Scans</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          style={{ 
                            width: `${Math.min((profile.daily_scan_count / (profile.plan === 'pro' ? 100 : profile.plan === 'basic' ? 20 : 3)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {profile.daily_scan_count}/{profile.plan === 'pro' ? '∞' : profile.plan === 'basic' ? 20 : 3}
                      </span>
                    </div>
                  </div>
                )}
                <DropdownMenuSeparator />
                {profile?.plan === 'free' && (
                  <DropdownMenuItem 
                    className="text-primary cursor-pointer"
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="gradient" 
              size="sm"
              onClick={() => navigate('/auth')}
            >
              Login
            </Button>
          )}
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;
