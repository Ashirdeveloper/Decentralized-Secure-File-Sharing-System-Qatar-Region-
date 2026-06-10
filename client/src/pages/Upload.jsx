import React, { useState } from 'react';
import api from '../api/axios';
import { Upload as UploadIcon, FileText, CheckCircle, AlertTriangle, Key, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
        setResult(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setError('');

        try {
            const res = await api.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could show toast
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-3xl mx-auto">
                <Link to="/dashboard" className="text-slate-400 hover:text-white mb-6 inline-block">&larr; Back to Dashboard</Link>

                <h1 className="text-3xl font-bold mb-8 flex items-center">
                    <UploadIcon className="w-8 h-8 mr-3 text-emerald-500" />
                    Secure File Upload
                </h1>

                {!result ? (
                    <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="border-2 border-dashed border-slate-600 rounded-lg p-10 text-center hover:border-emerald-500/50 transition-colors">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="fileInput"
                                />
                                <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                                    <FileText className="w-16 h-16 text-slate-500 mb-4" />
                                    <span className="text-xl text-slate-300 font-medium">
                                        {file ? file.name : 'Click to select a file'}
                                    </span>
                                    <span className="text-sm text-slate-500 mt-2">Max size: 2MB (Prototype Limit)</span>
                                </label>
                            </div>

                            {error && <div className="text-red-500 text-center p-3 bg-red-500/10 rounded">{error}</div>}

                            <button
                                type="submit"
                                disabled={uploading || !file}
                                className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-colors ${uploading || !file
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                            >
                                {uploading ? 'Processing (Encrypting & Splitting)...' : 'Encrypt & Upload'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Status Panel */}
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <div className="flex items-center mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-500 mr-3" />
                                <h2 className="text-2xl font-bold text-white">Upload Successful</h2>
                            </div>
                            <p className="text-slate-400 mb-2">File ID: <span className="font-mono text-emerald-400">{result.fileId}</span></p>
                            <p className="text-slate-400">{result.msg}</p>
                        </div>

                        {/* AI Scan Results */}
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
                                AI Sensitivity Scan
                            </h3>
                            {result.findings && result.findings.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-200">
                                        <strong>Warning:</strong> Sensitive data detected in this file.
                                    </div>
                                    {result.findings.map((finding, idx) => (
                                        <div key={idx} className="bg-slate-900 p-4 rounded border border-slate-700">
                                            <p className="font-bold text-yellow-500">{finding.type} Detected</p>
                                            <p className="text-slate-400 text-sm">Count: {finding.count}</p>
                                            <p className="text-slate-500 text-xs mt-1">Examples: {finding.examples.join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-200 flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    No sensitive data detected.
                                </div>
                            )}
                        </div>

                        {/* Shard Keys */}
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                <Key className="w-6 h-6 text-blue-500 mr-2" />
                                Shard Keys
                            </h3>
                            <p className="text-slate-400 mb-4 text-sm">
                                These keys are required to reconstruct the file. <strong className="text-white">You need at least 3 of these keys.</strong> Store them securely or share them with authorized recipients.
                            </p>

                            <div className="space-y-2">
                                {result.shardKeys.map((key, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                        <span className="text-slate-500 w-6 font-mono">{idx + 1}.</span>
                                        <code className="flex-1 bg-slate-900 p-2 rounded text-xs break-all text-blue-300 font-mono">
                                            {key}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(key)}
                                            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                            title="Copy Key"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center pt-4">
                            <button onClick={() => { setFile(null); setResult(null); }} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white">
                                Upload Another
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Upload;
