import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminNotesNotifications } from './AdminNotesNotifications';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  console.log("Navigation - user:", user, "profile:", profile);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/brokers", label: "Brokers" },
    { href: "/lenders", label: "Lenders" },
  ];

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    console.log("Sign out button clicked");
    try {
      await signOut();
      console.log("signOut() completed");
    } catch (e) {
      console.error("Error during sign out:", e);
    }
  };

  const getDashboardUrl = () => {
    console.log("getDashboardUrl - profile:", profile, "role:", profile?.role);
    if (!profile?.role) return "/dashboard";

    switch (profile.role) {
      case "admin":
        return "/dashboard/admin";
      case "lender":
        return "/dashboard/lender";
      case "broker":
        return "/dashboard/broker";
      default:
        return "/dashboard";
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-teal-600">
              Signal1
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={getDashboardUrl()}>
                  <Button
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white"
                  >
                    Dashboard
                  </Button>
                </Link>
                <AdminNotesNotifications />
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-teal-600 p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-lg mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-gray-700 hover:text-teal-600 block px-3 py-2 text-base font-medium"
                  onClick={handleNavClick}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 space-y-2">
                {user ? (
                  <>
                    <Link to={getDashboardUrl()} onClick={handleNavClick}>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleSignOut();
                        handleNavClick();
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={handleNavClick}>
                      <Button
                        variant="outline"
                        className="w-full border-teal-600 text-teal-600"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={handleNavClick}>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
