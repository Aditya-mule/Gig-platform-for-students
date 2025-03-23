import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { insertGigSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

// Extend the insert schema with validation
const formSchema = insertGigSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  minPrice: z.number().min(1, "Minimum price is required"),
  maxPrice: z.number().optional(),
  isPriceHourly: z.boolean().default(false),
  estimatedHours: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateGigFormProps {
  onSuccess?: () => void;
}

export function CreateGigForm({ onSuccess }: CreateGigFormProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [selectedSkills, setSelectedSkills] = useState<{ id: number; name: string }[]>([]);
  
  const { data: skills = [] } = useQuery({
    queryKey: ["/api/skills"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      minPrice: 0,
      maxPrice: undefined,
      isPriceHourly: false,
      estimatedHours: "",
      recruiterId: user?.id || 0,
      companyName: user?.company || "Campus Startup",
    },
  });

  const toggleSkill = (skill: { id: number; name: string }) => {
    if (selectedSkills.some(s => s.id === skill.id)) {
      setSelectedSkills(selectedSkills.filter(s => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    try {
      // Create the gig
      const createdGig = await apiRequest("POST", "/api/gigs", {
        ...data,
        recruiterId: user.id,
        companyName: user.company || user.name,
      });
      
      // Add skills to the gig
      if (selectedSkills.length > 0) {
        await Promise.all(
          selectedSkills.map(skill => 
            apiRequest("POST", `/api/gigs/${createdGig.id}/skills`, { skillId: skill.id })
          )
        );
      }
      
      toast({
        title: "Gig created!",
        description: "Your gig has been successfully posted.",
      });
      
      form.reset();
      setSelectedSkills([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error creating gig",
        description: error instanceof Error ? error.message : "An error occurred while creating your gig",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gig Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Frontend Developer for Campus Event App" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the requirements, responsibilities, and qualifications for this gig"
                  className="h-32" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Price {form.watch("isPriceHourly") ? "(per hour)" : ""}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 15" 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Price (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 25" 
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isPriceHourly"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Hourly Rate</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="estimatedHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Hours</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 15-20 hours" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel>Skills Required</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill: { id: number; name: string }) => (
              <Badge
                key={skill.id}
                variant={selectedSkills.some(s => s.id === skill.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSkill(skill)}
              >
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Posting..." : "Post Gig"}
        </Button>
      </form>
    </Form>
  );
}
