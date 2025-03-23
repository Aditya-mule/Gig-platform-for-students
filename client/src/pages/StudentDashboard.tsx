import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/ui/Header";
import StudentProfile from "@/components/StudentProfile";
import GigCard from "@/components/GigCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
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

export default function StudentDashboard() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("available");

  // Fetch all gigs
  const { 
    data: gigs = [], 
    isLoading,
    refetch: refetchGigs
  } = useQuery({
    queryKey: ["/api/gigs"],
  });

  // Fetch student applications
  const { 
    data: applications = [], 
    isLoading: isLoadingApplications
  } = useQuery({
    queryKey: ["/api/applications/student", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/applications/student/${user.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch saved gigs
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

  // Filter gigs based on search term and category
  const filteredGigs = gigs.filter((gig: any) => {
    const matchesSearch = 
      gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" ||
      gig.skills.some((skill: any) => skill.name.toLowerCase() === selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  // Get applied gig IDs
  const appliedGigIds = applications.map((app: any) => app.gigId);

  // Get saved gig IDs
  const savedGigIds = savedItems
    .filter((item: any) => item.gigId)
    .map((item: any) => item.gigId);

  // Filter gigs for each tab
  const availableGigs = filteredGigs.filter((gig: any) => !appliedGigIds.includes(gig.id));
  const appliedGigs = filteredGigs.filter((gig: any) => appliedGigIds.includes(gig.id));
  const savedGigs = filteredGigs.filter((gig: any) => savedGigIds.includes(gig.id));

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    const fields = [
      user.name,
      user.email,
      user.photo,
      user.about,
      user.university,
      user.major,
      user.graduationYear
    ];
    
    const completedFields = fields.filter(f => f).length;
    const skillsBonus = user.skills && user.skills.length > 0 ? 1 : 0;
    
    return Math.min(Math.round(((completedFields + skillsBonus) / (fields.length + 1)) * 100), 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // List of categories (from all available skills in gigs)
  const categories = ["All Categories"]
    .concat(
      Array.from(
        new Set(
          gigs.flatMap((gig: any) => 
            gig.skills.map((skill: any) => skill.name)
          )
        )
      )
    )
    .sort();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-6 flex-grow">
        {/* Profile completion notice */}
        {profileCompletion < 100 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="text-blue-500 mr-3">
                <i className="fas fa-info-circle text-lg"></i>
              </div>
              <div>
                <h3 className="font-medium">Complete your profile to get more gig opportunities</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your profile is {profileCompletion}% complete. 
                  {!user?.photo && " Add a profile photo."}
                  {!user?.about && " Add a bio."}
                  {!user?.skills?.length && " Add your skills."}
                </p>
                <div className="mt-2">
                  <Progress value={profileCompletion} className="h-2" />
                </div>
                <Button 
                  variant="link" 
                  className="mt-2 h-auto p-0 text-sm font-medium text-blue-500 hover:text-blue-700"
                >
                  Complete profile <i className="fas fa-arrow-right ml-1"></i>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar - Profile Section */}
          <div className="md:col-span-1">
            <StudentProfile />
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Tab Navigation */}
            <Tabs
              defaultValue="available"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="bg-white rounded-lg shadow-md mb-6">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="available" className="rounded-none">
                    Available Gigs
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="rounded-none">
                    My Applications
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="rounded-none">
                    Saved Gigs
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Search & Filter */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative">
                    <Input
                      placeholder="Search for gigs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.slice(1).map((category: string) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
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
              
              <TabsContent value="available" className="m-0">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-10">
                      <i className="fas fa-spinner fa-spin text-blue-500 text-2xl mb-2"></i>
                      <p>Loading gigs...</p>
                    </div>
                  ) : availableGigs.length > 0 ? (
                    availableGigs.map((gig: any) => (
                      <GigCard 
                        key={gig.id} 
                        gig={gig} 
                        refetchGigs={() => {
                          refetchGigs();
                          queryClient.invalidateQueries({ queryKey: ["/api/applications/student", user?.id] });
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <i className="fas fa-search text-gray-400 text-4xl mb-3"></i>
                      <h3 className="text-lg font-medium mb-1">No gigs found</h3>
                      <p className="text-gray-500">Try adjusting your search filters</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="applications" className="m-0">
                <div className="space-y-4">
                  {isLoadingApplications ? (
                    <div className="text-center py-10">
                      <i className="fas fa-spinner fa-spin text-blue-500 text-2xl mb-2"></i>
                      <p>Loading your applications...</p>
                    </div>
                  ) : appliedGigs.length > 0 ? (
                    appliedGigs.map((gig: any) => (
                      <div key={gig.id} className="bg-white rounded-lg shadow-md p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-poppins font-semibold text-lg">{gig.title}</h3>
                            <p className="text-gray-500 text-sm">Posted by {gig.companyName}</p>
                          </div>
                          <Badge>
                            {
                              applications.find((app: any) => app.gigId === gig.id)?.status || "pending"
                            }
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mt-3">{gig.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {gig.skills.map((skill: any) => (
                            <Badge 
                              key={skill.id} 
                              variant="secondary" 
                              className="bg-blue-50 text-blue-900 text-xs px-2 py-1"
                            >
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <i className="fas fa-file-alt text-gray-400 text-4xl mb-3"></i>
                      <h3 className="text-lg font-medium mb-1">No applications yet</h3>
                      <p className="text-gray-500">Start applying to gigs to see them here</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="saved" className="m-0">
                <div className="space-y-4">
                  {isLoadingSaved ? (
                    <div className="text-center py-10">
                      <i className="fas fa-spinner fa-spin text-blue-500 text-2xl mb-2"></i>
                      <p>Loading saved gigs...</p>
                    </div>
                  ) : savedGigs.length > 0 ? (
                    savedGigs.map((gig: any) => (
                      <GigCard 
                        key={gig.id} 
                        gig={gig} 
                        refetchGigs={() => {
                          refetchGigs();
                          queryClient.invalidateQueries({ queryKey: ["/api/saved-items", user?.id] });
                        }} 
                      />
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <i className="fas fa-bookmark text-gray-400 text-4xl mb-3"></i>
                      <h3 className="text-lg font-medium mb-1">No saved gigs</h3>
                      <p className="text-gray-500">Save gigs to view them later</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
