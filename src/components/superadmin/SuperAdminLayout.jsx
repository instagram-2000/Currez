import { NavLink, Outlet } from "react-router-dom";
import { signOutUser } from "../../firebase/auth";
import { useAuth } from "../../contexts/AuthContext";
import NavIcon from "../common/NavIcon";
import ThemeToggle from "../common/ThemeToggle";

const NAV_ITEMS = [
  { to: "/superadmin/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/superadmin/hospitals", label: "Hospitals", icon: "hospitals" },
];

function SuperAdminLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-page text-heading md:flex">
      <aside className="relative flex flex-col overflow-hidden border-b border-line bg-surface md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full opacity-[0.12] blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full opacity-[0.06] blur-3xl"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
        />

        <div className="relative px-5 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <img src="/currez-mark.png" alt="Currez" className="h-9 w-9 shrink-0 rounded-xl object-contain ring-1 ring-inset ring-indigo-500/20" />
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-heading">Currez</span>
              <span className="block text-[10px] font-semibold tracking-widest text-faint uppercase">
                Super Admin
              </span>
            </div>
          </div>
        </div>

        <nav className="relative mt-2 flex gap-1 px-3 pb-3 md:flex-col md:flex-1 md:px-2.5 md:pb-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-600 shadow-sm shadow-indigo-500/5 ring-1 ring-indigo-500/25 ring-inset dark:text-indigo-300"
                    : "text-muted hover:bg-card-strong hover:text-heading"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      isActive ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300" : "text-faint group-hover:text-muted"
                    }`}
                  >
                    <NavIcon name={item.icon} className="h-4 w-4" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative hidden border-t border-line px-5 py-4 md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 ring-1 ring-indigo-500/20 ring-inset dark:text-indigo-300">
              {(user?.email || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-heading">{user?.email}</p>
              <p className="truncate text-[11px] text-faint">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/80 bg-surface/80 px-6 py-3 backdrop-blur-xl backdrop-saturate-150">
          <span className="text-sm text-muted sm:hidden">{user?.email}</span>
          <span className="hidden text-sm text-muted sm:inline">Managing all onboarded hospitals</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <button
              onClick={() => signOutUser()}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
