import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import ActionButtons from "../../components/ActionButtons";
import { showAlert } from "../../functions/Alerts";
import { apiDelete, apiGet, apiPost } from "../../functions/AdminDataActions";

const formatDateTime = (value) => {
  if (!value) return "Sin registro";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatText = (value) => {
  const text = String(value ?? "").trim();
  return text || "No especificado";
};

const mapSchool = (school) => ({
  ...school,
  id: school.escuelas_registradas_id,
  nombre: school.nombre_contacto,
  telefono: school.telefono_contacto,
  relacion: school.relacion_escuela,
  correo: school.correo_contacto,
  estatus: school.aceptada ? "Aceptada" : "Pendiente",
});

export default function EscuelasRegistradas() {
  const [escuelas, setEscuelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const loadEscuelas = async () => {
    setLoading(true);
    try {
      const data = await apiGet("escuelas_registradas");
      setEscuelas(data.map(mapSchool));
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEscuelas();
  }, []);

  const selectedDetails = useMemo(() => {
    if (!selectedSchool) return [];

    return [
      ["Nombre de contacto", selectedSchool.nombre_contacto],
      ["Telefono de contacto", selectedSchool.telefono_contacto],
      ["Relacion con la escuela", selectedSchool.relacion_escuela],
      ["Correo de contacto", selectedSchool.correo_contacto],
      ["Nombre o clave de la escuela", selectedSchool.nombre_clave],
      ["Entidad", selectedSchool.entidad],
      ["Municipio", selectedSchool.municipio],
      ["Localidad", selectedSchool.localidad],
      ["Nivel educativo", selectedSchool.nivel_educativo],
      ["Turno", selectedSchool.turno],
      ["Sostenimiento", selectedSchool.sostenimiento],
      ["Fecha de registro", formatDateTime(selectedSchool.fecha_registro_contacto)],
    ];
  }, [selectedSchool]);

  const handleDelete = async (row) => {
    if (row.aceptada) {
      showAlert("warning", "Esta escuela ya fue aceptada y no se puede eliminar");
      return;
    }

    const result = await showAlert(
      "delete",
      "Deseas eliminar esta escuela registrada?"
    );
    if (!result.isConfirmed) return;

    try {
      await apiDelete(`escuelas_registradas/${row.escuelas_registradas_id}`);
      showAlert("success", "Escuela registrada eliminada correctamente");
      await loadEscuelas();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const handleAccept = async (row) => {
    if (row.aceptada) {
      showAlert("warning", "Esta escuela ya fue aceptada");
      return;
    }

    try {
      const response = await apiPost(
        `escuelas_registradas/${row.escuelas_registradas_id}/aceptar`,
        {}
      );
      showAlert(
        "success",
        response.message || "Escuela aceptada y correo enviado correctamente"
      );
      await loadEscuelas();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-4 py-lg-4" style={{ paddingLeft: "3px" }}>
        <div className="row g-4 g-lg-4">
          <div className="col-lg-12">
            <Table
              id="escuelasTable"
              title="Escuelas Registradas"
              columns={["Nombre", "Telefono", "Relacion", "Correo", "Estatus"]}
              data={escuelas}
              loading={loading}
              renderActions={(row) => (
                <ActionButtons
                  row={row}
                  actions={[
                    {
                      label: "Ver mas",
                      icon: "visibility",
                      className: "btn-outline-secondary mb-1 px-2 py-1",
                      onClick: () => setSelectedSchool(row),
                    },
                    {
                      label: "Aceptar",
                      icon: "check_circle",
                      className: "btn-outline-success mb-1 px-2 py-1",
                      disabled: row.aceptada,
                      title: row.aceptada ? "Escuela ya aceptada" : "Aceptar escuela",
                      onClick: () => handleAccept(row),
                    },
                    {
                      label: "Eliminar",
                      icon: "delete",
                      className: "btn-outline-danger px-2 py-1",
                      disabled: row.aceptada,
                      title: row.aceptada ? "Escuela ya aceptada" : "Eliminar escuela",
                      onClick: () => handleDelete(row),
                    },
                  ]}
                />
              )}
            />
          </div>
        </div>
      </div>

      {selectedSchool && (
        <div
          className="modal fade show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="escuelaRegistradaModalTitle"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.45)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title" id="escuelaRegistradaModalTitle">
                    Detalle de escuela registrada
                  </h5>
                  <p className="text-secondary small mb-0">
                    {formatText(selectedSchool.nombre_clave)}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setSelectedSchool(null)}
                />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  {selectedDetails.map(([label, value]) => (
                    <div className="col-12 col-md-6" key={label}>
                      <div className="border rounded p-3 h-100 bg-light">
                        <p className="text-secondary small mb-1">{label}</p>
                        <p className="fw-semibold mb-0">{formatText(value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedSchool(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
