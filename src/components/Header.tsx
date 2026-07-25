import {
  clearAdminSession,
  getAdminUser,
} from "../functions/AdminDataActions";

export default function Header() {
  const admin = getAdminUser();

  const handleLogout = () => {
    clearAdminSession();
    window.location.href = "/index.html";
  };

  return (
    <header className="color_fondo p-3 pb-1">
      <div className="d-flex justify-content-between align-items-center">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li
              className="breadcrumb-item active text-dark fw-bold"
              aria-current="page"
              style={{ position: "relative", top: "0px" }}
            >
              Dashboard general
            </li>
          </ol>
        </nav>
        <div className="d-flex align-items-center">
          <span className="me-4 text-muted">
            Hola! {admin?.correo || "admin"}
          </span>
          <button
            className="btn btn-outline-danger btn-sm px-4 py-1"
            onClick={handleLogout}
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
