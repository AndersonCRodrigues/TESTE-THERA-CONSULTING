'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { getCustomers } from '@/services/customers';
import { getOrders } from '@/services/orders';
import { getProducts } from '@/services/products';
import { Customer } from '@/types/customer';
import { Order } from '@/types/order';
import { Product } from '@/types/product';
import { getUserFromLocalStorage } from '@/utils/auth';
import { formatCurrency } from '@/utils/formatters';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = getUserFromLocalStorage();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [productsData, customersData, ordersData] = await Promise.all([
          getProducts(),
          getCustomers(),
          getOrders(),
        ]);

        setProducts(productsData);
        setCustomers(customersData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalSales = orders.reduce((total, order) => total + order.totalPrice, 0);

  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao sistema de gestão administrativa</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
                  <i className="fas fa-box"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Produtos</h3>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500 text-white mr-4">
                  <i className="fas fa-users"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Clientes</h3>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-yellow-50 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500 text-white mr-4">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Pedidos Pendentes</h3>
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-purple-50 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500 text-white mr-4">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total de Vendas</h3>
                  <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Pedidos Recentes</h2>
                <Link href="/orders" className="text-blue-600 hover:text-blue-800">
                  Ver todos
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="py-2 px-4 text-left">Cliente</th>
                        <th className="py-2 px-4 text-left">Status</th>
                        <th className="py-2 px-4 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="py-2 px-4">{order.customer.name}</td>
                          <td className="py-2 px-4">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status === 'completed'
                                ? 'Concluído'
                                : order.status === 'cancelled'
                                ? 'Cancelado'
                                : 'Pendente'}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-right">{formatCurrency(order.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Nenhum pedido encontrado.</p>
              )}
            </Card>

            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Produtos</h2>
                <Link href="/products" className="text-blue-600 hover:text-blue-800">
                  Ver todos
                </Link>
              </div>

              {products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="py-2 px-4 text-left">Nome</th>
                        <th className="py-2 px-4 text-right">Preço</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="py-2 px-4">{product.name}</td>
                          <td className="py-2 px-4 text-right">{formatCurrency(product.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Nenhum produto encontrado.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}