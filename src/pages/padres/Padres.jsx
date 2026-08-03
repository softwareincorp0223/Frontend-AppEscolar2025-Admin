import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import Form from "../../components/Form";
import ActionButtons from "../../components/ActionButtons";
import { showAlert } from "../../functions/Alerts";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  generateQrCode,
  option,
  todayDateTime,
  toOptions,
} from "../../functions/AdminDataActions";

export default function Padres() {
  const [padres, setPadres] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPadres = async () => {
    setLoading(true);
    try {
      const [padresApi, institutosApi] = await Promise.all([
        apiGet("padre"),
        apiGet("instituto"),
      ]);
      setInstituciones(institutosApi);
      setPadres(
        padresApi.map((padre) => ({
          ...padre,
          instituto:
            institutosApi.find((item) => item.id_instituto === padre.sid_instituto)?.nombre ||
            "Sin institución",
          creado: padre.creacion ? new Date(padre.creacion).toLocaleString() : "",
        }))
      );
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPadres();
  }, []);

  const fields = useMemo(
    () => [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "apellido", label: "Apellidos", type: "text" },
      { name: "correo", label: "Correo", type: "email", required: true },
      {
        name: "sid_instituto",
        label: "Institución",
        type: "select",
        required: true,
        options: [option("", "Seleccione..."), ...toOptions(instituciones, "id_instituto")],
      },
    ],
    [instituciones]
  );

  const handleSubmit = async (values) => {
    const payload = {
      id_padre: editing?.id_padre || null,
      nombre: values.nombre,
      apellido: values.apellido || "",
      correo: values.correo,
      creacion: editing?.creacion || todayDateTime(),
      contrasena: editing?.contrasena || generateQrCode(),
      codigo_qr: editing?.codigo_qr || generateQrCode(),
      sid_instituto: values.sid_instituto,
    };

    try {
      if (editing) {
        await apiPut(`padre/${editing.id_padre}`, payload);
        showAlert("success", "Padre actualizado correctamente");
      } else {
        await apiPost("padre", payload);
        showAlert("success", "Padre agregado correctamente");
      }
      setEditing(null);
      await loadPadres();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const handleDelete = async (row) => {
    const result = await showAlert("delete", "¿Deseas eliminar este padre?");
    if (!result.isConfirmed) return;

    try {
      await apiDelete(`padre/${row.id_padre}`);
      showAlert("success", "Padre eliminado correctamente");
      await loadPadres();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-4" style={{ paddingLeft: "3px" }}>
        <Form
          title={editing ? "Editar Padre" : "Registro de Padre"}
          fields={fields}
          columns={2}
          initialValues={editing || {}}
          submitLabel={editing ? "Actualizar" : "Guardar"}
          onCancel={editing ? () => setEditing(null) : null}
          onSubmit={handleSubmit}
        />

        <Table
          id="padresTable"
          title="Padres"
          columns={["Instituto", "Nombre", "Apellido", "Correo", "Creado"]}
          data={padres}
          loading={loading}
          renderActions={(row) => (
            <ActionButtons
              row={row}
              actions={[
                { label: "Editar", icon: "edit", className: "btn-outline-primary px-2 py-1", onClick: () => setEditing(row) },
                { label: "Eliminar", icon: "delete", className: "btn-outline-danger px-2 py-1", onClick: () => handleDelete(row) },
              ]}
            />
          )}
        />
      </div>
    </Layout>
  );
}
