import { BadgeCheck, BookOpen, BriefcaseBusiness, Clock3, Globe2, LaptopMinimalCheck, Monitor, Pencil, Settings2, ShieldCheck, Sparkles, Video } from 'lucide-react'
import { useTheme } from '@mui/material/styles'

const categories = [
  {
    name: 'Web Development',
    count: 3,
    description: 'Learn how to build modern, responsive websites using HTML, CSS, JavaScript, and more.',
    icon: Monitor,
  },
  {
    name: 'UI/UX Design',
    count: 2,
    description: 'Master user-centered design principles, wireframing, and prototyping to create intuitive experiences.',
    icon: Pencil,
  },
  {
    name: 'Digital Marketing',
    count: 1,
    description: 'Discover strategies for growing brands online through SEO, social media, content, and more.',
    icon: BriefcaseBusiness,
  },
  {
    name: 'Cyber Security',
    count: 0,
    description: 'Understand the fundamentals of securing systems, networks, and data while learning the essentials.',
    icon: ShieldCheck,
  },
  {
    name: 'Artificial Intelligence',
    count: 0,
    description: 'Explore the basics of AI, machine learning, and data-driven decision making to build new skills.',
    icon: Sparkles,
  },
  {
    name: 'Video Editing',
    count: 0,
    description: 'Learn professional video editing techniques, storytelling, and post-production skills.',
    icon: Video,
  },
]

const offers = [
  { name: 'Expert-Led Courses', description: 'Learn from experienced instructors who bring real-world knowledge into every lesson.', icon: BookOpen },
  { name: 'Flexible Learning', description: 'Study anytime, anywhere — pause, resume, and learn at your own pace.', icon: Clock3 },
  { name: 'Hands-On Projects', description: 'Apply what you learn through real projects, quizzes, and exercises.', icon: LaptopMinimalCheck },
  { name: 'Verified Certificates', description: 'Earn recognized certificates to showcase your new skills and boost your career.', icon: BadgeCheck },
  { name: 'Global Learning Community', description: 'Connect, collaborate, and grow with learners and mentors from around the world.', icon: Globe2 },
  { name: 'Personalized Progress Tracking', description: 'Monitor your learning journey, track progress, and celebrate milestones in your profile.', icon: Settings2 },
]

type DotNetPillarsProps = {
  variant?: 'categories' | 'offers'
}

const DotNetPillars = ({ variant = 'categories' }: DotNetPillarsProps) => {
  const darkMode = useTheme().palette.mode === 'dark'
  const isOffers = variant === 'offers'
  const cards: { name: string; description: string; icon: typeof Monitor; count?: number }[] = isOffers ? offers : categories

  return (
  <section aria-label={isOffers ? 'What We Offer' : undefined} aria-labelledby={isOffers ? undefined : 'dotnet-pillars-title'} className={`${darkMode ? 'bg-[#171717]' : 'bg-[#f5f7fa]'} px-4 ${isOffers ? 'pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-14 lg:pb-28' : 'py-16 sm:px-6 sm:py-20 md:px-8 lg:py-28'}`}>
    <div className="mx-auto max-w-7xl">
      {!isOffers && <div>
        <span className={`text-xs font-bold leading-5 tracking-[0.08em] ${darkMode ? 'text-slate-300' : 'text-[#127C71]'}`}>
          CATEGORIES
        </span>
        <h2 id="dotnet-pillars-title" className={`mt-1 text-[clamp(2rem,calc(1.6rem+1vw),2.5rem)] font-bold leading-[1.25] tracking-[-0.04em] ${darkMode ? 'text-[#f2f7f6]' : 'text-slate-950'}`}>
          Explore Category
        </h2>
      </div>}

      <div className={`${isOffers ? 'mt-0' : 'mt-11 sm:mt-14 lg:mt-16'} grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        {cards.map((card) => {
          const { name, description, icon: Icon } = card
          return (
          <article key={name} className={`group rounded-3xl border-2 px-5 pb-6 pt-5 transition-all duration-500 hover:border-[#127C71] sm:px-7 sm:pb-8 sm:pt-7 ${darkMode ? 'border-[#31413e] bg-[#192321]' : 'border-transparent bg-white'}`}>
            <div className="mb-9 flex items-start justify-between sm:mb-11 lg:mb-[60px]">
              <span className={`flex h-[54px] w-[54px] items-center justify-center rounded-full border text-[#127C71] shadow-lg ${darkMode ? 'border-[#31413e] bg-[#171717]' : 'border-slate-100 bg-white'}`}>
                <Icon aria-hidden="true" size={28} strokeWidth={1.8} />
              </span>
              {card.count !== undefined && <span className={`rounded-full px-3 py-1 text-sm font-medium leading-5 tracking-[0.035em] ${darkMode ? 'bg-[#24332f] text-[#b3c0bd]' : 'bg-[#f5f7fa] text-slate-600'}`}>
                {card.count} {card.count === 1 ? 'Course' : 'Courses'}
              </span>}
            </div>
            <h3 className={`text-lg font-medium leading-7 sm:text-xl lg:text-2xl ${darkMode ? 'text-[#f2f7f6]' : 'text-slate-950'}`}>{name}</h3>
            <p className={`mt-3 line-clamp-2 text-base leading-6 tracking-[0.03em] ${darkMode ? 'text-[#b3c0bd]' : 'text-slate-600'}`}>{description}</p>
          </article>
          )
        })}
      </div>
    </div>
  </section>
  )
}

export default DotNetPillars
