import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [chatAbierto, setChatAbierto] = useState(false);
  const [input, setInput] = useState('');
  const [contexto, setContexto] = useState('');
  const [notifVisible, setNotifVisible] = useState(false);
  const [mensajes, setMensajes] = useState([
    { texto: "¡Hola! Soy el guía de Manos que Hablan Kids. 🤟 ¿Buscas un curso para tu hijo/a o para aprender en familia?", soyYo: false }
  ]);

  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!chatAbierto) setNotifVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [chatAbierto]);

  useEffect(() => { 
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; 
  }, [mensajes]);

  const motorDeRespuesta = (textoBruto) => {
    const t = textoBruto.toLowerCase().trim();
    let r = "";
    let nuevoContexto = "";

    if (t.includes("precio") || t.includes("cuanto") || t.includes("valor")) {
      r = "¡Claro! El curso para niños tiene un valor de $35.000 mensuales. 🎨 Incluye materiales lúdicos y clases en vivo. ¿Te gustaría conocer los horarios?";
      nuevoContexto = "pre_venta";
    } else if ((t === "si" || t === "sí" || t.includes("quiero")) && contexto === "pre_venta") {
      r = "¡Genial! 🚀 Déjame tu WhatsApp o correo y te enviamos el catálogo de niveles para peques.";
    } else if (t.includes("hola")) {
      r = "¡Hola! 👋 Estamos felices de recibir a nuevas familias. ¿Quieres saber cómo son nuestras clases para niños?";
    } else if (t.includes("whatsapp") || t.includes("hablar") || t.includes("asesor")) {
      r = "Un asesor pedagógico te atenderá aquí: https://wa.me/56998337777";
    } else {
      r = "¿Te gustaría que un profesor te contacte para resolver tus dudas sobre el aprendizaje de los niños?";
    }
    setContexto(nuevoContexto);
    setTimeout(() => setMensajes(prev => [...prev, { texto: r, soyYo: false }]), 500);
  };

  const enviarOpcionRapida = (opcion) => {
    setMensajes(prev => [...prev, { texto: opcion, soyYo: true }]);
    motorDeRespuesta(opcion);
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMensajes(prev => [...prev, { texto: input, soyYo: true }]);
    motorDeRespuesta(input);
    setInput('');
  };

  return (
    <div className="site-wrapper">
      <nav className="glass-nav">
        <div className="nav-container">
          <div className="logo-moderno">🤟 Manos<span>queHablan Kids</span></div>
          <div className="nav-actions">
            <button className="btn-cta-nav" onClick={() => setChatAbierto(true)}>Inscribir a mi hijo</button>
          </div>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-text">
          <span className="pill-info">🌈 Un mundo por descubrir</span>
          <h1>Aprender señas <br/><span>es como un juego</span></h1>
          <p>Clases lúdicas y dinámicas diseñadas para que los niños conecten, jueguen y aprendan un nuevo lenguaje de forma natural.</p>
          <div className="cta-group">
            <button className="btn-main" onClick={() => setChatAbierto(true)}>Ver Precios Kids</button>
          </div>
        </div>
      </header>

      <section className="steps-section">
        <h2 className="section-title">¿Cómo aprenden los peques?</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Juegos y Canciones</h4>
            <p>Dinámicas divertidas para memorizar señas sin esfuerzo.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Cuentacuentos</h4>
            <p>Historias visuales que estimulan su imaginación y empatía.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Certificado Junior</h4>
            <p>¡Un diploma especial para celebrar su nuevo gran talento!</p>
          </div>
        </div>
      </section>

      <section className="value-grid">
        <div className="value-card">
          <div className="value-icon">🍭</div>
          <h4>Didáctico</h4>
          <p>Metodología 100% adaptada a etapas de crecimiento.</p>
        </div>
        <div className="value-card">
          <div className="value-icon">🏠</div>
          <h4>Desde Casa</h4>
          <p>Clases seguras vía Zoom con profesores expertos.</p>
        </div>
        <div className="value-card">
          <div className="value-icon">💖</div>
          <h4>Inclusivo</h4>
          <p>Fomentamos valores de respeto y comunidad desde pequeños.</p>
        </div>
      </section>

      {!chatAbierto && (
        <div className="chat-trigger-wrapper">
          {notifVisible && (
            <div className="chat-notif-bubble">
              ¡Hola! ¿Buscabas clases para niños? 👋
              <button className="close-notif" onClick={(e) => { e.stopPropagation(); setNotifVisible(false); }}>×</button>
            </div>
          )}
          <button className="btn-consulta-premium" onClick={() => { setChatAbierto(true); setNotifVisible(false); }}>
            <div className="pulse-container">
              <span className="pulse-ring"></span>
              🤟
            </div>
            <div className="btn-txt">
              <span>¿Dudas?</span>
              <strong>¡Escríbenos!</strong>
            </div>
          </button>
        </div>
      )}

      {chatAbierto && (
        <div className="chat-window-styled">
          <div className="chat-head">
            <div className="user-info">
              <div className="status-dot"></div>
              <span>Guía Kids</span>
            </div>
            <button className="close-chat" onClick={() => setChatAbierto(false)}>✕</button>
          </div>
          <div className="chat-body" ref={scrollRef}>
            {mensajes.map((m, i) => (
              <div key={i} className={`msg-wrap ${m.soyYo ? 'mine' : 'theirs'}`}>
                <div className="msg-content">{m.texto}</div>
              </div>
            ))}
            {!mensajes[mensajes.length - 1].soyYo && (
              <div className="quick-chips">
                <button onClick={() => enviarOpcionRapida("Ver Precios Kids")}>💰 Precios</button>
                <button onClick={() => enviarOpcionRapida("Clase de prueba")}>🎭 Clase Gratis</button>
              </div>
            )}
          </div>
          <form className="chat-footer" onSubmit={manejarEnvio}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregúntanos lo que quieras..." />
            <button type="submit">➤</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;