// src/components/ActionButtons.jsx
import React from "react";


export default function ActionButtons({ actions = [], row }) {

  //Funciones por boton

  //Editar Datos
  const EditData = (id) =>{
    console.log("Editar:", id);
  };

  //Eliminar Datos
  const DeleteData = (id) =>{
    console.log("Eliminar:", id);
  };
  
  //Ver mas Datos
  const ShowData = (id) =>{
    console.log("Ver mas:", id);
  };

  //Restaurar Datos
  const RestoreData = (id) =>{
    console.log("Restaurar:", id);
  };

  //QR Datos
  const QRData = (id) =>{
    console.log("QR:", id);
  };

  //QR Datos
  const Message = (id) =>{
    console.log("Mensaje:", id);
  };

  // Botones predefinidos
  const predefined = {
    edit: {
      label: "Editar",
      icon: "edit",
      className: "btn-outline-primary",
      onClick: (id) => EditData(id),
    },
    delete: {
      label: "Eliminar",
      icon: "delete",
      className: "btn-outline-danger",
      onClick: (id) => DeleteData(id),
    },
    view: {
      label: "Ver más",
      icon: "visibility",
      className: "btn-outline-secondary",
      onClick: (id) => ShowData(id),
    },
    restore: {
      label: "Restaurar",
      icon: "restore",
      className: "btn-outline-success",
      onClick: (id) => RestoreData(id),
    },
    qr: {
      label: "Ver QR",
      icon: "qr_code",
      className: "btn-outline-dark",
      onClick: (id) => QRData(id),
    },
    message: {
      label: "Mensaje",
      icon: "mail",
      className: "btn-outline-info",
      onClick: (id) => Message(id),
    },
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
            onClick={() => btn.onClick(row.id ?? row)}
          >
            {btn.icon && (
              <span
                className="material-icons align-middle"
                style={{ fontSize: "1rem", position:"relative", top:"-1px" }}
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
