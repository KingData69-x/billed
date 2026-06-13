export interface Profession {
  slug: string;
  label: string;       // plural display: "Freelance Designers"
  singular: string;    // singular: "designer"
  verb: string;        // "Design work", "Photography sessions", etc.
  emoji: string;
}

export const PROFESSIONS: Profession[] = [
  { slug: "freelance-designer", label: "Freelance Designers", singular: "designer", verb: "design projects", emoji: "🎨" },
  { slug: "photographer", label: "Photographers", singular: "photographer", verb: "photography sessions", emoji: "📷" },
  { slug: "web-developer", label: "Web Developers", singular: "web developer", verb: "development projects", emoji: "💻" },
  { slug: "consultant", label: "Consultants", singular: "consultant", verb: "consulting engagements", emoji: "📊" },
  { slug: "contractor", label: "Contractors", singular: "contractor", verb: "contracting work", emoji: "🔨" },
  { slug: "copywriter", label: "Copywriters", singular: "copywriter", verb: "writing projects", emoji: "✍️" },
  { slug: "videographer", label: "Videographers", singular: "videographer", verb: "video productions", emoji: "🎬" },
  { slug: "social-media-manager", label: "Social Media Managers", singular: "social media manager", verb: "social media services", emoji: "📱" },
  { slug: "virtual-assistant", label: "Virtual Assistants", singular: "virtual assistant", verb: "VA services", emoji: "🖥️" },
  { slug: "accountant", label: "Accountants", singular: "accountant", verb: "accounting services", emoji: "📑" },
  { slug: "lawyer", label: "Lawyers & Attorneys", singular: "lawyer", verb: "legal services", emoji: "⚖️" },
  { slug: "coach", label: "Coaches & Consultants", singular: "coach", verb: "coaching sessions", emoji: "🏆" },
  { slug: "therapist", label: "Therapists & Counselors", singular: "therapist", verb: "therapy sessions", emoji: "🧠" },
  { slug: "tutor", label: "Tutors & Educators", singular: "tutor", verb: "tutoring sessions", emoji: "📚" },
  { slug: "translator", label: "Translators", singular: "translator", verb: "translation projects", emoji: "🌐" },
  { slug: "musician", label: "Musicians & Audio Engineers", singular: "musician", verb: "music projects", emoji: "🎵" },
  { slug: "architect", label: "Architects", singular: "architect", verb: "architecture projects", emoji: "🏛️" },
  { slug: "interior-designer", label: "Interior Designers", singular: "interior designer", verb: "design projects", emoji: "🏠" },
  { slug: "marketing-consultant", label: "Marketing Consultants", singular: "marketing consultant", verb: "marketing campaigns", emoji: "📣" },
  { slug: "event-planner", label: "Event Planners", singular: "event planner", verb: "event planning services", emoji: "🎉" },
  { slug: "personal-trainer", label: "Personal Trainers", singular: "personal trainer", verb: "training sessions", emoji: "💪" },
  { slug: "illustrator", label: "Illustrators & Artists", singular: "illustrator", verb: "illustration projects", emoji: "🖼️" },
  { slug: "voice-over-artist", label: "Voice Over Artists", singular: "voice over artist", verb: "voice over work", emoji: "🎙️" },
  { slug: "electrician", label: "Electricians", singular: "electrician", verb: "electrical work", emoji: "⚡" },
  { slug: "plumber", label: "Plumbers", singular: "plumber", verb: "plumbing services", emoji: "🔧" },
  { slug: "real-estate-agent", label: "Real Estate Agents", singular: "real estate agent", verb: "real estate services", emoji: "🏡" },
  { slug: "ux-designer", label: "UX Designers", singular: "UX designer", verb: "UX/UI projects", emoji: "🖱️" },
  { slug: "motion-designer", label: "Motion Designers", singular: "motion designer", verb: "motion design projects", emoji: "🎞️" },
  { slug: "brand-designer", label: "Brand Designers", singular: "brand designer", verb: "branding projects", emoji: "✨" },
  { slug: "app-developer", label: "App Developers", singular: "app developer", verb: "app development projects", emoji: "📲" },
  { slug: "seo-specialist", label: "SEO Specialists", singular: "SEO specialist", verb: "SEO campaigns", emoji: "🔍" },
  { slug: "content-creator", label: "Content Creators", singular: "content creator", verb: "content creation", emoji: "🎥" },
  { slug: "bookkeeper", label: "Bookkeepers", singular: "bookkeeper", verb: "bookkeeping services", emoji: "📒" },
  { slug: "handyman", label: "Handymen & Tradespeople", singular: "handyman", verb: "repair services", emoji: "🛠️" },
  { slug: "landscaper", label: "Landscapers", singular: "landscaper", verb: "landscaping services", emoji: "🌿" },
  { slug: "cleaning-service", label: "Cleaning Services", singular: "cleaning professional", verb: "cleaning services", emoji: "🧹" },
  { slug: "dog-trainer", label: "Dog Trainers & Pet Services", singular: "dog trainer", verb: "pet services", emoji: "🐾" },
  { slug: "makeup-artist", label: "Makeup Artists", singular: "makeup artist", verb: "beauty services", emoji: "💄" },
  { slug: "nutritionist", label: "Nutritionists & Dietitians", singular: "nutritionist", verb: "nutrition consulting", emoji: "🥗" },
  { slug: "yoga-instructor", label: "Yoga & Fitness Instructors", singular: "yoga instructor", verb: "fitness classes", emoji: "🧘" },
];
