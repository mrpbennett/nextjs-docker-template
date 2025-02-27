import {useState} from 'react'
import {supabase} from '../lib/supabaseClient'

export default function AddPropertyModal({isOpen, onClose, onPropertyAdded}) {
  // Update field names to match Supabase column names
  const [formData, setFormData] = useState({
    address: '',
    type: '',
    bedrooms: '',
    bathrooms: '',
    valuation: '',
    estate_agent: '', // Changed from estateAgent to match Supabase column
    selling_agent: '', // Changed from sellingAgent to match Supabase column
    occupied: 'No',
  })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const resetForm = () => {
    setFormData({
      address: '',
      type: '',
      bedrooms: '',
      bathrooms: '',
      valuation: '',
      estate_agent: '', // Updated field name
      selling_agent: '', // Updated field name
      occupied: 'No',
    })
    setSuccess(false)
    setError(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('Submitting form with data:', formData)

    // Convert numeric values
    const submissionData = {
      ...formData,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : null,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
    }

    try {
      console.log('Sending data to Supabase:', submissionData)

      const {data, error} = await supabase
        .from('properties')
        .insert([submissionData])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Received response from Supabase:', data)

      if (data && data.length > 0) {
        onPropertyAdded(data[0])
        setSuccess(true)
      } else {
        throw new Error('No data returned from the server')
      }
    } catch (error) {
      console.error('Error adding property:', error)
      setError(error.message || 'Failed to add property. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleAddMore = () => {
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-lg mb-4">
              <svg
                className="h-12 w-12 text-green-500 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h2 className="text-xl font-bold text-green-700 mb-2">
                Success!
              </h2>
              <p className="text-green-600">
                Property has been added successfully.
              </p>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button className="btn btn-primary" onClick={handleAddMore}>
                Add Another Property
              </button>
              <button className="btn" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Add New Property</h2>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  className="input input-bordered w-full"
                  placeholder="Address"
                  value={formData.address}
                  onChange={e =>
                    setFormData({...formData, address: e.target.value})
                  }
                  required
                />
                <select
                  className="select select-bordered w-full"
                  value={formData.type}
                  onChange={e =>
                    setFormData({...formData, type: e.target.value})
                  }
                  required
                >
                  <option value="">Select Type</option>
                  <option value="House">House</option>
                  <option value="Flat">Flat</option>
                </select>
                <input
                  className="input input-bordered w-full"
                  type="number"
                  placeholder="Bedrooms"
                  value={formData.bedrooms}
                  onChange={e =>
                    setFormData({...formData, bedrooms: e.target.value})
                  }
                  required
                />
                <input
                  className="input input-bordered w-full"
                  type="number"
                  step="0.5"
                  placeholder="Bathrooms"
                  value={formData.bathrooms}
                  onChange={e =>
                    setFormData({...formData, bathrooms: e.target.value})
                  }
                  required
                />
                <input
                  className="input input-bordered w-full"
                  placeholder="Valuation"
                  value={formData.valuation}
                  onChange={e =>
                    setFormData({...formData, valuation: e.target.value})
                  }
                  required
                />
                <input
                  className="input input-bordered w-full"
                  placeholder="Estate Agent"
                  value={formData.estate_agent}
                  onChange={e =>
                    setFormData({...formData, estate_agent: e.target.value})
                  }
                />
                <input
                  className="input input-bordered w-full"
                  placeholder="Selling Agent"
                  value={formData.selling_agent}
                  onChange={e =>
                    setFormData({...formData, selling_agent: e.target.value})
                  }
                />
                <select
                  className="select select-bordered w-full"
                  value={formData.occupied}
                  onChange={e =>
                    setFormData({...formData, occupied: e.target.value})
                  }
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Adding...
                    </>
                  ) : (
                    'Add Property'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
