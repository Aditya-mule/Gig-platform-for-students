import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export const UserRole = {
  STUDENT: "student",
  RECRUITER: "recruiter",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<UserRoleType>(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  photo: text("photo"),
  about: text("about"),
  university: text("university"),
  major: text("major"),
  graduationYear: text("graduation_year"),
  company: text("company"),
  location: text("location"),
});

// Skills table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// User skills table (many-to-many relationship)
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
});

// Gigs table
export const gigs = pgTable("gigs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
  isPriceHourly: boolean("is_price_hourly").default(false),
  estimatedHours: text("estimated_hours"),
  recruiterId: integer("recruiter_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Gig skills table (many-to-many relationship)
export const gigSkills = pgTable("gig_skills", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id").notNull().references(() => gigs.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id").notNull().references(() => gigs.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"),
  coverLetter: text("cover_letter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Saved items table
export const savedItems = pgTable("saved_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gigId: integer("gig_id").references(() => gigs.id),
  savedUserId: integer("saved_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertUserSkillSchema = createInsertSchema(userSkills).omit({ id: true });
export const insertGigSchema = createInsertSchema(gigs).omit({ id: true, createdAt: true });
export const insertGigSkillSchema = createInsertSchema(gigSkills).omit({ id: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true });
export const insertSavedItemSchema = createInsertSchema(savedItems).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;

export type Gig = typeof gigs.$inferSelect;
export type InsertGig = z.infer<typeof insertGigSchema>;

export type GigSkill = typeof gigSkills.$inferSelect;
export type InsertGigSkill = z.infer<typeof insertGigSkillSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type SavedItem = typeof savedItems.$inferSelect;
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;

// User with skills type
export type UserWithSkills = User & { skills: Skill[] };

// Gig with skills type
export type GigWithSkills = Gig & { skills: Skill[] };
