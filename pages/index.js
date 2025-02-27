import {useEffect, useState} from 'react'
import AddPropertyModal from '../components/AddPropertyModal'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'
import EditPropertyModal from '../components/EditPropertyModal'
import {supabase} from '../lib/supabaseClient'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [dbProperties, setDbProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    try {
      // Updated query to order by ID in ascending order
      const {data, error} = await supabase
        .from('properties')
        .select('*')
        .order('id', {ascending: true})

      if (error) {
        throw error
      }
      setDbProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyAdded = newProperty => {
    setDbProperties([...dbProperties, newProperty])
  }

  const handlePropertyUpdated = updatedProperty => {
    setDbProperties(
      dbProperties.map(property =>
        property.id === updatedProperty.id ? updatedProperty : property,
      ),
    )
  }

  const handlePropertyDeleted = deletedId => {
    setDbProperties(dbProperties.filter(property => property.id !== deletedId))
  }

  const openEditModal = property => {
    setSelectedProperty(property)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = property => {
    setSelectedProperty(property)
    setIsDeleteModalOpen(true)
  }

  const filteredProperties = dbProperties
    .filter(property => {
      const searchableValue = searchTerm.toLowerCase()
      return (
        property.address.toLowerCase().includes(searchableValue) ||
        property.type.toLowerCase().includes(searchableValue) ||
        property.bedrooms.toString().includes(searchableValue) ||
        property.bathrooms.toString().includes(searchableValue) ||
        property.estate_agent?.toLowerCase().includes(searchableValue) ||
        property.selling_agent?.toLowerCase().includes(searchableValue) ||
        property.occupied.toLowerCase().includes(searchableValue)
      )
    })
    // Ensure filtered properties are still ordered by ID
    .sort((a, b) => a.id - b.id)

  // Calculate total property valuation
  const totalValuation = dbProperties.reduce((total, property) => {
    const value = parseFloat(property.valuation?.replace(/[£,]/g, '') || 0)
    return total + value
  }, 0)

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6 py-6 border-b border-b-amber-950">
        <div className="">
          <a className="text-xl">PNFB Holdings Properties</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="form-control w-full max-w-xs">
            <label className="input">
              <svg
                className="h-[1em] opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Property
          </button>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-4 my-6">
        <div>
          <div className="card bg-white text-black w-96">
            <div className="card-body items-center text-center">
              <h2 className="card-title">Properties</h2>
              <p>{dbProperties.length}</p>
            </div>
          </div>
        </div>
        <div>
          <div className="card bg-white text-black w-96">
            <div className="card-body items-center text-center">
              <h2 className="card-title">Asset Valuation</h2>
              <p>£{totalValuation.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div>
          <div className="card bg-white text-black w-96">
            <div className="card-body items-center text-center">
              <h2 className="card-title">Unrealised Rental</h2>
              <p>£ 6000 pcm</p>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Address</th>
                <th>Type</th>
                <th>Bedrooms</th>
                <th>Bathrooms</th>
                <th>Last Valuation</th>
                <th>Estate Agent</th>
                <th>Selling Agent</th>
                <th>Occupied</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(property => (
                <tr key={property.id}>
                  <th>{property.id}</th>
                  <td>{property.address}</td>
                  <td>{property.type}</td>
                  <td>{property.bedrooms}</td>
                  <td>{property.bathrooms}</td>
                  <td>
                    {property.valuation &&
                      (property.valuation.startsWith('£')
                        ? property.valuation
                        : `£${property.valuation}`)}
                  </td>
                  <td>{property.estate_agent}</td>
                  <td>{property.selling_agent}</td>
                  <td>{property.occupied}</td>
                  <td>
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(property)}
                        className="btn btn-sm btn-ghost"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => openDeleteModal(property)}
                        className="btn btn-sm btn-ghost text-error"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPropertyAdded={handlePropertyAdded}
      />

      <EditPropertyModal
        isOpen={isEditModalOpen}
        property={selectedProperty}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedProperty(null)
        }}
        onPropertyUpdated={handlePropertyUpdated}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        property={selectedProperty}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedProperty(null)
        }}
        onDelete={handlePropertyDeleted}
      />
    </div>
  )
}
