
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { navLinks } from '@/config/navConfig';
import { cn } from '@/lib/utils';
import { Box } from 'lucide-react';

const Sidebar = () => {
  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="hidden md:flex md:flex-col md:w-72 bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-primary-foreground shadow-lg"
    >
      <div className="flex items-center justify-center h-20 border-b border-primary-foreground/20">
        <Box className="h-8 w-8 mr-3 text-primary-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Mon Auxiliaire</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-foreground/10 hover:scale-105',
                isActive ? 'bg-primary-foreground/20 font-semibold shadow-md scale-105' : 'hover:text-primary-foreground'
              )
            }
          >
            {link.icon}
            <span className="ml-3">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-primary-foreground/20">
        <p className="text-xs text-center text-primary-foreground/70">
          &copy; {new Date().getFullYear()} Mon Auxiliaire Déménagement
        </p>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
  