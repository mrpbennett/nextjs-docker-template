import {useEffect, useState} from 'react'
import {debugLog} from '../lib/debug'
import {supabase} from '../lib/supabaseClient'

export default function EditPropertyModal({
  isOpen,
  property,
  onClose,
  onPropertyUpdated,
}) {
  const [formData, setFormData] = useState({
    address: '',
    type: '',
    bedrooms: '',
    bathrooms: '',
    valuation: '',
    estate_agent: '',
    selling_agent: '',
    occupied: 'No',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    // Reset success state when modal opens/closes or property changes
    setSuccess(false)
    setError(null)

    if (property) {
      console.log('EditPropertyModal received property:', property)

      // Extract property data no matter the structure
      let propertyData

      if (property.propertyData) {
        propertyData = property.propertyData
      } else if (property.id !== undefined) {
        propertyData = property
      } else {
        setDebugInfo({
          error: 'Unexpected property structure',
          receivedProperty: property,
        })
        setError('Unexpected property structure. Check console for details.')
        return
      }

      setFormData({
        address: propertyData.address || '',
        type: propertyData.type || '',
        bedrooms: propertyData.bedrooms?.toString() || '',
        bathrooms: propertyData.bathrooms?.toString() || '',
        valuation: propertyData.valuation || '',
        estate_agent: propertyData.estate_agent || '',
        selling_agent: propertyData.selling_agent || '',
        occupied: propertyData.occupied || 'No',
      })
    }
  }, [property, isOpen])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    // Determine the correct property ID
    let propertyId
    if (property.propertyData && property.propertyData.id) {
      propertyId = property.propertyData.id
    } else if (property.id !== undefined) {
      propertyId = property.id
    }

    if (!propertyId) {
      const errorMsg = 'Could not determine property ID for update'
      console.error(errorMsg, property)
      setError(errorMsg)
      setDebugInfo({error: errorMsg, property})
      setLoading(false)
      return
    }

    // Convert numeric values
    const submissionData = {
      ...formData,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : null,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
    }

    debugLog('Submission Data', {
      propertyId,
      submissionData,
      originalProperty: property,
    })

    try {
      const {data, error} = await supabase
        .from('properties')
        .update(submissionData)
        .eq('id', propertyId)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        debugLog('Update Success', data[0])

        // Determine the correct structure to return based on what was received
        let updatedProperty
        if (property.propertyData) {
          // If original structure had propertyData, maintain that structure
          updatedProperty = {
            ...property,
            propertyData: data[0],
          }
        } else {
          // Otherwise just return the updated data
          updatedProperty = data[0]
        }

        debugLog('Final Updated Property', updatedProperty)
        onPropertyUpdated(updatedProperty)
        setSuccess(true)
      } else {
        throw new Error('No data returned from the server')
      }
    } catch (err) {
      console.error('Error updating property:', err)
      setError(err.message || 'Failed to update property')
      setDebugInfo({error: err.message, property})
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
        {/* Debug information section */}
        {debugInfo && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <p className="font-bold">Debug Info:</p>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

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
                Property has been updated successfully.
              </p>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button className="btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Edit Property</h2>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {/* ...existing form inputs... */}
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
                  onClick={onClose}
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
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
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
