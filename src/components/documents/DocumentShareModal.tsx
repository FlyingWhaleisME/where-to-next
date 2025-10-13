import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Copy, Download } from 'lucide-react';

interface DocumentShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SharedDocument {
  id: string;
  data: any;
  creatorName: string;
  createdAt: string;
  accessCount: number;
}

const DocumentShareModal: React.FC<DocumentShareModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [shareCode, setShareCode] = useState('');
  const [sharedDocument, setSharedDocument] = useState<SharedDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareCode.trim()) return;

    setIsLoading(true);
    setError('');
    setSharedDocument(null);

    try {
      const upperShareCode = shareCode.toUpperCase();
      console.log('🔍 [DEBUG] DocumentShareModal: Attempting to retrieve document with code:', upperShareCode);
      
      // Retrieve shared document from backend API (no authentication required for viewing)
      const response = await fetch(`http://localhost:3001/api/documents/share/${upperShareCode}`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Document not found');
      }

      console.log('🔍 [DEBUG] DocumentShareModal: Backend API response:', result);
      
      // Convert to the expected format
      setSharedDocument({
        id: result.document.id,
        data: result.document.data,
        creatorName: result.document.creatorName,
        createdAt: result.document.createdAt,
        accessCount: result.document.accessCount
      });
      
      console.log('🔍 [DEBUG] DocumentShareModal: Successfully set sharedDocument from backend API.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('❌ [ERROR] DocumentShareModal: Error during document retrieval:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyShareCode = () => {
    if (sharedDocument) {
      navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (sharedDocument) {
      const blob = new Blob([JSON.stringify(sharedDocument.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trip-document-${shareCode}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const resetModal = () => {
    setShareCode('');
    setSharedDocument(null);
    setError('');
    setCopied(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {sharedDocument ? 'Shared Document' : 'View Document by Code'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <AnimatePresence mode="wait">
            {!sharedDocument ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-md mx-auto"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Enter Document Share Code
                  </h3>
                  <p className="text-gray-600">
                    Enter the 6-character code to view a shared trip document
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={shareCode}
                      onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-character code"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-red-600 text-sm">{error}</p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={!shareCode.trim() || isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Loading Document...
                      </div>
                    ) : (
                      'View Document'
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="document"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Document Header */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Trip Document
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyShareCode}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy Code'}
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to the full document page with share code
                          navigate(`/shared-document/${sharedDocument.id}?code=${shareCode}`);
                          onClose(); // Close the modal
                        }}
                        className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Document
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Creator:</span> {sharedDocument.creatorName}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {formatDate(sharedDocument.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Views:</span> {sharedDocument.accessCount}
                    </div>
                  </div>
                </div>

                {/* Document Content */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Document Content</h4>
                  <div className="prose max-w-none">
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(sharedDocument.data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetModal}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Another Document
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>,
    document.body || document.createElement('div')
  );
};

export default DocumentShareModal;
