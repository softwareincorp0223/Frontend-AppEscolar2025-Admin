import React, { useEffect, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "material-icons/iconfont/material-icons.css";
import "../index.css";

export default function Table({
  id,
  title,
  columns,
  data,
  renderActions,
  headerButtons,
  loading = false,
}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const selectedIdsRef = useRef(new Set());

  const normalizeKey = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;

    return data.filter((row) =>
      columns.some((col) => {
        if (col.toLowerCase() === "input") return false;
        const value = row[normalizeKey(col)];
        return String(value ?? "").toLowerCase().includes(term);
      })
    );
  }, [columns, data, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const visiblePages = useMemo(() => {
    const pages = new Set([1, totalPages, currentPage]);

    if (currentPage > 1) pages.add(currentPage - 1);
    if (currentPage < totalPages) pages.add(currentPage + 1);

    return Array.from(pages).sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [currentPage, filteredData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, data]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSelect = (checked, idValue) => {
    if (checked) {
      selectedIdsRef.current.add(idValue);
    } else {
      selectedIdsRef.current.delete(idValue);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <h2 className="card-title fs-5 mb-0">{title}</h2>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <input
              className="form-control form-control-sm"
              type="search"
              placeholder="Buscar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ width: 220 }}
            />
            {headerButtons && headerButtons()}
          </div>
        </div>

        <div className="table-responsive">
          <table
            id={id}
            className="table table-hover align-middle mb-0 uniform-table"
          >
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="fw-medium text-secondary">
                    {col.toLowerCase() === "input" ? (
                      <input
                        type="checkbox"
                        onChange={(event) => {
                          const checked = event.target.checked;
                          paginatedData.forEach((row) =>
                            handleSelect(checked, row.mensaje_id)
                          );
                        }}
                      />
                    ) : (
                      col
                    )}
                  </th>
                ))}
                {renderActions && (
                  <th className="text-end fw-medium text-secondary">Acciones</th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="py-5 text-center text-secondary"
                    colSpan={columns.length + (renderActions ? 1 : 0)}
                  >
                    <div className="spinner-border text-primary me-2" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    Cargando datos...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    className="py-4 text-center text-secondary"
                    colSpan={columns.length + (renderActions ? 1 : 0)}
                  >
                    Sin datos para mostrar
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={
                      row.id ||
                      row.id_instituto ||
                      row.id_usuario ||
                      row.id_padre ||
                      row.id_admin ||
                      idx
                    }
                  >
                    {columns.map((col, i) => {
                      const key = normalizeKey(col);

                      if (col.toLowerCase() === "input") {
                        return (
                          <td key={i} className="py-3 text-center">
                            <input
                              type="checkbox"
                              data-id={row.mensaje_id}
                              onChange={(event) =>
                                handleSelect(event.target.checked, row.mensaje_id)
                              }
                            />
                          </td>
                        );
                      }

                      return (
                        <td key={i} className="py-3">
                          {row[key]}
                        </td>
                      );
                    })}

                    {renderActions && (
                      <td className="text-end py-3">{renderActions(row)}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-3">
            <span className="text-secondary small">
              Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
              {Math.min(currentPage * pageSize, filteredData.length)} de{" "}
              {filteredData.length} registros
            </span>

            <nav aria-label={`Paginacion ${title}`}>
              <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-end">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  >
                    Anterior
                  </button>
                </li>

                {visiblePages.map((page, index) => (
                  <React.Fragment key={page}>
                    {index > 0 && page - visiblePages[index - 1] > 1 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li
                      className={`page-item ${page === currentPage ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        type="button"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  </React.Fragment>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
