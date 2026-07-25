// src/components/Layout.jsx
import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "material-icons/iconfont/material-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 
import { Tooltip } from "bootstrap"; // Importar Tooltip directo

import Aside from "./Aside";
import Header from "./Header";
import Footer from "./Footer";
import { getAdminToken } from "../functions/AdminDataActions";

import "../index.css";

export default function Layout({ children }) {
  useEffect(() => {
    if (!getAdminToken()) {
      window.location.href = "/index.html";
      return;
    }

    // Inicializa tooltips al montar el layout
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].forEach((tooltipTriggerEl) => {
      new Tooltip(tooltipTriggerEl);
    });
  }, []);

  return (
    <div className="d-flex color_fondo">
      {/* Sidebar fijo*/}
      <Aside />

      {/* Main content con margen para no quedar debajo del sidebar */}
      <main className="main-content d-flex flex-column ">
        <Header />

        {/* Contenido */}
        <div>
          <main>{children}</main>
        </div>

        <Footer />
      </main>
    </div>
  );
}
