import { useState } from 'react';
import { FaClipboardCheck, FaHome, FaTasks, FaKey, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEdit, FaTrashAlt, FaWhatsapp, FaEnvelope, FaCloudUploadAlt, FaStar, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Carousel from './Carousel';
import Footer from './Footer';
import SEO from './SEO';
import { useAdmin } from '../context/AdminContext';
import type { Property } from '../types';
import { cleanInputString } from '../lib/security';
import { optimizeMultipleImages } from '../lib/imageOptimizer';

export default function Inmobiliaria() {
  const services = [
    {
      title: 'Transferencias Inmobiliarias',
      icon: <FaClipboardCheck className="text-brand-green" size={24} />,
      items: [
        'Revisión Legal del Inmueble y deslinde.',
        'Redacción y Revisión de Contratos de Promesa y Compraventa.',
        'Gestión de Trámites Notariales y Registrales ante la Jurisdicción Inmobiliaria.',
        'Asesoría en Impuestos de transferencia inmobiliaria (3%) y Pagos Legales.',
        'Resolución de Conflictos, oposiciones y Litigios sobre derechos registrados.'
      ]
    },
    {
      title: 'Ventas de Inmuebles',
      icon: <FaHome className="text-brand-green" size={24} />,
      items: [
        'Promoción y venta de villas, apartamentos y terrenos en Samaná.',
        'Revisión legal rigurosa del inmueble antes de la puesta en venta.',
        'Redacción, firma y gestión de contratos notariales de compraventa.',
        'Asesoramiento integral al comprador y vendedor durante el cierre.',
        'Gestión de cobro y liquidación de impuestos del inmueble.'
      ]
    },
    {
      title: 'Administración de Propiedades',
      icon: <FaTasks className="text-brand-green" size={24} />,
      items: [
        'Gestión legal, administrativa y contractual de inquilinos.',
        'Cobranza y conciliación mensual de pagos de rentas y servicios.',
        'Mantenimiento preventivo y reparaciones de infraestructura.',
        'Gestión de conflictos, desalojos y recuperación de inmuebles.',
        'Administración y supervisión de propiedades en Régimen de Condominio.'
      ]
    },
    {
      title: 'Alquiler de Inmuebles',
      icon: <FaKey className="text-brand-green" size={24} />,
      items: [
        'Redacción, revisión y registro de contratos de arrendamiento.',
        'Asesoría en Derechos y Obligaciones de Arrendador y Arrendatario.',
        'Custodia y gestión de depósitos de garantía y cobro periódico.',
        'Renovaciones contractuales y reajustes tarifarios legales.',
        'Resolución rápida de disputas y desahucios administrativos.'
      ]
    }
  ];

  const { properties, canEditInmobiliaria, addProperty, updateProperty, deleteProperty } = useAdmin();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [filterType, setFilterType] = useState<'todos' | 'venta' | 'alquiler'>('todos');

  const filteredProperties = properties.filter(prop => {
    if (filterType === 'todos') return true;
    return prop.type === filterType;
  });

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'casa' | 'apartamento' | 'terreno'>('casa');
  const [formType, setFormType] = useState<'venta' | 'alquiler'>('venta');
  const [formPrice, setFormPrice] = useState(0);
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formLocation, setFormLocation] = useState('');
  const [formArea, setFormArea] = useState(0);
  const [formBedrooms, setFormBedrooms] = useState(0);
  const [formBathrooms, setFormBathrooms] = useState(0);
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleOpenAddModal = () => {
    setEditingProperty(null);
    setFormTitle('');
    setFormCategory('casa');
    setFormType('venta');
    setFormPrice(0);
    setFormCurrency('USD');
    setFormLocation('');
    setFormArea(0);
    setFormBedrooms(0);
    setFormBathrooms(0);
    setFormDescription('');
    setFormImages([]);
    setNewImageUrl('');
    setIsProcessingImages(false);
    setIsDragging(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prop: any) => {
    setEditingProperty(prop);
    setFormTitle(prop.title);
    setFormCategory(prop.category);
    setFormType(prop.type);
    setFormPrice(prop.price);
    setFormCurrency(prop.currency);
    setFormLocation(prop.location);
    setFormArea(prop.area);
    setFormBedrooms(prop.bedrooms);
    setFormBathrooms(prop.bathrooms);
    setFormDescription(prop.description);
    setFormImages(prop.images || []);
    setNewImageUrl('');
    setIsProcessingImages(false);
    setIsDragging(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta propiedad?')) {
      deleteProperty(id);
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (trimmed) {
      if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
        setFormImages(prev => [...prev, trimmed]);
        setNewImageUrl('');
      } else {
        alert('Por favor ingrese una URL válida que comience con https://');
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMakeMainImage = (index: number) => {
    if (index === 0) return;
    setFormImages(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessingImages(true);
    try {
      const { successful, errors } = await optimizeMultipleImages(files);
      if (errors.length > 0) {
        alert(errors.join('\n'));
      }
      if (successful.length > 0) {
        setFormImages(prev => [...prev, ...successful]);
      }
    } catch (err) {
      alert('Error al procesar las fotos seleccionadas.');
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleWhatsAppClick = (prop: Property) => {
    const formattedPrice = `${prop.currency === 'USD' ? '$' : 'RD$'}${prop.price.toLocaleString()} ${prop.currency}`;
    const message = `Hola, estoy interesado en la propiedad:\n\n*${prop.title}*\n*Precio:* ${formattedPrice}\n*Ubicación:* ${prop.location}\n\n¿Podrían darme más información?`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/18297709011?text=${encodedMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = (prop: Property) => {
    setSelectedProperty(null);
    const formattedPrice = `${prop.currency === 'USD' ? '$' : 'RD$'}${prop.price.toLocaleString()} ${prop.currency}`;
    navigate('/contactanos', {
      state: {
        subject: 'Servicios Inmobiliarios',
        message: `Hola, estoy interesado en recibir más detalles sobre la propiedad "${prop.title}" (${formattedPrice}) ubicada en ${prop.location}.`
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = cleanInputString(formTitle, 150);
    const cleanLocation = cleanInputString(formLocation, 200);
    const cleanDescription = cleanInputString(formDescription, 4000);

    if (!cleanTitle || !cleanLocation) {
      alert('El título y la ubicación son obligatorios.');
      return;
    }

    const propertyData = {
      title: cleanTitle,
      category: formCategory,
      type: formType,
      price: Math.max(0, Number(formPrice) || 0),
      currency: formCurrency,
      location: cleanLocation,
      area: Math.max(0, Number(formArea) || 0),
      bedrooms: Math.max(0, Number(formBedrooms) || 0),
      bathrooms: Math.max(0, Number(formBathrooms) || 0),
      description: cleanDescription,
      images: formImages.length > 0 ? formImages : ['/samana.png'],
      featured: true
    };

    if (editingProperty) {
      updateProperty({ ...propertyData, id: editingProperty.id });
    } else {
      addProperty(propertyData);
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <SEO
        title="Propiedades en Venta y Alquiler en Las Terrenas, Samaná"
        description="Villas, casas, apartamentos y terrenos en venta y alquiler en Las Terrenas, Samaná. Gestión inmobiliaria y asesoría legal con Inmobiliaria del Atlántico."
        canonicalPath="/inmobiliaria"
      />
      {/* Banner */}
      <section className="bg-brand-blue text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-grid-pattern pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-green/20 text-brand-green-light rounded-full text-xs font-semibold uppercase tracking-wider">
            <FaHome size={12} />
            <span>Asesoría Inmobiliaria y Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Servicios Inmobiliarios y Gestión
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-light">
            Encuentre y gestione la propiedad perfecta en el Caribe. Le asistimos en todos los trámites legales y de administración de bienes raíces.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-brand-blue">
              ¿Cómo le podemos ayudar?
            </h2>
            <p className="text-gray-500 font-light">
              Nuestros servicios cubren todos los aspectos legales, transaccionales y de mantenimiento de sus propiedades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {services.map((service, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 hover:shadow-lg transition-shadow duration-300 flex flex-col space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-brand-blue">
                    {service.title}
                  </h3>
                </div>
                <ul className="space-y-3 grow">
                  {service.items.map((item, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green mt-2 mr-2.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Grid */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold text-brand-blue flex items-center justify-center gap-4 flex-wrap">
              <span>Propiedades Destacadas</span>
              {canEditInmobiliaria && (
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green-light text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                >
                  + Agregar Propiedad
                </button>
              )}
            </h2>
            <p className="text-gray-500 font-light">
              Explore algunas de nuestras propiedades exclusivas disponibles para venta y alquiler en Las Terrenas.
            </p>
          </div>

          {/* Glass Filter Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 bg-slate-100/80 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-sm">
              <button
                type="button"
                onClick={() => setFilterType('todos')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${filterType === 'todos'
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-white'
                  }`}
              >
                Todas las Propiedades
              </button>
              <button
                type="button"
                onClick={() => setFilterType('venta')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${filterType === 'venta'
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-white'
                  }`}
              >
                En Venta
              </button>
              <button
                type="button"
                onClick={() => setFilterType('alquiler')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${filterType === 'alquiler'
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-white'
                  }`}
              >
                En Alquiler
              </button>
            </div>
          </div>

          {/* Glassmorphism scrollable list container */}
          <div className="bg-slate-50/50 dark:bg-slate-900/10 backdrop-blur-md border border-slate-200/30 dark:border-slate-800/20 shadow-xl rounded-3xl p-6 sm:p-8">
            <div className="max-h-162.5 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                  {filteredProperties.map((prop) => (
                    <div key={prop.id} className="relative bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col group h-full">

                      {/* Admin controls overlay */}
                      {canEditInmobiliaria && (
                        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(prop)}
                            className="p-2 bg-brand-blue hover:bg-brand-blue-light text-white rounded-lg shadow-md transition-all hover:scale-105 cursor-pointer"
                            title="Editar Propiedad"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(prop.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all hover:scale-105 cursor-pointer"
                            title="Eliminar Propiedad"
                          >
                            <FaTrashAlt size={12} />
                          </button>
                        </div>
                      )}

                      {/* Carousel wrapper */}
                      <div className="relative">
                        <Carousel slides={prop.images} />
                        <span className="absolute top-4 right-4 px-3 py-1 bg-brand-green text-white text-xs font-bold uppercase rounded-full tracking-wide shadow-md z-10">
                          En {prop.type}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col grow space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider">
                            {prop.category}
                          </span>
                          <h3 className="text-base font-bold text-brand-blue line-clamp-1 group-hover:text-brand-green transition-colors duration-200 dark:text-slate-100">
                            {prop.title}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed grow">
                          {prop.description}
                        </p>

                        {/* Specs */}
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-355 border-y border-slate-200/50 dark:border-slate-700/50 py-3">
                          {prop.bedrooms > 0 && (
                            <div className="flex items-center space-x-1" title="Habitaciones">
                              <FaBed className="text-slate-400" />
                              <span>{prop.bedrooms} Hab</span>
                            </div>
                          )}
                          {prop.bathrooms > 0 && (
                            <div className="flex items-center space-x-1" title="Baños">
                              <FaBath className="text-slate-400" />
                              <span>{prop.bathrooms} Baños</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1" title="Área">
                            <FaRulerCombined className="text-slate-400" />
                            <span>{prop.area} m²</span>
                          </div>
                        </div>

                        {/* Location info */}
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <FaMapMarkerAlt className="text-brand-green shrink-0" size={13} />
                          <span className="line-clamp-1">{prop.location}</span>
                        </div>

                        {/* Price and Action */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-base font-extrabold text-brand-blue dark:text-slate-100">
                            {prop.currency === 'USD' ? '$' : 'RD$'}
                            {prop.price.toLocaleString()} {prop.currency}
                          </span>
                          <button
                            onClick={() => setSelectedProperty(prop)}
                            className="px-3.5 py-2 bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-bold rounded-lg transition-colors duration-200 shadow-sm cursor-pointer"
                          >
                            Ver Detalles
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                    No se encontraron propiedades en esta categoría.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Property Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingProperty ? 'Editar Propiedad' : 'Agregar Nueva Propiedad'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="grow overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Título de la Propiedad
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                    placeholder="Ej. Villa Mariposa, Las Terrenas"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                  >
                    <option value="casa">Casa/Villa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="terreno">Terreno</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipo de Operación
                  </label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                  >
                    <option value="venta">Venta</option>
                    <option value="alquiler">Alquiler</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Precio
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formPrice}
                    onChange={e => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Moneda
                  </label>
                  <select
                    value={formCurrency}
                    onChange={e => setFormCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="RD$">RD$</option>
                  </select>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                    placeholder="Ej. El Portillo, Las Terrenas, Samaná"
                  />
                </div>

                {/* Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formArea}
                    onChange={e => setFormArea(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Habitaciones
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formBedrooms}
                    onChange={e => setFormBedrooms(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Baños
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formBathrooms}
                    onChange={e => setFormBathrooms(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                    placeholder="Escriba los detalles de la propiedad..."
                  />
                </div>

                {/* Images Visual Manager */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Galería de Fotos
                      </label>
                      <span className="px-2 py-0.5 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-brand-blue-light text-xs font-semibold rounded-full">
                        {formImages.length} {formImages.length === 1 ? 'foto' : 'fotos'}
                      </span>
                    </div>
                    {formImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('¿Desea eliminar todas las fotos cargadas?')) {
                            setFormImages([]);
                          }
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer transition-colors"
                      >
                        Eliminar todas
                      </button>
                    )}
                  </div>

                  {/* Drag & Drop Multi-Image Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      isDragging
                        ? 'border-brand-blue bg-brand-blue/10 scale-[1.01]'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-brand-blue/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="property-multi-images"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {isProcessingImages ? (
                      <div className="py-4 flex flex-col items-center justify-center gap-2 text-brand-blue">
                        <FaSpinner className="animate-spin" size={28} />
                        <span className="text-sm font-semibold">Procesando y optimizando fotos...</span>
                        <span className="text-xs text-slate-400">Por favor espere un momento</span>
                      </div>
                    ) : (
                      <label
                        htmlFor="property-multi-images"
                        className="flex flex-col items-center justify-center cursor-pointer select-none"
                      >
                        <div className="w-12 h-12 mb-2 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-brand-blue-light flex items-center justify-center shadow-inner">
                          <FaCloudUploadAlt size={24} />
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          Haga clic aquí para seleccionar múltiples fotos
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          o arrastre y suelte todas sus imágenes aquí a la vez (JPG, PNG, WEBP)
                        </span>
                        <span className="mt-3 px-4 py-2 bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105">
                          Explorar Fotos en su dispositivo...
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Thumbnail Gallery Preview */}
                  {formImages.length > 0 && (
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                        <span>La primera foto será la <strong>portada principal</strong>. Puede cambiar el orden usando el botón de estrella.</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                        {formImages.map((imgUrl, index) => (
                          <div
                            key={index}
                            className={`relative group aspect-video rounded-xl overflow-hidden border shadow-sm transition-all bg-slate-200 dark:bg-slate-700 ${
                              index === 0
                                ? 'border-brand-blue ring-2 ring-brand-blue/40'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Vista previa ${index + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Badge if main image */}
                            {index === 0 ? (
                              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-brand-blue/90 text-white text-[10px] font-bold rounded-md shadow-md flex items-center gap-1 backdrop-blur-xs">
                                <FaStar size={9} className="text-amber-300" />
                                Principal
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMakeMainImage(index)}
                                className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/60 hover:bg-brand-blue text-white text-[10px] font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md flex items-center gap-1"
                                title="Establecer como foto principal"
                              >
                                <FaStar size={9} />
                                Hacer principal
                              </button>
                            )}

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1.5 right-1.5 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full shadow-md transition-all hover:scale-110 cursor-pointer"
                              title="Eliminar foto"
                            >
                              <FaTrashAlt size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Internet URL Paste Input */}
                  <div className="p-3.5 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl">
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                      ¿Desea agregar un enlace de internet?
                    </span>
                    <span className="block text-[11px] text-slate-400 mb-2">
                      Pegue el enlace directo de una foto web si lo prefiere.
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                        className="grow px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue text-slate-800 dark:text-white"
                        placeholder="https://ejemplo.com/foto.jpg"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-4 py-2 bg-brand-green hover:bg-brand-green-light text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                      >
                        Agregar enlace
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-blue hover:bg-brand-blue-light text-white text-sm font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]">

            {/* Close Button */}
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 right-4 z-40 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer font-bold leading-none h-8 w-8 flex items-center justify-center"
              aria-label="Cerrar detalles"
            >
              ✕
            </button>

            {/* Left Column: Image Gallery/Carousel & Description */}
            <div className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-950 border-r border-slate-150 dark:border-slate-850 flex flex-col overflow-y-auto max-h-[45vh] md:max-h-[85vh]">
              {/* Carousel wrapper */}
              <div className="relative w-full aspect-video min-h-70 sm:min-h-80 bg-slate-100 dark:bg-slate-950 shrink-0">
                <Carousel slides={selectedProperty.images} />
                <span className="absolute top-4 left-4 px-3 py-1 bg-brand-green text-white text-xs font-bold uppercase rounded-full tracking-wide shadow-md z-10">
                  En {selectedProperty.type}
                </span>
              </div>

              {/* Description */}
              <div className="p-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Descripción de la Propiedad
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedProperty.description}
                </p>
              </div>
            </div>

            {/* Right Column: Full Info & Actions */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto max-h-[45vh] md:max-h-[85vh] justify-between space-y-6 bg-white dark:bg-slate-900">
              <div className="space-y-6">
                {/* Category & Title */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
                    {selectedProperty.category}
                  </span>
                  <h3 className="text-2xl font-extrabold text-brand-blue dark:text-slate-100">
                    {selectedProperty.title}
                  </h3>
                </div>

                {/* Price Tag */}
                <div className="text-3xl font-extrabold text-brand-blue dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-4">
                  {selectedProperty.currency === 'USD' ? '$' : 'RD$'}
                  {selectedProperty.price.toLocaleString()} {selectedProperty.currency}
                </div>

                {/* Specifications grid */}
                <div className="grid grid-cols-3 gap-4 text-center py-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {selectedProperty.bedrooms > 0 && (
                    <div className="flex flex-col items-center space-y-1">
                      <FaBed className="text-brand-green" size={18} />
                      <span className="text-[10px] text-slate-450 font-bold uppercase">Habitaciones</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedProperty.bedrooms}</span>
                    </div>
                  )}
                  {selectedProperty.bathrooms > 0 && (
                    <div className="flex flex-col items-center space-y-1">
                      <FaBath className="text-brand-green" size={18} />
                      <span className="text-[10px] text-slate-450 font-bold uppercase">Baños</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedProperty.bathrooms}</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center space-y-1">
                    <FaRulerCombined className="text-brand-green" size={18} />
                    <span className="text-[10px] text-slate-455 font-bold uppercase">Área Total</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedProperty.area} m²</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-2 text-sm text-slate-650 dark:text-slate-300">
                  <FaMapMarkerAlt className="text-brand-green mt-0.5 shrink-0" size={16} />
                  <span>{selectedProperty.location}</span>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
                <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">Contactar con un Agente</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleWhatsAppClick(selectedProperty)}
                    className="flex items-center justify-center space-x-2 py-3 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <FaWhatsapp size={16} />
                    <span>Preguntar por WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleEmailClick(selectedProperty)}
                    className="flex items-center justify-center space-x-2 py-3 bg-brand-blue hover:bg-brand-blue-light text-white font-bold rounded-xl text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <FaEnvelope size={16} />
                    <span>Enviar Correo</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
