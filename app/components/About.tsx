import Image from "next/image";

export default function About() {
  const techStack = ["TypeScript", "React", "React Native (Expo)", "Next.js", "Python", "Django", "AWS", "Docker"];
  

  return (
    <section id="about" className="py-32 border-b ghost-border dot-grid">
      <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Bio & Tech Stack */}
        <div className="flex flex-col items-start">
          <div className="label-text text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
            Section 01 // About Me
          </div>
          
          <h2 className="text-4xl font-sans font-bold text-on-surface mb-6">
            Building products across mobile, web, and AI.
          </h2>
          
          <p className="text-on-surface-variant font-sans text-base md:text-lg mb-6 leading-relaxed">
            I completed the degree requirements for Software and Emerging Technologies Engineering at <span className="text-primary font-medium">UABC Tijuana</span>; degree issuance is pending. My experience spans a part-time equity startup project, an IT internship at <span className="text-primary font-medium">Directive Consulting</span>, and production-minded hackathon builds. I work primarily with <span className="text-primary font-medium">TypeScript, React Native, Next.js, and Python</span>, and I have three national hackathon placements including 1st place at <span className="text-primary font-medium">Ethereum México</span> with <span className="text-primary font-medium">LiquiFi</span>.
          </p>
          
          <p className="text-on-surface-variant font-sans text-base md:text-lg mb-4 leading-relaxed">
            Here are some technologies I have been working with:
          </p>

          <div className="w-full mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
              {techStack.map(tech => (
                <div key={tech} className="flex items-center gap-2 label-text text-xs text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-sm ghost-border w-fit">
                  <span className="text-primary opacity-50">&gt;</span> {tech}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full border-t ghost-border pt-6 mt-2 relative">
            <div className="absolute -top-3 left-4 bg-surface px-2 label-text text-primary text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block animate-pulse"></span>
              PERSONAL LOG //
            </div>
            <p className="text-on-surface-variant font-sans text-base md:text-lg leading-relaxed">
              I care about products that are useful, explainable, and thoughtfully built. Outside engineering, I make music and play piano.
            </p>
          </div>
        </div>
        
        {/* Right Column: Image */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-full aspect-square max-w-md bg-surface-container-high rounded-sm ghost-border flex items-center justify-center p-2">
            <div className="absolute top-4 left-4 label-text text-[10px] text-on-surface-variant z-10 bg-surface/80 px-2 py-0.5 backdrop-blur-sm shadow-sm rounded-sm ghost-border">IMG_PRT_01</div>
            <div className="absolute top-4 right-4 flex gap-1.5 z-10 bg-surface/80 px-2 py-1.5 backdrop-blur-sm shadow-sm rounded-sm ghost-border">
              <span className="w-1.5 h-1.5 bg-outline rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-outline rounded-full"></span>
            </div>
            <div className="relative w-full h-full rounded-sm overflow-hidden ghost-border" style={{ position: "relative" }}>
              <Image 
                src="/jorge.jpeg" 
                alt="Jorge Alejandro Sandoval Romo"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover transition-all duration-700 ease-in-out"
                priority
              />
            </div>
            <div className="absolute bottom-4 left-4 label-text text-[10px] text-on-surface-variant z-10 bg-surface/80 px-2 py-0.5 backdrop-blur-sm shadow-sm rounded-sm ghost-border flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block animate-pulse"></span>
              CALIBRATED
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
