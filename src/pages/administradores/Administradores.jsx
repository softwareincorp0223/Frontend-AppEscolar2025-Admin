import React, { useEffect, useState } from "react";
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
  generateId,
} from "../../functions/AdminDataActions";

export default function Administradores() {
  const [administradores, setAdministradores] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdministradores = async () => {
    setLoading(true);
    try {
      const data = await apiGet("administrador");
      setAdministradores(data);
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdministradores();
  }, []);

  const fields = [
    { name: "nombre", label: "Nombres", type: "text", required: true },
    { name: "apellido", label: "Apellidos", type: "text" },
    { name: "correo", label: "Email", type: "email", required: true },
    {
      name: "contrasena",
      label: "Contrasena",
      type: "password",
      placeholder: editing ? "Dejar vacio para conservar" : "********",
      required: !editing,
    },
  ];

  const initialValues = editing
    ? {
        nombre: editing.nombre || "",
        apellido: editing.apellido || "",
        correo: editing.correo || "",
        contrasena: "",
      }
    : {};

  const handleSubmit = async (values) => {
    const payload = {
      id_admin: editing?.id_admin || generateId(),
      nombre: values.nombre,
      apellido: values.apellido || "",
      correo: values.correo,
      privilegios: editing?.privilegios || "B",
    };

    if (values.contrasena) {
      payload.contrasena = values.contrasena;
    }

    try {
      if (editing) {
        await apiPut(`administrador/${editing.id_admin}`, payload);
        showAlert("success", "Administrador actualizado correctamente");
      } else {
        await apiPost("administrador", payload);
        showAlert("success", "Administrador agregado correctamente");
      }
      setEditing(null);
      await loadAdministradores();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const handleDelete = async (row) => {
    const result = await showAlert("delete", "Deseas eliminar este administrador?");
    if (!result.isConfirmed) return;

    try {
      await apiDelete(`administrador/${row.id_admin}`);
      showAlert("success", "Administrador eliminado correctamente");
      await loadAdministradores();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-4" style={{ paddingLeft: "3px" }}>
        <Form
          title={editing ? "Editar Administrador" : "Registro de Administrador"}
          fields={fields}
          columns={2}
          initialValues={initialValues}
          submitLabel={editing ? "Actualizar" : "Guardar"}
          onCancel={editing ? () => setEditing(null) : null}
          onSubmit={handleSubmit}
        />

        <Table
          id="adminTable"
          title="Administradores"
          columns={["Nombre", "Apellido", "Correo"]}
          data={administradores}
          loading={loading}
          renderActions={(row) => (
            <ActionButtons
              row={row}
              actions={[
                {
                  label: "Editar",
                  icon: "edit",
                  className: "btn-outline-primary px-2 py-1",
                  onClick: () => setEditing(row),
                },
                {
                  label: "Eliminar",
                  icon: "delete",
                  className: "btn-outline-danger px-2 py-1",
                  onClick: () => handleDelete(row),
                },
              ]}
            />
          )}
        />
      </div>
    </Layout>
  );
}
