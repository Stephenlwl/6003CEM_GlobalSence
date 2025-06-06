import React, { useEffect, useState } from 'react';
import { useUser } from './UserData';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { FaCloudSun, FaMapMarkerAlt, FaTemperatureHigh, FaWind } from 'react-icons/fa';
import { WiHumidity } from 'react-icons/wi';
import { BsArrowLeftCircle } from 'react-icons/bs';

function SavedWeather() {
    const { userId } = useUser();
    const [savedData, setSavedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editItem, setEditItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const navigate = useNavigate();

    const EditWeather = (item) => {
        setEditItem({ ...item }); // clone the item for edit and update purpose
        setShowEditModal(true);
        console.log("Editing item:", item);
    };

    // update the value immediately in the edit modal after save the changes
    const handleEditChange = (field, value) => {
        setEditItem(prev => ({ ...prev, [field]: value })); 
    };

    const handleEditSave = async () => {
        try {
            const response = await fetch(`http://localhost:5000/saved-weather/${userId}/${editItem.weather_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    note: editItem.notes || '',
                    custom_label: editItem.custom_label || '',
                    tags: editItem.tags || []
                })
            });

            if (response.ok) {
                alert('Weather record updated.');
                setSavedData(prev => prev.map(item => item.weather_id === editItem.weather_id ? editItem : item));
                setShowEditModal(false);
            } else {
                alert('Update failed.');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('An error occurred during update.');
        }
    };


    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this saved weather record?')) return;
        try {
            const response = await fetch(`http://localhost:5000/saved-weather/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.status === 200) {
                alert('Weather record deleted successfully.');
                setSavedData((prevData) => prevData.filter(item => item.weather_id !== id));
            } else {
                alert('Failed to delete the weather record. Please try again.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred.');
        }
    };

    useEffect(() => {
        if (!userId) {
            navigate('/login', { replace: true });
            return;
        }

        const fetchSavedWeather = async () => {
            try {
                const res = await fetch(`http://localhost:5000/saved-weather?user_id=${userId}`);
                const data = await res.json();
                setSavedData(data);
            } catch (err) {
                console.error("Failed to fetch saved weather:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchSavedWeather();
    }, [userId, navigate]);

    return (
        <div className="container mt-5">
            <h3 className="mb-4"><FaCloudSun className="me-2" />Your Saved Weather Records</h3>
            <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/weather')}>
                <BsArrowLeftCircle className="me-2" /> Back to Weather Search
            </button>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-2">Loading saved weather...</p>
                </div>
            ) : savedData.length === 0 ? (
                <div className="alert alert-info">No saved weather data found.</div>
            ) : (
                <div className="row">
                    {savedData.map((item) => (
                        <div key={item._id} className="col-md-4 mb-4">
                            <div className="card shadow-lg border-0 h-100">
                                {item.iconic_image ? (
                                    <img src={item.iconic_image} className="card-img-top" alt="Iconic Location" />
                                ) : (
                                    <img src="https://placehold.co/600x400/beige/white?text=No+Iconic+Image+Found" className="card-img-top" alt="No Iconic Place Found" />
                                )}
                                <div className="card-body">
                                    <h5 className="card-title">
                                        <FaMapMarkerAlt className="me-2 text-secondary" />
                                        {item.location?.name}, {item.location?.country}
                                    </h5>
                                    <div className="bg-light p-3 rounded mb-3 text-center">
                                        <div className="d-flex flex-column align-items-center">
                                            <img
                                                src={item.current.condition.icon}
                                                alt="Condition Icon"
                                                style={{ width: '64px', height: '64px' }}
                                            />
                                            <h6 className="mt-2 mb-0">{item.current?.condition?.text}</h6>
                                            <small className="text-muted">Last Updated: {new Date(item.current.last_updated).toLocaleString()}</small>
                                        </div>
                                    </div>
                                    <ul className="list-unstyled mb-3">
                                        <li><FaTemperatureHigh className="me-2 text-danger" /> <strong>Temp:</strong> {item.current.temp_c ?? 'N/A'}°C</li>
                                        <li><WiHumidity className="me-2 text-primary" /> <strong>Humidity:</strong> {item.current.humidity ?? 'N/A'}%</li>
                                        <li><FaWind className="me-2 text-info" /> <strong>Wind:</strong> {item.current.wind_kph ?? 'N/A'} kph</li>
                                        <li><FaMapMarkerAlt className="me-2 text-warning" /> <strong>Direction:</strong> {item.current.wind_dir ?? 'N/A'}</li>
                                        <li><strong>Pressure:</strong> {item.current.pressure_mb ?? 'N/A'} mb</li>
                                    </ul>
                                    <hr />
                                    <p className="card-text" >
                                        <strong>Notes:</strong> {item.note || 'No notes provided.'}
                                        <br />
                                        <strong>Custom Label:</strong> {item.custom_label || 'No label provided.'}
                                        <br />
                                        <strong>Tags:</strong> {item.tags && item.tags.length > 0 ? item.tags.join(', ') : 'No tags provided.'}
                                    </p>
                                    <p className="text-muted">
                                        <small><strong>Saved At:</strong> {new Date(item.saved_at).toLocaleString()}</small>
                                    </p>
                                    <div className="d-flex justify-content-end mt-3">
                                        <button className="btn btn-outline-warning btn-sm me-2" onClick={() => EditWeather(item)}>Edit</button>
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(item.weather_id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {showEditModal && editItem && (
                        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog modal-lg" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Edit Weather Record</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Custom Label</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editItem.custom_label || ''}
                                                onChange={(e) => handleEditChange('custom_label', e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Tags (comma-separated)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editItem.tags?.join(', ') || ''}
                                                onChange={(e) => handleEditChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Notes (Optional)</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={editItem.notes || ''}
                                                onChange={(e) => handleEditChange('notes', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                        <button type="button" className="btn btn-primary" onClick={handleEditSave}>Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SavedWeather;
