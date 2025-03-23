import { Link } from "wouter";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Header() {
  const { user, setUser } = useUser();
  const [location] = useLocation();

  const handleLogout = () => {
    setUser(null);
    window.location.href = "/";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fas fa-water text-blue-500 text-xl"></i>
          <Link href="/">
            <h1 className="font-poppins font-bold text-xl text-blue-900 cursor-pointer">
              Ocean of Gigs
            </h1>
          </Link>
        </div>

        {user ? (
          <>
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                {user.role === "student" ? (
                  <>
                    <li>
                      <Link href="/student">
                        <a className={location === "/student" ? "text-blue-500 font-medium" : "text-gray-600 hover:text-blue-500 transition"}>
                          Find Gigs
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/student/applications">
                        <a className={location === "/student/applications" ? "text-blue-500 font-medium" : "text-gray-600 hover:text-blue-500 transition"}>
                          My Applications
                        </a>
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/recruiter">
                        <a className={location === "/recruiter" ? "text-blue-500 font-medium" : "text-gray-600 hover:text-blue-500 transition"}>
                          Find Talent
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/recruiter/gigs">
                        <a className={location === "/recruiter/gigs" ? "text-blue-500 font-medium" : "text-gray-600 hover:text-blue-500 transition"}>
                          My Gigs
                        </a>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="md:hidden text-gray-600">
                <i className="fas fa-bars text-lg"></i>
              </button>
              <div className="flex items-center space-x-2">
                <span className="font-medium hidden md:inline-block">{user.name}</span>
                <Avatar>
                  <AvatarImage src={user.photo} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt mr-1"></i> Logout
              </Button>
            </div>
          </>
        ) : (
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-500 transition">
                  How it works
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-blue-500 transition">
                  About
                </a>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
