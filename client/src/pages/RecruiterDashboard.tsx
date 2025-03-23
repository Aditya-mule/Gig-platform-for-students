import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/ui/Header";
import RecruiterProfile from "@/components/RecruiterProfile";
import StudentCard from "@/components/StudentCard";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { UserRole } from "@shared/schema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CreateGigForm } from "@/components/CreateGigForm";

export default function RecruiterDashboard() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [activeTab, setActiveTab] = useState("talent");
  const [isCreateGigOpen, setIsCreateGigOpen] = useState(false);

  // Fetch all students
  const { 
    data: students = [], 
    isLoading: isLoadingStudents,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ["/api/search/users"],
    queryFn: async () => {
      const res = await fetch(`/api/search/users?role=${UserRole.STUDENT}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });

  // Fetch all skills
  const { 
    data: skills = [], 
    isLoading: isLoadingSkills
  } = useQuery({
    queryKey: ["/api/skills"],
  });

  // Fetch recruiter's gigs
  const { 
    data: myGigs = [], 
    isLoading: isLoadingGigs,
    refetch: refetchGigs
  } = useQuery({
    queryKey: ["/api/recruiters", user?.id, "gigs"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/recruiters/${user.id}/gigs`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch gigs");
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch applications for recruiter's gigs
  const { 
    data: applications = [], 
    isLoading: isLoadingApplications
  } = useQuery({
    queryKey: ["/api/applications/gigs", myGigs],
    queryFn: async () => {
      if (!myGigs.length) return [];
      
      // Fetch applications for all gigs
      const appPromises = myGigs.map((gig: any) => 
        fetch(`/api/applications/gig/${gig.id}`, {
          credentials: "include",
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch applications for gig ${gig.id}`);
          return res.json();
        })
      );
      
      const results = await Promise.all(appPromises);
      return results.flat();
    },
    enabled: myGigs.length > 0,
  });

  // Fetch saved profiles
  const { 
    data: savedItems = [], 
    isLoading: isLoadingSaved
  } = useQuery({
    queryKey: ["/api/saved-items", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/saved-items/${user.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch saved items");
      return res.json();
    },
    enabled: !!user,
  });

  // Filter students based on search term and selected skill
  const filteredStudents = students.filter((student: any) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.major && student.major.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.about && student.about.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSkill = 
      selectedSkill === "all" ||
      student.skills.some((skill: any) => skill.name.toLowerCase() === selectedSkill.toLowerCase());
    
    return matchesSearch && matchesSkill;
  });

  // Get saved user IDs
  const savedUserIds = savedItems
    .filter((item: any) => item.savedUserId)
    .map((item: any) => item.savedUserId);

  // Filter students for each tab
  const allStudents = filteredStudents;
  const savedStudents = filteredStudents.filter((student: any) => savedUserIds.includes(student.id));

  // Format applications for display
  const formatApplicationsCount = (gigId: number) => {
    return applications.filter((app: any) => app.gigId === gigId).length;
  };

  // Calculate stats
  const stats = {
    activeGigs: myGigs.length,
    applications: applications.length,
    studentsContacted: 0, // Would need messaging data
    gigsCompleted: 0 // Would need completion status
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-6 flex-grow">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            onClick={() => setIsCreateGigOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium"
          >
            <i className="fas fa-plus-circle mr-2"></i> Post a New Gig
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setActiveTab("myGigs");
            }}
            className="bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            <i className="fas fa-bookmark mr-2"></i> My Posted Gigs
          </Button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Tab Navigation */}
            <Tabs
              defaultValue="talent"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="bg-white rounded-lg shadow-md mb-6">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="talent" className="rounded-none">
                    Find Talent
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="rounded-none">
                    Applications Received
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="rounded-none">
                    Saved Profiles
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Search & Filter */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative">
                    <Input
                      placeholder="Search for skills, students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selectedSkill}
                      onValueChange={setSelectedSkill}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Skills" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Skills</SelectItem>
                        {skills.map((skill: any) => (
                          <SelectItem key={skill.id} value={skill.name.toLowerCase()}>
                            {skill.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <i className="fas fa-filter"></i>
                    </Button>
                  </div>
                </div>
              </div>
              
              <TabsContent value="talent" className="m-0">
                <div className="space-y-4">
                  {isLoadingStudents ? (
                    <div className="text-center py-10">
                      <i className="fas fa-spinner fa-spin text-blue-500 text-2xl mb-2"></i>
                      <p>Loading talent profiles...</p>
                    </div>
                  ) : allStudents.length > 0 ? (
                    allStudents.map((student: any) => (
                      <StudentCard key={student.id} student={student} />
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <i className="fas fa-users text-gray-400 text-4xl mb-3"></i>
                      <h3 className="text-lg font-medium mb-1">No students found</h3>
                      <p className="text-gray-500">Try adjusting your search filters</p>
                    </div>
                  )}
                  
                  {allStudents.length > 0 && (
                    <div className="text-center py-4">
                      <Button variant="link" className="text-blue-500 font-medium hover:text-blue-700">
                        Load more profiles <i className="fas fa-chevron-down ml-1"></i>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="applications" className="m-0">
                <div className="space-y-4">
                  {isLoadingApplications ? (
                    <div className="text-center py-10">
                      <i className="fas fa-spinner fa-spin text-blue-500 text-2xl mb-2"></i>
                      <p>Loading applications...</p>
                    </div>
                  ) : applications.length > 0 ? (
                    applications.map((application: any) => (
                      <Card key={application.id} className="overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-poppins font-semibold text-lg">
                                    Application for{" "}
                                    {myGigs.find((g: any) => g.id === application.gigId)?.title || "Gig"}
                                  </h3>
                                  <p className="text-gray-500 text-sm">
                                    From{" "}
                                    {students.find((s: any) => s.id === application.studentId)?.name || "Student"}
                                  </p>
                                </div>
                                <div className="bg-blue-50 text-blue-900 text-xs px-2 py-1 rounded-full">
                                  {application.status}
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm mt-3">
                                {application.coverLetter || "No cover letter provided."}
                              </p>
                              
                              <div className="mt-4 flex justify-end space-x-2">
                                <Button variant="outline" size="sm">View Profile</Button>
                                <Button size="sm">Contact</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <i className="fas fa-file-alt text-gray-400 text-4xl mb-3"></i>
                      <h3 className="text-lg font-medium mb-1">No applications received</h3>
                      <p className="text-gray-500">Post more gigs to attract talented students</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="saved" className="m-0">
                <div className="space-y-4">
                  {isLoadingSaved ? (
                    <div className="text-center py-10">
                      <i className="fas fa-spinner fa-spin text-blue-500 text-2xl mb-2"></i>
                      <p>Loading saved profiles...</p>
                    </div>
                  ) : savedStudents.length > 0 ? (
                    savedStudents.map((student: any) => (
                      <StudentCard key={student.id} student={student} />
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <i className="fas fa-bookmark text-gray-400 text-4xl mb-3"></i>
                      <h3 className="text-lg font-medium mb-1">No saved profiles</h3>
                      <p className="text-gray-500">Save student profiles to view them later</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="myGigs" className="m-0">
                <div className="space-y-4">
                  {isLoadingGigs ? (
                    <div className="text-center py-10">
                      <i className="fas fa-spinner fa-spin text-blue-500 text-2xl mb-2"></i>
                      <p>Loading your gigs...</p>
                    </div>
                  ) : myGigs.length > 0 ? (
                    myGigs.map((gig: any) => (
                      <Card key={gig.id} className="overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-poppins font-semibold text-lg">{gig.title}</h3>
                              <p className="text-gray-500 text-sm">
                                Posted {new Date(gig.createdAt).toLocaleDateString()} • 
                                {formatApplicationsCount(gig.id)} applications
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm">View</Button>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mt-3 line-clamp-2">{gig.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {gig.skills && gig.skills.map((skill: any) => (
                              <div 
                                key={skill.id} 
                                className="bg-blue-50 text-blue-900 text-xs px-2 py-1 rounded-full"
                              >
                                {skill.name}
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-blue-900">
                                ${gig.minPrice}{gig.maxPrice && `-${gig.maxPrice}`}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {gig.isPriceHourly ? "/hour" : ""} • {gig.estimatedHours || "Fixed Price"}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatApplicationsCount(gig.id)} applications
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <i className="fas fa-briefcase text-gray-400 text-4xl mb-3"></i>
                      <h3 className="text-lg font-medium mb-1">No gigs posted yet</h3>
                      <p className="text-gray-500">Click "Post a New Gig" to get started</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar - Recruiter Profile & Stats */}
          <div className="md:col-span-1">
            {/* Recruiter Profile */}
            <RecruiterProfile />
            
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <h3 className="font-semibold text-gray-700 mb-4">Activity Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Gigs</span>
                  <span className="font-semibold">{stats.activeGigs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Applications Received</span>
                  <span className="font-semibold">{stats.applications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Students Contacted</span>
                  <span className="font-semibold">{stats.studentsContacted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gigs Completed</span>
                  <span className="font-semibold">{stats.gigsCompleted}</span>
                </div>
              </div>
            </div>
            
            {/* Recent Gigs Posted */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Recent Gigs Posted</h3>
                <Button 
                  variant="link" 
                  className="text-blue-500 text-sm p-0 h-auto hover:text-blue-700"
                  onClick={() => setActiveTab("myGigs")}
                >
                  View all
                </Button>
              </div>
              <div className="space-y-4">
                {isLoadingGigs ? (
                  <div className="py-4 text-center text-gray-500">
                    <i className="fas fa-spinner fa-spin mr-2"></i> Loading...
                  </div>
                ) : myGigs.length > 0 ? (
                  myGigs.slice(0, 3).map((gig: any, index: number) => (
                    <div key={gig.id} className={index < 2 ? "border-b border-gray-100 pb-3" : ""}>
                      <h4 className="font-medium">{gig.title}</h4>
                      <p className="text-gray-500 text-sm">
                        Posted {new Date(gig.createdAt).toLocaleDateString()} • 
                        {formatApplicationsCount(gig.id)} applications
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No gigs posted yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Gig Dialog */}
      <Dialog open={isCreateGigOpen} onOpenChange={setIsCreateGigOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Post a New Gig</DialogTitle>
          </DialogHeader>
          <CreateGigForm 
            onSuccess={() => {
              setIsCreateGigOpen(false);
              refetchGigs();
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
