import { Award, GraduationCap, MonitorPlay } from 'lucide-react'

const benefits = [
  {
    title: 'Course Program (Self-Paced)',
    description: 'Learn at your own pace using courses, lessons, and articles, plus quizzes and exams.',
    image: '/images/course-program-self-paced.webp',
    alt: 'Self-paced course program',
    icon: GraduationCap,
  },
  {
    title: 'Class Program (Tutor-Led)',
    description: 'Join live tutor-led classes with timed quizzes, graded work, and progress checks.',
    image: '/images/class-program-tutor-led.webp',
    alt: 'Tutor-led class program',
    icon: MonitorPlay,
  },
  {
    title: 'Recognized Certificates',
    description: 'Boost your portfolio with verified certificates after completing courses.',
    image: '/images/why-skillsaint-certificates.png',
    alt: 'Certificate of achievement',
    icon: Award,
  },
]

const WhySkillsaint = () => (
  <section aria-labelledby="why-skillsaint-title" className="bg-[#f5f7fa] px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:py-28">
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 text-xs font-bold leading-5 tracking-[0.08em] text-[#127C71]">
          <Award aria-hidden="true" size={14} />
          WHY COURSESHARP
        </span>
        <h2 id="why-skillsaint-title" className="mt-1 text-[clamp(2rem,calc(1.6rem+1vw),2.5rem)] font-bold leading-[1.25] tracking-[-0.04em] text-slate-950">
          The Smarter Way to Learn Tech
        </h2>
        <p className="mx-auto mt-4 max-w-[478px] text-base leading-6 text-slate-600">
          Experience the difference with a platform engineered to help you actually learn, apply, and succeed.
        </p>
      </div>

      <div className="mt-11 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
        {benefits.map(({ title, description, image, alt, icon: Icon }) => (
          <article key={title} className="rounded-3xl border border-[#dfe7e5] bg-white px-4 pb-4 pt-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#dce9e6] bg-[#f5f7fa] text-[#127C71]">
              <Icon aria-hidden="true" size={24} strokeWidth={1.8} />
            </span>
            <h3 className="mt-5 text-xl font-semibold leading-[1.5] text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            <img src={image} alt={alt} loading="lazy" className="mt-8 aspect-[3/2] w-full rounded-xl border-4 border-[#e4ecea] object-cover" />
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default WhySkillsaint
