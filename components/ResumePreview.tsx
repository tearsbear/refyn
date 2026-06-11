import type { ResumeJSON, Experience, Project } from "@/lib/types";

interface ResumePreviewProps {
  resume: ResumeJSON;
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <>
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-pure-black">
        <h1 className="text-3xl font-bold mb-2">Alifya Jiehan Anandika</h1>
        <div className="text-[11px] mt-2">
          jiehanandika@gmail.com <span className="mx-2">|</span> +62 897 6203
          842 <span className="mx-2">|</span>{" "}
          <a
            href="https://jiaan.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline cursor-pointer"
          >
            https://jiaan.vercel.app
          </a>{" "}
          <span className="mx-2">|</span> Jakarta, Indonesia
        </div>
        <div className="text-[11px] mt-1">
          Linkedin:{" "}
          <a
            href="https://www.linkedin.com/in/alifyajiehan/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline cursor-pointer"
          >
            https://www.linkedin.com/in/alifyajiehan
          </a>{" "}
          <span className="mx-2">|</span> Portofolio:{" "}
          <a
            href="https://drive.google.com/drive/folders/1EJrGrpbsj2PEfhaJssq4K-L7ljqx4JMD"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline cursor-pointer"
          >
            https://drive.google.com/drive/folders/1EJrGrpbsj2PEfhaJssq4K-L7ljqx4JMD
          </a>
        </div>
      </div>

      {/* Summary */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
          Summary
        </h2>
        <p className="text-[11px] leading-relaxed text-justify">
          {resume.summary}
        </p>
      </section>

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
          Experience
        </h2>
        {resume.experiences.map((exp: Experience, idx: number) => (
          <div key={idx} className="mb-4">
            <div className="mb-2">
              <h3 className="text-xs font-bold">{exp.role}</h3>
              <div className="text-[11px] mt-0.5">
                {exp.company} • {exp.startDate} - {exp.endDate}
              </div>
            </div>
            <ul className="list-disc ml-5 space-y-1">
              {exp.bullets.map((bullet: string, bulletIdx: number) => (
                <li key={bulletIdx} className="text-[11px] leading-relaxed">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
            Project Experience
          </h2>
          {resume.projects.map((proj: Project, idx: number) => (
            <div key={idx} className="mb-4">
              <div className="mb-2">
                <h3 className="text-xs font-bold">{proj.title}</h3>
                <div className="text-[11px] mt-0.5">
                  {proj.company} • {proj.location} • {proj.duration}
                </div>
              </div>
              <ul className="list-disc ml-5 space-y-1">
                {proj.bullets.map((bullet: string, bulletIdx: number) => (
                  <li key={bulletIdx} className="text-[11px] leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Achievements */}
      {resume.achievements && resume.achievements.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
            Achievement
          </h2>
          {resume.achievements.map((ach, idx) => (
            <div key={idx} className="mb-4">
              <div className="mb-2">
                <h3 className="text-xs font-bold">{ach.title}</h3>
                <div className="text-[11px] mt-0.5">
                  {ach.issuer} • {ach.location} • {ach.date}
                </div>
              </div>
              <ul className="list-disc ml-5 space-y-1">
                {ach.bullets.map((bullet, bulletIdx) => (
                  <li key={bulletIdx} className="text-[11px] leading-relaxed">
                    {bullet.startsWith("http") ? (
                      <a
                        href={bullet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline cursor-pointer"
                      >
                        {bullet}
                      </a>
                    ) : (
                      bullet
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
          Education
        </h2>
        <div className="mb-3">
          <div className="text-xs font-bold">Computer Science</div>
          <div className="text-[11px]">
            Perbanas Institute • Jakarta, Indonesia
          </div>
        </div>
        <div className="mb-3">
          <div className="text-xs font-bold">Software Engineering</div>
          <div className="text-[11px]">
            Vocational High School Prestasi Prima • Jakarta, Indonesia
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
          Skills
        </h2>
        <p className="text-[11px] leading-relaxed">
          {resume.skills.join(", ")}
        </p>
      </section>

      {/* Languages */}
      <section>
        <h2 className="text-sm font-bold uppercase border-b border-pure-black mb-3 pb-1">
          Languages
        </h2>
        <p className="text-[11px]">
          Indonesian (Native), English (Professional)
        </p>
      </section>
    </>
  );
}
