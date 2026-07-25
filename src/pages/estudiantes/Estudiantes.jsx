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
  toOptions,
} from "../../functions/AdminDataActions";

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [padres, setPadres] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [grados, setGrados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

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
            "Sin institución",
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

  const fields = useMemo(
    () => [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "apellido", label: "Apellidos", type: "text" },
      { name: "matricula", label: "Matrícula", type: "text", required: true },
      {
        name: "sexo",
        label: "Sexo",
        type: "select",
        options: [option("Masculino", "Masculino"), option("Femenino", "Femenino")],
      },
      {
        name: "sid_instituto",
        label: "Institución",
        type: "select",
        required: true,
        options: toOptions(instituciones, "id_instituto"),
      },
      {
        name: "sid_padre",
        label: "Padre",
        type: "select",
        required: true,
        options: padres.map((padre) =>
          option(padre.id_padre, `${padre.nombre || ""} ${padre.apellido || ""}`.trim())
        ),
      },
      {
        name: "sid_nivel",
        label: "Nivel",
        type: "select",
        required: true,
        options: toOptions(niveles, "id_nivel"),
      },
      {
        name: "sid_grado",
        label: "Grado",
        type: "select",
        required: true,
        options: toOptions(grados, "id_grado"),
      },
      {
        name: "sid_grupo",
        label: "Grupo",
        type: "select",
        required: true,
        options: toOptions(grupos, "id_grupo"),
      },
    ],
    [instituciones, padres, niveles, grados, grupos]
  );

  const handleSubmit = async (values) => {
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
      setEditing(null);
      await loadEstudiantes();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const handleDelete = async (row) => {
    const result = await showAlert("delete", "¿Deseas eliminar este estudiante?");
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
        <Form
          title={editing ? "Editar Estudiante" : "Registro de Estudiante"}
          fields={fields}
          columns={3}
          initialValues={editing || {}}
          submitLabel={editing ? "Actualizar" : "Guardar"}
          onCancel={editing ? () => setEditing(null) : null}
          onSubmit={handleSubmit}
        />

        <Table
          id="estudianteTable"
          title="Estudiantes"
          columns={["Nombre", "Apellido", "Matricula", "Instituto", "Padre", "Nivel", "Grado", "Grupo"]}
          data={estudiantes}
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
