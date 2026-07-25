import React, { useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "material-icons/iconfont/material-icons.css";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import $ from "jquery";
import "datatables.net-bs5";

import "../index.css";

export default function Table({
  id,
  title,
  columns,
  data,
  renderActions,
  headerButtons,
  loading = false,
}) {
  const selectedIdsRef = useRef(new Set()); // 🔹 Mantiene los IDs seleccionados sin causar renders

  useEffect(() => {
    if (loading) return undefined;

    const languageConfig = {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
    };

    // Destruye instancia previa si existe
    if ($.fn.DataTable.isDataTable(`#${id}`)) {
      $(`#${id}`).DataTable().destroy();
    }

    // Inicializa DataTable
    const table = $(`#${id}`).DataTable({
      language: languageConfig,
      autoWidth: false,
    });

    // Forzar altura uniforme en cada renderizado
    table.on("draw", function () {
      $(`#${id} tbody tr`).css("height", "48px");
    });

    return () => {
      if ($.fn.DataTable.isDataTable(`#${id}`)) {
        $(`#${id}`).DataTable().destroy();
      }
    };
  }, [id, data, loading]);

  // Normaliza nombres de las columnas
  const normalizeKey = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

  // 🔹 Maneja selección de checkboxes sin re-renderizar
  const handleSelect = (checked, idValue) => {
    if (checked) {
      selectedIdsRef.current.add(idValue);
    } else {
      selectedIdsRef.current.delete(idValue);
    }
    console.log("Seleccionados:", Array.from(selectedIdsRef.current));
  };

  return (
    <div className="card mb-3">
      <div className="card-body p-4 p-lg-5">
        {/* Encabezado con título y botones */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="card-title fs-5 mb-0">{title}</h2>
          <div className="d-flex gap-2">{headerButtons && headerButtons()}</div>
        </div>

        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <span className="text-secondary">Cargando datos...</span>
          </div>
        ) : (
        <div className="table-responsive">
          <table
            id={id}
            className="table table-hover align-middle mb-0 uniform-table"
          >
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="fw-medium text-secondary">
                    {/* Si la columna es Input, agregamos un checkbox general para seleccionar todos */}
                    {col.toLowerCase() === "input" ? (
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const checkboxes = document.querySelectorAll(
                            `#${id} tbody input[type="checkbox"]`
                          );
                          checkboxes.forEach((cb) => {
                            cb.checked = checked;
                            const val = cb.getAttribute("data-id");
                            handleSelect(checked, val);
                          });
                        }}
                      />
                    ) : (
                      col
                    )}
                  </th>
                ))}
                {renderActions && (
                  <th className="text-end fw-medium text-secondary">Acciones</th>
                )}
              </tr>
            </thead>

            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col, i) => {
                    const key = normalizeKey(col);

                    // Si la columna es Input → mostramos checkbox
                    if (col.toLowerCase() === "input") {
                      return (
                        <td key={i} className="py-3 text-center">
                          <input
                            type="checkbox"
                            data-id={row.mensaje_id}
                            onChange={(e) =>
                              handleSelect(e.target.checked, row.mensaje_id)
                            }
                          />
                        </td>
                      );
                    }

                    // En caso normal → renderiza el texto
                    return (
                      <td key={i} className="py-3">
                        {row[key]}
                      </td>
                    );
                  })}

                  {renderActions && (
                    <td className="text-end py-3">{renderActions(row)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
