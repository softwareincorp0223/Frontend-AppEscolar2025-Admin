export const filtrarDatos = (filtros, dataOriginal) => {
  let filtrado = dataOriginal;

  if (filtros.buscar) {
    const buscarLower = filtros.buscar.toLowerCase();

    filtrado = filtrado.filter((d) =>
      Object.values(d).some((valor) =>
        String(valor).toLowerCase().includes(buscarLower)
      )
    );
  }

  if (filtros.nivel) {
    filtrado = filtrado.filter((d) => d.nivel === filtros.nivel);
  }

  if (filtros.grado) {
    filtrado = filtrado.filter((d) => d.grado === filtros.grado);
  }

  if (filtros.grupo) {
    filtrado = filtrado.filter((d) => d.grupo === filtros.grupo);
  }

  if (filtros.desde) {
    filtrado = filtrado.filter(
      (d) => new Date(d.fecha_y_hora) >= new Date(filtros.desde)
    );
  }

  if (filtros.hasta) {
    filtrado = filtrado.filter(
      (d) => new Date(d.fecha_y_hora) <= new Date(filtros.hasta)
    );
  }

  return filtrado;
};
