import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useLocation } from 'react-router-dom';

// Definición de la consulta GraphQL
const GET_VEHICLE_BY_PLACA = gql`
  query GetVehicleByPlaca($placa: String!) {
    getVehicleByPlaca(placa: $placa) {
      id
      placa
      estado
      tipoVehiculo
      origen
      cargo
      area
      createdAt
      conductor {
        id
        name
      }
    }
  }
`;

const VehicleVerification: React.FC = () => {
  const [placa, setPlaca] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [startTour, setStartTour] = useState(false);
  
  // Obtener parámetros de la URL para verificar si debemos iniciar el tour
  const location = useLocation();
  
  useEffect(() => {
    // Verificar si hay un parámetro startTour=true en la URL
    const params = new URLSearchParams(location.search);
    if (params.get('startTour') === 'true') {
      setStartTour(true);
    }
  }, [location]);
  
  // Consulta GraphQL para buscar vehículo
  const [getVehicle, { loading, error, data }] = useLazyQuery(GET_VEHICLE_BY_PLACA, {
    fetchPolicy: 'network-only', // No usar caché para esta consulta
    onCompleted: () => {
      setSearchPerformed(true);
    },
    onError: () => {
      setSearchPerformed(true);
    }
  });
  
  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (placa.trim()) {
      getVehicle({ variables: { placa: placa.trim() } });
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <DirectionsCarIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Verificación de Vehículo
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Ingresa la placa de tu vehículo para verificar su registro
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Placa del Vehículo"
                variant="outlined"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                inputProps={{ maxLength: 7 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading || !placa.trim()}
              >
                {loading ? <CircularProgress size={24} /> : 'Verificar'}
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {/* Resultados de la búsqueda */}
        {searchPerformed && (
          <Box sx={{ mt: 4 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                No se encontró ningún vehículo con la placa {placa}
              </Alert>
            ) : data?.getVehicleByPlaca ? (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  ¡Vehículo encontrado! A continuación se muestra la información registrada.
                </Alert>
                
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.light' }}>
                        <TableCell colSpan={2}>
                          <Typography variant="h6">Información del Vehículo</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" width="40%"><strong>Placa</strong></TableCell>
                        <TableCell>{data.getVehicleByPlaca.placa}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row"><strong>Estado</strong></TableCell>
                        <TableCell>{data.getVehicleByPlaca.estado}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row"><strong>Tipo de Vehículo</strong></TableCell>
                        <TableCell>{data.getVehicleByPlaca.tipoVehiculo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row"><strong>Origen</strong></TableCell>
                        <TableCell>{data.getVehicleByPlaca.origen}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row"><strong>Cargo</strong></TableCell>
                        <TableCell>{data.getVehicleByPlaca.cargo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row"><strong>Área</strong></TableCell>
                        <TableCell>{data.getVehicleByPlaca.area}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row"><strong>Fecha de Registro</strong></TableCell>
                        <TableCell>{formatDate(data.getVehicleByPlaca.createdAt)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {data.getVehicleByPlaca.conductor && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.light' }}>
                          <TableCell colSpan={2}>
                            <Typography variant="h6">Información del Conductor</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row" width="40%"><strong>Cédula</strong></TableCell>
                          <TableCell>{data.getVehicleByPlaca.conductor.id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row"><strong>Nombre</strong></TableCell>
                          <TableCell>{data.getVehicleByPlaca.conductor.name}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            ) : (
              <Alert severity="info">
                No se encontró información para la placa ingresada.
              </Alert>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VehicleVerification;
