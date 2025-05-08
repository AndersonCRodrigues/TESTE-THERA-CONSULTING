'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { getProductById, updateProduct } from '@/services/products';
import { ProductInput } from '@/types/product';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  const router = useRouter();
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    price: 0,
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProductById(id);
        setFormData({
          name: data.name,
          price: data.price,
          description: data.description || '',
        });
      } catch (error: any) {
        console.error('Erro ao buscar produto:', error);
        setError(error.response?.data?.message || 'Erro ao carregar produto.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || formData.price <= 0) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setIsSaving(true);
      await updateProduct(id, formData);
      router.push(`/products/${id}`);
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      setError(error.response?.data?.message || 'Erro ao atualizar produto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Editar Produto</h1>
        <Button
          onClick={() => router.back()}
          variant="secondary"
        >
          Voltar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome do produto"
                required
              />

              <Input
                label="Preço *"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descrição do produto"
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="mt-6 flex items-center justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="mr-4"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
              >
                Salvar
              </Button>
            </div>
          </form>
        )}
      </Card>
    </DashboardLayout>
  );
}