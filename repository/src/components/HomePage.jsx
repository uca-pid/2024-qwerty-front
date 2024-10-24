import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TransaccionesTable from "./TransaccionesTable";
import ModalForm from "./ModalForm";
import "./styles/HomePage.css";
import AlertPending from "./AlertPending";
import MonthlyGraphic from "./MonthlyGraphic";
import Header from "./Header";
import ModalAskPayment from "./ModalAskPayment";
import ModalSendPayment from "./ModalSendPayment";

function HomePage() {
  const [transacciones, setTransacciones] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [showNoTransactions, setShowNoTransactions] = useState(false);
  const [valor, setValor] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState(null);
  const [edit, setEdit] = useState(false);
  const [tipoGasto, setTipoGasto] = useState("Efectivo");
  const [tranPendiente, setTranPendiente] = useState({});
  const [categoria, setCategoria] = useState("");
  const [payCategories, setPayCategories] = useState([]);
  const [payCategoriesDefault, setPayCategoriesDefault] = useState([
    {
      value: "Impuestos y Servicios",
      label: "Impuestos y Servicios",
      iconPath: "fa-solid fa-file-invoice-dollar",
    },
    {
      value: "Entretenimiento y Ocio",
      label: "Entretenimiento y Ocio",
      iconPath: "fa-solid fa-ticket",
    },
    {
      value: "Hogar y Mercado",
      label: "Hogar y Mercado",
      iconPath: "fa-solid fa-house",
    },
    { value: "Antojos", label: "Antojos", iconPath: "fa-solid fa-candy-cane" },
    {
      value: "Electrodomesticos",
      label: "Electrodomesticos",
      iconPath: "fa-solid fa-blender",
    },
    { value: "Clase", label: "Clase", iconPath: "fa-solid fa-chalkboard-user" },
    {
      value: "Ingreso de Dinero",
      label: "Ingreso de Dinero",
      iconPath: "fa-solid fa-money-bill",
    },
  ]);
  const [payOptions, setPayOptions] = useState([
    { value: "Tarjeta de credito", label: "Tarjeta de credito" },
    { value: "Tarjeta de Debito", label: "Tarjeta de debito" },
    { value: "Efectivo", label: "Efectivo" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState({
    value: "Efectivo",
    label: "Efectivo",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transaccionId, setTransaccionId] = useState(null);
  const navigate = useNavigate();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [categoriasConTodas, setCategoriasConTodas] = useState([]);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);
  const [pendTran, setPendTran] = useState(false);
  const [filtroMes, setFiltroMes] = useState(""); // Ej: "10" para octubre
  const [filtroAno, setFiltroAno] = useState("2024"); //
  const [filterEmpty, setFilterEmpty] = useState(false);

  useEffect(() => {
    getTransacciones(categoriaSeleccionada);
  }, [categoriaSeleccionada, filtroMes, filtroAno]);
  useEffect(() => {
    if (payCategories.length > 0) {
      setCategoriasConTodas([
        { value: "Todas", label: "Todas las Categorias" },
        ...payCategories,
      ]);
    }
    //getTransacciones(categoriaSeleccionada);
  }, [payCategories]);
  useEffect(() => {
    fetchPersonalTipoGastos();
  }, []);

  const showTransactionsPendientes = async () => {
    const token = localStorage.getItem("token");
    console.log("buscando pendientes");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-2.onrender.com/api/transaccionesPendientes/user",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data[0] != null) {
        setTranPendiente(data[0]);
        console.log(data[0]);
        setPendTran(true);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoadingFilter(false);
    }
  };

  const fetchPersonalTipoGastos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-2.onrender.com/api/personal-tipo-gasto",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const customOptions = data.map((tipo) => ({
          label: tipo.nombre,
          value: tipo.nombre,
        }));
        setPayOptions([...payOptions, ...customOptions]);
      }
    } catch (error) {
      console.error(
        "Error al obtener los tipos de gasto personalizados:",
        error
      );
    }
  };
  const checkIfValidToken = async (token) => {
    try {
      const response = await fetch(
        "https://two024-qwerty-back-2.onrender.com/api/transacciones/userTest",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        //entra aca si pasa la autenticacion
        return true; //si esta activo tengo que devolver true
      } else {
        localStorage.removeItem("token");
        return false;
      }
    } catch (error) {
      localStorage.removeItem("token");
      return false;
    }
  };
  const getTransacciones = async (filtrado = "Todas") => {
    const token = localStorage.getItem("token");
    if (await checkIfValidToken(token)) {
      let url = `https://two024-qwerty-back-2.onrender.com/api/transacciones/user/filter`;
      if (filtrado !== "Todas" || filtroMes || filtroAno) {
        url += `?categoria=${filtrado}`;
        if (filtroMes) url += `&mes=${filtroMes}`;
        if (filtroAno) url += `&anio=${filtroAno}`;
        console.log(url);
      }
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setTransacciones(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoadingFilter(false);
      }
      fetchPersonalCategorias();
      showTransactionsPendientes();
    } else {
      console.log("deberia redirec");
      navigate("/");
    }
  };

  const fetchPersonalCategorias = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-2.onrender.com/api/personal-categoria",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const customOptions = data.map((cat) => ({
          label: cat.nombre,
          value: cat.nombre,
          iconPath: cat.iconPath,
        }));

        setPayCategories([
          {
            value: "Otros",
            label: "Otros",
            iconPath: "fa-solid fa-circle-dot",
          },
          ...payCategoriesDefault,
          ...customOptions,
        ]);
      }
    } catch (error) {
      console.error("Error al obtener las categorías personalizadas:", error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    clearForm();
    setEdit(false);
  };

  const clearForm = () => {
    setMotivo("");
    setValor("");
    setFecha(new Date().toISOString().split("T")[0]);
    setSelectedCategory(null);
    setTipoGasto("Efectivo");
    setSelectedPayMethod({
      value: "Efectivo",
      label: "Efectivo",
    });
  };

  const editRow = (row) => {
    setEdit(true);
    setMotivo(row.motivo);
    setValor(row.valor);
    const selectedOption = payOptions.find(
      (option) => option.value === row.tipoGasto
    );
    setSelectedPayMethod(selectedOption || null);
    const selectedPayCategory = payCategories.find(
      (option) => option.value == row.categoria
    );
    setSelectedCategory(selectedPayCategory || null);
    setFecha(row.fecha);
    setTransaccionId(row.id);
    openModal();
  };

  const isAccepted = async (transaction, categoria, tipoGasto) => {
    await aceptarTransaccion(transaction, categoria, tipoGasto);
    eliminarTransaccionPendiente(transaction.id);
    if (transaction.id_reserva != "Cobro" && transaction.id_reserva != "Pago") {
      enviarRespuesta("aceptada", transaction.id_reserva);
    }
    setPendTran(false);
  };

  const isRejected = (transaction) => {
    eliminarTransaccionPendiente(transaction.id);
    if (transaction.id_reserva != "Cobro" && transaction.id_reserva != "Pago") {
      enviarRespuesta("rechazada", transaction.id_reserva);
    }
    setPendTran(false);
  };
  const enviarRespuesta = async (resp, id_reserva) => {
    const token = localStorage.getItem("token");
    const url = `https://two024-qwerty-back-2.onrender.com/api/transaccionesPendientes/${resp}?id_reserva=${id_reserva}`;
    const method = "POST";
    try {
      //hacer chequeos de que pase bien las cosas en el back!
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        //
      }
    } catch (err) {
      // habria que avisar que hubo un error en aceptar la transaccion o algo
    }
  };
  const aceptarTransaccion = async (transaccion, categoria, tipoGasto) => {
    const token = localStorage.getItem("token");
    let url = "https://two024-qwerty-back-2.onrender.com/api/transacciones";
    if (transaccion.id_reserva == "Cobro") {
      url += "/crearPago/" + transaccion.sentByEmail;
      const motivo = transaccion.motivo;
      const valor = transaccion.valor;
      const fecha = transaccion.fecha;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ motivo, valor, fecha, categoria, tipoGasto }),
        });
        if (response.ok) {
          const data = await response.json();
          const updatedTransacciones = [...transacciones, data];
          updatedTransacciones.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );
          setTransacciones(updatedTransacciones);
        }
      } catch (err) {
        console.log(err);
      }
    } else if (transaccion.id_reserva == "Pago") {
      console.log("Transaccion Aprobada");
    } else {
      const method = "POST";
      let motivo = transaccion.motivo;
      let valor = transaccion.valor;
      let fecha = transaccion.fecha;
      categoria = "Clase";
      try {
        //hacer chequeos de que pase bien las cosas en el back!
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ motivo, valor, fecha, categoria }),
        });

        if (response.ok) {
          const data = await response.json();
          const updatedTransacciones = [...transacciones, data];
          updatedTransacciones.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );
          setTransacciones(updatedTransacciones);
        }
      } catch (err) {
        // habria que avisar que hubo un error en aceptar la transaccion o algo
      }
    }
    /*const token = localStorage.getItem("token");
    const url = "https://two024-qwerty-back-2.onrender.com/api/transacciones";
    const method = "POST";
    let motivo = transaccion.motivo;
    let valor = transaccion.valor;
    let fecha = transaccion.fecha;
    try {
      //hacer chequeos de que pase bien las cosas en el back!
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo, valor, fecha, categoria }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedTransacciones = [...transacciones, data];
        updatedTransacciones.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setTransacciones(updatedTransacciones);
      }
    } catch (err) {
      // habria que avisar que hubo un error en aceptar la transaccion o algo
    }*/
  };
  const agregarTransaccion = async (e, categoria) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = edit
      ? `https://two024-qwerty-back-2.onrender.com/api/transacciones/${transaccionId}`
      : "https://two024-qwerty-back-2.onrender.com/api/transacciones";

    const method = edit ? "PUT" : "POST";

    try {
      if (valor <= 0) {
        setModalError("El valor debe ser mayor a 0");
        return;
      }
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo, valor, fecha, categoria, tipoGasto }),
      });

      if (response.ok) {
        const data = await response.json();
        if (edit) {
          const updatedTransacciones = transacciones.map((t) =>
            t.id === data.id ? data : t
          );
          setTransacciones(updatedTransacciones);
        } else {
          const updatedTransacciones = [...transacciones, data];
          updatedTransacciones.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );
          setTransacciones(updatedTransacciones);
        }
        setModalError("");
        closeModal();
      } else {
        setModalError("Error al agregar o actualizar la transacción");
      }
    } catch (err) {
      setModalError("Ocurrió un error. Intenta nuevamente.");
    }
  };

  const deleteRow = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://two024-qwerty-back-2.onrender.com/api/transacciones/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setTransacciones(transacciones.filter((t) => t.id !== id));
      } else {
        setError("Error al eliminar la transacción");
      }
    } catch (err) {
      setError("Ocurrió un error. Intenta nuevamente.");
    }
  };
  const eliminarTransaccionPendiente = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://two024-qwerty-back-2.onrender.com/api/transaccionesPendientes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        showTransactionsPendientes();
      } else {
        //poner algun error?
      }
    } catch (err) {
      //poner algun error?
      //setError("Ocurrió un error. Intenta nuevamente.");
    }
  };
  const handleMotivoChange = (e) => {
    setMotivo(e.target.value);
  };
  const handleCategoryChange = (value) => {
    setCategoria(value ? value.value : "");
    setSelectedCategory(value);
  };
  const handlePayChange = (value) => {
    setTipoGasto(value ? value.value : "");
    setSelectedPayMethod(value);
  };
  const handleCreateTP = async (inputValue) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://two024-qwerty-back-2.onrender.com/api/personal-tipo-gasto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(inputValue),
        }
      );

      if (response.ok) {
        const newTipoGasto = await response.json();
        const newOption = {
          label: newTipoGasto.nombre,
          value: newTipoGasto.nombre,
        };
        setPayOptions((prevOptions) => [...prevOptions, newOption]);
        setSelectedPayMethod(newOption);
        setTipoGasto(newTipoGasto.nombre);
      }
    } catch (error) {
      console.error("Error al agregar el tipo de gasto personalizado:", error);
    }
  };
  const handleCreateCat = async (nombre, icono) => {
    console.log("entre      ");
    const token = localStorage.getItem("token");
    if (!nombre || !icono) {
      console.error("Nombre y icono son obligatorios");
      return;
    }
    try {
      const inputValue = {
        nombre: nombre,
        iconPath: icono,
      };
      const response = await fetch(
        "https://two024-qwerty-back-2.onrender.com/api/personal-categoria",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(inputValue),
        }
      );
      if (response.ok) {
        const newCategoria = await response.json();
        const newOption = {
          label: newCategoria.nombre,
          value: newCategoria.nombre,
          iconPath: newCategoria.iconPath,
        };
        setPayCategories((prevOptions) => [...prevOptions, newOption]);
        console.log(payCategories);
        setSelectedCategory(newOption);
        setCategoria(newCategoria.nombre);
      } else {
        const errorMessage = await response.text();
        console.error("Error al agregar categoria:", errorMessage);
        console.log("la categoria existeeeeeeeeeee");
        return "La categoria ya existe";
      }
    } catch (error) {
      console.error("Error al agregar categoria personalizada:", error);
      return "";
    }
    return "";
  };
  const handleChange = (event) => {
    setIsLoadingFilter(true);
    let cat = event.target.value;
    setCategoriaSeleccionada(cat);
    getTransacciones(cat);
  };
  const resetFilters = () => {
    setCategoriaSeleccionada("Todas");
    setFiltroAno("2024");
    setFiltroMes("");
  };
  const refershTransacciones = (transaccionNueva) => {
    const updatedTransacciones = [...transacciones, transaccionNueva];
    updatedTransacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    setTransacciones(updatedTransacciones);
  };

  return (
    <div className="container min-h-screen min-w-full max-w-full bg-black">
      {/* Header */}
      <Header
        payCategories={payCategories}
        setPayCategories={setPayCategories}
        fetchPersonalCategorias={fetchPersonalCategorias}
        getTransacciones={getTransacciones}
      />

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-center md:gap-6 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
          {/* Select de Categorías */}
          <div className="flex flex-col w-full md:w-1/3">
            <select
              id="categorias"
              value={categoriaSeleccionada}
              onChange={handleChange}
              className="block select select-bordered w-full max-w-full"
            >
              {categoriasConTodas.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Select de Mes */}
          <div className="flex flex-col w-full md:w-1/3">
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="select select-bordered w-full max-w-full"
            >
              <option value="">Mes</option>
              <option value="01">Enero</option>
              <option value="02">Febrero</option>
              <option value="03">Marzo</option>
              <option value="04">Abril</option>
              <option value="05">Mayo</option>
              <option value="06">Junio</option>
              <option value="07">Julio</option>
              <option value="08">Agosto</option>
              <option value="09">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>

          {/* Select de Año */}
          <div className="flex flex-col w-full md:w-1/3">
            <select
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
              className="select select-bordered w-full max-w-full"
            >
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          {/* Botón para borrar filtros */}
          <button
            onClick={() => resetFilters()}
            className="btn btn-warning w-full md:w-auto mt-2 md:mt-0"
          >
            Borrar filtros
          </button>
        </div>

        {/* Botones de acciones */}
        <div className="flex flex-col md:flex-row items-center justify-end gap-2 mt-4 w-full">
          <button
            className="btn w-full md:w-auto bg-yellow-500 text-gray-950 text-lg md:text-xl rounded-lg hover:bg-yellow-700"
            onClick={openModal}
          >
            Agregar Transacción
          </button>
          <button
            className="btn w-full md:w-auto bg-yellow-500 text-gray-950 text-lg md:text-xl rounded-lg hover:bg-yellow-700"
            onClick={() => document.getElementById("sendPayModal").showModal()}
          >
            Realizar Pago
          </button>
          <button
            className="btn w-full md:w-auto bg-yellow-500 text-gray-950 text-lg md:text-xl rounded-lg hover:bg-yellow-700"
            onClick={() =>
              document.getElementById("generatePayModal").showModal()
            }
          >
            Generar Cobro
          </button>
        </div>
      </div>

      {/* Monto por Categoria */}
      {!showNoTransactions && (
        <>
          <div className="flex items-center">
            <h2 className="text-xl md:text-2xl py-2 font-bold text-gray-100">
              Monto por Categoria
            </h2>
          </div>

          {/* Gráfico */}
          <MonthlyGraphic
            type="categorias"
            transacciones={transacciones}
            payCategories={payCategories}
            filtroMes={filtroMes}
            filtroCategoria={categoriaSeleccionada}
          />

          {/* Historial de Transacciones */}
          <div className="bg-black flex flex-col w-full overflow-x-auto">
            <div className="flex justify-between items-center w-full px-4 py-6">
              <div className="flex items-center">
                <h2 className="text-xl md:text-2xl py-2 font-bold text-gray-100">
                  Historial de Transacciones
                </h2>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cargando Spinner */}
      {isLoadingFilter ? (
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin h-8 w-8 md:h-10 md:w-10 text-yellow-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.965 7.965 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-yellow-500 font-bold ml-2">Cargando...</span>
        </div>
      ) : (
        <>
          <TransaccionesTable
            transacciones={transacciones}
            payCategories={payCategories}
            editRow={editRow}
            deleteRow={deleteRow}
            onTableEmpty={() => setShowNoTransactions(true)}
            onTransactions={() => setShowNoTransactions(false)}
          />

          {/* Si no hay transacciones */}
          {showNoTransactions && (
            <div className="flex flex-col justify-center items-center mb-0">
              {(categoriaSeleccionada !== "Todas" ||
                filtroAno !== "2024" ||
                filtroMes !== "") && (
                <p className="text-red-500 font-bold mb-4">
                  Su filtro no coincide con ninguna transacción
                </p>
              )}
              <button
                className="bg-yellow-500 text-gray-950 font-extrabold py-4 px-8 rounded-lg hover:bg-yellow-700"
                onClick={openModal}
              >
                Ingrese una transacción
              </button>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      <ModalForm
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        agregarTransaccion={agregarTransaccion}
        edit={edit}
        motivo={motivo}
        valor={valor}
        fecha={fecha}
        handleMotivoChange={handleMotivoChange}
        setValor={setValor}
        selectedCategory={selectedCategory}
        payCategories={payCategories}
        handleCategoryChange={handleCategoryChange}
        handleCreateCat={handleCreateCat}
        setFecha={setFecha}
        handlePayChange={handlePayChange}
        selectedPayMethod={selectedPayMethod}
        payOptions={payOptions}
        handleCreateTP={handleCreateTP}
      />
      <ModalAskPayment payCategories={payCategories} />
      <ModalSendPayment
        payCategories={payCategories}
        refreshTransacciones={refershTransacciones}
      />
      <AlertPending
        isOpen={pendTran}
        pendingTransaction={tranPendiente}
        isAccepted={isAccepted}
        isRejected={isRejected}
        payCategories={payCategories}
      />
    </div>
  );
}

export default HomePage;
