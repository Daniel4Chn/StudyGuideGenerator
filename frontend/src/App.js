import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studyGuide, setStudyGuide] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setInputText('');
      setError(null);
    } else {
      setError('Please select a PDF file');
      setSelectedFile(null);
    }
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    setSelectedFile(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!inputText.trim() && !selectedFile) {
      setError('Please paste text or upload a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setStudyGuide(null);

    try {
      let response;

      if (selectedFile) {
        // Upload PDF
        const formData = new FormData();
        formData.append('pdf', selectedFile);

        response = await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Send text
        response = await axios.post(`${API_BASE_URL}/generate`, {
          text: inputText,
        });
      }

      setStudyGuide(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to generate study guide. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setSelectedFile(null);
    setStudyGuide(null);
    setError(null);
    // Reset file input
    const fileInput = document.getElementById('pdf-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lecture Notes to Study Guide
          </h1>
          <p className="text-gray-600">
            Transform your lecture notes into a structured study guide
          </p>
        </header>

        {!studyGuide ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="space-y-6">
              {/* PDF Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload PDF (Optional)
                </label>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Text Input Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Lecture Notes
                </label>
                <textarea
                  value={inputText}
                  onChange={handleTextChange}
                  placeholder="Paste your lecture notes here..."
                  rows="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || (!inputText.trim() && !selectedFile)}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating Study Guide...
                  </span>
                ) : (
                  'Generate Study Guide'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Study Guide Results */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Study Guide
                </h2>
                <button
                  onClick={handleReset}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create New
                </button>
              </div>

              {/* Key Concepts */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Key Concepts
                </h3>
                <ul className="space-y-2">
                  {studyGuide.keyConcepts?.map((concept, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{concept}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Explanations */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Explanations
                </h3>
                <div className="space-y-4">
                  {Object.entries(studyGuide.explanations || {}).map(
                    ([concept, explanation], index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {concept}
                        </h4>
                        <p className="text-gray-700">{explanation}</p>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* Practice Questions */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Practice Questions
                </h3>
                <div className="space-y-4">
                  {studyGuide.practiceQuestions?.map((qa, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-md">
                      <p className="font-semibold text-gray-800 mb-2">
                        Q{index + 1}: {qa.question}
                      </p>
                      <p className="text-gray-700 pl-4 border-l-2 border-blue-300">
                        <span className="font-medium">Answer:</span> {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Cheat Sheet */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Cheat Sheet
                </h3>
                <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-400">
                  <p className="text-gray-700 whitespace-pre-line">
                    {studyGuide.cheatSheet}
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

