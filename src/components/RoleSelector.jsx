import { Shield, User, Settings } from "lucide-react";

const roles = [
  { id: "citizen", label: "Citizen", icon: User },
  { id: "inspector", label: "Inspector", icon: Shield },
  { id: "admin", label: "Admin", icon: Settings },
];

export default function RoleSelector({ onSelect }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="bg-panel border border-panel-line rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-serif text-center text-text-1 mb-2">
          Welcome to LabelLens
        </h1>

        <p className="text-sm text-text-2 text-center mb-6">
          Select your role
        </p>

        <div className="space-y-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => onSelect(role.id)}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-panel-raised border border-panel-line hover:border-brass hover:bg-panel-line transition"
              >
                <Icon className="text-brass" size={20} />
                <span className="text-text-1 font-medium">{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}