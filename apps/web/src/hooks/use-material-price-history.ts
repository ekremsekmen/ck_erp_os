import { useState, useEffect } from "react"
import { fetchMaterials, fetchMaterialPriceHistory, Material, MaterialPriceHistory } from "@/lib/api-client"

export function useMaterialPriceHistory() {
    const [materials, setMaterials] = useState<Material[]>([])
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
    const [priceHistory, setPriceHistory] = useState<MaterialPriceHistory[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        async function loadMaterials() {
            try {
                const data = await fetchMaterials()
                setMaterials(data)
                if (data.length > 0) {
                    setSelectedMaterialId(data[0].id)
                }
            } catch (err) {
                console.error("Failed to load materials:", err)
                setError(err instanceof Error ? err : new Error('Failed to load materials'))
            }
        }
        loadMaterials()
    }, [])

    useEffect(() => {
        if (!selectedMaterialId) return

        async function loadHistory() {
            setLoading(true)
            try {
                const history = await fetchMaterialPriceHistory(selectedMaterialId)
                setPriceHistory(history)
            } catch (err) {
                console.error("Failed to load price history:", err)
                setError(err instanceof Error ? err : new Error('Failed to load price history'))
            } finally {
                setLoading(false)
            }
        }
        loadHistory()
    }, [selectedMaterialId])

    const selectedMaterial = materials.find(m => m.id === selectedMaterialId)

    return {
        materials,
        selectedMaterialId,
        setSelectedMaterialId,
        priceHistory,
        loading,
        error,
        selectedMaterial
    }
}
