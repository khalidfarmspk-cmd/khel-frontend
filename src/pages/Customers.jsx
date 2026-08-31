import MasterList from '../components/MasterList'

export default function Customers() {
  return (
    <MasterList
      title="Customers"
      crumb="Master Data / 05"
      path="/api/customers"
      idKey="customerId"
      addLabel="Add Customer"
      columns={[
        { key: 'nama_pelanggan', label: 'Name' },
        { key: 'telp_pelanggan', label: 'Phone' },
        { key: 'alamat_pelanggan', label: 'Address' },
      ]}
      fields={[
        { key: 'nama_pelanggan', label: 'Name', maxLength: 60 },
        { key: 'telp_pelanggan', label: 'Phone', maxLength: 20, required: false },
        { key: 'alamat_pelanggan', label: 'Address', maxLength: 255, required: false },
      ]}
    />
  )
}
