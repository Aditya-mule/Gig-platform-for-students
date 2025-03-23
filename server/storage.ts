import {
  users, User, InsertUser, UserRole,
  skills, Skill, InsertSkill,
  userSkills, UserSkill, InsertUserSkill,
  gigs, Gig, InsertGig,
  gigSkills, GigSkill, InsertGigSkill,
  applications, Application, InsertApplication,
  savedItems, SavedItem, InsertSavedItem,
  UserWithSkills, GigWithSkills
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Skills
  getAllSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillByName(name: string): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;

  // User Skills
  getUserSkills(userId: number): Promise<UserSkill[]>;
  getUserWithSkills(userId: number): Promise<UserWithSkills | undefined>;
  addUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;
  removeUserSkill(userId: number, skillId: number): Promise<boolean>;

  // Gigs
  createGig(gig: InsertGig): Promise<Gig>;
  getGig(id: number): Promise<Gig | undefined>;
  getGigWithSkills(id: number): Promise<GigWithSkills | undefined>;
  getAllGigs(): Promise<Gig[]>;
  getGigsByRecruiterId(recruiterId: number): Promise<Gig[]>;
  getAllGigsWithSkills(): Promise<GigWithSkills[]>;

  // Gig Skills
  addGigSkill(gigSkill: InsertGigSkill): Promise<GigSkill>;
  removeGigSkill(gigId: number, skillId: number): Promise<boolean>;
  getGigSkills(gigId: number): Promise<GigSkill[]>;

  // Applications
  createApplication(application: InsertApplication): Promise<Application>;
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByGigId(gigId: number): Promise<Application[]>;
  getApplicationsByStudentId(studentId: number): Promise<Application[]>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;

  // Saved Items
  saveFavorite(savedItem: InsertSavedItem): Promise<SavedItem>;
  removeFavorite(id: number): Promise<boolean>;
  getSavedItemsByUserId(userId: number): Promise<SavedItem[]>;

  // Filtered Searches
  getGigsBySkills(skillIds: number[]): Promise<GigWithSkills[]>;
  getUsersBySkills(skillIds: number[], role: UserRoleType): Promise<UserWithSkills[]>;
  getUsersByRole(role: UserRoleType): Promise<User[]>;
  getUsersWithSkillsByRole(role: UserRoleType): Promise<UserWithSkills[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, Skill>;
  private userSkills: Map<number, UserSkill>;
  private gigs: Map<number, Gig>;
  private gigSkills: Map<number, GigSkill>;
  private applications: Map<number, Application>;
  private savedItems: Map<number, SavedItem>;
  
  private userIdCounter: number;
  private skillIdCounter: number;
  private userSkillIdCounter: number;
  private gigIdCounter: number;
  private gigSkillIdCounter: number;
  private applicationIdCounter: number;
  private savedItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.userSkills = new Map();
    this.gigs = new Map();
    this.gigSkills = new Map();
    this.applications = new Map();
    this.savedItems = new Map();
    
    this.userIdCounter = 1;
    this.skillIdCounter = 1;
    this.userSkillIdCounter = 1;
    this.gigIdCounter = 1;
    this.gigSkillIdCounter = 1;
    this.applicationIdCounter = 1;
    this.savedItemIdCounter = 1;
    
    // Initialize with some skills
    this.initializeSkills();
  }

  private initializeSkills() {
    const defaultSkills = [
      "Web Development", "UI/UX Design", "Graphic Design", "JavaScript", "React", 
      "Node.js", "Python", "Content Writing", "Social Media", "SEO", "Marketing",
      "Copywriting", "Data Analysis", "Figma", "Adobe XD", "MongoDB", "Flutter",
      "Mobile Development", "CSS", "HTML", "Tailwind CSS", "TypeScript"
    ];
    
    defaultSkills.forEach(skillName => {
      this.createSkill({ name: skillName });
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Skills
  async getAllSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async getSkillByName(name: string): Promise<Skill | undefined> {
    return Array.from(this.skills.values()).find(
      (skill) => skill.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.skillIdCounter++;
    const newSkill: Skill = { ...skill, id };
    this.skills.set(id, newSkill);
    return newSkill;
  }

  // User Skills
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return Array.from(this.userSkills.values()).filter(
      (userSkill) => userSkill.userId === userId
    );
  }

  async getUserWithSkills(userId: number): Promise<UserWithSkills | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const userSkillEntries = await this.getUserSkills(userId);
    const userSkillIds = userSkillEntries.map(entry => entry.skillId);
    const userSkills = await Promise.all(
      userSkillIds.map(id => this.getSkill(id))
    );
    
    return {
      ...user,
      skills: userSkills.filter((skill): skill is Skill => skill !== undefined),
    };
  }

  async addUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
    const id = this.userSkillIdCounter++;
    const newUserSkill: UserSkill = { ...userSkill, id };
    this.userSkills.set(id, newUserSkill);
    return newUserSkill;
  }

  async removeUserSkill(userId: number, skillId: number): Promise<boolean> {
    const userSkillEntry = Array.from(this.userSkills.entries()).find(
      ([_, userSkill]) => userSkill.userId === userId && userSkill.skillId === skillId
    );
    
    if (!userSkillEntry) return false;
    
    this.userSkills.delete(userSkillEntry[0]);
    return true;
  }

  // Gigs
  async createGig(gig: InsertGig): Promise<Gig> {
    const id = this.gigIdCounter++;
    const createdAt = new Date();
    const newGig: Gig = { ...gig, id, createdAt };
    this.gigs.set(id, newGig);
    return newGig;
  }

  async getGig(id: number): Promise<Gig | undefined> {
    return this.gigs.get(id);
  }

  async getAllGigs(): Promise<Gig[]> {
    return Array.from(this.gigs.values());
  }

  async getGigsByRecruiterId(recruiterId: number): Promise<Gig[]> {
    return Array.from(this.gigs.values()).filter(
      (gig) => gig.recruiterId === recruiterId
    );
  }

  async getGigWithSkills(id: number): Promise<GigWithSkills | undefined> {
    const gig = await this.getGig(id);
    if (!gig) return undefined;
    
    const gigSkillEntries = await this.getGigSkills(id);
    const gigSkillIds = gigSkillEntries.map(entry => entry.skillId);
    const gigSkills = await Promise.all(
      gigSkillIds.map(id => this.getSkill(id))
    );
    
    return {
      ...gig,
      skills: gigSkills.filter((skill): skill is Skill => skill !== undefined),
    };
  }

  async getAllGigsWithSkills(): Promise<GigWithSkills[]> {
    const gigs = await this.getAllGigs();
    return Promise.all(
      gigs.map(gig => this.getGigWithSkills(gig.id))
    ).then(results => results.filter((gig): gig is GigWithSkills => gig !== undefined));
  }

  // Gig Skills
  async addGigSkill(gigSkill: InsertGigSkill): Promise<GigSkill> {
    const id = this.gigSkillIdCounter++;
    const newGigSkill: GigSkill = { ...gigSkill, id };
    this.gigSkills.set(id, newGigSkill);
    return newGigSkill;
  }

  async removeGigSkill(gigId: number, skillId: number): Promise<boolean> {
    const gigSkillEntry = Array.from(this.gigSkills.entries()).find(
      ([_, gigSkill]) => gigSkill.gigId === gigId && gigSkill.skillId === skillId
    );
    
    if (!gigSkillEntry) return false;
    
    this.gigSkills.delete(gigSkillEntry[0]);
    return true;
  }

  async getGigSkills(gigId: number): Promise<GigSkill[]> {
    return Array.from(this.gigSkills.values()).filter(
      (gigSkill) => gigSkill.gigId === gigId
    );
  }

  // Applications
  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const createdAt = new Date();
    const newApplication: Application = { ...application, id, createdAt };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByGigId(gigId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.gigId === gigId
    );
  }

  async getApplicationsByStudentId(studentId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.studentId === studentId
    );
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const application = await this.getApplication(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, status };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Saved Items
  async saveFavorite(savedItem: InsertSavedItem): Promise<SavedItem> {
    const id = this.savedItemIdCounter++;
    const createdAt = new Date();
    const newSavedItem: SavedItem = { ...savedItem, id, createdAt };
    this.savedItems.set(id, newSavedItem);
    return newSavedItem;
  }

  async removeFavorite(id: number): Promise<boolean> {
    if (!this.savedItems.has(id)) return false;
    
    this.savedItems.delete(id);
    return true;
  }

  async getSavedItemsByUserId(userId: number): Promise<SavedItem[]> {
    return Array.from(this.savedItems.values()).filter(
      (savedItem) => savedItem.userId === userId
    );
  }

  // Filtered Searches
  async getGigsBySkills(skillIds: number[]): Promise<GigWithSkills[]> {
    if (skillIds.length === 0) {
      return this.getAllGigsWithSkills();
    }
    
    const gigIdsWithSkill = new Set<number>();
    
    for (const skillId of skillIds) {
      const gigSkillsWithSkill = Array.from(this.gigSkills.values()).filter(
        gigSkill => gigSkill.skillId === skillId
      );
      
      gigSkillsWithSkill.forEach(gigSkill => gigIdsWithSkill.add(gigSkill.gigId));
    }
    
    const gigsWithSkills = await Promise.all(
      Array.from(gigIdsWithSkill).map(gigId => this.getGigWithSkills(gigId))
    );
    
    return gigsWithSkills.filter((gig): gig is GigWithSkills => gig !== undefined);
  }

  async getUsersBySkills(skillIds: number[], role: UserRoleType): Promise<UserWithSkills[]> {
    if (skillIds.length === 0) {
      return this.getUsersWithSkillsByRole(role);
    }
    
    const userIdsWithSkill = new Set<number>();
    
    for (const skillId of skillIds) {
      const userSkillsWithSkill = Array.from(this.userSkills.values()).filter(
        userSkill => userSkill.skillId === skillId
      );
      
      userSkillsWithSkill.forEach(userSkill => userIdsWithSkill.add(userSkill.userId));
    }
    
    const usersWithSkills = await Promise.all(
      Array.from(userIdsWithSkill).map(userId => this.getUserWithSkills(userId))
    );
    
    return usersWithSkills
      .filter((user): user is UserWithSkills => user !== undefined && user.role === role);
  }

  async getUsersByRole(role: UserRoleType): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async getUsersWithSkillsByRole(role: UserRoleType): Promise<UserWithSkills[]> {
    const users = await this.getUsersByRole(role);
    
    const usersWithSkills = await Promise.all(
      users.map(user => this.getUserWithSkills(user.id))
    );
    
    return usersWithSkills.filter((user): user is UserWithSkills => user !== undefined);
  }
}

export const storage = new MemStorage();
