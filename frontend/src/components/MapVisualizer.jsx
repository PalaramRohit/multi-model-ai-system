import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { MapPin } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Coordinate Dictionary for Major Indian States/Regions
const REGION_COORDS = {
    'india': [20.5937, 78.9629],
    'andhra pradesh': [15.9129, 79.7400],
    'arunachal pradesh': [28.2180, 94.7278],
    'assam': [26.2006, 92.9376],
    'bihar': [25.0961, 85.3131],
    'chhattisgarh': [21.2787, 81.8661],
    'goa': [15.2993, 74.1240],
    'gujarat': [22.2587, 71.1924],
    'haryana': [29.0588, 76.0856],
    'himachal pradesh': [31.1048, 77.1734],
    'jharkhand': [23.6102, 85.2799],
    'karnataka': [15.3173, 75.7139],
    'kerala': [10.8505, 76.2711],
    'madhya pradesh': [22.9734, 78.6569],
    'maharashtra': [19.7515, 75.7139],
    'manipur': [24.6637, 93.9063],
    'meghalaya': [25.4670, 91.3662],
    'mizoram': [23.1645, 92.9376],
    'nagaland': [26.1584, 94.5624],
    'odisha': [20.9517, 85.0985],
    'punjab': [31.1471, 75.3412],
    'rajasthan': [27.0238, 74.2179],
    'sikkim': [27.5330, 88.5122],
    'tamil nadu': [11.1271, 78.6569],
    'telangana': [18.1124, 79.0193],
    'tripura': [23.9408, 91.9882],
    'uttar pradesh': [26.8467, 80.9462],
    'uttarakhand': [30.0668, 79.0193],
    'west bengal': [22.9868, 87.8550],
    'delhi': [28.7041, 77.1025],
    'jammu and kashmir': [33.7782, 76.5762],
    'ladakh': [34.1526, 77.5770],
    'puducherry': [11.9416, 79.8083]
};

// Component to handle map movement
const MapUpdater = ({ location }) => {
    const map = useMap();

    useEffect(() => {
        if (!location) return;

        const query = location.toLowerCase().trim();
        let coords = REGION_COORDS['india']; // Default
        let zoom = 5;

        // Direct match
        if (REGION_COORDS[query]) {
            coords = REGION_COORDS[query];
            zoom = 7;
        } else {
            // Partial match hack
            const match = Object.keys(REGION_COORDS).find(key => query.includes(key) || key.includes(query));
            if (match) {
                coords = REGION_COORDS[match];
                zoom = 7;
            }
        }

        map.flyTo(coords, zoom, {
            duration: 1.5
        });

    }, [location, map]);

    return null;
};

export const MapVisualizer = ({ location, className = '' }) => {
    const { t } = useLanguage();

    // Find valid coords for marker
    const getCoords = () => {
        if (!location) return REGION_COORDS['india'];
        const query = location.toLowerCase().trim();
        const match = Object.keys(REGION_COORDS).find(key => query.includes(key) || key.includes(query));
        return match ? REGION_COORDS[match] : REGION_COORDS['india'];
    };

    const center = getCoords();

    return (
        <ErrorBoundary>
            <div className={`rounded-2xl border border-white/10 overflow-hidden relative group/map ${className}`}>

                {/* Map Container */}
                <div className="h-[400px] w-full z-0 relative">
                    <MapContainer
                        center={center}
                        zoom={5}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapUpdater location={location} />

                        {location && (
                            <Marker position={center}>
                                <Popup>
                                    Target Region: <br /> <b>{location}</b>
                                </Popup>
                            </Marker>
                        )}

                    </MapContainer>
                </div>

                {/* Overlay Header */}
                <div className="absolute top-4 left-4 z-[400] bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-green-500/30 shadow-lg pointer-events-none">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-400" />
                        {t('crop.mapTitle') || "Geographic Context"}
                    </h3>
                    {location && <p className="text-green-300 text-xs mt-0.5">Focus: {location}</p>}
                </div>

            </div>
        </ErrorBoundary>
    );
};
