import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

function ModalCreateBudget({ closeModal = () => {}, initialBudget = null }) {
  library.add(fas);
  const [payCategories, setPayCategories] = useState([]);
  const [formMessage, setFormMessage] = useState("");
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

  const [budgetValues, setBudgetValues] = useState({});
  const [totalBudget, setTotalBudget] = useState("");
  const [errors, setErrors] = useState({});
  const [budgetName, setBudgetName] = useState("");
  const [budgetDate, setBudgetDate] = useState("");

  useEffect(() => {
    const fetchPersonalCategorias = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "https://two024-qwerty-back-2.onrender.com/api/personal-categoria",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const customOptions = data.map((cat) => ({
            label: cat.nombre,
            value: cat.nombre,
            iconPath: cat.iconPath,
          }));

          setPayCategories([...payCategoriesDefault, ...customOptions]);
        }
      } catch (error) {
        console.error("Error al obtener las categorías personalizadas:", error);
      }
    };

    fetchPersonalCategorias();
  }, []);

  useEffect(() => {
    if (initialBudget) {
      setBudgetName(initialBudget.nameBudget || "");
      setBudgetDate(initialBudget.budgetMonth || "");
      setTotalBudget(initialBudget.totalBudget || "");
      setBudgetValues(initialBudget.categoryBudgets || {});
    }
  }, [initialBudget]);

  const handleInputChange = (value, category) => {
    const numericValue = parseFloat(value);
    setBudgetValues((prevValues) => ({
      ...prevValues,
      [category]: numericValue,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [category]: numericValue < 0 ? "El valor no puede ser negativo" : "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!budgetName) {
      alert("El nombre del presupuesto es obligatorio.");
      return;
    }

    const totalCategoryBudget = Object.values(budgetValues).reduce(
      (acc, curr) => acc + (curr || 0),
      0
    );

    if (totalCategoryBudget > totalBudget) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        totalBudget:
          "La suma de los presupuestos no debe exceder el presupuesto total",
      }));
      return;
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, totalBudget: "" }));
    }

    const hasNegativeValues = Object.values(budgetValues).some(
      (value) => value < 0
    );

    if (hasNegativeValues) {
      alert("Algunos valores de categorías son negativos. Revise los campos.");
      return;
    }

    const formData = initialBudget
      ? {
          ...initialBudget,
          nameBudget: budgetName,
          totalBudget: totalBudget,
          budgetMonth: budgetDate,
          categoryBudgets: budgetValues,
        }
      : {
          nameBudget: budgetName,
          totalBudget: totalBudget,
          budgetMonth: budgetDate,
          categoryBudgets: budgetValues,
        };

    createOrUpdateBudget(formData);
  };

  const createOrUpdateBudget = async (budget) => {
    const token = localStorage.getItem("token");
    const url = initialBudget
      ? "https://two024-qwerty-back-2.onrender.com/api/presupuesto/editPresupuesto"
      : "https://two024-qwerty-back-2.onrender.com/api/presupuesto";
    const method = initialBudget ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budget),
      });

      if (response.ok) {
        setFormMessage(
          initialBudget ? "Presupuesto actualizado!" : "Presupuesto creado!"
        );
        closeModal();
      } else {
        const errorMessage = await response.text();
        console.error(
          "Error en la respuesta del servidor",
          response.status,
          errorMessage
        );
      }
    } catch (error) {
      console.error(
        initialBudget
          ? "Error al actualizar el presupuesto:"
          : "Error al crear el presupuesto:",
        error
      );
    }
  };

  return (
    <div className="modal-box w-full max-w-md p-6 bg-[#1E2126] rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-white">
        {initialBudget ? "Editar Presupuesto" : "Agregar Nuevo Presupuesto"}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-white">
            Nombre del Presupuesto
          </label>
          <input
            type="text"
            placeholder="Nombre del Presupuesto"
            className="input input-bordered w-full"
            value={budgetName}
            onChange={(e) => setBudgetName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-white">
            Fecha (Mes y Año)
          </label>
          <input
            type="month"
            className="input input-bordered w-full"
            value={budgetDate}
            onChange={(e) => setBudgetDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-white">
            <FontAwesomeIcon
              className="mr-2"
              color="#FFFFFF"
              icon="fa-solid fa-wallet"
            />
            Presupuesto Total
          </label>
          <input
            type="number"
            placeholder="Monto Total"
            className="input input-bordered w-full"
            value={totalBudget}
            onChange={(e) => setTotalBudget(parseFloat(e.target.value))}
            required
          />
          {errors.totalBudget && (
            <p className="text-red-500 text-sm">{errors.totalBudget}</p>
          )}
        </div>

        {payCategories.map((category, index) => (
          <div className="mb-4" key={index}>
            <label className="block text-sm font-semibold mb-1 text-white">
              <FontAwesomeIcon
                className="mr-2"
                color="#FFFFFF"
                icon={category.iconPath}
              />
              {category.label}
            </label>
            <input
              type="number"
              id={`amount-${index}`}
              placeholder={`Monto para ${category.label}`}
              className="input input-bordered w-full"
              value={budgetValues[category.value] || ""}
              onChange={(e) =>
                handleInputChange(e.target.value, category.value)
              }
            />
            {errors[category.value] && (
              <p className="text-red-500 text-sm">{errors[category.value]}</p>
            )}
          </div>
        ))}

        {formMessage && <p className="text-green-500 text-sm">{formMessage}</p>}

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" className="btn btn-ghost" onClick={closeModal}>
            Cancelar
          </button>
          <button type="submit" className="btn bg-yellow-500 text-black">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ModalCreateBudget;
