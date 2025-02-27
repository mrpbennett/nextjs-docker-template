import {useState} from 'react'
import {supabase} from '../lib/supabaseClient'

export default function DeleteConfirmationModal({
  isOpen,
  property,
  onClose,
  onDelete,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !property) {
    return null
  }

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const {error} = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id)

      if (error) {
        throw error
      }

      onDelete(property.id)
      onClose()
    } catch (error) {
      console.error('Error deleting property:', error)
      setError(error.message || 'Failed to delete property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <p className="mb-6">
          Are you sure you want to delete this property?
          <br />
          <span className="font-semibold">{property.address}</span>
        </p>
        <p className="text-red-600 text-sm mb-6">
          This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-error"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
