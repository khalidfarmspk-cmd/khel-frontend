import MasterList from '../components/MasterList'

export default function Units() {
  return (
    <MasterList
      title="Units"
      crumb="Master Data / 06"
      path="/api/units"
      idKey="unitId"
      columns={[
        { key: 'name', label: 'Name' },
        {
          key: 'allowDecimal',
          label: 'Allow decimal',
          render: (value) => (value ? 'Yes' : 'No'),
        },
      ]}
      fields={[
        { key: 'name', label: 'Name', maxLength: 20 },
        { key: 'allowDecimal', label: 'Allow decimal', type: 'checkbox' },
      ]}
    />
  )
}
