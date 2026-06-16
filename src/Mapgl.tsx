import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import { useMapglContext } from './MapglContext';
import { Clusterer } from '@2gis/mapgl-clusterer';
import { RulerControl } from '@2gis/mapgl-ruler';
import { Directions } from '@2gis/mapgl-directions';
import { useControlRotateClockwise } from './useControlRotateClockwise';
import { ControlRotateCounterclockwise } from './ControlRotateConterclockwise';
import { MapWrapper } from './MapWrapper';
import { FeatureCollection, Geometry, GeoJsonProperties } from
'geojson';
import geoData from './data/kaliningradskaia-oblast_xaaaa.json';

export const MAP_CENTER = [20.509039, 54.706602];

export default function Mapgl() {
    const { setMapglContext } = useMapglContext();

    // const layer = 

    useEffect(() => {
        let map: mapgl.Map | undefined = undefined;
        let directions: Directions | undefined = undefined;
        let clusterer: Clusterer | undefined = undefined;

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 13,
                key: '136056af-d101-47aa-af05-789de46061b6',
                style: 'dbf775aa-b6c9-4cad-ac6b-aa047649ed8f',
            });

            map.on('click', (e) => console.log(e));

            const data: FeatureCollection<Geometry, GeoJsonProperties> =
            geoData as FeatureCollection<Geometry, GeoJsonProperties>;

            const source = new mapgl.GeoJsonSource(map, {
                    data,
                    attributes: {
                    visible: true, // Уникальное свойство
                    },
                });

            
            map.on(
                'styleload', ()=>{
                    map?.addLayer({
                        id: 'dtp-heatmap-layer', 
                        filter: [
                        'match',
                        ['sourceAttr', 'visible'],
                        [true],
                        true,
                        false, 
                        ],
                        type: 'heatmap',
                        style: {
                        color: [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0,
                        'rgba(0, 0, 0, 0)',
                        0.2,
                        'rgba(172, 32, 135, 1)',
                        0.4,
                        'rgba(255, 154, 0, 1)',
                        0.6,
                        'rgba(255, 252, 0, 1)',
                        0.8,
                        'rgba(255, 255, 63, 1)',
                        1,
                        'rgba(255, 255, 255, 1)',
                        ],
                        radius: 20,
                        intensity: 0.8,
                        opacity: 0.8,
                        downscale: 1,
                    },
                    });
                }
            )

            map.on('styleload', () => {
                map?.addLayer({
                id: 'dtp-data-layer', // ID каждого слоя должен быть уникальным
                // Фильтрация или выбор данных для этого слоя
                filter: [
                    'all',
                    [
                        'match',
                        ['sourceAttr', 'visible'],
                        [true],
                        true, // Значение при совпадении атрибута 'visible' источника со значением 'true'
                        false, // Значение при несовпадении
                    ]
                ],
                // Тип объекта отрисовки
                type: 'point',
                // Стиль объекта отрисовки
                style: {
                    iconImage: 'shopping-cart',
                    iconWidth: 15,
                    iconPriority: 100,
                    textField: ['get', 'weather'],
                    textFont: ['Helvetica'],
                    textColor: '#202020',
                    textHaloColor: '#fff',
                    textHaloWidth: 1,
                    textPriority: 1
                },
                });
            });

            /**
             * Ruler  plugin
             */

            const rulerControl = new RulerControl(map, { position: 'centerRight' });

            /**
             * Clusterer plugin
             */

            clusterer = new Clusterer(map, {
                radius: 60,
            });

            const markers = [
                { coordinates: [55.27887, 25.21001] },
                { coordinates: [55.30771, 25.20314] },
                { coordinates: [55.35266, 25.24382] },
            ];
            clusterer.load(markers);

            /**
             * Directions plugin
             */

            directions = new Directions(map, {
                directionsApiKey: 'rujany4131', // It's just demo key
            });

            directions.carRoute({
                points: [
                    [55.28273111108218, 25.234131928828333],
                    [55.35242563034581, 25.23925607042088],
                ],
            });

            setMapglContext({
                mapglInstance: map,
                rulerControl,
                mapgl,
            });
        });



        // Destroy the map, if Map component is going to be unmounted
        return () => {
            directions && directions.clear();
            clusterer && clusterer.destroy();
            map && map.destroy();
            setMapglContext({ mapglInstance: undefined, mapgl: undefined });
        };
    }, [setMapglContext]);

    useControlRotateClockwise();

    return (
        <>
            <MapWrapper />
            <ControlRotateCounterclockwise />
        </>
    );
}
