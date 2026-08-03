import React, { useEffect, useMemo, useState } from "react";
import $ from "jquery";
import select2Factory from "select2";
import "select2/dist/css/select2.min.css";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import ActionButtons from "../../components/ActionButtons";
import { showAlert } from "../../functions/Alerts";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  todayDateTime,
} from "../../functions/AdminDataActions";

select2Factory(window, $);

const emptyForm = {
  nombre: "",
  apellido: "",
  correo: "",
  sid_instituto: "",
  sid_rol: "",
  contrasena: "",
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState(emptyForm);

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
            "Sin institucion",
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

  const filteredRoles = useMemo(
    () => roles.filter((role) => role.sid_instituto === values.sid_instituto),
    [roles, values.sid_instituto]
  );

  const handleChange = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "sid_instituto" ? { sid_rol: "" } : {}),
    }));
  };

  useEffect(() => {
    const selects = $(".usuarios-select2-control");

    selects.each(function initSelect2() {
      const select = $(this);

      if (select.data("select2")) {
        select.select2("destroy");
      }

      select.select2({
        width: "100%",
        placeholder: "Seleccione...",
        allowClear: false,
      });

      select.on("change.usuarios-select2", (event) => {
        handleChange(event.target.name, event.target.value);
      });
    });

    return () => {
      selects.each(function destroySelect2() {
        const select = $(this);
        select.off("change.usuarios-select2");
        if (select.data("select2")) {
          select.select2("destroy");
        }
      });
    };
  }, [instituciones, filteredRoles]);

  useEffect(() => {
    $(".usuarios-select2-control").each(function syncSelect2Value() {
      const select = $(this);
      const name = select.attr("name");
      select.val(values[name] || "").trigger("change.select2");
    });
  }, [values]);

  useEffect(() => {
    if (!editing) {
      setValues(emptyForm);
      return;
    }

    setValues({
      nombre: editing.nombre || "",
      apellido: editing.apellido || "",
      correo: editing.correo || "",
      sid_instituto: editing.sid_instituto || "",
      sid_rol: editing.sid_rol || "",
      contrasena: "",
    });
  }, [editing]);

  const resetForm = () => {
    setEditing(null);
    setValues(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!values.sid_instituto) throw new Error("Selecciona una institucion");
      if (!values.sid_rol) throw new Error("Selecciona un rol");

      const payload = {
        id_usuario: editing?.id_usuario || null,
        nombre: values.nombre,
        apellido: values.apellido || "",
        correo: values.correo,
        sid_rol: values.sid_rol,
        creacion: editing?.creacion || todayDateTime(),
        modificacion: todayDateTime(),
        sid_instituto: values.sid_instituto,
      };

      if (values.contrasena) payload.contrasena = values.contrasena;

      if (editing) {
        await apiPut(`usuario/${editing.id_usuario}`, payload);
        showAlert("success", "Usuario actualizado correctamente");
      } else {
        await apiPost("usuario", payload);
        showAlert("success", "Usuario agregado correctamente");
      }

      resetForm();
      await loadUsuarios();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const handleDelete = async (row) => {
    const result = await showAlert("delete", "Deseas eliminar este usuario?");
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
        <div className="card mb-4">
          <div className="card-body p-4">
            <h2 className="card-title fs-5 mb-4">
              {editing ? "Editar Usuario" : "Registro de Usuario"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="nombre">
                    Nombres
                  </label>
                  <input
                    id="nombre"
                    className="form-control"
                    type="text"
                    value={values.nombre}
                    onChange={(event) => handleChange("nombre", event.target.value)}
                    required
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="apellido">
                    Apellidos
                  </label>
                  <input
                    id="apellido"
                    className="form-control"
                    type="text"
                    value={values.apellido}
                    onChange={(event) => handleChange("apellido", event.target.value)}
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="correo">
                    Email
                  </label>
                  <input
                    id="correo"
                    className="form-control"
                    type="email"
                    value={values.correo}
                    onChange={(event) => handleChange("correo", event.target.value)}
                    required
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="sid_instituto">
                    Institucion
                  </label>
                  <select
                    id="sid_instituto"
                    name="sid_instituto"
                    className="form-select usuarios-select2-control"
                    value={values.sid_instituto}
                    onChange={(event) =>
                      handleChange("sid_instituto", event.target.value)
                    }
                    required
                  >
                    <option value="">Seleccione...</option>
                    {instituciones.map((institucion) => (
                      <option
                        key={institucion.id_instituto}
                        value={institucion.id_instituto}
                      >
                        {institucion.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="sid_rol">
                    Rol
                  </label>
                  <select
                    id="sid_rol"
                    name="sid_rol"
                    className="form-select usuarios-select2-control"
                    value={values.sid_rol}
                    onChange={(event) => handleChange("sid_rol", event.target.value)}
                    required
                    disabled={!values.sid_instituto}
                  >
                    <option value="">Seleccione...</option>
                    {filteredRoles.map((role) => (
                      <option key={role.id_rol} value={role.id_rol}>
                        {role.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="contrasena">
                    Contrasena
                  </label>
                  <input
                    id="contrasena"
                    className="form-control"
                    type="password"
                    placeholder={editing ? "Dejar vacio para conservar" : "********"}
                    value={values.contrasena}
                    onChange={(event) => handleChange("contrasena", event.target.value)}
                    required={!editing}
                  />
                </div>
              </div>

              <div className="text-end d-flex justify-content-end gap-2">
                {editing && (
                  <button
                    className="btn btn-outline-secondary py-2"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancelar
                  </button>
                )}
                <button className="btn btn-success py-2" type="submit">
                  {editing ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>

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
                {
                  label: "Editar",
                  icon: "edit",
                  className: "btn-outline-primary mb-1 px-2 py-1",
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
