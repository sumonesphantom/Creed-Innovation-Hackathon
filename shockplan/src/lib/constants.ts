export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
] as const;

export const INSURANCE_TYPES = [
  { id: "auto", label: "Auto Insurance", icon: "Car" },
  { id: "renters", label: "Renters Insurance", icon: "Home" },
  { id: "homeowners", label: "Homeowners Insurance", icon: "Building" },
  { id: "health", label: "Health Insurance", icon: "Heart" },
  { id: "life", label: "Life Insurance", icon: "Shield" },
] as const;

export const HOUSEHOLD_TYPES = [
  { id: "single", label: "Just me", icon: "User" },
  { id: "couple", label: "Me + partner", icon: "Users" },
  { id: "family", label: "Family with kids", icon: "Baby" },
  { id: "multi-gen", label: "Multi-generational", icon: "Home" },
] as const;

export const HOUSING_TYPES = [
  { id: "rent", label: "I rent", icon: "Building" },
  { id: "own", label: "I own", icon: "Home" },
  { id: "family", label: "Living with family", icon: "Users" },
  { id: "other", label: "Other", icon: "HelpCircle" },
] as const;

export const INCOME_TYPES = [
  { id: "salary", label: "Salaried job", icon: "Briefcase" },
  { id: "gig", label: "Gig / Freelance", icon: "Laptop" },
  { id: "hourly", label: "Hourly work", icon: "Clock" },
  { id: "unemployed", label: "Not working right now", icon: "Pause" },
  { id: "retired", label: "Retired", icon: "Armchair" },
] as const;

export const CRISIS_EVENTS = [
  { id: "car-accident", name: "Car Accident", icon: "Car", description: "Vehicle damage or collision" },
  { id: "job-loss", name: "Job Loss", icon: "Briefcase", description: "Lost income or hours cut" },
  { id: "medical-bill", name: "Medical Bill", icon: "Heart", description: "Unexpected medical expense" },
  { id: "storm-damage", name: "Storm Damage", icon: "CloudLightning", description: "Weather or natural disaster" },
  { id: "death-family", name: "Death in Family", icon: "HeartHandshake", description: "Loss of a loved one" },
  { id: "rent-spike", name: "Rent Spike", icon: "TrendingUp", description: "Housing cost increase" },
  { id: "home-repair", name: "Major Repair", icon: "Wrench", description: "Home or appliance breakdown" },
] as const;
