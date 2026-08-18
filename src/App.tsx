import { useEffect, useState } from "react";
import logo from "./assets/logo_fondo.png";
import background from "./assets/2.png";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { getAdminToken, loginAdmin } from "./functions/AdminDataActions";
import { showAlert } from "./functions/Alerts";

export default function App() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAdminToken()) {
      window.location.href = "/src/pages/escuelas-registradas/index.html";
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      await loginAdmin({ correo, contrasena });
      await showAlert("success", "Sesion iniciada correctamente");
      window.location.href = "/src/pages/escuelas-registradas/index.html";
    } catch (error) {
      showAlert(
        "error",
        error instanceof Error ? error.message : "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column min-vh-100 text-center"
      style={{
        background: `url(${background}) no-repeat center center / cover`,
      }}
    >
      <div className="mt-4">
        <img
          src={logo}
          alt="Aplicación Escolar"
          className="img-fluid"
          style={{ maxWidth: "350px", position: "relative", top: "70px" }}
        />
      </div>

      <div className="container flex-grow-1 d-flex justify-content-center align-items-center">
        <div
          className="card shadow-lg p-4 pb-0"
          style={{ maxWidth: "450px", width: "100%" }}
        >
          <div
            className="bg-primary-def rounded py-4 shadow-lg"
            style={{ position: "relative", top: "-55px" }}
          >
            <h4 className="text-white fw-bold mb-2">Iniciar sesión</h4>
            <p className="text-white small mb-0">ADMINISTRACIÓN GENERAL</p>
          </div>

          <div style={{ position: "relative", top: "-25px" }}>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Correo"
                className="form-control mb-3"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="form-control mb-3"
                value={contrasena}
                onChange={(event) => setContrasena(event.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-primary-def text-white fw-bold w-100 mb-2 roboto p-2"
                style={{ fontSize: "12px" }}
                disabled={loading}
              >
                {loading ? "INGRESANDO..." : "INGRESAR"}
              </button>
            </form>

          </div>
        </div>
      </div>

      <footer className="d-flex justify-content-between align-items-center px-4 py-2 text-white">
        <div className="bg-primary-def text-white px-3 py-2 rounded">
          © {new Date().getFullYear()}, Hecho por aplicación escolar
        </div>
        <div className="d-flex gap-3 fs-3 text-white">
          <a
            href="https://www.facebook.com/aplicacionescolar"
            target="_blank"
            rel="noreferrer"
            className="text-white"
          >
            <i className="bi bi-facebook"></i>
          </a>
          <a
            href="mailto:contacto@aplicacionescolar.com"
            target="_blank"
            rel="noreferrer"
            className="text-white"
          >
            <i className="bi bi-envelope"></i>
          </a>
          <a
            href="tel:7229247249"
            target="_blank"
            rel="noreferrer"
            className="text-white"
          >
            <i className="bi bi-telephone-fill"></i>
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=527292775116&text=Hola%20quiero%20mas%20informacion"
            target="_blank"
            rel="noreferrer"
            className="text-white"
          >
            <i className="bi bi-whatsapp"></i>
          </a>
        </div>
      </footer>
    </div>
  );
}
