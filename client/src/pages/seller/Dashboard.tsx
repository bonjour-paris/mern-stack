import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [outOfStock, setOutOfStock] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const productsRes = await api.get('/products');
        const products = productsRes.data;
        setTotalProducts(products.length);
        const outStockCount = products.filter((p: any) => p.stockStatus === 'Out of Stock').length;
        setOutOfStock(outStockCount);

        const ordersRes = await api.get('/orders');
        const orders = ordersRes.data;
        setTotalOrders(orders.length);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const handleChangePassword = async () => {
    navigate('/seller/change-password');
  };

  if (loading) {
    return <p className="p-6 text-center">Loading dashboard data...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-sm">Total Products</p>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-sm">Total Orders</p>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-sm">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
        </div>
      </div>
      <div className="border rounded h-64 mt-8 flex items-center justify-center text-gray-400">
        Order Activity Chart (coming soon)
      </div>
      <button
        onClick={handleChangePassword}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Change Password
      </button>
    </div>
  );
}