import { useState } from 'react';
import { FaGavel, FaUsers, FaShieldAlt, FaBriefcase, FaUniversity } from 'react-icons/fa';
import Footer from './Footer';
import SEO from './SEO';

interface SubService {
  title: string;
  items: string[];
}

interface LawCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgImage: string;
  subcategories: SubService[];
}

export default function Juridico() {
  const categories: LawCategory[] = [
    {
      id: 'civil',
      title: 'Derecho Civil',
      description: 'Protección integral de sus relaciones personales, familiares y patrimoniales.',
      icon: <FaUsers size={24} />,
      bgImage: '/martillo.png',
      subcategories: [
        {
          title: 'Derecho de Persona y Familia',
          items: [
            'Registro y reconocimiento de personas (nombres, nacionalidad, capacidad legal).',
            'Matrimonios, divorcios y separación de bienes.',
            'Adopciones y tutela de menores.',
            'Patria potestad y custodia de hijos.',
            'Declaración de interdicción (incapacidad legal de una persona).'
          ]
        },
        {
          title: 'Derecho de Obligaciones y Contratos',
          items: [
            'Redacción y revisión de contratos (compraventa, arrendamiento, préstamos, etc.).',
            'Responsabilidad civil por daños y perjuicios.',
            'Cumplimiento e incumplimiento de contratos.',
            'Negociaciones y resolución de disputas contractuales.'
          ]
        },
        {
          title: 'Derecho de Sucesiones (Herencias)',
          items: [
            'Elaboración de testamentos.',
            'Declaración de herederos.',
            'Partición y administración de herencias.',
            'Impugnación de testamentos.'
          ]
        },
        {
          title: 'Responsabilidad Civil y Daños',
          items: [
            'Indemnización por daños materiales o morales.',
            'Responsabilidad por accidentes de tránsito.',
            'Responsabilidad médica o profesional.'
          ]
        },
        {
          title: 'Derecho de Bienes y Propiedad',
          items: [
            'Compra, venta y transferencia de bienes inmuebles.',
            'Constitución de hipotecas y otros derechos reales.',
            'Usufructo, uso y servidumbres de bienes.',
            'Conflictos de propiedad y posesión.'
          ]
        }
      ]
    },
    {
      id: 'penal',
      title: 'Derecho Penal',
      description: 'Defensa estratégica y representación comprometida en procesos delictivos.',
      icon: <FaShieldAlt size={24} />,
      bgImage: '/palaciojusticiasamana.jpg',
      subcategories: [
        {
          title: 'Defensa Penal y Representación',
          items: [
            'Defensa de acusados en procesos penales.',
            'Asistencia legal en detenciones y declaraciones.',
            'Apelaciones y recursos ante condenas.',
            'Representación de víctimas en juicios penales.'
          ]
        },
        {
          title: 'Delitos y Sanciones',
          items: [
            'Delitos contra la persona y propiedad.',
            'Delitos económicos, financieros e informáticos.',
            'Delitos contra la administración pública.',
            'Delitos contra la seguridad pública.'
          ]
        },
        {
          title: 'Ejecución de Penas',
          items: [
            'Reducción de penas y beneficios penitenciarios.',
            'Trámites de libertad condicional.',
            'Recursos contra decisiones judiciales desfavorables.',
            'Protección de derechos de personas privadas de libertad.'
          ]
        },
        {
          title: 'Asesoría y Prevención Penal',
          items: [
            'Asesoramiento legal para evitar conductas delictivas.',
            'Elaboración de estrategias de defensa legal.',
            'Mediación y acuerdos extrajudiciales en casos penales.'
          ]
        }
      ]
    },
    {
      id: 'laboral',
      title: 'Derecho Laboral',
      description: 'Mediación eficaz y defensa de derechos del trabajador y empleador.',
      icon: <FaBriefcase size={24} />,
      bgImage: '/laboral.png',
      subcategories: [
        {
          title: 'Asesoría Laboral Completa',
          items: [
            'Contratos de Trabajo y Condiciones Laborales.',
            'Despidos y Terminación de Contratos.',
            'Derechos y Beneficios Laborales.'
          ]
        }
      ]
    },
    {
      id: 'mercantil',
      title: 'Derecho Mercantil',
      description: 'Estructuración societaria y protección de propiedad corporativa.',
      icon: <FaUniversity size={24} />,
      bgImage: '/mercantil.png',
      subcategories: [
        {
          title: 'Servicios Corporativos',
          items: [
            'Constitución y Regulación de Empresas.',
            'Contratos Mercantiles.',
            'Propiedad Intelectual y Protección de Marcas y Patentes.'
          ]
        }
      ]
    },
    {
      id: 'inmobiliario',
      title: 'Derecho inmobiliario',
      description: 'Gestión de derechos reales, deslindes y tramitaciones inmobiliarias.',
      icon: <FaUniversity size={24} />,
      bgImage: '/cortesfscmcori.jpg',
      subcategories: [
        {
          title: 'SERVICIOS INMOBILIARIOS Y BIENES RAÍCES',
          items: [
            ' tranferencias inmobiliarias.',
            'litis sobre derechos registrados',
            'deslindes',
            'sub divisiones y mesura',
            'determionacion de herederos entre otros'
          ]
        }
      ]
    }
  ];

  const [activeTab, setActiveTab] = useState<string>('civil');

  const selectedCategory = categories.find(cat => cat.id === activeTab) || categories[0];

  return (
    <>
      <SEO
        title="Servicios Legales y Abogados Inmobiliarios en Las Terrenas, Samaná"
        description="Bufete legal especializado en derecho inmobiliario, deslindes, transferencias, contratos, derecho civil, laboral y penal en Las Terrenas y Samaná, República Dominicana."
        canonicalPath="/juridico"
      />
      {/* Intro Banner */}
      <section className="bg-brand-blue text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-grid-pattern pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-green/20 text-brand-green-light rounded-full text-xs font-semibold uppercase tracking-wider">
            <FaGavel size={12} />
            <span>Asesoría Legal Profesional</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Servicios Jurídicos Especializados
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-light">
            Ofrecemos representación y consultoría legal de primer nivel en Samaná, protegiendo sus intereses con honestidad, rigor y eficacia.
          </p>
        </div>
      </section>

      {/* Main Content with Tabs */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Tab Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center space-x-2.5 px-6 py-3.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 shadow ${activeTab === cat.id
                    ? 'bg-brand-green text-white scale-[1.02]'
                    : 'bg-white text-brand-blue hover:bg-brand-blue-light hover:text-white'
                  }`}
              >
                {cat.icon}
                <span>{cat.title}</span>
              </button>
            ))}
          </div>

          {/* Active Tab Panel */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 lg:p-12">

              {/* Left Side: Summary Image & Info */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
                <img
                  src={selectedCategory.bgImage}
                  alt={selectedCategory.title}
                  className="w-48 h-48 rounded-full shadow-lg object-cover border-4 border-slate-50 hover:scale-105 transition-transform duration-300"
                />
                <div className="text-center lg:text-left space-y-3">
                  <h2 className="text-2xl font-extrabold text-brand-blue">
                    {selectedCategory.title}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed font-light">
                    {selectedCategory.description}
                  </p>
                </div>
              </div>

              {/* Right Side: Specific Details */}
              <div className="lg:col-span-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {selectedCategory.subcategories.map((sub, i) => (
                    <div key={i} className="space-y-4">
                      <h3 className="text-base font-bold text-brand-green uppercase tracking-wide border-b border-brand-green-light/20 pb-2">
                        {sub.title}
                      </h3>
                      <ul className="space-y-2.5">
                        {sub.items.map((item, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600 leading-relaxed">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-blue mt-2 mr-2.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
