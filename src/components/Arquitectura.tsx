import { useState } from 'react';
import { FaDraftingCompass, FaHardHat, FaSearch, FaCalculator, FaCheckCircle, FaEdit, FaTrashAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaCloudUploadAlt, FaStar, FaSpinner, FaImages } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Carousel from './Carousel';
import Footer from './Footer';
import SEO from './SEO';
import { useAdmin } from '../context/AdminContext';
import type { Project } from '../types';
import { cleanInputString } from '../lib/security';
import { optimizeMultipleImages } from '../lib/imageOptimizer';

export default function Arquitectura() {
  const services = [
    {
      title: 'DISEÑO',
      icon: <FaDraftingCompass size={22} />,
      items: [
        'Diseños arquitectónicos residenciales y comerciales.',
        'Diseño de lotificaciones y urbanizaciones.',
        'Planos arquitectónicos detallados y modelado 3D.',
        'Anteproyectos y presentaciones de diseño.'
      ]
    },
    {
      title: 'CONSTRUCCIÓN',
      icon: <FaHardHat size={22} />,
      items: [
        'Construcción general de villas, apartamentos y locales.',
        'Remodelaciones y ampliación de espacios.',
        'Reformas y adecuaciones de interiores y exteriores.',
        'Mano de obra calificada y control de materiales.'
      ]
    },
    {
      title: 'SUPERVISIÓN',
      icon: <FaSearch size={22} />,
      items: [
        'Supervisión técnica e inspección de obras en proceso.',
        'Dirección y coordinación general del proyecto.',
        'Medición de obra y control de cronograma.',
        'Garantía de calidad y cumplimiento de planos.'
      ]
    },
    {
      title: 'TASACIONES',
      icon: <FaCalculator size={22} />,
      items: [
        'Tasaciones inmobiliarias y avalúos comerciales.',
        'Estimación y presupuestos de construcción.',
        'Valoraciones catastrales para gestiones fiscales.',
        'Obtención de Licencias de Construcción y permisos gubernamentales.'
      ]
    }
  ];

  const { projects, canEditArquitectura, addProject, updateProject, deleteProject } = useAdmin();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormLocation('');
    setFormDescription('');
    setFormImages([]);
    setNewImageUrl('');
    setIsProcessingImages(false);
    setIsDragging(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: any) => {
    setEditingProject(proj);
    setFormTitle(proj.title);
    setFormLocation(proj.location);
    setFormDescription(proj.description || '');
    const existingImgs = proj.images && proj.images.length > 0
      ? proj.images
      : (proj.image ? [proj.image] : []);
    setFormImages(existingImgs);
    setNewImageUrl('');
    setIsProcessingImages(false);
    setIsDragging(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este proyecto del portafolio?')) {
      deleteProject(id);
    }
  };

  const handleWhatsAppEditaClick = (proj: Project) => {
    const message = `Hola Arq. Edita Hernández, me interesa su proyecto de arquitectura:\n\n*${proj.title}*\n*Ubicación:* ${proj.location}\n\n¿Podríamos coordinar una consulta al respecto?`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/18099139331?text=${encodedMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailEditaClick = (proj: Project) => {
    setSelectedProject(null);
    navigate('/contactanos', {
      state: {
        subject: 'Servicios de Arquitectura',
        message: `Hola Arq. Edita Hernández, estoy interesado en recibir más detalles sobre el proyecto de diseño/construcción "${proj.title}" ubicado en ${proj.location}.\n\nPor favor, contáctenme.`
      }
    });
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = cleanInputString(formTitle, 150);
    const cleanLocation = cleanInputString(formLocation, 200);
    const cleanDescription = cleanInputString(formDescription, 4000);

    if (!cleanTitle || !cleanLocation) {
      alert('El título y la ubicación del proyecto son obligatorios.');
      return;
    }

    const primaryImage = formImages[0] || '/samana.png';
    const projectData = {
      title: cleanTitle,
      location: cleanLocation,
      description: cleanDescription,
      image: primaryImage,
      images: formImages.length > 0 ? formImages : [primaryImage]
    };

    if (editingProject) {
      updateProject({ ...projectData, id: editingProject.id });
    } else {
      addProject(projectData);
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <SEO
        title="Diseño Arquitectónico, Planos y Construcción en Las Terrenas"
        description="Estudio de arquitectura y construcción en Las Terrenas, Samaná. Diseño residencial y comercial, modelado 3D, presupuestos y supervisión técnica de obras."
        canonicalPath="/arquitectura"
      />
      {/* Banner */}
      <section className="bg-brand-blue text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-grid-pattern pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-green/20 text-brand-green-light rounded-full text-xs font-semibold uppercase tracking-wider">
            <FaDraftingCompass size={12} />
            <span>Arquitectura y Construcción</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Estudio de Arquitectura y Construcción
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-light">
            De la idea al plano, del plano a la obra. Ofrecemos soluciones arquitectónicas innovadoras y dirección técnica profesional en Las Terrenas.
          </p>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: Image with accent overlay */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-2 bg-linear-to-r from-brand-green to-brand-blue rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500" />
              <div className="relative bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
                <img
                  src="/arquitectura.png"
                  alt="Diseño arquitectónico plano y lápiz"
                  className="w-full h-auto rounded-xl object-cover hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
            </div>

            {/* Right Column: List of Main Architectural Services */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl font-extrabold text-brand-blue">
                Servicios de Arquitectura y Urbanismo
              </h2>
              <p className="text-gray-600 font-light leading-relaxed">
                Acompañamos a nuestros clientes en cada etapa del desarrollo. Desde la concepción preliminar de ideas, diseño detallado de lotificaciones, levantamientos en terreno, modelado 3D, hasta la obtención de licencias de obra.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FaCheckCircle className="text-brand-green shrink-0" size={16} />
                  <span>DISEÑOS ARQUITECTÓNICOS</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FaCheckCircle className="text-brand-green shrink-0" size={16} />
                  <span>CONSTRUCCIÓN DE VILLAS</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FaCheckCircle className="text-brand-green shrink-0" size={16} />
                  <span>DISEÑO DE LOTIFICACIONES</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FaCheckCircle className="text-brand-green shrink-0" size={16} />
                  <span>SUPERVISIÓN DE PROYECTOS</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FaCheckCircle className="text-brand-green shrink-0" size={16} />
                  <span>LEVANTAMIENTOS DE INMUEBLES</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FaCheckCircle className="text-brand-green shrink-0" size={16} />
                  <span>TASACIONES INMOBILIARIAS</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Rebuilt Portfolio Grid matching Mockup */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl font-extrabold text-brand-blue uppercase tracking-wide flex items-center justify-center gap-4 flex-wrap">
              <span>Portafolio de Arquitectura y Construcción</span>
              {canEditArquitectura && (
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green-light text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer tracking-normal normal-case"
                >
                  + Agregar Proyecto
                </button>
              )}
            </h2>
            <p className="text-gray-500 font-light">
              Nuestros cuatro pilares y galerías de proyectos destacados.
            </p>
          </div>

          {/* Pillars Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            {services.map((srv, index) => (
              <div key={index} className="bg-slate-50 border border-slate-100 p-6 rounded-xl flex flex-col space-y-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-brand-green text-white">
                  {srv.icon}
                </div>
                <h3 className="text-base font-bold text-brand-blue tracking-wide">
                  {srv.title}
                </h3>
                <ul className="space-y-2 grow">
                  {srv.items.map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-600 leading-relaxed flex items-start">
                      <span className="h-1 w-1 rounded-full bg-brand-green mt-1.5 mr-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Glassmorphism scrollable list container */}
          <div className="bg-slate-50/50 dark:bg-slate-900/10 backdrop-blur-md border border-slate-200/30 dark:border-slate-800/20 shadow-xl rounded-3xl p-6 sm:p-8">
            <div className="max-h-150 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                  {projects.map((proj, idx) => (
                    <div
                      key={proj.id || idx}
                      onClick={() => setSelectedProject(proj)}
                      className="group relative rounded-xl overflow-hidden shadow-md h-64 bg-slate-200 cursor-pointer"
                    >

                      {/* Admin controls overlay */}
                      {canEditArquitectura && (
                        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(proj); }}
                            className="p-2 bg-brand-blue hover:bg-brand-blue-light text-white rounded-lg shadow-md transition-all hover:scale-105 cursor-pointer"
                            title="Editar Proyecto"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(proj.id); }}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all hover:scale-105 cursor-pointer"
                            title="Eliminar Proyecto"
                          >
                            <FaTrashAlt size={12} />
                          </button>
                        </div>
                      )}

                      {/* Images count badge */}
                      {proj.images && proj.images.length > 1 && (
                        <div className="absolute top-4 right-4 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold rounded-full flex items-center gap-1 shadow-md">
                          <FaImages size={10} />
                          <span>{proj.images.length} fotos</span>
                        </div>
                      )}

                      <img
                        src={proj.image}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-brand-blue-dark via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-4 left-4 text-white space-y-0.5 z-10">
                        <h4 className="text-sm font-bold tracking-wide uppercase">
                          {proj.title}
                        </h4>
                        <p className="text-[10px] text-brand-green-light">
                          {proj.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                    No hay proyectos en el portafolio actualmente.
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      <Footer />

      {/* Project Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingProject ? 'Editar Proyecto' : 'Agregar Nuevo Proyecto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Título del Proyecto
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                  placeholder="Ej. Villa Mariposa"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Ubicación
                </label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                  placeholder="Ej. Las Terrenas, Samaná"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Descripción del Proyecto
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800 dark:text-white"
                  placeholder="Escriba los detalles, conceptos de diseño, metros cuadrados o características especiales del proyecto..."
                />
              </div>

              {/* Multi-Images Manager */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Galería de Fotos del Proyecto
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
                    id="architecture-multi-images"
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
                      htmlFor="architecture-multi-images"
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 max-h-56 overflow-y-auto">
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
                <div className="p-3 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl">
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

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
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

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]">

            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-40 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer font-bold leading-none h-8 w-8 flex items-center justify-center"
              aria-label="Cerrar detalles"
            >
              ✕
            </button>

            {/* Left Column: Full-size project image or Carousel */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 dark:bg-slate-950 relative flex items-center justify-center min-h-64">
              {selectedProject.images && selectedProject.images.length > 1 ? (
                <div className="w-full h-full min-h-64">
                  <Carousel slides={selectedProject.images} />
                </div>
              ) : (
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Right Column: Title, Location & CTA */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[45vh] md:max-h-[85vh] space-y-6 bg-white dark:bg-slate-900">

              <div className="space-y-4">
                <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
                  Proyecto de Arquitectura
                </span>
                <h3 className="text-2xl font-extrabold text-brand-blue dark:text-slate-100">
                  {selectedProject.title}
                </h3>

                <div className="flex items-start space-x-2 text-sm text-slate-650 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <FaMapMarkerAlt className="text-brand-green mt-0.5 shrink-0" size={16} />
                  <span>{selectedProject.location}</span>
                </div>

                {/* Project Description */}
                {selectedProject.description && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      Descripción
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {selectedProject.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons (WhatsApp Edita / Contact Form) */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
                <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                  Consultar con la Arquitecta
                </h4>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleWhatsAppEditaClick(selectedProject)}
                    className="flex items-center justify-center space-x-2 py-3 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer w-full"
                  >
                    <FaWhatsapp size={16} />
                    <span>Preguntar por WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleEmailEditaClick(selectedProject)}
                    className="flex items-center justify-center space-x-2 py-3 bg-brand-blue hover:bg-brand-blue-light text-white font-bold rounded-xl text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer w-full"
                  >
                    <FaEnvelope size={16} />
                    <span>Enviar Consulta Web</span>
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
