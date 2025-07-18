import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';

interface Product {
  _id: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  stockStatus: 'Active' | 'Inactive' | 'Out of Stock';
  imageUrl?: string;
  description?: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading product details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-indigo-600 hover:underline"
      >
        &larr; Back to Products
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="rounded shadow object-cover w-full h-auto"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
              No image
            </div>
          )}
        </div>

        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
          <p className="mb-2 text-gray-700"><strong>Category:</strong> {product.category}</p>
          <p className="mb-2 text-gray-700"><strong>Price:</strong> ${product.price.toFixed(2)}</p>
          <p className="mb-2 text-gray-700"><strong>Quantity:</strong> {product.quantity}</p>
          <p className="mb-2 text-gray-700"><strong>Status:</strong> {product.stockStatus}</p>
          {product.description && product.description.trim() !== '' && (
            <p className="mb-2 text-gray-700"><strong>Description:</strong> {product.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
