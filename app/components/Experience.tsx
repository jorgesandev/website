export default function Experience() {
  const experiences = [
    {
      id: "01",
      role: "Founding Software Engineer",
      company: "Pitch Jams",
      period: "October 2025 to Present",
      description: "Building the Expo monorepo that ships Pitch Jams to iOS, Android, and web from a single React Native codebase. Designed the subscription tier architecture across 4 plans (Free/Pro Pitcher, Free/Pro Jammer, Enterprise) with the corresponding access control logic. Managing beta distribution through TestFlight and Google Play Console. Also contribute to the Django REST backend: API endpoints, data models, and authentication."
    },
    {
      id: "02",
      role: "IT Intern",
      company: "Directive Consulting",
      period: "May 2025 to October 2025",
      description: "Built an internal asset inventory management system using Next.js, Firebase Auth, and Firestore. Integrated Google Workspace Admin SDK via Cloud Functions for role-based access control, with real-time queries and Google SSO."
    }
  ];

  return (
    <section id="experience" className="py-32 border-b ghost-border">
      <div className="max-w-4xl mx-auto px-6 w-full">
        
        <div className="label-text text-primary mb-12 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
          Section 02 // Experience
        </div>

        <div className="flex flex-col gap-6">
          {experiences.map((exp, index) => (
            <div 
              key={exp.id} 
              className={`p-6 md:p-8 rounded-sm transition-colors ${index % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface'}`}
            >
              <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 md:gap-4 mb-2 md:mb-0">
                  <span className="label-text text-primary text-xs hidden sm:inline-block">{exp.id}</span>
                  <h3 className="text-xl md:text-2xl font-sans font-bold text-on-surface leading-tight">{exp.role}</h3>
                </div>
                <div className="label-text text-xs md:text-sm text-on-surface-variant">
                  {exp.company} {"//"} {exp.period}
                </div>
              </div>
              <p className="text-on-surface-variant font-sans text-sm md:text-base leading-relaxed pl-0 md:pl-8">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
