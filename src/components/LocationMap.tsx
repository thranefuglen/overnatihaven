import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface LocationMapProps {
  address?: string
  city?: string
  postalCode?: string
}

const LocationMap = ({
  address = "Ribe",
  city = "Ribe",
  postalCode = "6760"
}: LocationMapProps) => {
  // Coordinates for Ribe, Denmark
  const position: [number, number] = [55.3278, 8.7636]

  return (
    <div className="h-full min-h-96 w-full">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full rounded-lg"
        style={{ minHeight: '384px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-center">
              <strong className="block font-semibold">{city}</strong>
              {address && <span className="text-sm">{address}</span>}
              {postalCode && <span className="text-sm block">{postalCode} {city}</span>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default LocationMap
