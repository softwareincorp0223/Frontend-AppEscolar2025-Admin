// src/utils/alerts.js
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export function showAlert(type, message = "") {
  switch (type) {
    case "success":
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: message || "Operación exitosa",
        confirmButtonColor: "#0399fd",
      });
      break;

    case "error":
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message || "Ocurrió un error",
        confirmButtonColor: "#ef4444",
      });
      break;

    case "info":
      Swal.fire({
        icon: "info",
        title: "Información",
        text: message || "Información importante",
        confirmButtonColor: "#0399fd",
      });
      break;

    case "delete":
      return Swal.fire({
        icon: "warning",
        title: "¿Estás seguro?",
        text: message || "Esta acción no se puede deshacer",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
      });

    default:
      Swal.fire({
        icon: "question",
        title: "Aviso",
        text: message || "Acción no definida",
        confirmButtonColor: "#0399fd",
      });
      break;
  }
}
