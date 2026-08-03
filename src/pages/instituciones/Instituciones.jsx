import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
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

const emptyForm = {
  nombre: "",
  correo: "",
  logo: "",
  banco: "",
  cuenta_banco: "",
  nombre_beneficiario: "",
  descripcion: "",
  fecha_inicio_licencia: "",
  fecha_limite: "",
  asistencia: false,
  pago: false,
  politicas: "",
};

const optionalText = (value) => {
  const text = String(value || "").trim();
  return text || null;
};

export default function Instituciones() {
  const [instituciones, setInstituciones] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [deadlineTouched, setDeadlineTouched] = useState(false);
  const quillContainerRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const fileInputRef = useRef(null);
  
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
          banco: item.banco || "",
          cuenta_banco: item.cuenta_banco || "",
          beneficiario: item.nombre_beneficiario || "",
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

  useEffect(() => {
    if (!quillContainerRef.current || quillInstanceRef.current) return;

    const quill = new Quill(quillContainerRef.current, {
      theme: "snow",
      placeholder: "Descripcion de la institucion",
      modules: {
        toolbar: [
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
          ["clean"],
        ],
      },
    });


    quill.on("text-change", () => {
      setValues((current) => ({
        ...current,
        descripcion: quill.root.innerHTML,
      }));
    });

    quillInstanceRef.current = quill;
  }, []);

  useEffect(() => {
    const nextValues = editing
      ? {
          nombre: editing.nombre || "",
          correo: editing.correo || "",
          logo: editing.logo || "",
          banco: editing.banco || "",
          cuenta_banco: editing.cuenta_banco || "",
          nombre_beneficiario: editing.nombre_beneficiario || "",
          descripcion: editing.descripcion || "",
          fecha_inicio_licencia: formatDate(editing.fecha_inicio_licencia),
          fecha_limite: formatDate(editing.fecha_limite),
          asistencia: false,
          pago: false,
          politicas: "",
        }
      : emptyForm;

    setValues(nextValues);
    setLogoFile(null);
    setLogoPreview(nextValues.logo || "");
    setDeadlineTouched(!!editing?.fecha_limite);

    if (quillInstanceRef.current) {
      quillInstanceRef.current.root.innerHTML = nextValues.descripcion || "";
    }
  }, [editing]);

  useEffect(() => {
    if (!logoFile) return undefined;

    const previewUrl = URL.createObjectURL(logoFile);
    setLogoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [logoFile]);

  const handleChange = (field, value) => {
    setValues((current) => {
      const next = { ...current, [field]: value };

      if (field === "fecha_inicio_licencia" && !deadlineTouched) {
        next.fecha_limite = addOneYear(value);
      }

      return next;
    });
  };

  const handleDateLimitChange = (value) => {
    setDeadlineTouched(true);
    handleChange("fecha_limite", value);
  };

  const resetForm = () => {
    setEditing(null);
    setValues(emptyForm);
    setLogoFile(null);
    setLogoPreview("");
    setDeadlineTouched(false);
    if (quillInstanceRef.current) quillInstanceRef.current.root.innerHTML = "";
    if (fileInputRef.current) { fileInputRef.current.value = ""; }
  };

  const uploadLogo = async () => {
    if (!logoFile) return values.logo || null;

    const formData = new FormData();
    formData.append("files", logoFile);

    const response = await apiPost("drive/upload", formData);
    if (!response.ok || !response.files?.length) {
      throw new Error("No se pudo subir el logo");
    }

    return response.files[0].url;
  };

  const handleSubmit = async (formValues) => {
    const fechaLimite =
      formValues.fecha_limite || addOneYear(formValues.fecha_inicio_licencia);

    try {
      const logoUrl = await uploadLogo();
      const payload = {
        id_instituto: editing?.id_instituto || generateId(),
        nombre: formValues.nombre,
        logo: logoUrl,
        correo: formValues.correo,
        banco: optionalText(formValues.banco),
        cuenta_banco: optionalText(formValues.cuenta_banco),
        nombre_beneficiario: optionalText(formValues.nombre_beneficiario),
        descripcion: optionalText(formValues.descripcion),
        fecha_inicio_licencia: formValues.fecha_inicio_licencia,
        fecha_limite: fechaLimite,
        politicas: null,
        asistencia: 0,
        pago: 0,
        fecha_creacion: editing?.fecha_creacion || todayDateTime(),
      };

      if (editing) {
        await apiPut(`instituto/${editing.id_instituto}`, payload);
        showAlert("success", "Institucion actualizada correctamente");
      } else {
        await apiPost("instituto", payload);
        showAlert("success", "Institucion agregada correctamente");
      }

      resetForm();
      await loadInstituciones();
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const handleDelete = async (row) => {
    const result = await showAlert("delete", "Deseas eliminar esta institucion?");
    if (!result.isConfirmed) return;

    try {
      await apiDelete(`instituto/${row.id_instituto}`);
      showAlert("success", "Institucion eliminada correctamente");
      await loadInstituciones();
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
              {editing ? "Editar Institucion" : "Registro de Institucion"}
            </h2>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit(values);
              }}
            >
              <section className="mb-4">
                <h3 className="fs-6 fw-semibold mb-3">Datos de la escuela</h3>
                <div className="row g-3">
                  <div className="col-12 col-lg-4">
                    <label className="form-label" htmlFor="nombre">
                      Nombre <span className="text-danger">*</span>
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

                  <div className="col-12 col-lg-4">
                    <label className="form-label" htmlFor="correo">
                      Correo de afiliacion <span className="text-danger">*</span>
                    </label>
                    <input
                      id="correo"
                      className="form-control"
                      type="email"
                      placeholder="ejemplo@gmail.com"
                      value={values.correo}
                      onChange={(event) => handleChange("correo", event.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 col-lg-4">
                    <label className="form-label" htmlFor="logo">
                      Logo
                    </label>
                    <input
                      ref={fileInputRef}
                      id="logo"
                      className="form-control"
                      type="file"
                      accept="image/*"
                      onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                    />
                    {logoPreview && (
                      <div className="mt-3 border rounded p-2 d-inline-flex align-items-center justify-content-center">
                        <img
                          src={logoPreview}
                          alt="Logo de la institucion"
                          style={{ width: 96, height: 96, objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Descripcion</label>
                    <div style={{height: "150px"}} className="institucion-description-editor" ref={quillContainerRef} />
                  </div>
                </div>
              </section>

              <section className="mb-4">
                <h3 className="fs-6 fw-semibold mb-3">Datos de pago</h3>
                <div className="row g-3">
                  <div className="col-12 col-lg-4">
                    <label className="form-label" htmlFor="banco">
                      Banco
                    </label>
                    <input
                      id="banco"
                      className="form-control"
                      type="text"
                      value={values.banco}
                      onChange={(event) => handleChange("banco", event.target.value)}
                    />
                  </div>

                  <div className="col-12 col-lg-4">
                    <label className="form-label" htmlFor="cuenta_banco">
                      Cuenta de banco
                    </label>
                    <input
                      id="cuenta_banco"
                      className="form-control"
                      type="text"
                      value={values.cuenta_banco}
                      onChange={(event) => handleChange("cuenta_banco", event.target.value)}
                    />
                  </div>

                  <div className="col-12 col-lg-4">
                    <label className="form-label" htmlFor="nombre_beneficiario">
                      Beneficiario
                    </label>
                    <input
                      id="nombre_beneficiario"
                      className="form-control"
                      type="text"
                      value={values.nombre_beneficiario}
                      onChange={(event) =>
                        handleChange("nombre_beneficiario", event.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="mb-4">
                <h3 className="fs-6 fw-semibold mb-3">Fechas y licencia</h3>
                <div className="row g-3">
                  <div className="col-12 col-lg-4">
                    <label className="form-label" htmlFor="fecha_inicio_licencia">
                      Inicio de licencia <span className="text-danger">*</span>
                    </label>
                    <input
                      id="fecha_inicio_licencia"
                      className="form-control"
                      type="date"
                      value={values.fecha_inicio_licencia}
                      onChange={(event) =>
                        handleChange("fecha_inicio_licencia", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-12 col-lg-4">
                    <label className="form-label" htmlFor="fecha_limite">
                      Fecha limite <span className="text-danger">*</span>
                    </label>
                    <input
                      id="fecha_limite"
                      className="form-control"
                      type="date"
                      value={values.fecha_limite}
                      onChange={(event) => handleDateLimitChange(event.target.value)}
                      required
                    />
                  </div>
                </div>
              </section>

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
          id="institucionTable"
          title="Instituciones"
          columns={[
            "Nombre",
            "Inicio Licencia",
            "Fecha Limite",
            "Correo Afiliacion",
            "Creado",
          ]}
          data={instituciones}
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
                  className: "btn-outline-danger  px-2 py-1",
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
