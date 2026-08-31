import MasterList from '../components/MasterList'

export default function Suppliers() {
  return (
    <MasterList
      title="Suppliers"
      crumb="Master Data / 04"
      path="/api/suppliers"
      idKey="supplierId"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'address', label: 'Address' },
        { key: 'phone', label: 'Phone' },
        { key: 'productCount', label: 'Products' },
      ]}
      fields={[
        { key: 'name', label: 'Name', maxLength: 30 },
        { key: 'address', label: 'Address', maxLength: 255 },
        { key: 'phone', label: 'Phone', maxLength: 13, required: false },
      ]}
    />
  )
}
