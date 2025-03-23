import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { EditProfileForm } from "./EditProfileForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function RecruiterProfile() {
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-amber-500 to-amber-300"></div>
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
                <h3 className="text-lg font-semibold mb-4">Upload Company Logo</h3>
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-gray-500 mb-2">Drag and drop your logo here, or click to browse</p>
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
        <p className="text-gray-600 mt-1">{user.company || "Technology Startup"}</p>
        <p className="text-gray-500 text-sm mt-1">{user.location}</p>
        
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
    </div>
  );
}
