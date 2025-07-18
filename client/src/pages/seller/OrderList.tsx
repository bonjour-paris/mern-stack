import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';

interface Order {
  _id: string;
  productId: {
    productName: string;
    imageUrl?: string;
  };
  customerId: {
    name: string;
  };
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Shipped' | 'Delivered'>('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const statusQuery = filter !== 'All' ? `?status=${filter}` : '';
        const res = await api.get(`/orders${statusQuery}`);
        setOrders(res.data);
        setError(null);
      } catch {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filter]);

  const handleRowClick = (id: string) => {
    navigate(`/seller/orders/${id}`);
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="mb-4 space-x-2">
        {['All', 'Pending', 'Shipped', 'Delivered'].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setFilter(status as any)}
          >
            {status}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded cursor-pointer">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border-b">Product</th>
                <th className="p-2 border-b">Customer</th>
                <th className="p-2 border-b">Total Amount</th>
                <th className="p-2 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50"
                  onClick={() => handleRowClick(order._id)}
                >
                  <td className="p-2 border-b flex items-center gap-2">
                    {order.productId.imageUrl ? (
                      <img
                        src={order.productId.imageUrl}
                        alt={order.productId.productName}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                        No Img
                      </div>
                    )}
                    {order.productId.productName}
                  </td>
                  <td className="p-2 border-b">{order.customerId.name}</td>
                  <td className="p-2 border-b">${order.totalAmount.toFixed(2)}</td>
                  <td className="p-2 border-b">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
