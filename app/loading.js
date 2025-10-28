export default function Loading() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <h4>Cargando VecindApp...</h4>
        <p className="text-muted">Por favor espera un momento</p>
      </div>
    </div>
  );
}