import React, { useEffect, useState } from "react";
import $ from "jquery";
import select2Factory from "select2";
import "select2/dist/css/select2.min.css";

select2Factory(window, $);

export default function Form({
  title,
  fields,
  onSubmit,
  columns = 2,
  initialValues = {},
  submitLabel = "Guardar",
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues || {});
  }, [initialValues]);

  useEffect(() => {
    const selects = $(".select2-control");

    selects.each(function initSelect2() {
      const select = $(this);

      if (select.data("select2")) {
        select.select2("destroy");
      }

      select.select2({
        width: "100%",
        placeholder: select.data("placeholder") || "Seleccione...",
        allowClear: !select.prop("required"),
      });

      select.on("change.admin-select2", (event) => {
        handleChange(event.target.name, event.target.value);
      });
    });

    return () => {
      selects.each(function destroySelect2() {
        const select = $(this);
        select.off("change.admin-select2");
        if (select.data("select2")) {
          select.select2("destroy");
        }
      });
    };
  }, [fields]);

  useEffect(() => {
    $(".select2-control").each(function syncSelect2Value() {
      const select = $(this);
      const name = select.attr("name");
      select.val(values[name] || "").trigger("change.select2");
    });
  }, [values]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(values);
  };

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const colClass = `col-md-${12 / columns} mb-4`;

  return (
    <div className="card mb-4 mb-lg-4">
      <div className="card-body p-4 p-lg-4">
        <h2 className="card-title fs-5 mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            {fields.map((field, index) => (
              <div className={colClass} key={index}>
                <label className="form-label" htmlFor={field.name}>
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    className="form-select select2-control"
                    id={field.name}
                    name={field.name}
                    value={values[field.name] || ""}
                    required={field.required}
                    data-placeholder={field.placeholder || "Seleccione..."}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    <option value="" disabled={field.required}>
                      {field.placeholder || "Seleccione..."}
                    </option>
                    {field.options?.map((option, i) => (
                      <option
                        key={i}
                        value={typeof option === "object" ? option.value : option}
                      >
                        {typeof option === "object" ? option.label : option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-control"
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    type={field.type || "text"}
                    value={values[field.name] || ""}
                    required={field.required}
                    readOnly={field.readOnly}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-end d-flex justify-content-end gap-2">
            {onCancel && (
              <button
                className="btn btn-outline-secondary py-2"
                type="button"
                onClick={onCancel}
              >
                Cancelar
              </button>
            )}
            <button className="btn btn-success py-2" type="submit">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
