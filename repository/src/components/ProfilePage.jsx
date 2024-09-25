import React, { useEffect, useState } from 'react';
import ActionButtons from './ActionButtons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

function ProfilePage() {
    library.add(fas);
    const defaultCategories = [
        { value: "Impuestos y Servicios", label: "Impuestos y Servicios", iconPath: "fa-solid fa-file-invoice-dollar", textColor: 'mr-2 text-yellow-500'},
        { value: "Entretenimiento y Ocio", label: "Entretenimiento y Ocio", iconPath: "fa-solid fa-ticket", textColor: 'mr-2 text-yellow-500'},
        { value: "Hogar y Mercado", label: "Hogar y Mercado", iconPath: "fa-solid fa-house", textColor: 'mr-2 text-yellow-500'},
        { value: "Antojos", label: "Antojos", iconPath: "fa-solid fa-candy-cane", textColor: 'mr-2 text-yellow-500'},
        { value: "Electrodomesticos", label: "Electrodomesticos", iconPath: "fa-solid fa-blender", textColor: 'mr-2 text-yellow-500'}
    ];
    
    const [payCategories, setPayCategories] = useState(defaultCategories);

    const fetchPersonalCategorias = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("https://two024-qwerty-back-2.onrender.com/api/personal-categoria", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const customOptions = data.map(cat => ({ label: cat.nombre, value: cat.nombre, iconPath: cat.iconPath, textColor: 'mr-2 text-white' }));
                setPayCategories(customOptions);
            }
        } catch (error) {
            console.error("Error al obtener las categorías personalizadas:", error);
        }
    };

    useEffect(() => {
        fetchPersonalCategorias();
    }, []);

    const handleEdit = (categoryValue) => {
        console.log(`Editar categoría: ${categoryValue}`);
    };

    // Función para eliminar una categoría
    const handleDelete = async(categoryValue) => {
        const filteredCategories = payCategories.filter(category => category.value == categoryValue);
        const token = localStorage.getItem("token");
        const inputValue = {
            nombre: filteredCategories[0].label,
            iconPath: filteredCategories[0].iconPath
        };
        try {
            const response = await fetch("https://two024-qwerty-back-2.onrender.com/api/personal-categoria", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(inputValue)
            });
            if(response.ok){
                console.log(`Categoría eliminada: ${categoryValue}`);
                setPayCategories([]);
                await fetchPersonalCategorias();
            }
        }catch(err){
            console.log(err);
        }
    };

    return (
        <div className="container min-h-screen min-w-full max-w-full bg-black">
            <div className='text-white font-bold'>Mi Cuenta</div>
            <ActionButtons />
            <div className='text-white'>
                <div className='text-bold text-yellow-500 text-xl mb-3 underline'>Mis Categorias</div>
                <ul>
                    {defaultCategories.map((category) => (
                        <li key={category.value} className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={category.iconPath} className={category.textColor} />
                                <div className={category.textColor}>{category.label}</div>
                            </div>
                        </li>
                    ))}
                </ul>
                <ul>
                    {payCategories.map((category) => (
                        <li key={category.value} className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={category.iconPath} className={category.textColor} />
                                <div className={category.textColor}>{category.label}</div>
                            </div>
                            <div>
                                <button 
                                    className="ml-4 text-blue-500 hover:text-blue-700"
                                    onClick={() => handleEdit(category.value)}
                                >
                                    Editar
                                </button>
                                <button 
                                    className="ml-2 text-red-500 hover:text-red-700"
                                    onClick={() => handleDelete(category.value)}
                                >
                                    X
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ProfilePage;
