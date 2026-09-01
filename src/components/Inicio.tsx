import { Link } from 'react-router-dom';
import { FaGavel, FaBuilding, FaDraftingCompass, FaArrowRight } from 'react-icons/fa';
import Footer from './Footer';
import SEO from './SEO';

export default function Inicio() {
  return (
    <>
      <SEO
        title="Bienes Raíces, Legal & Arquitectura en Las Terrenas"
        description="Venta y alquiler de villas, apartamentos y terrenos en Las Terrenas, Samaná. Asesoría jurídica experta y proyectos de arquitectura en República Dominicana."
        canonicalPath="/"
      />
      {/* Hero Section */}
      <section className="relative w-full h-162.5 bg-black overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero_villa.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/20 sm:bg-linear-to-r sm:from-black/15 sm:via-black/25 sm:to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center sm:items-start sm:text-left z-10">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-md">
              Su Futuro en las terrenas, <br />
              <span className="text-brand-green-light">Respaldados por Expertos</span> <br />
              en la Costa Atlántica
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 leading-relaxed font-light drop-shadow">
              Soluciones integrales de primer nivel en servicios legales, inmobiliarios y de arquitectura para inversores exigentes.
            </p>
            <div className="pt-4">
              <Link
                to="/inmobiliaria"
                className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-brand-green hover:bg-brand-green-dark text-white font-bold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Explorar Propiedades
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Summary Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            {/* Legal Services Card */}
            <div className="flex flex-col items-center text-center p-8 bg-[#F8FAFC] rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-slate-100 group">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-brand-blue-light/10 text-brand-blue mb-6 group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                <FaGavel size={26} />
              </div>
              <h2 className="text-xl font-bold text-brand-blue mb-4">
                Servicios Jurídicos y Legales
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 grow">
                Protección y asesoría especializada en derecho civil, penal y corporativo para garantizar transacciones e inversiones seguras.
              </p>
              <Link
                to="/juridico"
                className="inline-flex items-center text-brand-green hover:text-brand-green-dark text-sm font-bold tracking-wide transition-colors duration-200"
              >
                Más información <FaArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </div>

            {/* Real Estate Services Card */}
            <div className="flex flex-col items-center text-center p-8 bg-[#F8FAFC] rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-slate-100 group">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-brand-green/10 text-brand-green mb-6 group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
                <FaBuilding size={26} />
              </div>
              <h2 className="text-xl font-bold text-brand-blue mb-4">
                Bienes Raíces y Gestión
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 grow">
                Encuentre y gestione la propiedad perfecta en Las Terrenas. Transferencias, administración de condominios y alquileres.
              </p>
              <Link
                to="/inmobiliaria"
                className="inline-flex items-center text-brand-green hover:text-brand-green-dark text-sm font-bold tracking-wide transition-colors duration-200"
              >
                Más información <FaArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </div>

            {/* Architecture Services Card */}
            <div className="flex flex-col items-center text-center p-8 bg-[#F8FAFC] rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-slate-100 group">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-brand-blue-light/10 text-brand-blue mb-6 group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                <FaDraftingCompass size={26} />
              </div>
              <h2 className="text-xl font-bold text-brand-blue mb-4">
                Arquitectura y Construcción
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 grow">
                De la visión a la obra. Diseño arquitectónico, levantamientos, remodelación, tasación y supervisión de proyectos de alta gama.
              </p>
              <Link
                to="/arquitectura"
                className="inline-flex items-center text-brand-green hover:text-brand-green-dark text-sm font-bold tracking-wide transition-colors duration-200"
              >
                Más información <FaArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
