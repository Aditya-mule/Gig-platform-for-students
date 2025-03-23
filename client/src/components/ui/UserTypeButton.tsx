import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { Skill, UserRole, UserWithSkills } from "@shared/schema";

interface UserTypeButtonProps {
  userType: "student" | "recruiter";
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export default function UserTypeButton({ 
  userType, 
  icon, 
  title, 
  description, 
  className = "" 
}: UserTypeButtonProps) {
  const [_, setLocation] = useLocation();
  const { setUser } = useUser();

  const handleClick = () => {
    // Create a demo user account and auto-login
    const demoUser: UserWithSkills = userType === UserRole.STUDENT
      ? createDemoStudent()
      : createDemoRecruiter();

    setUser(demoUser);
    setLocation(`/${userType}`);
  };

  const createDemoStudent = (): UserWithSkills => {
    const skills: Skill[] = [
      { id: 1, name: "Web Development" },
      { id: 3, name: "JavaScript" },
      { id: 4, name: "React" }
    ];

    return {
      id: 1,
      username: "student_demo",
      password: "password",
      role: UserRole.STUDENT,
      name: "John Doe",
      email: "john.doe@university.edu",
      photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
      about: "Junior CS major with a passion for frontend development. Looking for opportunities to build real-world applications.",
      university: "Boston University",
      major: "Computer Science",
      graduationYear: "2025",
      company: "",
      location: "",
      skills
    };
  };

  const createDemoRecruiter = (): UserWithSkills => {
    return {
      id: 2,
      username: "recruiter_demo",
      password: "password",
      role: UserRole.RECRUITER,
      name: "Campus Startup",
      email: "contact@campusstartup.com",
      photo: "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
      about: "Campus startup looking for talented students to help build our platform.",
      university: "",
      major: "",
      graduationYear: "",
      company: "Campus Startup",
      location: "Boston University",
      skills: []
    };
  };

  return (
    <button 
      onClick={handleClick}
      className={`flex-1 text-white font-semibold py-4 px-6 rounded-lg transition flex flex-col items-center ${className}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <span>{title}</span>
      <span className="text-sm font-normal mt-1">{description}</span>
    </button>
  );
}
