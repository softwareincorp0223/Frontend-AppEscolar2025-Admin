import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import Form from "../../components/Form";
import ActionButtons from "../../components/ActionButtons";
import { showAlert } from "../../functions/Alerts";
import {
  addOneYear,
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  formatDate,
  generateId,
  todayDateTime,
} from "../../functions/AdminDataActions";

export default function Instituciones() {
  const [instituciones, setInstituciones] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInstituciones = async () => {
    setLoading(true);
    try {
      const data = await apiGet("instituto");
      setInstituciones(
        data.map((item) => ({
          ...item,
          inicio_licencia: formatDate(item.fecha_inicio_licencia),
          fecha_limite: formatDate(item.fecha_limite),
          correo_afiliacion: item.correo,
          creado: item.fecha_creacion
            ? new Date(item.fecha_creacion).toLocaleString()
            : "",
        }))
      );
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstituciones();
  }, []);

  const fields = [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    {
      name: "fecha_inicio_licencia",
      label: "Inicio de licencia",
      type: "date",
      required: true,
    },
    {
      name: "fecha_limite",
      label: "Límite",
      type: "date",
      readOnly: true,
      required: true,
    },
    {
      name: "correo",
      label: "Correo de afiliación",
      type: "email",
      placeholder: "ejemplo@gmail.com",
      required: true,
    },
  ];

  const initialValues = editing
    ? {
        nombre: editing.nombre,
        fecha_inicio_licencia: formatDate(editing.fecha_inicio_licencia),
        fecha_limite: formatDate(editing.fecha_limite),
        correo: editing.correo,
      }
    : {};

  const handleSubmit = async (values) => {
    const fechaLimite =
      values.fecha_limite || addOneYear(values.fecha_inicio_licencia);

    const payload = {
      id_instituto: editing?.id_instituto || generateId(),
      nombre: values.nombre,
      correo: values.correo,
      fecha_inicio_licencia: values.fecha_inicio_licencia,
      fecha_limite: fechaLimite,
      fecha_creacion: editing?.fecha_creacion || todayDateTime(),
    };

    try {
      if (editing) {
        await apiPut(`instituto/${editing.id_instituto}`, payload);
        showAlert("success", "Institución actualizada correctamente");
      } else {
        await apiPost("instituto", payload);
        showAlert("success", "Institución agregada correctamente");
      }
      setEditing(null);
      await loadInstituciones();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const handleDelete = async (row) => {
    const result = await showAlert("delete", "¿Deseas eliminar esta institución?");
    if (!result.isConfirmed) return;

    try {
      await apiDelete(`instituto/${row.id_instituto}`);
      showAlert("success", "Institución eliminada correctamente");
      await loadInstituciones();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-4" style={{ paddingLeft: "3px" }}>
        <Form
          title={editing ? "Editar Institución" : "Registro de Institución"}
          fields={fields}
          columns={2}
          initialValues={initialValues}
          submitLabel={editing ? "Actualizar" : "Guardar"}
          onCancel={editing ? () => setEditing(null) : null}
          onSubmit={(values) =>
            handleSubmit({
              ...values,
              fecha_limite: addOneYear(values.fecha_inicio_licencia),
            })
          }
        />

        <Table
          id="institucionTable"
          title="Instituciones"
          columns={["Nombre", "Inicio Licencia", "Fecha Limite", "Correo Afiliacion", "Creado"]}
          data={instituciones}
          loading={loading}
          renderActions={(row) => (
            <ActionButtons
              row={row}
              actions={[
                { label: "Editar", icon: "edit", className: "btn-outline-primary", onClick: () => setEditing(row) },
                { label: "Eliminar", icon: "delete", className: "btn-outline-danger", onClick: () => handleDelete(row) },
              ]}
            />
          )}
        />
      </div>
    </Layout>
  );
}
