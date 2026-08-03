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
  generateQrCode,
} from "../../functions/AdminDataActions";

select2Factory(window, $);

const emptyForm = {
  nombre: "",
  apellido: "",
  matricula: "",
  sexo: "",
  sid_instituto: "",
  sid_padre: "",
  sid_nivel: "",
  sid_grado: "",
  sid_grupo: "",
};

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [padres, setPadres] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [grados, setGrados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState(emptyForm);

  const loadEstudiantes = async () => {
    setLoading(true);
    try {
      const [
        alumnosApi,
        institutosApi,
        padresApi,
        nivelesApi,
        gradosApi,
        gruposApi,
      ] = await Promise.all([
        apiGet("alumno?include=Instituto,Nivel,Grado,Grupo"),
        apiGet("instituto"),
        apiGet("padre"),
        apiGet("nivel"),
        apiGet("grado"),
        apiGet("grupo"),
      ]);

      setInstituciones(institutosApi);
      setPadres(padresApi);
      setNiveles(nivelesApi);
      setGrados(gradosApi);
      setGrupos(gruposApi);

      setEstudiantes(
        alumnosApi.map((alumno) => ({
          ...alumno,
          instituto:
            alumno.Instituto?.nombre ||
            institutosApi.find((item) => item.id_instituto === alumno.sid_instituto)?.nombre ||
            "Sin institucion",
          padre:
            padresApi.find((item) => item.id_padre === alumno.sid_padre)?.nombre ||
            "Sin padre",
          nivel:
            alumno.Nivel?.nombre ||
            nivelesApi.find((item) => item.id_nivel === alumno.sid_nivel)?.nombre ||
            "Sin nivel",
          grado:
            alumno.Grado?.nombre ||
            gradosApi.find((item) => item.id_grado === alumno.sid_grado)?.nombre ||
            "Sin grado",
          grupo:
            alumno.Grupo?.nombre ||
            gruposApi.find((item) => item.id_grupo === alumno.sid_grupo)?.nombre ||
            "Sin grupo",
        }))
      );
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstudiantes();
  }, []);

  useEffect(() => {
    if (!editing) {
      setValues(emptyForm);
      return;
    }

    setValues({
      nombre: editing.nombre || "",
      apellido: editing.apellido || "",
      matricula: editing.matricula || "",
      sexo: editing.sexo || "",
      sid_instituto: editing.sid_instituto || "",
      sid_padre: editing.sid_padre || "",
      sid_nivel: editing.sid_nivel || "",
      sid_grado: editing.sid_grado || "",
      sid_grupo: editing.sid_grupo || "",
    });
  }, [editing]);

  const filteredPadres = useMemo(
    () => padres.filter((padre) => padre.sid_instituto === values.sid_instituto),
    [padres, values.sid_instituto]
  );

  const filteredNiveles = useMemo(
    () => niveles.filter((nivel) => nivel.sid_instituto === values.sid_instituto),
    [niveles, values.sid_instituto]
  );

  const filteredGrados = useMemo(
    () => grados.filter((grado) => grado.sid_nivel === values.sid_nivel),
    [grados, values.sid_nivel]
  );

  const filteredGrupos = useMemo(
    () => grupos.filter((grupo) => grupo.sid_grado === values.sid_grado),
    [grupos, values.sid_grado]
  );

  const handleChange = (field, value) => {
    setValues((current) => {
      const next = { ...current, [field]: value };

      if (field === "sid_instituto") {
        next.sid_padre = "";
        next.sid_nivel = "";
        next.sid_grado = "";
        next.sid_grupo = "";
      }

      if (field === "sid_nivel") {
        next.sid_grado = "";
        next.sid_grupo = "";
      }

      if (field === "sid_grado") {
        next.sid_grupo = "";
      }

      return next;
    });
  };

  useEffect(() => {
    const selects = $(".estudiantes-select2-control");

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

      select.on("change.estudiantes-select2", (event) => {
        handleChange(event.target.name, event.target.value);
      });
    });

    return () => {
      selects.each(function destroySelect2() {
        const select = $(this);
        select.off("change.estudiantes-select2");
        if (select.data("select2")) {
          select.select2("destroy");
        }
      });
    };
  }, [instituciones, filteredPadres, filteredNiveles, filteredGrados, filteredGrupos]);

  useEffect(() => {
    $(".estudiantes-select2-control").each(function syncSelect2Value() {
      const select = $(this);
      const name = select.attr("name");
      select.val(values[name] || "").trigger("change.select2");
    });
  }, [values]);

  const resetForm = () => {
    setEditing(null);
    setValues(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      id_alumno: editing?.id_alumno || null,
      nombre: values.nombre,
      apellido: values.apellido || "",
      matricula: values.matricula,
      sexo: values.sexo || "",
      codigo_qr: editing?.codigo_qr || generateQrCode(),
      sid_nivel: values.sid_nivel,
      sid_grado: values.sid_grado,
      sid_grupo: values.sid_grupo,
      sid_padre: values.sid_padre,
      sid_instituto: values.sid_instituto,
      foto: editing?.foto || "",
      nombre_contacto: editing?.nombre_contacto || "Sin datos",
      telefono_contacto: editing?.telefono_contacto || "Sin datos",
      alergias: editing?.alergias || "Sin datos",
    };

    try {
      if (editing) {
        await apiPut(`alumno/${editing.id_alumno}`, payload);
        showAlert("success", "Estudiante actualizado correctamente");
      } else {
        await apiPost("alumno", payload);
        showAlert("success", "Estudiante agregado correctamente");
      }
      resetForm();
      await loadEstudiantes();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const handleDelete = async (row) => {
    const result = await showAlert("delete", "Deseas eliminar este estudiante?");
    if (!result.isConfirmed) return;

    try {
      await apiDelete(`alumno/${row.id_alumno}`);
      showAlert("success", "Estudiante eliminado correctamente");
      await loadEstudiantes();
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
              {editing ? "Editar Estudiante" : "Registro de Estudiante"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="nombre">
                    Nombre
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
                  <label className="form-label" htmlFor="matricula">
                    Matricula
                  </label>
                  <input
                    id="matricula"
                    className="form-control"
                    type="text"
                    value={values.matricula}
                    onChange={(event) => handleChange("matricula", event.target.value)}
                    required
                  />
                </div>

                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="sexo">
                    Sexo
                  </label>
                  <select
                    id="sexo"
                    name="sexo"
                    className="form-select estudiantes-select2-control"
                    value={values.sexo}
                    onChange={(event) => handleChange("sexo", event.target.value)}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>

                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="sid_instituto">
                    Institucion
                  </label>
                  <select
                    id="sid_instituto"
                    name="sid_instituto"
                    className="form-select estudiantes-select2-control"
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
                  <label className="form-label" htmlFor="sid_padre">
                    Padre
                  </label>
                  <select
                    id="sid_padre"
                    name="sid_padre"
                    className="form-select estudiantes-select2-control"
                    value={values.sid_padre}
                    onChange={(event) => handleChange("sid_padre", event.target.value)}
                    required
                    disabled={!values.sid_instituto}
                  >
                    <option value="">Seleccione...</option>
                    {filteredPadres.map((padre) => (
                      <option key={padre.id_padre} value={padre.id_padre}>
                        {`${padre.nombre || ""} ${padre.apellido || ""}`.trim()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="sid_nivel">
                    Nivel
                  </label>
                  <select
                    id="sid_nivel"
                    name="sid_nivel"
                    className="form-select estudiantes-select2-control"
                    value={values.sid_nivel}
                    onChange={(event) => handleChange("sid_nivel", event.target.value)}
                    required
                    disabled={!values.sid_instituto}
                  >
                    <option value="">Seleccione...</option>
                    {filteredNiveles.map((nivel) => (
                      <option key={nivel.id_nivel} value={nivel.id_nivel}>
                        {nivel.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="sid_grado">
                    Grado
                  </label>
                  <select
                    id="sid_grado"
                    name="sid_grado"
                    className="form-select estudiantes-select2-control"
                    value={values.sid_grado}
                    onChange={(event) => handleChange("sid_grado", event.target.value)}
                    required
                    disabled={!values.sid_nivel}
                  >
                    <option value="">Seleccione...</option>
                    {filteredGrados.map((grado) => (
                      <option key={grado.id_grado} value={grado.id_grado}>
                        {grado.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-4">
                  <label className="form-label" htmlFor="sid_grupo">
                    Grupo
                  </label>
                  <select
                    id="sid_grupo"
                    name="sid_grupo"
                    className="form-select estudiantes-select2-control"
                    value={values.sid_grupo}
                    onChange={(event) => handleChange("sid_grupo", event.target.value)}
                    required
                    disabled={!values.sid_grado}
                  >
                    <option value="">Seleccione...</option>
                    {filteredGrupos.map((grupo) => (
                      <option key={grupo.id_grupo} value={grupo.id_grupo}>
                        {grupo.nombre}
                      </option>
                    ))}
                  </select>
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
          id="estudianteTable"
          title="Estudiantes"
          columns={[
            "Nombre",
            "Apellido",
            "Matricula",
            "Instituto",
            "Padre",
            "Nivel",
            "Grado",
            "Grupo",
          ]}
          data={estudiantes}
          loading={loading}
          renderActions={(row) => (
            <ActionButtons
              row={row}
              actions={[
                {
                  label: "Editar",
                  icon: "edit",
                  className: "btn-outline-primary",
                  onClick: () => setEditing(row),
                },
                {
                  label: "Eliminar",
                  icon: "delete",
                  className: "btn-outline-danger",
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
