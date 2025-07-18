import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../api/axios';

interface Seller {
  _id: string;
  companyName: string;
  email: string;
  contactNumber: string;
  originCountry: string;
  logoUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  sellerId: string;
}

export default function UserAdminDashboard() {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSellers = async () => {
    console.log('Fetching pending sellers...');
    try {
      const res = await api.get('/api/admin/pending-sellers');
      console.log('API Response:', res.data);
      if (Array.isArray(res.data)) {
        setSellers(res.data);
      } else {
        console.log('Invalid response format:', res.data);
        setSellers([]);
      }
      setLoading(false);
    } catch (err: any) {
      console.log('API Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch pending sellers');
      toast.error(error || 'Failed to fetch pending sellers');
      setLoading(false);
      if (err.response?.status === 401) {
        navigate('/login/admin');
      }
    }
  };

  useEffect(() => {
    console.log('useEffect triggered');
    fetchSellers();
  }, [navigate]);

  const handleApproval = async (sellerId: string, approve: boolean) => {
    try {
      const res = await api.post(`/api/admin/seller-approval/${sellerId}`, { approve });
      await fetchSellers(); // Refetch after approval/rejection
      toast.success(res.data.message || (approve ? 'Seller approved and email sent' : 'Seller rejected'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  console.log('Sellers state:', sellers);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">User Admin Dashboard</h1>
      {sellers.length === 0 ? (
        <p>No pending sellers</p>
      ) : (
        <div className="space-y-4">
          {sellers.map((seller) => (
            <div key={seller._id} className="border p-4 rounded flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{seller.companyName}</h2>
                <p>Email: {seller.email}</p>
                <p>Contact: {seller.contactNumber}</p>
                <p>Country: {seller.originCountry}</p>
                <img src={seller.logoUrl} alt="Logo" className="w-16 h-16 object-contain mt-2" />
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleApproval(seller._id, true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={seller.status !== 'pending'}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(seller._id, false)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  disabled={seller.status !== 'pending'}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
    </div>
  );
}