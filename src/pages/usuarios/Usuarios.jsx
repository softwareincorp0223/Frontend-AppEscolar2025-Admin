import React, { useEffect, useMemo, useState } from "react";
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
  option,
  todayDateTime,
  toOptions,
} from "../../functions/AdminDataActions";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCatalogs = async () => {
    const [institutosApi, rolesApi] = await Promise.all([
      apiGet("instituto"),
      apiGet("rol"),
    ]);
    setInstituciones(institutosApi);
    setRoles(rolesApi);
    return { institutosApi, rolesApi };
  };

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const [{ institutosApi, rolesApi }, usuariosApi] = await Promise.all([
        loadCatalogs(),
        apiGet("usuario?include=Rol,Instituto"),
      ]);
      setUsuarios(
        usuariosApi.map((user) => ({
          ...user,
          instituto:
            user.Instituto?.nombre ||
            institutosApi.find((item) => item.id_instituto === user.sid_instituto)?.nombre ||
            "Sin institución",
          rol:
            user.Rol?.nombre ||
            rolesApi.find((item) => item.id_rol === user.sid_rol)?.nombre ||
            "Sin rol",
          creado: user.creacion ? new Date(user.creacion).toLocaleString() : "",
        }))
      );
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const fields = useMemo(
    () => [
      { name: "nombre", label: "Nombres", type: "text", required: true },
      { name: "apellido", label: "Apellidos", type: "text" },
      { name: "correo", label: "Email", type: "email", required: true },
      {
        name: "sid_instituto",
        label: "Institución",
        type: "select",
        options: [option("__new__", "Crear nueva institución"), ...toOptions(instituciones, "id_instituto")],
      },
      {
        name: "sid_rol",
        label: "Rol",
        type: "select",
        options: toOptions(roles, "id_rol"),
      },
      {
        name: "contrasena",
        label: "Contraseña",
        type: "password",
        placeholder: editing ? "Dejar vacío para conservar" : "********",
        required: !editing,
      },
      {
        name: "nueva_institucion_nombre",
        label: "Nombre institución nueva",
        type: "text",
      },
      {
        name: "nueva_institucion_correo",
        label: "Correo institución nueva",
        type: "email",
      },
      {
        name: "nueva_institucion_inicio",
        label: "Inicio licencia nueva",
        type: "date",
      },
    ],
    [instituciones, roles, editing]
  );

  const createAdminRoleForInstitution = async (sidInstituto) => {
    const role = await apiPost("rol", {
      id_rol: generateId(),
      sid_instituto: sidInstituto,
      nombre: "Administrador",
      fecha_registro: formatDate(new Date().toISOString()),
    });

    const privilegios = await apiGet("privilegios");
    await Promise.all(
      privilegios.map((privilegio) =>
        apiPost("privilegios_rol", {
          privilegios_rol_id: generateId(),
          sid_rol: role.id_rol,
          sid_privilegios: privilegio.privilegios_id,
          activo: "si",
        })
      )
    );

    return role.id_rol;
  };

  const resolveInstitutionAndRole = async (values) => {
    if (values.sid_instituto !== "__new__") {
      return { sidInstituto: values.sid_instituto, sidRol: values.sid_rol };
    }

    if (!values.nueva_institucion_nombre || !values.nueva_institucion_correo) {
      throw new Error("Captura nombre y correo para la institución nueva");
    }

    const inicio = values.nueva_institucion_inicio || formatDate(new Date().toISOString());
    const instituto = await apiPost("instituto", {
      id_instituto: generateId(),
      nombre: values.nueva_institucion_nombre,
      correo: values.nueva_institucion_correo,
      fecha_inicio_licencia: inicio,
      fecha_limite: addOneYear(inicio),
      fecha_creacion: todayDateTime(),
    });

    const sidRol = await createAdminRoleForInstitution(instituto.id_instituto);
    return { sidInstituto: instituto.id_instituto, sidRol };
  };

  const handleSubmit = async (values) => {
    try {
      const { sidInstituto, sidRol } = await resolveInstitutionAndRole(values);

      if (!sidInstituto) throw new Error("Selecciona una institución");
      if (!sidRol) throw new Error("Selecciona un rol");

      const payload = {
        id_usuario: editing?.id_usuario || null,
        nombre: values.nombre,
        apellido: values.apellido || "",
        correo: values.correo,
        sid_rol: sidRol,
        creacion: editing?.creacion || todayDateTime(),
        modificacion: todayDateTime(),
        sid_instituto: sidInstituto,
      };

      if (values.contrasena) payload.contrasena = values.contrasena;

      if (editing) {
        await apiPut(`usuario/${editing.id_usuario}`, payload);
        showAlert("success", "Usuario actualizado correctamente");
      } else {
        await apiPost("usuario", payload);
        showAlert("success", "Usuario agregado correctamente");
      }

      setEditing(null);
      await loadUsuarios();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const handleDelete = async (row) => {
    const result = await showAlert("delete", "¿Deseas eliminar este usuario?");
    if (!result.isConfirmed) return;

    try {
      await apiDelete(`usuario/${row.id_usuario}`);
      showAlert("success", "Usuario eliminado correctamente");
      await loadUsuarios();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-4" style={{ paddingLeft: "3px" }}>
        <Form
          title={editing ? "Editar Usuario" : "Registro de Usuario"}
          fields={fields}
          columns={3}
          initialValues={editing || {}}
          submitLabel={editing ? "Actualizar" : "Guardar"}
          onCancel={editing ? () => setEditing(null) : null}
          onSubmit={handleSubmit}
        />

        <Table
          id="userTable"
          title="Usuarios"
          columns={["Instituto", "Nombre", "Apellido", "Correo", "Rol", "Creado"]}
          data={usuarios}
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
