import { useState } from "react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl">
              📁
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Gestion CSV (Import / Export)
            </h2>
          </div>

          <div className="space-y-6">
            {/* Import Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Importer un fichier CSV
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer file:hover:bg-blue-600"
                  />
                </div>
                <button
                  onClick={handleImport}
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Importer CSV
                </button>
              </div>
            </div>

            {/* Export Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Exporter les données
              </h3>
              <button
                onClick={handleExport}
                className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
              >
                Exporter CSV
              </button>
            </div>

            {/* Message Display Area */}
            <div className="rounded-xl p-6 border-2 min-h-[100px] flex items-center justify-center bg-blue-50 border-blue-300">
              <p className={`text-center ${message ? 'text-blue-700 font-semibold' : 'text-gray-400 italic'}`}>
                {message || "Les messages s'afficheront ici..."}
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📤</span>
              <h4 className="font-semibold text-gray-700">Import</h4>
            </div>
            <p className="text-sm text-gray-600">
              Chargez vos fichiers CSV pour les importer dans le système
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📥</span>
              <h4 className="font-semibold text-gray-700">Export</h4>
            </div>
            <p className="text-sm text-gray-600">
              Téléchargez vos données au format CSV
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CsvPage;
