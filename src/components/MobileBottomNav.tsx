/**
 * MobileBottomNav Component (Astro)
 * ==================================
 * Sticky bottom navigation for mobile devices with page links.
 *
 * Features:
 * - Fixed bottom positioning for mobile devices
 * - Lucide icons with text labels
 * - Active state detection via URL path
 * - Safe area padding for notched phones
 * - Hidden on desktop (lg:hidden)
 * - Light theme styling with emerald accents
 *
 * Usage in .astro files:
 *   import MobileBottomNav from '@/components/MobileBottomNav';
 *   <MobileBottomNav client:load currentPath={Astro.url.pathname} />
 */

import { Home, Briefcase, BookOpen, User, Mail } from "lucide-react";

interface NavItem {
  label: string;
  url: string;
  icon: React.ReactNode;
  /** Match paths that start with this prefix (for nested routes) */
  matchPrefix?: string;
}

interface MobileBottomNavProps {
  /** Current page path for active state detection */
  currentPath?: string;
  /** Additional CSS classes */
  className?: string;
}

// Navigation items with page URLs
// CUSTOMIZE: Update these to match your site pages
const navItems: NavItem[] = [
  { label: "Home", url: "/", icon: <Home size={20} /> },
  { label: "Services", url: "/services/", icon: <Briefcase size={20} />, matchPrefix: "/services" },
  { label: "Blog", url: "/blog/", icon: <BookOpen size={20} />, matchPrefix: "/blog" },
  { label: "About", url: "/about/", icon: <User size={20} /> },
  { label: "Contact", url: "/contact/", icon: <Mail size={20} /> },
];

export default function MobileBottomNav({
  currentPath = "/",
  className = "",
}: MobileBottomNavProps) {
  // Check if a link is active based on current URL path
  const isActiveLink = (item: NavItem): boolean => {
    // Exact match for home
    if (item.url === "/") {
      return currentPath === "/";
    }
    // Contact page
    if (item.url === "/contact/") {
      return currentPath === "/contact/" || currentPath === "/contact";
    }
    // Prefix match for nested routes (e.g., /services/data-strategy/)
    if (item.matchPrefix) {
      return currentPath.startsWith(item.matchPrefix);
    }
    // Exact match
    return currentPath === item.url;
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 lg:hidden pb-safe ${className}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = isActiveLink(item);
          return (
            <a
              key={item.url}
              href={item.url}
              className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors duration-200 ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="mb-1">{item.icon}</span>
              <span
                className={`text-xs ${isActive ? "font-medium" : "font-normal"}`}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
