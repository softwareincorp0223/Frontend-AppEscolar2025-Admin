import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "material-icons/iconfont/material-icons.css";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import $ from "jquery";
import "datatables.net-bs5";

import "../../index.css";

import Aside from "../../components/Aside";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function Dashboard() {
  useEffect(() => {
    const languageConfig = {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
    };

    // Destruir si ya existe
    if ($.fn.DataTable.isDataTable("#nivelesTable")) {
      $("#nivelesTable").DataTable().destroy();
    }
    if ($.fn.DataTable.isDataTable("#gradosTable")) {
      $("#gradosTable").DataTable().destroy();
    }

    // Inicializar
    $("#nivelesTable").DataTable({ language: languageConfig });
    $("#gradosTable").DataTable({ language: languageConfig });

    // Cleanup al desmontar
    return () => {
      if ($.fn.DataTable.isDataTable("#nivelesTable")) {
        $("#nivelesTable").DataTable().destroy();
      }
      if ($.fn.DataTable.isDataTable("#gradosTable")) {
        $("#gradosTable").DataTable().destroy();
      }
    };
  }, []);

  return (
    <div className="d-flex color_fondo">
      {/* Sidebar fijo*/}
      <Aside />

      {/* Main content con margen para no quedar debajo del sidebar */}
      <main className="main-content d-flex flex-column ">
        <Header />

        {/* Contenido */}
        <div
          className="container-fluid py-4 py-lg-4"
          style={{ paddingLeft: "3px" }}
        >
          <div className="row g-4 g-lg-4">
            {/* Columna izquierda */}
            <div className="col-lg-6">
              {/* Agregar Nivel */}
              <div className="card mb-4 mb-lg-5">
                <div className="card-body p-4 p-lg-4">
                  <h2 className="card-title fs-5 mb-4">Agregar Nivel</h2>
                  <form>
                    <div className="mb-4">
                      <label className="form-label" htmlFor="level-name">
                        Nombre
                      </label>
                      <input
                        className="form-control"
                        id="level-name"
                        placeholder="Ej. Primaria"
                        type="text"
                      />
                    </div>
                    <div className="text-end">
                      <button
                        className="btn btn-success w-25 py-2"
                        type="submit"
                      >
                        Agregar
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Tabla Niveles */}
              <div className="card">
                <div className="card-body p-4 p-lg-5">
                  <h2 className="card-title fs-5 mb-4">Niveles</h2>
                  <div className="table-responsive">
                    <table
                      id="nivelesTable"
                      className="table table-hover align-middle mb-0"
                    >
                      <thead>
                        <tr>
                          <th className="fw-medium text-secondary">Nombre</th>
                          <th className="text-end fw-medium text-secondary">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-3">Primaria</td>
                          <td className="text-end py-3">
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                edit
                              </span>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                delete
                              </span>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3">Secundaria</td>
                          <td className="text-end py-3">
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                edit
                              </span>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                delete
                              </span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="col-lg-6">
              {/* Agregar Grado */}
              <div className="card mb-4 mb-lg-5">
                <div className="card-body py-4 py-lg-4">
                  <h2 className="card-title fs-5 mb-4">Agregar Grado</h2>
                  <form>
                    <div className="mb-4">
                      <label className="form-label" htmlFor="select-level">
                        Selecciona un nivel
                      </label>
                      <select className="form-select" id="select-level">
                        <option>Primaria</option>
                        <option>Secundaria</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="form-label" htmlFor="grade-name">
                        Nombre
                      </label>
                      <input
                        className="form-control"
                        id="grade-name"
                        placeholder="Ej. Primero"
                        type="text"
                      />
                    </div>
                    <div className="text-end">
                      <button
                        className="btn btn-success w-25 py-2"
                        type="submit"
                      >
                        Agregar
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Tabla Grados */}
              <div className="card">
                <div className="card-body p-4 p-lg-5">
                  <h2 className="card-title fs-5 mb-4">Grados</h2>
                  <div className="table-responsive">
                    <table
                      id="gradosTable"
                      className="table table-hover align-middle mb-0"
                    >
                      <thead>
                        <tr>
                          <th className="fw-medium text-secondary">Nivel</th>
                          <th className="fw-medium text-secondary">Nombre</th>
                          <th className="text-end fw-medium text-secondary">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-3">Primaria</td>
                          <td className="py-3">Primero</td>
                          <td className="text-end py-3">
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                edit
                              </span>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                delete
                              </span>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3">Primaria</td>
                          <td className="py-3">Segundo</td>
                          <td className="text-end py-3">
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                edit
                              </span>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                delete
                              </span>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3">Secundaria</td>
                          <td className="py-3">Primero</td>
                          <td className="text-end py-3">
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                edit
                              </span>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                delete
                              </span>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3">Secundaria</td>
                          <td className="py-3">Segundo</td>
                          <td className="text-end py-3">
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                edit
                              </span>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <span
                                className="material-icons align-middle"
                                style={{ fontSize: "1rem" }}
                              >
                                delete
                              </span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />

      </main>

    </div>
  );
}
