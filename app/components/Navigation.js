'use client';

export default function Navigation() {
  const handleShowForm = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.showRequestForm) {
      window.showRequestForm();
    }
  };

  const handleShowContact = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.showContactForm) {
      window.showContactForm();
    }
  };

  const handleShowStatus = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.showStatusForm) {
      window.showStatusForm();
    }
  };

  return (
    <nav>
      <a href="#" onClick={handleShowForm}>
        Realizar solicitud
      </a>
      <a href="#" onClick={handleShowStatus}>Estado de solicitud</a>
      <a href="#" onClick={handleShowContact}>Contacto</a>
    </nav>
  );
}