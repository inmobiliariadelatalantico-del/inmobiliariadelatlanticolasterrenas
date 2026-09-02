import { useState } from 'react';
import { FaDraftingCompass, FaHardHat, FaSearch, FaCalculator, FaCheckCircle, FaEdit, FaTrashAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import SEO from './SEO';
import { useAdmin } from '../context/AdminContext';
import type { Project } from '../types';
import { cleanInputString } from '../lib/security';
import { optimizeImageFile } from '../lib/imageOptimizer';

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
  const [formImage, setFormImage] = useState('');

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormLocation('');
    setFormImage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: any) => {
    setEditingProject(proj);
    setFormTitle(proj.title);
    setFormLocation(proj.location);
    setFormImage(proj.image);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImageFile(file);
        setFormImage(optimized);
      } catch (err) {
        alert((err as Error).message || 'Error al procesar la imagen.');
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = cleanInputString(formTitle, 150);
    const cleanLocation = cleanInputString(formLocation, 200);

    if (!cleanTitle || !cleanLocation) {
      alert('El título y la ubicación del proyecto son obligatorios.');
      return;
    }

    const projectData = {
      title: cleanTitle,
      location: cleanLocation,
      image: formImage.trim() || '/samana.png'
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
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
            <form onSubmit={handleSave} className="p-6 space-y-4">
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

              {/* Cover Image Visual Manager */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Foto de Portada del Proyecto
                </label>

                {/* Live Preview */}
                {formImage ? (
                  <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shadow-inner group">
                    <img
                      src={formImage}
                      alt="Vista previa de portada"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormImage('')}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-transform hover:scale-105 cursor-pointer"
                      title="Quitar foto"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-400">
                    No se ha seleccionado ninguna foto de portada. Cargue una foto de su computadora o pegue un enlace.
                  </div>
                )}

                {/* Upload options grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* File Selector */}
                  <div className="flex flex-col justify-center p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cargar de la computadora o celular
                    </span>
                    <label className="px-3 py-2 bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-bold rounded-lg text-center cursor-pointer shadow-sm transition-all hover:scale-[1.01]">
                      <span>Seleccionar Foto...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* URL Input */}
                  <div className="flex flex-col justify-center p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Pegar enlace de internet
                    </span>
                    <input
                      type="text"
                      value={formImage}
                      onChange={e => setFormImage(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue text-slate-800 dark:text-white"
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
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

            {/* Left Column: Full-size project image */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 dark:bg-slate-950 relative flex items-center justify-center">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
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
