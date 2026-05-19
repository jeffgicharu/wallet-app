// @ts-nocheck
import { Outlet, Navigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useIsDesktop } from '../lib/useMediaQuery';

// One shell, two navigation chromes. Below the lg breakpoint (1024px)
// the app is the phone-shaped column it has always been, with the
// bottom tab bar. At lg and up a fixed 240px sidebar takes over, the
// bottom bar is gone, and the content area widens to a desktop
// max-width so pages use the horizontal space instead of floating as a
// narrow column in a sea of whitespace. The 1024px cut keeps
// tablet-portrait on the mobile layout (where it reads well) and gives
// tablet-landscape and up the desktop layout.
//
// Only the active chrome is rendered (not merely CSS-hidden): a hidden
// sidebar would still inject duplicate "Sign Out" / account-name text
// nodes that collide with content assertions and assistive tech.
export function AppShell() {
  const { isAuthenticated } = useAuth();
  const isDesktop = useIsDesktop();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      {isDesktop && <Sidebar />}
      <div className="lg:pl-60">
        <div className="mx-auto w-full max-w-md pb-24 md:max-w-xl lg:max-w-7xl lg:px-12 lg:pb-12 lg:pt-2">
          <Outlet />
        </div>
      </div>
      {!isDesktop && <BottomNav />}
    </div>
  );
}
