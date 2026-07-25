import React, { useEffect, useRef, useState } from "react";

/**
 * DataUpload
 * - props:
 *   - modules: array de objetos { id, label, uploadUrl?, validateUrl?, saveUrl?, historyUrl?, templateUrl?, requirementsText?, requirementsImages?: [] }
 *   - initialModuleId?: id por defecto
 *   - simulate?: true -> funciona sin backend (por defecto true)
 *
 * Cambios realizados:
 * - Añadí un switch para activar/desactivar el modo test desde la interfaz (no cambio el prop `simulate`, lo tomo como valor inicial).
 * - Reemplacé los <i> con Material Icons donde había íconos.
 * - Mejoré el modal de "Requerimientos": ahora muestra texto e imágenes (si el módulo provee `requirementsImages`).
 * - Aseguro que el cambio de módulos refresque correctamente el historial y la selección.
 * - Añadí pequeños botones útiles (ver/descargar si hay URL) y validaciones mínimas.
 * - Comentarios en primera persona, resumidos y en español.
 */

export default function DataUpload({
  modules = [],
  initialModuleId = null,
  simulate = true,
}) {
  // Inicializo el módulo seleccionado con el id inicial o el primero del array
  const [selectedModuleId, setSelectedModuleId] = useState(
    () => initialModuleId || (modules[0] && modules[0].id) || null
  );

  // Modo "test" controlado desde la UI (valor inicial viene del prop simulate)
  const [isTestMode, setIsTestMode] = useState(Boolean(simulate));

  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1); // 1 = subir, 2 = validar, 3 = guardar
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);
  const fileInputRef = useRef();

  // Obtengo el módulo activo a partir del id seleccionado
  const active = modules.find((m) => m.id === selectedModuleId) || {};

  // Si cambian los módulos desde props y no hay ninguno seleccionado, elijo el primero
  useEffect(() => {
    if (!selectedModuleId && modules && modules.length > 0) {
      setSelectedModuleId(modules[0].id);
    }
    // si cambian los módulos pero el id seleccionado ya no existe, reubico al primero
    if (
      selectedModuleId &&
      !modules.some((m) => m.id === selectedModuleId) &&
      modules.length > 0
    ) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules]);

  // Cada vez que cambia el módulo seleccionado refresco el historial y reseteo selección
  useEffect(() => {
    fetchHistory();
    setFile(null);
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedModuleId]);

  // --- Fetch historial ---
  // Yo intento traer el historial del endpoint si existe y no estoy en modo test.
  const fetchHistory = async () => {
    if (active.historyUrl && !isTestMode) {
      try {
        const res = await fetch(active.historyUrl);
        const json = await res.json();
        setHistory(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setHistory([]);
      }
    } else {
      // Simulación: creo algunos items de ejemplo sin eliminar los reales que pueda tener
      setHistory((prev) => [
        {
          id: `sim-${selectedModuleId}-1`,
          filename: `${selectedModuleId}_archivo_20240424.xlsx`,
          uploadedAt: "2024-04-24",
          status: "GUARDADO",
        },
        ...prev.filter((r) => r.id && !String(r.id).startsWith("sim-")),
      ]);
    }
  };

  // --- Descargar plantilla ---
  // Si hay URL pública uso window.open, si no informo al usuario.
  const handleDownloadTemplate = () => {
    if (active.templateUrl) {
      window.open(active.templateUrl, "_blank");
      return;
    }
    alert("No hay plantilla configurada para este módulo.");
  };

  // --- Subir archivo ---
  // Yo envío el archivo al endpoint si existe y no estoy en modo test; en test creo entrada simulada.
  const handleUpload = async () => {
    if (!file) return alert("Selecciona un archivo primero.");
    setLoading(true);

    try {
      if (active.uploadUrl && !isTestMode) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(active.uploadUrl, { method: "POST", body: fd });
        const json = await res.json();
        const row = {
          id: json.id || Date.now(),
          filename: json.filename || file.name,
          uploadedAt: json.uploadedAt || new Date().toISOString(),
          status: json.status || "EN_VALIDACION",
          fileUrl: json.fileUrl || null,
        };
        setHistory((h) => [row, ...h]);
        setStep(2);
      } else {
        // Simulación
        const row = {
          id: `sim-${Date.now()}`,
          filename: file.name,
          uploadedAt: new Date().toLocaleString(),
          status: "EN_VALIDACION",
        };
        setHistory((h) => [row, ...h]);
        // avanzo visualmente al paso de validación
        setTimeout(() => setStep(2), 600);
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir el archivo.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
    }
  };

  // --- Validar archivo ---
  // Yo pido al backend que valide o simulo la validación. Actualizo el estado del historial.
  const handleValidate = async (rowId) => {
    setLoading(true);
    try {
      if (active.validateUrl && !isTestMode) {
        const res = await fetch(`${active.validateUrl}?id=${rowId}`, {
          method: "POST",
        });
        const json = await res.json();
        setHistory((h) =>
          h.map((r) =>
            r.id === rowId ? { ...r, status: json.status || "VALIDADO" } : r
          )
        );
      } else {
        await new Promise((res) => setTimeout(res, 800));
        setHistory((h) =>
          h.map((r) => (r.id === rowId ? { ...r, status: "VALIDADO" } : r))
        );
      }
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Error en la validación");
    } finally {
      setLoading(false);
    }
  };

  // --- Guardar en BD ---
  // Yo llamo al endpoint de guardado o simulo el guardado y actualizo la tabla.
  const handleSave = async (rowId) => {
    setLoading(true);
    try {
      if (active.saveUrl && !isTestMode) {
        const res = await fetch(`${active.saveUrl}?id=${rowId}`, {
          method: "POST",
        });
        const json = await res.json();
        setHistory((h) =>
          h.map((r) =>
            r.id === rowId ? { ...r, status: json.status || "GUARDADO" } : r
          )
        );
      } else {
        await new Promise((res) => setTimeout(res, 700));
        setHistory((h) =>
          h.map((r) => (r.id === rowId ? { ...r, status: "GUARDADO" } : r))
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar en BD");
    } finally {
      setLoading(false);
    }
  };

  // --- Eliminar historial ---
  // Yo pregunto confirmación y remuevo el registro localmente.
  const handleDeleteHistory = (id) => {
    if (!confirm("Eliminar el registro de carga?")) return;
    setHistory((h) => h.filter((r) => r.id !== id));
  };

  // --- Mostrar/abrir archivo si hay URL ---
  const handleOpenFile = (r) => {
    if (r.fileUrl) {
      window.open(r.fileUrl, "_blank");
      return;
    }
    alert("No hay archivo disponible para descargar/ver.");
  };

  return (
    <div className="card shadow-sm mt-3">
      <div className="card-header bg-white" style={{ borderBottom: "0px" }}>
        <div className="mb-0 p-2 pb-0">
          <h3>Cargar Bases de Datos</h3>
          <p className="text-muted">
            Selecciona el módulo y sube el Excel correspondiente. La interfaz es
            la misma para todos los módulos.
          </p>
        </div>
      </div>

      <div className="card-body">
        {/* 1) Selector módulos (tabs) y botón requerimientos */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <ul className="nav nav-pills">
            {modules.map((m) => (
              <li key={m.id} className="nav-item me-2">
                <button
                  className={`nav-link ${
                    m.id === selectedModuleId ? "active" : ""
                  }`}
                  onClick={() => setSelectedModuleId(m.id)}
                >
                  {m.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {/* Switch para modo test */}
            <div className="form-check form-switch me-2 mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="switchTestMode"
                checked={isTestMode}
                onChange={(e) => setIsTestMode(e.target.checked)}
              />
              <label
                className="form-check-label small "
                htmlFor="switchTestMode"
              >
                Modo test
              </label>
            </div>

            <button
              className="btn btn-secondary me-2 btn-sm mt-1"
              onClick={() => setShowReqModal(true)}
              data-bs-toggle="tooltip"
              title="Requerimientos y plantilla"
              style={{ padding: "5px 20px 0px" }}
            >
              <span className="material-icons me-1 " aria-hidden>
                info
              </span>
              <span style={{ position: "relative", top: "-6px" }}>
                Requerimientos de archivo
              </span>
            </button>

            <button
              className="btn btn-primary btn-sm mt-1"
              style={{ padding: "5px 20px 0px" }}
              onClick={handleDownloadTemplate}
              data-bs-toggle="tooltip"
              title="Descargar plantilla"
            >
              <span className="material-icons me-1 " aria-hidden>
                download
              </span>
              <span style={{ position: "relative", top: "-6px" }}>
                Descargar Plantilla
              </span>
            </button>
          </div>
        </div>

        {/* 2) Paso a paso visual */}
        <div className="row text-center mb-4">
          {[
            { key: 1, icon: "upload", title: "Subir Archivo" },
            { key: 2, icon: "document_scanner", title: "Validar Archivo" },
            { key: 3, icon: "task", title: "Guardar en la Base de Datos" },
          ].map((p) => (
            <div key={p.key} className="col-12 col-md-4 mb-2">
              <div
                className={`p-3 rounded shadow-sm d-flex flex-column align-items-center ${
                  step === p.key ? "border border-2 border-primary" : ""
                }`}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: step === p.key ? "#0d6efd" : "#f0f0f0",
                    color: step === p.key ? "white" : "#333",
                    marginBottom: 8,
                  }}
                >
                  <span className="material-icons">{p.icon}</span>
                </div>
                <small className="text-muted">Paso {p.key}:</small>
                <strong className="mt-1">{p.title}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* 3) Zona de subida */}
        <div
          className="row align-items-center mb-3 pt-3 pb-2"
          style={{ borderTop: "1px dotted black" }}
        >
          <div className="col-md-6">
            <label className="form-label small d-block">Archivo Excel</label>
            <input
              ref={fileInputRef}
              type="file"
              accept={
                active && active.id === "fotos"
                  ? ".zip,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
                  : ".xlsx,.xls,.csv"
              }
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="form-control"
            />
            <div className="form-text">
              Selecciona el archivo que quieres subir para{" "}
              <strong>{active.label}</strong>.
            </div>
          </div>

          <div className="col-md-3 text-end">
            <button
              className="btn btn-success w-100 btn-sm mt-1"
              style={{ padding: "5px 20px 0px" }}
              onClick={handleUpload}
              disabled={!file || loading}
            >
              <span className="material-icons me-1">cloud_upload</span>
              <span style={{ position: "relative", top: "-6px" }}>Subir</span>
            </button>
          </div>

          <div className="col-md-3 text-end">
            <button
              className="btn btn-outline-secondary btn-sm mt-1"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={loading}
              data-bs-toggle="tooltip"
              title="Limpiar selección"
              style={{ padding: "5px 20px 0px" }}
            >
              <span className="material-icons">close</span>
              <span style={{ position: "relative", top: "-6px" }}>Limpiar</span>
            </button>
          </div>
        </div>

        {/* 4) Tabla historial */}
        <div
          className="table-responsive pt-4"
          style={{ borderTop: "1px dotted black" }}
        >
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Fecha De Subida</th>
                <th>Archivo</th>
                <th>Estado</th>
                <th style={{ width: 220 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No hay cargas todavía para{" "}
                    <strong>{active.label || "—"}</strong>.
                  </td>
                </tr>
              )}

              {history.map((r) => (
                <tr key={r.id}>
                  <td style={{ width: 170 }}>{r.uploadedAt}</td>
                  <td>{r.filename}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === "GUARDADO"
                          ? "bg-success"
                          : r.status === "VALIDADO"
                          ? "bg-info"
                          : "bg-secondary"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        style={{ padding: "5px 20px 0px", height: "40px" }}
                        onClick={() => handleValidate(r.id)}
                        disabled={
                          loading ||
                          r.status === "VALIDADO" ||
                          r.status === "GUARDADO"
                        }
                      >
                        <span style={{ position: "relative", top: "-3px" }}>
                          Validar
                        </span>
                      </button>

                      <button
                        className="btn btn-sm btn-outline-success"
                        style={{ padding: "5px 20px 0px", height: "40px" }}
                        onClick={() => handleSave(r.id)}
                        disabled={loading || r.status === "GUARDADO"}
                      >
                        <span style={{ position: "relative", top: "-3px" }}>
                          Guardar
                        </span>
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        style={{ padding: "5px 20px 0px", height: "40px" }}
                        onClick={() => handleDeleteHistory(r.id)}
                      >
                        <span style={{ position: "relative", top: "-3px" }}>
                          Eliminar
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Requerimientos: ahora es un POPUP con texto e imágenes explicativas (si el módulo las provee) */}
        {showReqModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            onClick={() => setShowReqModal(false)}
          >
            <div
              className="modal-dialog modal-lg"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Requerimientos y plantilla — {active.label}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowReqModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Texto explicativo: lo muestro tal cual viene en requirementsText */}
                  <p className="mb-2">
                    {active.requirementsText ||
                      "No hay instrucciones configuradas para este módulo."}
                  </p>

                  {/* Si el módulo provee imágenes explicativas, las muestro en un grid */}
                  {Array.isArray(active.requirementsImages) &&
                    active.requirementsImages.length > 0 && (
                      <div className="row mt-3">
                        {active.requirementsImages.map((src, idx) => (
                          <div key={idx} className="col-12 col-md-6 mb-3">
                            <div className="card">
                              <img
                                src={src}
                                alt={`preview-${idx}`}
                                style={{ width: "100%", objectFit: "contain" }}
                              />
                              <div className="card-body small text-muted">
                                Imagen {idx + 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  <hr />

                  {/* Mostrar enlace de descarga solo como acción adicional, no es el contenido principal del modal */}
                  <button
                    className="btn btn-primary btn-sm mt-1"
                    style={{ padding: "5px 20px 0px" }}
                    onClick={handleDownloadTemplate}
                    data-bs-toggle="tooltip"
                    title="Descargar plantilla"
                  >
                    <span className="material-icons me-1 " aria-hidden>
                      download
                    </span>
                    <span style={{ position: "relative", top: "-6px" }}>
                      Descargar Plantilla
                    </span>
                  </button>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowReqModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
