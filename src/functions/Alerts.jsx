// src/utils/alerts.js
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export function showAlert(type, message = "") {
  switch (type) {
    case "success":
      return Swal.fire({
        icon: "success",
        title: "Listo",
        text: message || "Operacion exitosa",
        confirmButtonColor: "#0399fd",
      });

    case "error":
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: message || "Ocurrio un error",
        confirmButtonColor: "#ef4444",
      });

    case "info":
      return Swal.fire({
        icon: "info",
        title: "Informacion",
        text: message || "Informacion importante",
        confirmButtonColor: "#0399fd",
      });

    case "delete":
      return Swal.fire({
        icon: "warning",
        title: "Estas seguro?",
        text: message || "Esta accion no se puede deshacer",
        showCancelButton: true,
        confirmButtonText: "Si, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
      });

    case "warning":
      return Swal.fire({
        icon: "warning",
        title: "Aviso",
        text: message || "Revisa la informacion",
        confirmButtonColor: "#f59e0b",
      });

    default:
      return Swal.fire({
        icon: "question",
        title: "Aviso",
        text: message || "Accion no definida",
        confirmButtonColor: "#0399fd",
      });
  }
}
