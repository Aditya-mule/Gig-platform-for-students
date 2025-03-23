import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { EditProfileForm } from "./EditProfileForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function StudentProfile() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-teal-600"></div>
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage src={user.photo} alt={user.name} />
              <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline" className="absolute bottom-1 right-1 rounded-full p-1.5 hover:bg-gray-200 transition w-8 h-8">
                  <i className="fas fa-camera"></i>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <h3 className="text-lg font-semibold mb-4">Upload Profile Photo</h3>
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-gray-500 mb-2">Drag and drop your photo here, or click to browse</p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                    <input type="file" className="hidden" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Upload</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="pt-16 pb-6 px-6 text-center">
        <h2 className="font-poppins font-semibold text-xl">{user.name}</h2>
        <p className="text-gray-600 mt-1">{user.major} Major</p>
        <p className="text-gray-500 text-sm mt-1">{user.university}, {user.graduationYear}</p>
        
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="mt-4 w-full border-blue-500 text-blue-500 hover:bg-blue-50 font-medium"
            >
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <EditProfileForm onSuccess={() => setIsEditing(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Skills Section */}
      <div className="px-6 pb-6">
        <h3 className="font-semibold text-gray-700 mb-3">My Skills</h3>
        <div className="flex flex-wrap gap-2">
          {user.skills && user.skills.map((skill) => (
            <Badge key={skill.id} variant="secondary" className="bg-blue-50 text-blue-900 hover:bg-blue-100">
              {skill.name}
            </Badge>
          ))}
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-gray-500 text-sm hover:text-blue-500">
                <i className="fas fa-plus mr-1"></i> Add more
              </button>
            </DialogTrigger>
            <DialogContent>
              <h3 className="text-lg font-semibold mb-4">Add Skills</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Add skills to your profile to help recruiters find you</p>
                {/* Skill selection would go here */}
                <div className="flex justify-end">
                  <Button>Save Skills</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* About Me Section */}
      <div className="px-6 pb-6">
        <h3 className="font-semibold text-gray-700 mb-2">About Me</h3>
        <p className="text-gray-600 text-sm">
          {user.about || "You haven't added a bio yet. Tell recruiters about yourself."}
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-gray-500 hover:text-blue-500 text-sm mt-2">
              <i className="fas fa-edit mr-1"></i> Edit
            </button>
          </DialogTrigger>
          <DialogContent>
            <h3 className="text-lg font-semibold mb-4">Edit Bio</h3>
            <div className="space-y-4">
              <textarea 
                className="w-full rounded-md border border-gray-300 p-2 h-32"
                placeholder="Tell recruiters about yourself..."
                defaultValue={user.about || ""}
              ></textarea>
              <div className="flex justify-end">
                <Button>Save Bio</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
