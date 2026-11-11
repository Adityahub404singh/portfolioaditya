export default function SectionHeading({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={`section-heading align-${align}`}>
      {eyebrow && <span className="eyebrow"><i />{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}