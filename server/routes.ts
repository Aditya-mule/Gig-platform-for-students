import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertUserSchema,
  insertSkillSchema,
  insertUserSkillSchema,
  insertGigSchema,
  insertGigSkillSchema,
  insertApplicationSchema,
  insertSavedItemSchema,
  UserRole
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Error handler middleware for routes
  const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => 
    (req: Request, res: Response) => {
      Promise.resolve(fn(req, res)).catch(err => {
        console.error(err);
        
        if (err instanceof ZodError) {
          return res.status(400).json({ 
            message: "Validation error", 
            errors: fromZodError(err).message 
          });
        }
        
        res.status(500).json({ message: err.message || "Internal server error" });
      });
    };

  // USERS API
  apiRouter.post("/users", asyncHandler(async (req, res) => {
    const data = insertUserSchema.parse(req.body);
    const user = await storage.createUser(data);
    res.status(201).json(user);
  }));

  apiRouter.get("/users/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  }));

  apiRouter.get("/users/:id/skills", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const userWithSkills = await storage.getUserWithSkills(id);
    
    if (!userWithSkills) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(userWithSkills);
  }));

  apiRouter.patch("/users/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = insertUserSchema.partial().parse(req.body);
    const updatedUser = await storage.updateUser(id, data);
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updatedUser);
  }));

  // SKILLS API
  apiRouter.get("/skills", asyncHandler(async (req, res) => {
    const skills = await storage.getAllSkills();
    res.json(skills);
  }));

  apiRouter.post("/skills", asyncHandler(async (req, res) => {
    const data = insertSkillSchema.parse(req.body);
    
    // Check if skill already exists
    const existingSkill = await storage.getSkillByName(data.name);
    if (existingSkill) {
      return res.status(409).json({ message: "Skill already exists" });
    }
    
    const skill = await storage.createSkill(data);
    res.status(201).json(skill);
  }));

  // USER SKILLS API
  apiRouter.post("/users/:userId/skills", asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    const { skillId } = z.object({ skillId: z.number() }).parse(req.body);
    
    // Verify user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify skill exists
    const skill = await storage.getSkill(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    
    // Check if the skill is already added
    const userSkills = await storage.getUserSkills(userId);
    const hasSkill = userSkills.some(us => us.skillId === skillId);
    
    if (hasSkill) {
      return res.status(409).json({ message: "User already has this skill" });
    }
    
    const userSkill = await storage.addUserSkill({ userId, skillId });
    res.status(201).json(userSkill);
  }));

  apiRouter.delete("/users/:userId/skills/:skillId", asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    const skillId = Number(req.params.skillId);
    
    const result = await storage.removeUserSkill(userId, skillId);
    
    if (!result) {
      return res.status(404).json({ message: "User skill not found" });
    }
    
    res.status(204).send();
  }));

  // GIGS API
  apiRouter.post("/gigs", asyncHandler(async (req, res) => {
    const data = insertGigSchema.parse(req.body);
    
    // Verify recruiter exists
    const recruiter = await storage.getUser(data.recruiterId);
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }
    
    if (recruiter.role !== UserRole.RECRUITER) {
      return res.status(403).json({ message: "Only recruiters can post gigs" });
    }
    
    const gig = await storage.createGig(data);
    res.status(201).json(gig);
  }));

  apiRouter.get("/gigs", asyncHandler(async (req, res) => {
    const { skills: skillsParam } = req.query;
    
    // If skills filter is provided
    if (skillsParam) {
      const skillIds = Array.isArray(skillsParam) 
        ? skillsParam.map(Number) 
        : [Number(skillsParam)];
      
      const gigs = await storage.getGigsBySkills(skillIds);
      return res.json(gigs);
    }
    
    // Otherwise return all gigs
    const gigs = await storage.getAllGigsWithSkills();
    res.json(gigs);
  }));

  apiRouter.get("/gigs/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const gig = await storage.getGigWithSkills(id);
    
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }
    
    res.json(gig);
  }));

  apiRouter.get("/recruiters/:recruiterId/gigs", asyncHandler(async (req, res) => {
    const recruiterId = Number(req.params.recruiterId);
    const gigs = await storage.getGigsByRecruiterId(recruiterId);
    res.json(gigs);
  }));

  // GIG SKILLS API
  apiRouter.post("/gigs/:gigId/skills", asyncHandler(async (req, res) => {
    const gigId = Number(req.params.gigId);
    const { skillId } = z.object({ skillId: z.number() }).parse(req.body);
    
    // Verify gig exists
    const gig = await storage.getGig(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }
    
    // Verify skill exists
    const skill = await storage.getSkill(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    
    // Check if the skill is already added
    const gigSkills = await storage.getGigSkills(gigId);
    const hasSkill = gigSkills.some(gs => gs.skillId === skillId);
    
    if (hasSkill) {
      return res.status(409).json({ message: "Gig already has this skill" });
    }
    
    const gigSkill = await storage.addGigSkill({ gigId, skillId });
    res.status(201).json(gigSkill);
  }));

  apiRouter.delete("/gigs/:gigId/skills/:skillId", asyncHandler(async (req, res) => {
    const gigId = Number(req.params.gigId);
    const skillId = Number(req.params.skillId);
    
    const result = await storage.removeGigSkill(gigId, skillId);
    
    if (!result) {
      return res.status(404).json({ message: "Gig skill not found" });
    }
    
    res.status(204).send();
  }));

  // APPLICATIONS API
  apiRouter.post("/applications", asyncHandler(async (req, res) => {
    const data = insertApplicationSchema.parse(req.body);
    
    // Verify gig exists
    const gig = await storage.getGig(data.gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }
    
    // Verify student exists
    const student = await storage.getUser(data.studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    if (student.role !== UserRole.STUDENT) {
      return res.status(403).json({ message: "Only students can apply to gigs" });
    }
    
    // Check if student already applied
    const studentApplications = await storage.getApplicationsByStudentId(data.studentId);
    const alreadyApplied = studentApplications.some(app => app.gigId === data.gigId);
    
    if (alreadyApplied) {
      return res.status(409).json({ message: "Student already applied to this gig" });
    }
    
    const application = await storage.createApplication(data);
    res.status(201).json(application);
  }));

  apiRouter.get("/applications/gig/:gigId", asyncHandler(async (req, res) => {
    const gigId = Number(req.params.gigId);
    const applications = await storage.getApplicationsByGigId(gigId);
    res.json(applications);
  }));

  apiRouter.get("/applications/student/:studentId", asyncHandler(async (req, res) => {
    const studentId = Number(req.params.studentId);
    const applications = await storage.getApplicationsByStudentId(studentId);
    res.json(applications);
  }));

  apiRouter.patch("/applications/:id/status", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { status } = z.object({ status: z.string() }).parse(req.body);
    
    const updatedApplication = await storage.updateApplicationStatus(id, status);
    
    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.json(updatedApplication);
  }));

  // SAVED ITEMS API
  apiRouter.post("/saved-items", asyncHandler(async (req, res) => {
    const data = insertSavedItemSchema.parse(req.body);
    
    // Verify user exists
    const user = await storage.getUser(data.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify gig exists if gigId is provided
    if (data.gigId) {
      const gig = await storage.getGig(data.gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
    }
    
    // Verify saved user exists if savedUserId is provided
    if (data.savedUserId) {
      const savedUser = await storage.getUser(data.savedUserId);
      if (!savedUser) {
        return res.status(404).json({ message: "Saved user not found" });
      }
    }
    
    const savedItem = await storage.saveFavorite(data);
    res.status(201).json(savedItem);
  }));

  apiRouter.get("/saved-items/:userId", asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    const savedItems = await storage.getSavedItemsByUserId(userId);
    res.json(savedItems);
  }));

  apiRouter.delete("/saved-items/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const result = await storage.removeFavorite(id);
    
    if (!result) {
      return res.status(404).json({ message: "Saved item not found" });
    }
    
    res.status(204).send();
  }));

  // USER SEARCH API
  apiRouter.get("/search/users", asyncHandler(async (req, res) => {
    const { role, skills: skillsParam } = req.query;
    
    if (!role || (role !== UserRole.STUDENT && role !== UserRole.RECRUITER)) {
      return res.status(400).json({ message: "Valid role parameter is required" });
    }
    
    const roleType = role as "student" | "recruiter";
    
    // If skills filter is provided
    if (skillsParam) {
      const skillIds = Array.isArray(skillsParam) 
        ? skillsParam.map(Number) 
        : [Number(skillsParam)];
      
      const users = await storage.getUsersBySkills(skillIds, roleType);
      return res.json(users);
    }
    
    // Otherwise return all users of that role
    const users = await storage.getUsersWithSkillsByRole(roleType);
    res.json(users);
  }));

  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);

  return httpServer;
}
