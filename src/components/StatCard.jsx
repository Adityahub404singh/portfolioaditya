export default function StatCard({ icon: Icon, value, label, note }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={23} /></div>
      <div><strong>{value}</strong><span>{label}</span>{note && <small>{note}</small>}</div>
    </div>
  );
}