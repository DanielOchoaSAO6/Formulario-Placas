// Usamos axios en lugar de fetch para compatibilidad
const axios = require('axios');

async function createVehicle() {
  try {
    console.log('Probando la creación de un vehículo sin conductor...');
    
    const query = `
      mutation {
        createVehicle(input: {
          placa: "XYZ789",
          estado: "ACTIVO",
          tipoVehiculo: "AUTOMOVIL",
          origen: "PESV",
          cargo: "OPERARIO",
          area: "MANTENIMIENTO"
        }) {
          id
          placa
          estado
          tipoVehiculo
          origen
          conductorId
          cargo
          area
          createdAt
        }
      }
    `;
    
    const response = await axios.post('http://localhost:4000/graphql', {
      query
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = response.data;
    console.log('Resultado de la creación del vehículo:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.errors) {
      console.error('Error al crear el vehículo:', result.errors);
    } else {
      console.log('Vehículo creado exitosamente!');
      console.log('Verifica en la hoja de Google Sheets si el registro fue añadido.');
    }
  } catch (error) {
    console.error('Error al hacer la solicitud:', error);
  }
}

createVehicle();
