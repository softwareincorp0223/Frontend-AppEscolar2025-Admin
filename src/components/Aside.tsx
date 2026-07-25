import React from "react";
import logo from "../../src/assets/logo_app_escolar.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

type MenuItem = {
  label: string;
  icon: string;
  link: string;
  children?: MenuItem[];
};

export default function Aside() {
  const currentPath = window.location.pathname; // ruta actual

  const menuItems: MenuItem[] = [
    {
      label: "Escuelas Registradas",
      icon: "account_balance",
      link: "/src/pages/escuelas-registradas/index.html",
    },
    {
      label: "Instituciones",
      icon: "school",
      link: "/src/pages/instituciones/index.html",
    },
    {
      label: "Administradores",
      icon: "manage_accounts",
      link: "/src/pages/administradores/index.html",
    },
    {
      label: "Usuarios",
      icon: "account_circle",
      link: "/src/pages/usuarios/index.html",
    },
    {
      label: "Padres",
      icon: "supervisor_account",
      link: "/src/pages/padres/index.html",
    },
    {
      label: "Estudiantes",
      icon: "local_library",
      link: "/src/pages/estudiantes/index.html",
    },
  ];

  const isActive = (link: string) => currentPath === link;

  return (
    <aside className="sidebar p-3 d-flex flex-column shadow fixed-top">
      {/* Logo */}
      <div className="px-3 py-2 mb-4">
        <h6 className="fw-bold text-center">
          <img src={logo} alt="" width={50} />
          <span style={{ position: "relative", top: "3px", paddingLeft: "10px" }}>
            App Escolar
          </span>
        </h6>
      </div>

      {/* Menú dinámico */}
      <nav className="nav flex-column flex-grow-1">
        {menuItems.map((item, index) =>
          item.children ? (
            <React.Fragment key={index}>
              <a
                className="nav-link fontSize d-flex align-items-center"
                data-bs-toggle="collapse"
                href={`#submenu-${index}`}
                role="button"
                aria-expanded="false"
                aria-controls={`submenu-${index}`}
              >
                <span className="d-flex align-items-center">
                  <span className="material-icons me-2">{item.icon}</span>
                  {item.label}
                </span>
                <span className="material-icons expand-icon">expand_more</span>
              </a>
              <div
                className={`collapse ps-4 ${item.children.some((sub) => isActive(sub.link)) ? "show" : ""
                  }`}
                id={`submenu-${index}`}
              >
                <ul className="nav flex-column">
                  {item.children.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <a
                        href={subItem.link}
                        className={`nav-link fontSizeSubMenu ${isActive(subItem.link) ? "active" : ""
                          }`}
                      >
                        {subItem.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </React.Fragment>
          ) : (
            <a
              key={index}
              href={item.link}
              className={`nav-link d-flex align-items-center ${isActive(item.link) ? "active" : ""
                }`}
            >
              <span className="d-flex align-items-center">
                <span className="material-icons me-2">{item.icon}</span>
                {item.label}
              </span>
            </a>
          )
        )}
      </nav>
    </aside>
  );
}
