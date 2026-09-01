import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import SEO from './SEO';
import { cleanInputString, isValidEmail } from '../lib/security';

export default function Contactanos() {
  const location = useLocation();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    sujeto: 'Consulta General',
    mensaje: '',
    website: '' // Honeypot field
  });

  useEffect(() => {
    if (location.state && (location.state as any).subject) {
      setFormData(prev => ({
        ...prev,
        sujeto: cleanInputString((location.state as any).subject, 100),
        mensaje: cleanInputString((location.state as any).message || '', 2000)
      }));
    }
  }, [location.state]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanNombre = cleanInputString(formData.nombre, 100);
    const cleanEmail = formData.email.trim();
    const cleanSujeto = cleanInputString(formData.sujeto, 100);
    const cleanMensaje = cleanInputString(formData.mensaje, 3000);

    if (!cleanNombre || !cleanEmail || !cleanMensaje) {
      setErrorMsg('Por favor complete todos los campos obligatorios.');
      setLoading(false);
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMsg('Por favor ingrese un correo electrónico válido (ej. usuario@dominio.com).');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: cleanNombre,
          user_email: cleanEmail,
          subject: cleanSujeto,
          message: cleanMensaje,
          website: formData.website // Honeypot
        })
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        setSubmitted(true);
        setFormData({ nombre: '', email: '', sujeto: 'Consulta General', mensaje: '', website: '' });
      } else {
        setErrorMsg(resData.error || 'Hubo un error al enviar el correo.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo establecer conexión con el servidor de correos. Intente nuevamente en unos minutos.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWhatsAppFrancisco = () => {
    const message = "Hola Dr. Francisco Hernández, me comunico a través de la web. Me gustaría realizar una consulta legal.";
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/18297709011?text=${encodedMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppEdita = () => {
    const message = "Hola Arq. Edita Hernández, me comunico a través de la web. Me gustaría realizar una consulta sobre un proyecto de arquitectura/construcción.";
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/18099139331?text=${encodedMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <SEO
        title="Contáctenos | Inmobiliaria del Atlántico Las Terrenas"
        description="Póngase en contacto con nuestro equipo de asesores inmobiliarios, abogados y arquitectos en Las Terrenas, Samaná. Atención directa por WhatsApp y correo electrónico."
        canonicalPath="/contactanos"
      />
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Column: Contact Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-slate-100 space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-brand-blue tracking-tight">
                  Contáctanos
                </h1>
                <p className="text-sm text-gray-500 font-light">
                  Envíenos un mensaje y nos pondremos en contacto con usted a la brevedad posible.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-xl text-center font-bold text-sm transition-all duration-300">
                  ¡Mensaje enviado con éxito! Nos comunicaremos con usted pronto.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Anti-spam honeypot (hidden from human users) */}
                  <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="nombre" className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        required
                        maxLength={100}
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej. Juan Pérez"
                        className="px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none transition-colors duration-200"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="email" className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        maxLength={120}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ej. juan@correo.com"
                        className="px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-brand-green transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label htmlFor="sujeto" className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                      Asunto de Consulta
                    </label>
                    <select
                      name="sujeto"
                      id="sujeto"
                      value={formData.sujeto}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-lg border text-sm bg-white focus:outline-none focus:border-brand-green transition-colors duration-200"
                    >
                      <option value="Consulta General">Consulta General</option>
                      <option value="Servicios Inmobiliarios">Bienes Raíces / Inmobiliaria</option>
                      <option value="Servicios Jurídicos">Servicios Jurídicos y Legales</option>
                      <option value="Servicios de Arquitectura">Arquitectura y Diseño</option>
                      <option value="Soporte Técnico">Soporte Técnico</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label htmlFor="mensaje" className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                      Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      id="mensaje"
                      required
                      maxLength={3000}
                      rows={5}
                      value={formData.mensaje}
                      onChange={handleChange}
                      placeholder="Escriba aquí los detalles de su requerimiento..."
                      className="px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-brand-green transition-colors duration-200 resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-600/10 border border-red-500/30 text-red-600 rounded-xl text-center text-sm font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold tracking-wider text-sm rounded-lg shadow hover:shadow-lg transition-all duration-200 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Professional Contacts */}
            <div className="lg:col-span-5 space-y-8 flex flex-col">

              {/* Main Callout Box */}
              <div className="bg-brand-blue text-white rounded-2xl p-8 lg:p-10 shadow-xl space-y-6">
                <h2 className="text-2xl font-extrabold tracking-wide uppercase border-b border-brand-blue-light pb-4">
                  Hablemos Directamente
                </h2>

                {/* General Contacts */}
                <div className="space-y-4 text-sm text-gray-300">
                  <div className="flex items-start space-x-3">
                    <FaMapMarkerAlt className="text-brand-green-light mt-1 shrink-0" size={18} />
                    <span>Calle Juan Pablo Duarte #60, Centro de la Ciudad, Las Terrenas, RD.</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="text-brand-green-light shrink-0" size={16} />
                    <span>inmobiliariadelatalantico@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaClock className="text-brand-green-light shrink-0" size={16} />

                    <div>
                      <span>Lunes a viernes: 9:00 AM a 6:00 PM</span>
                      <p>Sábados: 8:00 AM - 3:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profiles Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 grow">
                {/* Francisco Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow duration-300">
                  <div className="space-y-2">
                    <h3 className="font-bold text-brand-blue text-sm uppercase tracking-wide">
                      FRANCISCO HERNÁNDEZ
                    </h3>
                    <span className="text-[10px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded font-bold uppercase">
                      Abogado
                    </span>
                    <p className="text-xs text-gray-500 leading-relaxed font-light">
                      Prestigioso abogado especializado en derecho civil, penal y migratorio, ofreciendo asesoría y representación excepcional en Samaná.
                    </p>
                  </div>
                  <button
                    onClick={handleWhatsAppFrancisco}
                    className="inline-flex items-center justify-center space-x-2 w-full py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-xs font-bold transition-colors duration-200 cursor-pointer"
                  >
                    <FaWhatsapp size={16} />
                    <span>WhatsApp Francisco</span>
                  </button>
                </div>

                {/* Edita Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow duration-300">
                  <div className="space-y-2">
                    <h3 className="font-bold text-brand-blue text-sm uppercase tracking-wide">
                      EDITA HERNÁNDEZ
                    </h3>
                    <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded font-bold uppercase">
                      Arquitecta
                    </span>
                    <p className="text-xs text-gray-500 leading-relaxed font-light">
                      Distinguida arquitecta reconocida por su excelencia en diseño y construcción, especializada en proyectos innovadores y funcionales.
                    </p>
                  </div>
                  <button
                    onClick={handleWhatsAppEdita}
                    className="inline-flex items-center justify-center space-x-2 w-full py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-xs font-bold transition-colors duration-200 cursor-pointer"
                  >
                    <FaWhatsapp size={16} />
                    <span>WhatsApp Edita</span>
                  </button>
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
