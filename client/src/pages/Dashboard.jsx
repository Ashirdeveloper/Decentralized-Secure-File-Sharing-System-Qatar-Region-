import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Upload, Download, LogOut, Shield, Globe, Server } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <header className="flex justify-between items-center mb-10 border-b border-slate-700 pb-4">
                <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-emerald-500" />
                    <h1 className="text-2xl font-bold">SecureShare<span className="text-emerald-500">Qatar</span></h1>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-slate-400">User: <span className="text-white font-semibold">{user?.username}</span></span>
                    <button onClick={logout} className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Status Cards */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex items-center space-x-4">
                    <Globe className="w-10 h-10 text-blue-500" />
                    <div>
                        <h3 className="text-sm text-slate-400">Geo-Fencing</h3>
                        <p className="text-lg font-semibold text-emerald-400">Qatar Region Validated</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex items-center space-x-4">
                    <Shield className="w-10 h-10 text-purple-500" />
                    <div>
                        <h3 className="text-sm text-slate-400">Zero Trust</h3>
                        <p className="text-lg font-semibold text-white">Session Active</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex items-center space-x-4">
                    <Server className="w-10 h-10 text-orange-500" />
                    <div>
                        <h3 className="text-sm text-slate-400">Storage Nodes</h3>
                        <p className="text-lg font-semibold text-white">5/5 Active (Simulated)</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                <Link to="/upload" className="group bg-slate-800 hover:bg-slate-750 border border-slate-700 p-8 rounded-xl transition-all hover:scale-105 hover:border-emerald-500/50">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors">
                            <Upload className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold">Secure Upload</h2>
                        <p className="text-slate-400">Encrypt, shard, and distribute a file to the network. Scan for sensitive data automatically.</p>
                    </div>
                </Link>

                <Link to="/reconstruct" className="group bg-slate-800 hover:bg-slate-750 border border-slate-700 p-8 rounded-xl transition-all hover:scale-105 hover:border-blue-500/50">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                            <Download className="w-12 h-12 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold">Reconstruct File</h2>
                        <p className="text-slate-400">Retrieve a file by providing 3 valid shard keys. The file will be reassembled in RAM.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
