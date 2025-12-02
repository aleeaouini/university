import { useState } from "react";
import { FileText, Upload, Download, CheckCircle, AlertCircle, File } from "lucide-react";

function CsvPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setMessage("Veuillez sélectionner un fichier CSV.");
      return;
    }

    const formData = new FormData();
    formData.append("csvfile", selectedFile);

    try {
      setMessage("Import en cours...");
      const response = await fetch("http://localhost:3004/import-csv", {
        method: "POST",
        body: formData,
      });
      const text = await response.text();
      setMessage(text);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setMessage(`Erreur: ${err.message}`);
    }
  };

  const handleExport = async () => {
    try {
      setMessage("Export en cours...");
      const response = await fetch("http://localhost:3004/export-csv");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "utilisateurs_export.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      setMessage("Export CSV terminé !");
    } catch (err) {
      console.error(err);
      setMessage(`Erreur: ${err.message}`);
    }
  };

  const getMessageType = () => {
    if (!message) return "idle";
    if (message.includes("en cours")) return "processing";
    if (message.includes("Erreur") || message.includes("Veuillez")) return "error";
    return "success";
  };

  const messageType = getMessageType();

  return (
    <div className="csv-page-container">
      {/* Header */}
      <div className="csv-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <FileText className="header-icon" />
          </div>
          <div className="header-text">
            <h1 className="csv-title">Gestion CSV</h1>
            <p className="csv-subtitle">Import et export de données au format CSV</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="csv-content">
        {/* Import Section */}
        <div className="csv-card import-card">
          <div className="card-header">
            <div className="card-header-content">
              <div className="card-icon-wrapper import-icon">
                <Upload className="card-icon" />
              </div>
              <div>
                <h3 className="card-title">Importer un fichier CSV</h3>
                <p className="card-description">Chargez vos fichiers CSV pour les importer dans le système</p>
              </div>
            </div>
          </div>

          <div className="card-body">
            {/* File Input Area */}
            <div className="file-input-wrapper">
              <label className="file-input-label">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="file-input-hidden"
                />
                <div className="file-input-visual">
                  <File className="file-icon" />
                  <div className="file-input-text">
                    <span className="file-input-primary">
                      {selectedFile ? selectedFile.name : "Cliquez pour sélectionner un fichier"}
                    </span>
                    <span className="file-input-secondary">
                      {selectedFile ? "Fichier CSV sélectionné" : "Format CSV uniquement"}
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* Import Button */}
            <button
              onClick={handleImport}
              className="action-btn import-btn"
            >
              <Upload className="btn-icon" />
              <span>Importer CSV</span>
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div className="csv-card export-card">
          <div className="card-header">
            <div className="card-header-content">
              <div className="card-icon-wrapper export-icon">
                <Download className="card-icon" />
              </div>
              <div>
                <h3 className="card-title">Exporter les données</h3>
                <p className="card-description">Téléchargez vos données au format CSV</p>
              </div>
            </div>
          </div>

          <div className="card-body">
            <button
              onClick={handleExport}
              className="action-btn export-btn"
            >
              <Download className="btn-icon" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message-card ${messageType}`}>
            <div className="message-content">
              {messageType === "success" && <CheckCircle className="message-icon" />}
              {messageType === "error" && <AlertCircle className="message-icon" />}
              {messageType === "processing" && (
                <div className="message-spinner"></div>
              )}
              <p className="message-text">{message}</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .csv-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Header */
        .csv-header {
          margin-bottom: 2.5rem;
          animation: slideDown 0.5s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .header-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, #18539c, #1e63b8);
          border-radius: 1rem;
          box-shadow: 0 8px 20px rgba(24, 83, 156, 0.25);
          transition: all 0.3s ease;
        }

        .header-icon-wrapper:hover {
          transform: scale(1.05) rotate(5deg);
          box-shadow: 0 12px 28px rgba(24, 83, 156, 0.35);
        }

        .header-icon {
          width: 2rem;
          height: 2rem;
          color: white;
        }

        .header-text {
          flex: 1;
        }

        .csv-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
          letter-spacing: -0.025em;
        }

        .csv-subtitle {
          font-size: 1rem;
          color: #64748b;
          margin: 0;
          font-weight: 400;
        }

        /* Content */
        .csv-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 768px) {
          .csv-content {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* CSV Card */
        .csv-card {
          background: white;
          border-radius: 1.5rem;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          animation: scaleIn 0.5s ease-out backwards;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .csv-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }

        .import-card {
          animation-delay: 0.1s;
        }

        .export-card {
          animation-delay: 0.2s;
        }

        /* Card Header */
        .card-header {
          padding: 1.75rem;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-bottom: 1px solid #e2e8f0;
        }

        .card-header-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .card-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 1rem;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .csv-card:hover .card-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .import-icon {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }

        .export-icon {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
        }

        .card-icon {
          width: 1.75rem;
          height: 1.75rem;
        }

        .import-icon .card-icon {
          color: #1e40af;
        }

        .export-icon .card-icon {
          color: #15803d;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.375rem 0;
        }

        .card-description {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        /* Card Body */
        .card-body {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* File Input */
        .file-input-wrapper {
          width: 100%;
        }

        .file-input-label {
          display: block;
          cursor: pointer;
        }

        .file-input-hidden {
          display: none;
        }

        .file-input-visual {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 1rem;
          transition: all 0.3s ease;
        }

        .file-input-visual:hover {
          background: white;
          border-color: #18539c;
          box-shadow: 0 0 0 3px rgba(24, 83, 156, 0.1);
        }

        .file-icon {
          width: 2.5rem;
          height: 2.5rem;
          color: #64748b;
          flex-shrink: 0;
        }

        .file-input-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
          min-width: 0;
        }

        .file-input-primary {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-input-secondary {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* Action Buttons */
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          width: 100%;
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        .import-btn {
          background: linear-gradient(135deg, #18539c, #1e63b8);
        }

        .export-btn {
          background: linear-gradient(135deg, #059669, #10b981);
        }

        .btn-icon {
          width: 1.125rem;
          height: 1.125rem;
        }

        /* Message Card */
        .message-card {
          grid-column: 1 / -1;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 2px solid;
          animation: slideInUp 0.4s ease-out;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-card.success {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-color: #86efac;
        }

        .message-card.error {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border-color: #fca5a5;
        }

        .message-card.processing {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border-color: #93c5fd;
        }

        .message-card.idle {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .message-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .message-icon {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
        }

        .message-card.success .message-icon {
          color: #15803d;
        }

        .message-card.error .message-icon {
          color: #dc2626;
        }

        .message-card.processing .message-icon {
          color: #1e40af;
        }

        .message-spinner {
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid #bfdbfe;
          border-top-color: #1e40af;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .message-text {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
        }

        .message-card.success .message-text {
          color: #15803d;
        }

        .message-card.error .message-text {
          color: #dc2626;
        }

        .message-card.processing .message-text {
          color: #1e40af;
        }

        .message-card.idle .message-text {
          color: #64748b;
        }

        /* Responsive Design */
        @media (max-width: 767px) {
          .csv-page-container {
            padding: 1.5rem 1rem;
          }

          .csv-header {
            margin-bottom: 2rem;
          }

          .csv-title {
            font-size: 2rem;
          }

          .csv-subtitle {
            font-size: 0.875rem;
          }

          .header-icon-wrapper {
            width: 3.5rem;
            height: 3.5rem;
          }

          .header-icon {
            width: 1.75rem;
            height: 1.75rem;
          }

          .csv-content {
            gap: 1.5rem;
          }

          .card-header {
            padding: 1.5rem;
          }

          .card-body {
            padding: 1.5rem;
          }

          .card-icon-wrapper {
            width: 3rem;
            height: 3rem;
          }

          .card-icon {
            width: 1.5rem;
            height: 1.5rem;
          }

          .card-title {
            font-size: 1.125rem;
          }

          .card-description {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .csv-page-container {
            padding: 1rem 0.75rem;
          }

          .csv-title {
            font-size: 1.75rem;
          }

          .header-content {
            gap: 1rem;
          }

          .header-icon-wrapper {
            width: 3rem;
            height: 3rem;
          }

          .header-icon {
            width: 1.5rem;
            height: 1.5rem;
          }

          .card-header-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .file-input-visual {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem 1rem;
          }

          .action-btn {
            padding: 0.75rem 1.25rem;
            font-size: 0.95rem;
          }

          .message-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}

export default CsvPage;