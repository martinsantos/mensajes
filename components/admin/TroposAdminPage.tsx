import React, { useState, useEffect, useMemo } from 'react';
import useNewsData from '../../hooks/useNewsData';
import { Tropo } from '../../types';
import { slugify } from '../../utils/imageUtils';
import Modal from '../common/Modal';
import Button from '../common/Button';

const TroposAdminPage: React.FC = () => {
    const { tropos, addTropo, updateTropo, deleteTropo } = useNewsData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTropo, setCurrentTropo] = useState<Tropo | null>(null);
    const [formData, setFormData] = useState({ nombre: '', slug: '', color: '#0D9488' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (currentTropo) {
            setFormData({
                nombre: currentTropo.nombre,
                slug: currentTropo.slug,
                color: currentTropo.color
            });
        } else {
            setFormData({ nombre: '', slug: '', color: '#0D9488' });
        }
    }, [currentTropo]);

    const filteredTropos = useMemo(() => {
        if (!searchTerm.trim()) {
            return tropos;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return tropos.filter(tropo =>
            tropo.nombre.toLowerCase().includes(lowercasedFilter) ||
            tropo.slug.toLowerCase().includes(lowercasedFilter)
        );
    }, [tropos, searchTerm]);

    const handleOpenModal = (tropo: Tropo | null = null) => {
        setCurrentTropo(tropo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTropo(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'nombre') {
            setFormData(prev => ({ ...prev, nombre: value, slug: slugify(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentTropo) {
            updateTropo({ ...currentTropo, ...formData });
        } else {
            addTropo(formData);
        }
        handleCloseModal();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manage Tropos</h1>
                <Button onClick={() => handleOpenModal()}>Add Tropo</Button>
            </div>
            
            <div className="mb-4">
                <input
                    type="search"
                    placeholder="Search by name or slug..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
            </div>

            <div className="overflow-hidden bg-white rounded-lg shadow-md">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Color</th>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Slug</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTropos.map(tropo => (
                            <tr key={tropo.id} className="bg-white border-b hover:bg-gray-50 align-middle">
                                <td className="px-6 py-4">
                                     <div className="flex items-center space-x-3">
                                        <div 
                                            className="w-8 h-8 border border-gray-200 rounded-lg shadow-md" 
                                            style={{ backgroundColor: tropo.color }}
                                        ></div>
                                        <span className="font-mono text-sm text-gray-700">{tropo.color.toUpperCase()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{tropo.nombre}</td>
                                <td className="px-6 py-4 font-mono text-sm text-gray-500">{tropo.slug}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="secondary" onClick={() => handleOpenModal(tropo)}>Edit</Button>
                                        <Button variant="danger" onClick={() => deleteTropo(tropo.id)}>Delete</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTropos.length === 0 && (
                    <p className="p-6 text-center text-gray-500">
                        {searchTerm ? 'No categories match your search.' : 'No categories found.'}
                    </p>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentTropo ? 'Edit Tropo' : 'Add Tropo'}>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nombre" className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                            <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleChange} className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500" required />
                        </div>
                        <div>
                            <label htmlFor="slug" className="block mb-2 text-sm font-medium text-gray-900">Slug</label>
                            <input type="text" name="slug" id="slug" value={formData.slug} onChange={handleChange} className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500" required />
                        </div>
                        <div>
                            <label htmlFor="color" className="block mb-2 text-sm font-medium text-gray-900">Color</label>
                            <input type="color" name="color" id="color" value={formData.color} onChange={handleChange} className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-6 mt-6 space-x-2 border-t">
                        <Button variant="secondary" type="button" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">Save Tropo</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TroposAdminPage;