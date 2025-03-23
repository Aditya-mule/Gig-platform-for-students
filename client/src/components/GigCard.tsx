import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GigWithSkills } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

interface GigCardProps {
  gig: GigWithSkills;
  refetchGigs?: () => void;
}

export default function GigCard({ gig, refetchGigs }: GigCardProps) {
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const handleApply = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/applications", {
        gigId: gig.id,
        studentId: user.id,
        coverLetter,
        status: "pending"
      });
      
      toast({
        title: "Application submitted!",
        description: "Your application has been successfully submitted.",
      });
      
      setIsApplyDialogOpen(false);
      setCoverLetter("");
      if (refetchGigs) refetchGigs();
    } catch (error) {
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const toggleSave = async () => {
    // This would save/unsave a gig
    toast({
      title: "Gig saved",
      description: "This gig has been added to your saved list",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex justify-between">
        <div>
          <h3 className="font-poppins font-semibold text-lg">{gig.title}</h3>
          <p className="text-gray-500 text-sm">Posted by {gig.companyName} • {formatDate(gig.createdAt)}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600" onClick={toggleSave}>
          <i className="far fa-bookmark"></i>
        </button>
      </div>
      
      <p className="text-gray-600 text-sm mt-3">{gig.description}</p>
      
      <div className="flex flex-wrap gap-2 mt-3">
        {gig.skills.map((skill) => (
          <Badge 
            key={skill.id} 
            variant="secondary" 
            className="bg-blue-50 text-blue-900 text-xs px-2 py-1"
          >
            {skill.name}
          </Badge>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div>
          <span className="font-semibold text-blue-900">
            ${gig.minPrice}{gig.maxPrice && `-${gig.maxPrice}`}
          </span>
          <span className="text-gray-500 text-sm">
            {gig.isPriceHourly ? "/hour" : ""} • {gig.estimatedHours || "Fixed Price"}
          </span>
        </div>
        <Button 
          onClick={() => setIsApplyDialogOpen(true)}
          className="bg-blue-500 hover:bg-blue-700"
        >
          Apply Now
        </Button>
      </div>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply to: {gig.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cover Letter</label>
              <textarea 
                className="w-full rounded-md border border-gray-300 p-3 h-32 text-sm"
                placeholder="Tell the recruiter why you're a good fit for this gig..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsApplyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApply}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
