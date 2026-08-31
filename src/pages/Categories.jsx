import MasterList from '../components/MasterList'

export default function Categories() {
  return (
    <MasterList
      title="Categories"
      crumb="Master Data / 03"
      path="/api/categories"
      idKey="categoryId"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'shelfNumber', label: 'Shelf' },
        { key: 'productCount', label: 'Products' },
      ]}
      fields={[
        { key: 'name', label: 'Name', maxLength: 30 },
        { key: 'shelfNumber', label: 'Shelf number', type: 'number', min: 0 },
      ]}
    />
  )
}
