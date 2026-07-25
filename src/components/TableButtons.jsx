// src/components/TableButtons.jsx
import React from "react";

//uso de componente
/*
headerButtons={(row) => (
  <TableButtons
    row={row}
    actions={[
      "delete", // usa botón predefinido
      "excel", // usa botón predefinido
      "qr_code", // usa botón predefinido
      "pdf", // usa botón predefinido
      "filter", // usa botón predefinido
      {
        label: "Descargar", // personalizado
        icon: "download",
        className: "btn-outline-warning",
        onClick: (id) => console.log("Descargar mensaje:", id),
      },
    ]}
  />
)}
*/

export default function TableButtons({ actions = [], row }) {
  // Botones predefinidos
  const predefined = {
    excel: {
      label: "Exportar Excel",
      icon: "description",
      className: "btn-outline-success",
      onClick: (id) => console.log("excel:", id),
    },
    delete: {
      label: "Eliminar Seleccionados",
      icon: "delete",
      className: "btn-outline-danger",
      onClick: (id) => console.log("Eliminar:", id),
    },
    qr_code: {
      label: "Descargar QRs",
      icon: "qr_code",
      className: "btn-outline-dark",
      onClick: (id) => console.log("qr_code:", id),
    },
    pdf: {
      label: "Exportar PDF",
      icon: "picture_as_pdf",
      className: "btn-outline-primary",
      onClick: (id) => console.log("pdf:", id),
    },
    filter: {
      label: "Filtros",
      icon: "filter_alt",
      className: "btn-outline-secondary",
      onClick: (id) => console.log("pdf:", id),
    }
  };

  return (
    <>
      {actions.map((action, idx) => {
        let btn;

        // 🔹 Caso 1: string → botón predefinido
        if (typeof action === "string" && predefined[action]) {
          btn = predefined[action];
        }

        // 🔹 Caso 2: objeto → botón personalizado
        if (typeof action === "object") {
          btn = {
            label: action.label,
            icon: action.icon,
            className: action.className || "btn-outline-secondary",
            onClick: action.onClick || (() => {}),
          };
        }

        if (!btn) return null;

        return (
          <button
            key={idx}
            className={`btn btn-sm ${btn.className} me-2`}
            onClick={() => btn.onClick(row.mensaje_id)}
          >
            {btn.icon && (
              <span
                className="material-icons align-middle"
                style={{ fontSize: "1rem" }}
              >
                {btn.icon}
              </span>
            )}
            <span className="px-1">{btn.label}</span>
          </button>
        );
      })}
    </>
  );
}
