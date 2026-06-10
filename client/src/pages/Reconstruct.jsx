import React, { useState } from 'react';
import api from '../api/axios';
import { Download, Key, FileCheck, ArrowRight, AlertCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reconstruct = () => {
    // We need minimum 3 keys. Let's provide 3 input fields dynamically or fixed?
    // User might want to paste more. Let's just have 3 required inputs, optionally add more.
    // For simplicity, 3 is the threshold, so 3 is enough.
    const [keys, setKeys] = useState(['', '', '']);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleKeyChange = (index, value) => {
        const newKeys = [...keys];
        newKeys[index] = value;
        setKeys(newKeys);
    };

    const handleReconstruct = async (e) => {
        e.preventDefault();

        // Filter empty keys
        const validKeys = keys.filter(k => k.trim() !== '');

        if (validKeys.length < 3) {
            setError('You must provide at least 3 shard keys.');
            return;
        }

        setError('');
        setDownloading(true);

        try {
            const res = await api.post('/files/reconstruct', { shardKeys: validKeys }, {
                responseType: 'blob'
            });

            // Trigger download
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;

            // Try to get filename from header
            const contentDisposition = res.headers['content-disposition'];
            let filename = 'reconstructed_file';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match) filename = match[1];
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setSuccess(true);
        } catch (err) {
            console.error(err);
            // If blob, we need to read it to see error message
            if (err.response && err.response.data instanceof Blob) {
                const text = await err.response.data.text();
                try {
                    const json = JSON.parse(text);
                    setError(json.msg || 'Reconstruction failed');
                } catch {
                    setError('Reconstruction failed');
                }
            } else {
                setError('Reconstruction failed. Keys may be invalid or file expired.');
            }
        } finally {
            setDownloading(false);
        }
    };

    const reset = () => {
        setKeys(['', '', '']);
        setSuccess(false);
        setError('');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-3xl mx-auto">
                <Link to="/dashboard" className="text-slate-400 hover:text-white mb-6 inline-block">&larr; Back to Dashboard</Link>

                <h1 className="text-3xl font-bold mb-8 flex items-center">
                    <Download className="w-8 h-8 mr-3 text-blue-500" />
                    File Reconstruction
                </h1>

                {!success ? (
                    <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                        <p className="text-slate-400 mb-6">
                            Enter any <strong>3 valid shard keys</strong> to reconstruct and download the original file from the decentralized network.
                        </p>

                        <form onSubmit={handleReconstruct} className="space-y-4">
                            {keys.map((key, idx) => (
                                <div key={idx} className="flex items-center space-x-3">
                                    <div className="bg-slate-700 p-2 rounded text-slate-400">
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`Shard Key #${idx + 1}`}
                                        className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded text-blue-300 font-mono focus:outline-none focus:border-blue-500 transition-colors"
                                        value={key}
                                        onChange={(e) => handleKeyChange(idx, e.target.value)}
                                    />
                                </div>
                            ))}

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={downloading}
                                className={`w-full py-3 px-6 rounded-lg font-bold text-lg mt-4 flex items-center justify-center transition-colors ${downloading
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {downloading ? 'Reconstructing...' : (
                                    <>
                                        Reconstruct & Download <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <FileCheck className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Reconstruction Complete</h2>
                        <p className="text-slate-400">
                            The file has been successfully reconstructed in RAM and downloaded. The file shards have been purged from memory/storage as per protocol.
                        </p>
                        <button onClick={reset} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white mt-4">
                            Reconstruct Another
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reconstruct;
