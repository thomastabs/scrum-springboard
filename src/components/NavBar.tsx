
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface NavBarProps {
  title: string;
  subtitle?: string;
}

const NavBar: React.FC<NavBarProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  
  return (
    <div className="w-full bg-black text-white py-4 px-8 flex justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">
          <Link to="/">
            {title}
          </Link>
        </h1>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
      
      <div className="flex items-center space-x-4">
        {user?.email && (
          <span className="hidden md:block text-sm text-gray-400">
            {user.email}
          </span>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 bg-gray-800">
                <AvatarFallback className="text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="cursor-pointer">
              <Link to="/profile" className="w-full">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-red-500" 
              onClick={logout}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NavBar;
