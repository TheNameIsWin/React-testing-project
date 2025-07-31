import React, { useState, useEffect } from 'react';
import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Tag,
  Tooltip,
} from 'antd';
import { DownloadOutlined, EditOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import './AdminTable.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const flightStatusColors = {
  Available: 'green',
  Full: 'volcano',
  Cancelled: 'red',
};

const flightLogos = {
  Indigo: '🟦',
  Vistara: '🟪',
  AirIndia: '🔴',
};

const initialData = [
  {
    key: '1',
    flightNo: '6E 2045',
    origin: 'Delhi',
    destination: 'Mumbai',
    frequency: 'Daily',
    effective: '2025-08-01',
    departure: '06:00',
    arrival: '08:00',
    airline: 'Indigo',
    status: 'Available',
  },
  {
    key: '2',
    flightNo: 'UK 883',
    origin: 'Bangalore',
    destination: 'Pune',
    frequency: 'Mon/Wed/Fri',
    effective: '2025-08-03',
    departure: '13:00',
    arrival: '15:10',
    airline: 'Vistara',
    status: 'Full',
  },
  {
    key: '3',
    flightNo: 'AI 101',
    origin: 'Chennai',
    destination: 'Delhi',
    frequency: 'Tue/Thu/Sat',
    effective: '2025-08-05',
    departure: '17:00',
    arrival: '19:30',
    airline: 'AirIndia',
    status: 'Cancelled',
  },
];

const AdminTable = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState(initialData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filteredDates, setFilteredDates] = useState(null);

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      effective: dayjs(record.effective),
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const updatedRecord = {
        ...values,
        key: editingRecord.key,
        effective: values.effective.format('YYYY-MM-DD'),
      };
      setData((prev) =>
        prev.map((item) =>
          item.key === editingRecord.key ? updatedRecord : item
        )
      );
      setModalVisible(false);
    });
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Flights');
    XLSX.writeFile(workbook, 'FlightSchedule.xlsx');
  };

  const columns = [
    {
      title: 'Flight No.',
      dataIndex: 'flightNo',
      key: 'flightNo',
      render: (text, record) => (
        <Tooltip title="Edit">
          <span
            onClick={() => handleEdit(record)}
            style={{ cursor: 'pointer', color: '#1890ff' }}
          >
            ✏️ {text}
          </span>
        </Tooltip>
      ),
      sorter: (a, b) => a.flightNo.localeCompare(b.flightNo),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search flight"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys([e.target.value])}
            onPressEnter={confirm}
            style={{ width: 150 }}
          />
        </div>
      ),
      onFilter: (value, record) =>
        record.flightNo.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Origin',
      dataIndex: 'origin',
      filters: [...new Set(data.map((d) => d.origin))].map((city) => ({
        text: city,
        value: city,
      })),
      onFilter: (value, record) => record.origin === value,
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      filters: [...new Set(data.map((d) => d.destination))].map((city) => ({
        text: city,
        value: city,
      })),
      onFilter: (value, record) => record.destination === value,
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
    },
    {
      title: 'Effective',
      dataIndex: 'effective',
      render: (text) => dayjs(text).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.effective).unix() - dayjs(b.effective).unix(),
    },
    {
      title: 'Departure',
      dataIndex: 'departure',
    },
    {
      title: 'Arrival',
      dataIndex: 'arrival',
    },
    {
      title: 'Airline',
      dataIndex: 'airline',
      render: (airline) => flightLogos[airline] + ' ' + airline,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={flightStatusColors[status]}>{status}</Tag>
      ),
    },
  ];

  const filteredData = filteredDates
    ? data.filter((d) => {
      const date = dayjs(d.effective);
      return (
        date.isAfter(filteredDates[0], 'day') &&
        date.isBefore(filteredDates[1], 'day')
      );
    })
    : data;

  return (
    <div style={{ backgroundColor: '#030303', minHeight: '100vh', padding: 24 }}>
      <div style={{ marginBottom: 16, color: 'white' }}>
        <RangePicker
          onChange={(dates) => setFilteredDates(dates)}
          style={{ marginRight: 8 }}
        />
        <Button icon={<DownloadOutlined />} onClick={handleDownload}>
          Download
        </Button>
      </div>

      <div style={{ backgroundColor: '#00002B', borderRadius: 8, padding: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 5 }}
          rowKey="key"
        />
      </div>

      <Modal
        title="Edit Flight"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="flightNo" label="Flight No." rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="origin" label="Origin" rules={[{ required: true }]}>
            <Select>
              <Option value="Delhi">Delhi</Option>
              <Option value="Mumbai">Mumbai</Option>
              <Option value="Bangalore">Bangalore</Option>
              <Option value="Chennai">Chennai</Option>
              <Option value="Pune">Pune</Option>
            </Select>
          </Form.Item>
          <Form.Item name="destination" label="Destination" rules={[{ required: true }]}>
            <Select>
              <Option value="Delhi">Delhi</Option>
              <Option value="Mumbai">Mumbai</Option>
              <Option value="Bangalore">Bangalore</Option>
              <Option value="Chennai">Chennai</Option>
              <Option value="Pune">Pune</Option>
            </Select>
          </Form.Item>
          <Form.Item name="frequency" label="Frequency">
            <Input />
          </Form.Item>
          <Form.Item name="effective" label="Effective Date">
            <DatePicker />
          </Form.Item>
          <Form.Item name="departure" label="Departure">
            <Input />
          </Form.Item>
          <Form.Item name="arrival" label="Arrival">
            <Input />
          </Form.Item>
          <Form.Item name="airline" label="Airline">
            <Select>
              <Option value="Indigo">Indigo</Option>
              <Option value="Vistara">Vistara</Option>
              <Option value="AirIndia">AirIndia</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Flight Status">
            <Select>
              <Option value="Available">Available</Option>
              <Option value="Full">Full</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTable;
