import { GraduationCap, MapPin, Mail, Github, Linkedin, Code2 } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { usePortfolio } from "../hooks/usePortfolio";

export default function About() {
  const { content } = usePortfolio();
  const p = content.profile || {};
  const skills = Array.isArray(content.skills) ? content.skills : [];
  const groups = [...new Set(skills.map(s => s.group || "Other"))];
  return (
    <section className="page-section container">
      <SectionHeading eyebrow="ABOUT & CAPABILITIES" title="The person behind the pixels." description="A little context about what I learn, what I build and where I want to go." />
      <div className="about-layout">
        <div className="about-photo panel"><img src={p.photoUrl || "/images/profile.jpg"} alt={p.name} /><div><h3>{p.name}</h3><span>{p.role}</span></div></div>
        <div className="about-copy panel"><span className="eyebrow"><i /> MY APPROACH</span><h2>Learn deeply.<br /><em>Build thoughtfully.</em></h2><p>{p.about}</p><div className="contact-lines"><span><MapPin size={16}/>{p.location}</span><span><Mail size={16}/>{p.email}</span><span><GraduationCap size={16}/>{p.degree}</span></div><div className="social-row">{p.github&&<a href={p.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github/></a>}{p.linkedin&&<a href={p.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin/></a>}</div></div>
      </div>
      <div className="education-panel panel"><GraduationCap/><div><span className="eyebrow">EDUCATION</span><h3>{p.degree}</h3><p>{p.college} · Expected graduation {p.graduation}</p><small>CGPA: {p.cgpa}</small></div></div>
      <div className="skills-section"><SectionHeading eyebrow="TOOLKIT" title="Skills & technologies" description="A growing toolkit across software development and computer science."/><div className="skills-groups">{groups.map(group=><div className="panel skill-group" key={group}><h3><Code2 size={18}/>{group}</h3>{skills.filter(s=>s.group===group).map(skill=><div className="skill-item" key={skill.id}><div><strong>{skill.name}</strong><span>{Math.max(0,Math.min(100,Number(skill.level)||0))}%</span></div><div className="skill-track" role="progressbar" aria-label={`${skill.name} proficiency`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.max(0,Math.min(100,Number(skill.level)||0))}><i style={{width:`${Math.max(0,Math.min(100,Number(skill.level)||0))}%`}}/></div><small>{skill.detail}</small></div>)}</div>)}</div></div>
    </section>
  );
}