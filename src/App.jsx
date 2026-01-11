import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, DollarSign, ShoppingCart, Trash2, RefreshCw } from 'lucide-react';

// REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzV5noaEz1KPiFUSbu5IHhO-U3Rb6r5ImiTcSvuflsXMTMqL1zj5AXDIktrbLJEc8kxsQ/exec';

export default function SalesTracker() {
  const [sales, setSales] = useState([]);
  const [itemName, setItemName] = useState('');
  const [cashPrice, setCashPrice] = useState('');
  const [onlinePrice, setOnlinePrice] = useState('');
  const [capital, setCapital] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load sales from Google Sheets
  const loadSales = async () => {
    setLoading(true);
    setMessage('Loading data...');
    try {
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      
      // Transform data and calculate totals
      const transformedData = data.map(sale => ({
        id: sale.id,
        date: sale.date,
        itemName: sale.itemName,
        cashPrice: parseFloat(sale.cashPrice) || 0,
        onlinePrice: parseFloat(sale.onlinePrice) || 0,
        sellingPrice: parseFloat(sale.cashPrice || 0) + parseFloat(sale.onlinePrice || 0),
        capital: parseFloat(sale.capital),
        quantity: parseInt(sale.quantity),
        profit: ((parseFloat(sale.cashPrice || 0) + parseFloat(sale.onlinePrice || 0)) - parseFloat(sale.capital)) * parseInt(sale.quantity),
        totalSales: (parseFloat(sale.cashPrice || 0) + parseFloat(sale.onlinePrice || 0)) * parseInt(sale.quantity),
        totalCapital: parseFloat(sale.capital) * parseInt(sale.quantity),
        totalCash: parseFloat(sale.cashPrice || 0) * parseInt(sale.quantity),
        totalOnline: parseFloat(sale.onlinePrice || 0) * parseInt(sale.quantity)
      }));
      
      setSales(transformedData);
      setMessage('Data loaded successfully!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Error loading data: ' + error.message);
      console.error('Error loading sales:', error);
    }
    setLoading(false);
  };

  // Load data on component mount
  useEffect(() => {
    if (SCRIPT_URL !== 'YOUR_SCRIPT_URL_HERE') {
      loadSales();
    }
  }, []);

  const addSale = async () => {
    if (!itemName || !capital) {
      setMessage('Please fill in item name and capital');
      return;
    }
    if (!cashPrice && !onlinePrice) {
      setMessage('Please enter at least one price (cash or online)');
      return;
    }

    setLoading(true);
    setMessage('Adding sale...');

    const qty = parseInt(quantity) || 1;
    const cash = parseFloat(cashPrice) || 0;
    const online = parseFloat(onlinePrice) || 0;
    const id = Date.now();
    
    const saleData = {
      action: 'add',
      id: id,
      date: date,
      itemName: itemName,
      cashPrice: cash,
      onlinePrice: online,
      capital: parseFloat(capital),
      quantity: qty
    };

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      });

      // Since no-cors doesn't return response, we'll reload data after a delay
      setTimeout(() => {
        loadSales();
        setItemName('');
        setCashPrice('');
        setOnlinePrice('');
        setCapital('');
        setQuantity('1');
        setMessage('Sale added successfully!');
        setTimeout(() => setMessage(''), 2000);
      }, 1000);
      
    } catch (error) {
      setMessage('Error adding sale: ' + error.message);
      console.error('Error adding sale:', error);
      setLoading(false);
    }
  };

  const deleteSale = async (id) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    setLoading(true);
    setMessage('Deleting sale...');

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          id: id
        })
      });

      setTimeout(() => {
        loadSales();
        setMessage('Sale deleted successfully!');
        setTimeout(() => setMessage(''), 2000);
      }, 1000);
      
    } catch (error) {
      setMessage('Error deleting sale: ' + error.message);
      console.error('Error deleting sale:', error);
      setLoading(false);
    }
  };

  const getTotals = () => {
    return sales.reduce((acc, sale) => ({
      totalSales: acc.totalSales + sale.totalSales,
      totalCapital: acc.totalCapital + sale.totalCapital,
      totalProfit: acc.totalProfit + sale.profit,
      totalCash: acc.totalCash + sale.totalCash,
      totalOnline: acc.totalOnline + sale.totalOnline
    }), { totalSales: 0, totalCapital: 0, totalProfit: 0, totalCash: 0, totalOnline: 0 });
  };

  const getDailyTotals = (selectedDate) => {
    const dailySales = sales.filter(s => s.date === selectedDate);
    return dailySales.reduce((acc, sale) => ({
      totalSales: acc.totalSales + sale.totalSales,
      totalCapital: acc.totalCapital + sale.totalCapital,
      totalProfit: acc.totalProfit + sale.profit,
      totalCash: acc.totalCash + sale.totalCash,
      totalOnline: acc.totalOnline + sale.totalOnline
    }), { totalSales: 0, totalCapital: 0, totalProfit: 0, totalCash: 0, totalOnline: 0 });
  };

  const totals = getTotals();
  const dailyTotals = getDailyTotals(date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Logo Section */}
        <div className="flex justify-center items-center mb-8">
          <img 
            src="https://cdn.glitch.global/62343cea-1f00-4e76-b176-437992c58298/image.png?v=1736582396914" 
            alt="LA Store Logo" 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain"
          />
        </div>

        {/* Message Banner */}
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-center">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="text-indigo-600" />
              Sales Tracker
            </h1>
            <button
              onClick={loadSales}
              disabled={loading}
              className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
            <input
              type="number"
              placeholder="Cash price"
              value={cashPrice}
              onChange={(e) => setCashPrice(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <input
              type="number"
              placeholder="Online price"
              value={onlinePrice}
              onChange={(e) => setOnlinePrice(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <input
              type="number"
              placeholder="Capital cost"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={addSale}
              disabled={loading}
              className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <PlusCircle size={20} />
              Add Sale
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 font-semibold">Total Sales</span>
                <DollarSign className="text-green-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-green-800">${totals.totalSales.toFixed(2)}</p>
              <p className="text-sm text-green-600 mt-1">Today: ${dailyTotals.totalSales.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-700 font-semibold">Cash Sales</span>
                <DollarSign className="text-emerald-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-emerald-800">${totals.totalCash.toFixed(2)}</p>
              <p className="text-sm text-emerald-600 mt-1">Today: ${dailyTotals.totalCash.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-4 border border-sky-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sky-700 font-semibold">Online Sales</span>
                <DollarSign className="text-sky-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-sky-800">${totals.totalOnline.toFixed(2)}</p>
              <p className="text-sm text-sky-600 mt-1">Today: ${dailyTotals.totalOnline.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-700 font-semibold">Total Capital</span>
                <ShoppingCart className="text-orange-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-orange-800">${totals.totalCapital.toFixed(2)}</p>
              <p className="text-sm text-orange-600 mt-1">Today: ${dailyTotals.totalCapital.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-semibold">Total Profit</span>
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-blue-800">${totals.totalProfit.toFixed(2)}</p>
              <p className="text-sm text-blue-600 mt-1">Today: ${dailyTotals.totalProfit.toFixed(2)}</p>
            </div>
          </div>

          {/* Sales List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cash</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Online</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Capital</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Sales</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Profit</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && sales.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      Loading sales data...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      No sales recorded yet. Add your first sale above!
                    </td>
                  </tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{sale.date}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{sale.itemName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{sale.quantity}</td>
                      <td className="px-4 py-3 text-sm text-emerald-700 text-right">${sale.cashPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-sky-700 text-right">${sale.onlinePrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">${sale.sellingPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">${sale.capital.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-700 text-right">${sale.totalSales.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-700 text-right">${sale.profit.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteSale(sale.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}