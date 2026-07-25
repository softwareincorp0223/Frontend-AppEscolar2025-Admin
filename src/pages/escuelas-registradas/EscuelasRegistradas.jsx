import React from "react";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import Form from "../../components/Form";
import { showAlert } from "../../functions/Alerts";
import ActionButtons from "../../components/ActionButtons";
import TableButtons from "../../components/TableButtons";

export default function EscuelasRegistradas() {
  const institucion = [
    { institucion_id: "1", nombre: "nombre", telefono: "722222222", relacion: "Coordinador", correo: "ervmora29@gmail.com" },
    { institucion_id: "1", nombre: "nombre", telefono: "722222222", relacion: "Coordinador", correo: "ervmora29@gmail.com" },
    { institucion_id: "1", nombre: "nombre", telefono: "722222222", relacion: "Coordinador", correo: "ervmora29@gmail.com" },
    { institucion_id: "1", nombre: "nombre", telefono: "722222222", relacion: "Coordinador", correo: "ervmora29@gmail.com" },
    { institucion_id: "1", nombre: "nombre", telefono: "722222222", relacion: "Coordinador", correo: "ervmora29@gmail.com" },
    { institucion_id: "1", nombre: "nombre", telefono: "722222222", relacion: "Coordinador", correo: "ervmora29@gmail.com" },
    { institucion_id: "1", nombre: "nombre", telefono: "722222222", relacion: "Coordinador", correo: "ervmora29@gmail.com" },
  ];

  return (
    <Layout>
      {/* Contenido */}
      <div
        className="container-fluid py-4 py-lg-4"
        style={{ paddingLeft: "3px" }}
      >
        <div className="row g-4 g-lg-4">

          <div className="col-lg-12">

            {/* Tabla Instituciones */}
            <Table
              id="escuelasTable"
              title="Escuelas Registradas"
              columns={["Nombre", "Telefono", "Relación", "Correo"]}
              data={institucion}
              renderActions={(row) => (
                <ActionButtons row={row} actions={["delete", "view", "message"]} />
              )}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
