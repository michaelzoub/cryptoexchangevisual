import * as THREE from "three";
import { useRef, useEffect } from "react";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { receivedData } from "../util/fakedata";
import ThreeGlobe from 'three-globe';
import countries from "../util/countries"
import { fetchExchangeData } from "../util/fetchExchangeInfo";

export default function GlobeEarth(props) {
    const initialRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const sphereRef = useRef(null);
    const labelRef = useRef(null)

    function addCountriesToMap(exchangesArray) {
        if (!Array.isArray(exchangesArray)) return;
    
        exchangesArray.map((exchange, index) => {
            let coords;
            
            if (exchange.Country === "U.S.A") {
                coords = [40.7128, -74.0060];
            } else {
                const countryFeature = countries.features.find((c) => 
                    c.properties.name.toLowerCase().includes(exchange.Country.toLowerCase())
                );
                if (countryFeature && countryFeature.geometry && countryFeature.geometry.coordinates) {
                    coords = countryFeature.geometry.coordinates[0][0][4] || countryFeature.geometry.coordinates[0][4];
                } else {
                    coords = [0, 0];
                }
            }
    
            const lat = coords[0] || 0;
            const lng = coords[1] || 0;
    
            exchangesArray[index] = {
                lat,
                lng,
                ...exchange,
                altitude: exchange.TOTALVOLUME24H.BTC / 30000
            };
            
            console.log(exchangesArray[index]); 
        });
        return exchangesArray
    }
    
     

    useEffect(() => {

        const radius = 200

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x120636)
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.01,
            1000
        );
        camera.position.z = 215;
        camera.position.x = 0;
        camera.position.y = 0;

        //setup renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        initialRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0)
        controls.enableZoom = false
        controls.pan = false

        //controls.minPolarAngle = Math.PI / 2;
        //controls.maxPolarAngle = Math.PI / 2;

        //lighting
        const ambientLight = new THREE.AmbientLight(0xbbbbbb, 0.3);
        scene.add(ambientLight);

        const pointLight = new THREE.DirectionalLight(0xffffff, 0.8);
        pointLight.position.set(-400, 1000, 200).normalize();
        scene.add(pointLight);

        const dLight1 = new THREE.DirectionalLight(0x7982f6, 1)
        dLight1.position.set(-100, 250, 100).normalize();
        scene.add(dLight1);

        const dLight2 = new THREE.DirectionalLight(0x8466cc, 1)
        dLight1.position.set(-100, 250, 100).normalize();
        scene.add(dLight2);

        scene.fog = new THREE.Fog(0x535ef3, 140, 205)

        //globe config and creation
        receivedData.forEach((e, index) => {
            receivedData[index].altitude = e.population / 300000
        })
        const altitude = receivedData.map((e) => e.altitude)
        console.log(altitude)

        console.log(props)
        console.log(props.array)
        const test = addCountriesToMap(props.array)
        console.log(test)

        const globe = new ThreeGlobe({
            waitForGlobeReady: true,
            animateIn: true
        })
        .hexPolygonsData(countries.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.7)
        .showAtmosphere(true)
        .atmosphereColor("#3a228a")
        .atmosphereAltitude(0.25)

        //hex bins
        .hexBinPointsData(test)
        .hexBinResolution(3)
        .hexBinPointWeight(d => d.altitude)

        const globeGeometry = new THREE.SphereGeometry(radius, 80, 32)
        const globeMaterial = globe.globeMaterial()

        globeMaterial.color = new THREE.Color(0x3a228a)
        globeMaterial.emissive = new THREE.Color(0x220038)
        globeMaterial.emissiveIntensity = 0.1
        globeMaterial.metalness = 0.6
        const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial)

        globe.scale.set(2, 2, 2)

        sphereRef.current = globe
        scene.add(globe)

        //test out adding fake data
        //nyc cos = 40.7128, sin = 74.0060
        //map

        // Handle window resize
        /*const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };*/
        //window.addEventListener('resize', handleResize);

        //add stars
        for (let i = 0; i < 1000; i++) {
            //initialize geometry
            const newS = new THREE.SphereGeometry(0.8, 32, 32)
            const mesh = new THREE.MeshStandardMaterial( { 
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 1
             } )
            const star = new THREE.Mesh(newS, mesh)
            const positiveOrNegativeForX = Math.random() > 0.5 ? 1 : -1
            const positiveOrNegativeForY = Math.random() > 0.5 ? 1 : -1
            const positiveOrNegativeForZ = Math.random() > 0.5 ? 1 : -1
            star.position.set((1500 * positiveOrNegativeForX * Math.random()), (1000 * positiveOrNegativeForY * Math.random()), (500 * positiveOrNegativeForZ * Math.random()))
            scene.add(star)
        }


        // Animation
        function animate() {
            controls.update()
            if (sphereRef.current) {
                /*angle += 1
                const radius = 1 
                sphereRef.current.position.x = radius * Math.cos(angle)
                sphereRef.current.position.y = radius * Math.sin(angle)*/
            }
            renderer.render(scene, camera);
        }
        
        renderer.setAnimationLoop(animate);

        // Cleanup
        return () => {
            //window.removeEventListener('resize', handleResize);
            renderer.setAnimationLoop(null);
            renderer.dispose();
            if (initialRef.current) {
                initialRef.current.removeChild(renderer.domElement);
            }
        };
    }, [props.array]);

    return (
        <main className="w-full">
            <div 
                className="bg-white" 
                ref={initialRef} 
                style={{ width: "100vw", height: "100vh" }}
            />
            <div ref={labelRef}></div>
        </main>
    );
}