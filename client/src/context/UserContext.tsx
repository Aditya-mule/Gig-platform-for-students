import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserWithSkills } from "@shared/schema";

interface UserContextType {
  user: UserWithSkills | null;
  setUser: (user: UserWithSkills | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithSkills | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user data
    const storedUser = localStorage.getItem("oceanOfGigsUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("oceanOfGigsUser");
      }
    }
    setIsLoading(false);
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("oceanOfGigsUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("oceanOfGigsUser");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
