import React, { useState } from 'react';
import { Button, DatePicker } from '@strapi/design-system';
import { request } from '@strapi/helper-plugin';

const ExportButton = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const handleExport = async () => {
    const response = await request(`/excel-export?from=${from}&to=${to}`, { method: 'GET' });
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads.xlsx');
    document.body.appendChild(link);
    link.click();
  };
  return (
    <div>
      <DatePicker onChange={setFrom} label='From' />
      <DatePicker onChange={setTo} label='To' />
      <Button onClick={handleExport}>Export to Excel</Button>
    </div>
  );
};

export default ExportButton;