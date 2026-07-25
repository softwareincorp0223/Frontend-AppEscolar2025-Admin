import React, { useState, useRef, useEffect } from "react";

export default function Filter({ enabledFilters = [], nombreFiltro }) {
  //Helper para saber qué mostrar
  const mostrar = (campo) => enabledFilters.includes(campo);

  /*const [filtros, setFiltros] = useState({
    buscar: "",
    desde: "",
    hasta: "",
    nivel: "",
    grado: "",
    grupo: "",
  });*/

  const [showRange, setShowRange] = useState(false);
  const popoverRef = useRef(null);

  // 🔹 Cerrar popover al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowRange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔸 Cada cambio de filtro notifica al padre
  /*useEffect(() => {
    onFilterChange(filtros);
  }, [filtros]);

  // 🔸 Limpiar todos los filtros
  const limpiarFiltros = () => {
    const filtrosVacios = {
      buscar: "",
      desde: "",
      hasta: "",
      nivel: "",
      grado: "",
      grupo: "",
    };
    setFiltros(filtrosVacios);
    onFilterChange(filtrosVacios);
  };
*/
  return (
    <div className="col-12 col-md d-flex gap-2 mb-3 justify-content-end align-items-center">
      <p className="mb-2">
        <span
          style={{
            position: "relative",
            top: "-3px",
            fontWeight: "bold",
          }}
        >
          Filtro {nombreFiltro}
        </span>
        <span
          className="material-icons"
          style={{
            fontSize: "30px",
            position: "relative",
            top: "6px",
          }}
        >
          arrow_right
        </span>
      </p>

      {/* Buscar */}
      {mostrar("buscar") && (
        <div className="col-12 col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar"
            //value={filtros.buscar}
            //onChange={(e) =>
            //  setFiltros((prev) => ({ ...prev, buscar: e.target.value }))
            //}
          />
        </div>
      )}

      {/*Rango de fechas */}
      {mostrar("rango") && (
        <div className="col-12 col-md-1 position-relative" ref={popoverRef}>
          <button
            type="button"
            className="w-100"
            onClick={() => setShowRange((prev) => !prev)}
            style={{
              padding: "4px 0 5px 0",
              border: "1px solid #c1c1c1",
              borderRadius: "5px",
              backgroundColor: "white",
            }}
          >
            Fechas
          </button>
          {showRange && (
            <div
              className="position-absolute bg-white p-3 rounded shadow border"
              style={{ top: "110%", left: 0, zIndex: 10, minWidth: 250 }}
            >
              <div className="mb-2">
                <label className="form-label small">Desde:</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  //value={filtros.desde}
                  //onChange={(e) =>
                  //  setFiltros((prev) => ({ ...prev, desde: e.target.value }))
                  //}
                />
              </div>
              <div className="mb-2">
                <label className="form-label small">Hasta:</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  //value={filtros.hasta}
                  //onChange={(e) =>
                  //  setFiltros((prev) => ({ ...prev, hasta: e.target.value }))
                  //}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nivel */}
      {mostrar("nivel") && (
        <div className="col-12 col-md-1">
          <select
            className="form-select"
            //</div>value={filtros.nivel}
            //onChange={(e) =>
            //  setFiltros((prev) => ({ ...prev, nivel: e.target.value }))
            //}
          >
            <option value="">Nivel...</option>
            <option value="Primaria">Primaria</option>
            <option value="Secundaria">Secundaria</option>
            <option value="Preparatoria">Preparatoria</option>
          </select>
        </div>
      )}

      {mostrar("grado") && (
        <div className="col-12 col-md-1">
          <select
            className="form-select"
            //value={filtros.grado}
            //onChange={(e) =>
            //  setFiltros((prev) => ({ ...prev, grado: e.target.value }))
            //}
          >
            <option value="">Grado...</option>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      )}

      {mostrar("grupo") && (
        <div className="col-12 col-md-1">
          <select
            className="form-select"
            //value={filtros.grupo}
            //onChange={(e) =>
            //  setFiltros((prev) => ({ ...prev, grupo: e.target.value }))
            //}
          >
            <option value="">Grupo...</option>
            {["A", "B", "C", "D"].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Botón limpiar con tooltip nativo */}
      <div className="col-12 col-md-1 d-flex align-items-center">
        <button
          //onClick={limpiarFiltros}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Limpiar filtro"
          style={{
            padding: "4px 0 4px 0",
            border: "0px",
            borderRadius: "5px",
            backgroundColor: "red",
            width: "100%",
          }}
        >
          <span
            className="material-icons"
            style={{
              fontSize: "20px",
              position: "relative",
              top: "3px",
              color: "white",
            }}
          >
            restart_alt
          </span>
        </button>
      </div>
    </div>
  );
}
