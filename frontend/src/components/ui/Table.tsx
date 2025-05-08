import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full bg-white ${className}`}>
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            {headers.map((header, index) => (
              <th
                key={index}
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
            <th className="py-3 px-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;