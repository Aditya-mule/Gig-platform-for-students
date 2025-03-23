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
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema, UserRole } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/context/UserContext";

// Define the form schema based on the user role
const studentFormSchema = insertUserSchema.pick({
  name: true,
  email: true,
  about: true,
  university: true,
  major: true,
  graduationYear: true,
}).partial();

const recruiterFormSchema = insertUserSchema.pick({
  name: true,
  email: true,
  about: true,
  company: true,
  location: true,
}).partial();

interface EditProfileFormProps {
  onSuccess?: () => void;
}

export function EditProfileForm({ onSuccess }: EditProfileFormProps) {
  const { toast } = useToast();
  const { user, setUser } = useUser();

  if (!user) return null;

  // Determine schema based on user role
  const formSchema = user.role === UserRole.STUDENT
    ? studentFormSchema
    : recruiterFormSchema;

  type FormValues = z.infer<typeof formSchema>;

  // Set default values from the user object
  const defaultValues = user.role === UserRole.STUDENT
    ? {
        name: user.name,
        email: user.email,
        about: user.about,
        university: user.university,
        major: user.major,
        graduationYear: user.graduationYear,
      }
    : {
        name: user.name,
        email: user.email,
        about: user.about,
        company: user.company,
        location: user.location,
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const updatedUser = await apiRequest("PATCH", `/api/users/${user.id}`, data);
      
      // Update the user context
      setUser({ ...user, ...updatedUser });
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error instanceof Error ? error.message : "An error occurred while updating your profile",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={
                    user.role === UserRole.STUDENT 
                      ? "Tell recruiters about yourself" 
                      : "Tell students about your company"
                  }
                  className="h-24" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {user.role === UserRole.STUDENT ? (
          <>
            <FormField
              control={form.control}
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="major"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Major</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Year</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Boston University" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
