let map = L.map('mi_mapa').setView([-34.6140, -58.3855],16)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.on("click", OnMapClick)
map.on("contextmenu", cerrarPanel)
const markersLayer = L.layerGroup().addTo(map);
const markersLayerDatos = L.layerGroup().addTo(map);
const maxSlider = document.getElementById("mi_slider").max;



function cerrarPanel() {
    document.getElementById("confi_layer").classList.remove('active');
    cleanLayers()
    cleanRadius()
}

function OnMapClick(e) {
    cleanLayers()
    L.marker([e.latlng.lat,e.latlng.lng]).addTo(markersLayer).bindPopup("posicion seleccionada")
    document.getElementById("lat").value=e.latlng.lat
    document.getElementById("lng").value=e.latlng.lng
    drawZone(e.latlng)
}


function actualizarTamaño() {
    var count=0;
    markersLayer.eachLayer(layer => {
        posicion = layer.getLatLng()
        count++;
    });
    if(count>1){
        console.log("hay mas de 1 layer en la lista")        
    }
    drawZone(posicion)
}

function drawZone(posicion) {
    cleanRadius()
    //document.getElementById("confi_layer").style.display="block";
    document.getElementById("confi_layer").classList.add('active');
    var tamaño = document.getElementById("mi_slider").value;
    document.getElementById("val_slider").innerHTML = tamaño;
    zoneCircle = L.circle(posicion, {radius: tamaño,color: "red",fillOpacity: 0.3}).addTo(markersLayer);
}

function cleanLayers() {
    markersLayer.clearLayers()
}

function cleanRadius() {
    markersLayer.eachLayer(layer => {
        if(layer instanceof L.Circle){
            layer.remove()
        }
    });
}


window.onload = function() {
    console.log("Toda la página (incluyendo imágenes) ha cargado.");
    fetch("/api/eventos")
    .then(res => res.json())
    .then(eventos => {
        eventos.forEach(e => {
        var imgIcon= L.divIcon({
            html: `<img src="static/uploads/${e.imagen}" class="img-marker">`,
            iconSize: [40, 40],
            className: ""
        });
        console.log(e.imagen);
        L.marker([e.lat, e.lng], {
            icon : imgIcon,
            radius: e.radius,
            idEvento: e.id,
            tipo:e.descripcion
        })
        .addTo(markersLayerDatos)
        .bindPopup(`<div class="popup-evento">
                        <h2> Nombre: </h2>  <br> 
                        <b>Descripción:</b>  e.descripcion  <br>
                    </div>
                `);
        });
    });


    if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log("Lat:", lat, "Lng:", lng);

            L.marker([lat, lng],{tipo: "posicion_actual"})
                .addTo(markersLayerDatos)
                .bindPopup("📍 Estás acá")
                .openPopup();

            map.setView([lat, lng], 15);
        },
        function (error) {
            console.error("Error obteniendo ubicación:", error);
        }
    );
} else {
    alert("Tu navegador no soporta geolocalización 😬");
}


    
};

function BuscarCordenadas() {
    console.log(L);
    console.log(L.Routing);
    console.log(L.Routing);
    const input = document.getElementById("searchInput");
    const resultsDiv = document.getElementById("results");
    const query = input.value.trim();
    console.log("hola")
        fetch(`/buscarCordenadas?palabra=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if(data){
                const lat = data.lat;
                const lng = data.lng;
                crearCamino(lat,lng)
            } else{
                alert("no pudimos encontrar el evento")
            }
            
        });
}

function crearCamino(finalLat,finalLng) {
        markersLayerDatos.eachLayer((layer) => {
            if(layer.options.tipo==="posicion_actual"){
                posicion_actual= layer.getLatLng();
            }
        });
        L.Routing.control({
        waypoints: [
            L.latLng(posicion_actual.lat, posicion_actual.lng), // Punto A
            L.latLng(finalLat, finalLng)  // Punto B
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        lineOptions: {
            addWaypoints: false
        },
        show: false
    }).addTo(map);
    

}

function buscador() {
    const input = document.getElementById("searchInput");
    const resultsDiv = document.getElementById("results");
    const query = input.value.trim();

    resultsDiv.innerHTML = "";

    fetch(`/buscar?palabra=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                resultsDiv.innerHTML = "";

                data.forEach(place => {
                    console.log("el nombre es " + place)
                    const div = document.createElement("div");
                    div.className = "result-item";
                    div.textContent = place;

                    resultsDiv.appendChild(div);

                    div.addEventListener("click", () => {
                            // 1️⃣ completar el input
                            input.value = div.textContent;
                    });
                });
            });
}