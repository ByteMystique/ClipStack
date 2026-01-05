// frontend/src/components/ExportButton.jsx
function ExportButton({ onExport, isExporting, disabled }) {
  return (
    <button
      className={`btn-export ${isExporting ? 'exporting' : ''}`}
      onClick={onExport}
      disabled={disabled || isExporting}
    >
      {isExporting ? (
        <>
          <span className="spinner">⏳</span>
          Exporting...
        </>
      ) : (
        <>
          <span>⬇️</span>
          Export Video
        </>
      )}
    </button>
  );
}

export default ExportButton;