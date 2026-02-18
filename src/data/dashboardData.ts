export type LeadType = "cold" | "warm";
export type LeadStatus = "closed" | "lost";
export type LeadSource = "linkedin" | "google" | "referral" | "website" | "cold-call";

export interface Lead {
  id: string;
  name: string;
  avatar: string;
  type: LeadType;
  email: string;
  followUp: string;
  status: LeadStatus;
  website: string;
  score: number;
  source: LeadSource;
}

export interface TopPerformer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  icon: "star" | "user";
}

export const dashboardStats = {
  generatedRevenue: {
    value: "$67,024",
    change: 12,
  },
  signedClients: {
    value: "227",
    change: 23,
  },
  totalLeads: {
    value: "3,867",
    change: 17,
  },
  teamMembers: {
    value: "38",
    activeCount: 6,
  },
};

export const leadsChartDataWeek = [
  { date: "Mon", line1: 180, line2: 220, line3: 280, line4: 350 },
  { date: "Tue", line1: 420, line2: 550, line3: 380, line4: 280 },
  { date: "Wed", line1: 280, line2: 380, line3: 520, line4: 450 },
  { date: "Thu", line1: 550, line2: 280, line3: 420, line4: 620 },
  { date: "Fri", line1: 323, line2: 729, line3: 506, line4: 490 },
  { date: "Sat", line1: 480, line2: 420, line3: 280, line4: 380 },
  { date: "Sun", line1: 220, line2: 550, line3: 450, line4: 320 },
];

export const leadsChartDataMonth = [
  { date: "Jan 1", line1: 180, line2: 220, line3: 280, line4: 350 },
  { date: "Jan 5", line1: 420, line2: 550, line3: 380, line4: 280 },
  { date: "Jan 9", line1: 280, line2: 380, line3: 520, line4: 450 },
  { date: "Jan 13", line1: 550, line2: 280, line3: 420, line4: 620 },
  { date: "Jan 15", line1: 323, line2: 729, line3: 506, line4: 490 },
  { date: "Jan 17", line1: 480, line2: 420, line3: 280, line4: 380 },
  { date: "Jan 21", line1: 220, line2: 550, line3: 450, line4: 320 },
  { date: "Jan 25", line1: 380, line2: 320, line3: 580, line4: 480 },
  { date: "Jan 30", line1: 520, line2: 450, line3: 350, line4: 420 },
];

export const leadsChartDataQuarter = [
  { date: "Jan", line1: 320, line2: 450, line3: 380, line4: 420 },
  { date: "Feb", line1: 480, line2: 380, line3: 520, line4: 350 },
  { date: "Mar", line1: 550, line2: 620, line3: 450, line4: 580 },
  { date: "Apr", line1: 420, line2: 510, line3: 380, line4: 490 },
  { date: "May", line1: 380, line2: 450, line3: 620, line4: 420 },
  { date: "Jun", line1: 620, line2: 380, line3: 510, line4: 550 },
  { date: "Jul", line1: 520, line2: 580, line3: 450, line4: 480 },
  { date: "Aug", line1: 450, line2: 490, line3: 380, line4: 620 },
  { date: "Sep", line1: 580, line2: 420, line3: 550, line4: 380 },
];

export const topPerformers: TopPerformer[] = [
  {
    id: "1",
    name: "Sarah M.",
    avatar: "https://api.dicebear.com/9.x/icons/svg?seed=sarah",
    score: 120,
    icon: "star",
  },
  {
    id: "2",
    name: "James K.",
    avatar: "https://api.dicebear.com/9.x/icons/svg?seed=james",
    score: 60,
    icon: "user",
  },
  {
    id: "3",
    name: "Emily R.",
    avatar: "https://api.dicebear.com/9.x/icons/svg?seed=emily",
    score: 21,
    icon: "user",
  },
  {
    id: "4",
    name: "Michael L.",
    avatar: "https://api.dicebear.com/9.x/icons/svg?seed=michael",
    score: 3,
    icon: "user",
  },
  {
    id: "5",
    name: "Alex T.",
    avatar: "https://api.dicebear.com/9.x/icons/svg?seed=alex",
    score: 45,
    icon: "user",
  },
];

export const leads: Lead[] = [
  {
    id: "1",
    name: "Sarah",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=sarah",
    type: "cold",
    email: "sarah@brightwave.co",
    followUp: "In 1 day",
    status: "closed",
    website: "brightwave.co",
    score: 87,
    source: "linkedin",
  },
  {
    id: "2",
    name: "James",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=james",
    type: "warm",
    email: "james@gmail.com",
    followUp: "In 1 day",
    status: "lost",
    website: "-",
    score: 42,
    source: "google",
  },
  {
    id: "3",
    name: "Daniela",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=daniela",
    type: "cold",
    email: "daniela@avella.io",
    followUp: "In 2 days",
    status: "lost",
    website: "avella.io",
    score: 65,
    source: "referral",
  },
  {
    id: "4",
    name: "Lucas",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=lucas",
    type: "cold",
    email: "lucas@yahoo.com",
    followUp: "In 3 days",
    status: "lost",
    website: "-",
    score: 28,
    source: "cold-call",
  },
  {
    id: "5",
    name: "Emily",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=emily",
    type: "warm",
    email: "emily@zencloud.com",
    followUp: "In 1 week",
    status: "closed",
    website: "zencloud.com",
    score: 94,
    source: "website",
  },
  {
    id: "6",
    name: "Priya",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=priya",
    type: "warm",
    email: "priya@auroratech.io",
    followUp: "In 1 week",
    status: "lost",
    website: "auroratech.io",
    score: 73,
    source: "linkedin",
  },
  {
    id: "7",
    name: "Michael",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=michael",
    type: "cold",
    email: "michael@outlook.com",
    followUp: "In 2 weeks",
    status: "closed",
    website: "brightwave.co",
    score: 56,
    source: "referral",
  },
  {
    id: "8",
    name: "Olivia",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=olivia",
    type: "warm",
    email: "olivia@nextera.io",
    followUp: "In 3 days",
    status: "closed",
    website: "nextera.io",
    score: 91,
    source: "linkedin",
  },
  {
    id: "9",
    name: "Noah",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=noah",
    type: "cold",
    email: "noah@techflow.com",
    followUp: "In 1 day",
    status: "lost",
    website: "techflow.com",
    score: 35,
    source: "google",
  },
  {
    id: "10",
    name: "Sophia",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=sophia",
    type: "warm",
    email: "sophia@cloudbase.io",
    followUp: "In 2 days",
    status: "closed",
    website: "cloudbase.io",
    score: 82,
    source: "website",
  },
];
