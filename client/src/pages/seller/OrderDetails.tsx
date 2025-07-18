import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';

interface Order {
  _id: string;
  productId: {
    _id: string;
    productName: string;
    imageUrl?: string;
  };
  customerId: {
    _id: string;
    name: string;
    email?: string;
    contactNumber?: string;
  };
  totalAmount: number;
  quantity: number;
  shippingAddress: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
        setError(null);
      } catch {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus: 'Pending' | 'Shipped' | 'Delivered') => {
    if (!order) return;
    try {
      const res = await api.patch(`/orders/${order._id}/status`, { status: newStatus });
      setOrder(res.data);
      alert(`Order marked as ${newStatus}`);
    } catch {
      alert('Failed to update order status');
    }
  };

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-indigo-600 hover:underline"
      >
        &larr; Back to Orders
      </button>

      <h1 className="text-3xl font-bold mb-4">Order Details</h1>

      <div className="flex gap-6 flex-col md:flex-row">
        <div className="md:w-1/3">
          {order.productId.imageUrl ? (
            <img
              src={order.productId.imageUrl}
              alt={order.productId.productName}
              className="rounded shadow object-cover w-full h-auto"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
              No image
            </div>
          )}
        </div>

        <div className="md:w-2/3 space-y-2">
          <p><strong>Product:</strong> {order.productId.productName}</p>
          <p><strong>Quantity:</strong> {order.quantity}</p>
          <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
          <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
          <p><strong>Status:</strong> {order.status}</p>

          <hr />

          <h2 className="font-semibold">Customer Info</h2>
          <p><strong>Name:</strong> {order.customerId.name}</p>
          {order.customerId.email && <p><strong>Email:</strong> {order.customerId.email}</p>}
          {order.customerId.contactNumber && <p><strong>Contact:</strong> {order.customerId.contactNumber}</p>}

          <div className="mt-4 space-x-2">
            {order.status !== 'Shipped' && (
              <button
                onClick={() => updateStatus('Shipped')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Mark Shipped
              </button>
            )}
            {order.status !== 'Delivered' && (
              <button
                onClick={() => updateStatus('Delivered')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Mark Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
