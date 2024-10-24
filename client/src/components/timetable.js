import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Calendar, Trash2, AlertCircle, Clock } from 'lucide-react';

const Timetable = () => {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const baseUrl = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    fetchTimetables();
  }, [user]);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/timetables`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTimetables(data.timetables);
        if (data.timetables.length > 0) {
          setActiveSchedule(data.timetables[0]);
        }
      }
    } catch (err) {
      setError('Failed to fetch timetables');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      setError('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('timetable', file);

    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/timetables/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        fetchTimetables();
      } else {
        setError('Failed to upload timetable');
      }
    } catch (err) {
      setError('An error occurred while uploading');
    } finally {
      setLoading(false);
    }
  };

  const deleteTimetable = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/api/timetables/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        fetchTimetables();
      }
    } catch (err) {
      setError('Failed to delete timetable');
    }
  };

  const renderSchedule = (schedule) => {
    if (!schedule?.scheduleData) return null;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 bg-gray-50 border text-left text-gray-600">Time</th>
              {days.map(day => (
                <th key={day} className="p-3 bg-gray-50 border text-left text-gray-600">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.scheduleData[days[0]].map((_, timeIndex) => (
              <tr key={timeIndex}>
                <td className="p-3 border text-gray-600 font-medium">
                  {schedule.scheduleData[days[0]][timeIndex].time}
                </td>
                {days.map(day => (
                  <td key={day} className="p-3 border">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2 text-blue-500" />
                      {schedule.scheduleData[day][timeIndex]?.subject || '-'}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Class Schedule</h1>
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            <Upload size={18} className="mr-2" />
            Upload Timetable
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <>
            {timetables.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No timetables uploaded yet. Upload your first timetable to get started.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {timetables.map((timetable) => (
                    <button
                      key={timetable.id}
                      onClick={() => setActiveSchedule(timetable)}
                      className={`px-4 py-2 rounded-lg flex items-center whitespace-nowrap ${
                        activeSchedule?.id === timetable.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Calendar size={14} className="mr-2" />
                      Schedule {timetable.id}
                      <Trash2
                        size={14}
                        className="ml-3 text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTimetable(timetable.id);
                        }}
                      />
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  {renderSchedule(activeSchedule)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Timetable;