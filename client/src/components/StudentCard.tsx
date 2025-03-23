import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserWithSkills } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface StudentCardProps {
  student: UserWithSkills;
}

export default function StudentCard({ student }: StudentCardProps) {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleContact = () => {
    setIsContactDialogOpen(false);
    setMessage("");
    // Would normally make API call here
  };

  const toggleSave = () => {
    // This would save/unsave a student profile
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex flex-col sm:flex-row gap-4">
      <div className="flex-shrink-0">
        <Avatar className="w-20 h-20">
          <AvatarImage src={student.photo} alt={student.name} />
          <AvatarFallback className="text-xl">{getInitials(student.name)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between">
          <h3 className="font-poppins font-semibold text-lg">{student.name}</h3>
          <button className="text-gray-400 hover:text-gray-600" onClick={toggleSave}>
            <i className="far fa-bookmark"></i>
          </button>
        </div>
        <p className="text-gray-500">{student.major} • {student.university}</p>
        <p className="text-gray-600 text-sm mt-2">
          {student.about}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {student.skills.map((skill) => (
            <Badge 
              key={skill.id}
              variant="secondary"
              className="bg-blue-50 text-blue-900 text-xs px-2 py-1"
            >
              {skill.name}
            </Badge>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => setIsContactDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-700"
          >
            Contact
          </Button>
        </div>
      </div>

      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {student.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-3 h-32 text-sm"
                placeholder="Tell the student about your gig opportunity..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsContactDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleContact}>
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
