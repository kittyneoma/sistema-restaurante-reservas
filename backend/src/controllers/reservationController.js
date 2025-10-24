const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/TableModelClass');

// Crear reserva
const createReservation = async (req, res) => {
  try {
    const {
      restaurantId,
      tableId,
      reservationDate,
      reservationTime,
      partySize,
      specialRequests
    } = req.body;

    // Validaciones
    if (!restaurantId || !reservationDate || !reservationTime || !partySize) {
      return res.status(400).json({
        error: 'Restaurante, fecha, hora y número de personas son requeridos'
      });
    }

    if (partySize < 1) {
      return res.status(400).json({
        error: 'El número de personas debe ser al menos 1'
      });
    }

    // Verificar que la fecha no sea en el pasado
    const reservationDateTime = new Date(`${reservationDate} ${reservationTime}`);
    const now = new Date();

    if (reservationDateTime < now) {
      return res.status(400).json({
        error: 'No se puede hacer una reserva en el pasado'
      });
    }

    // Si se especificó una mesa, verificar disponibilidad
    if (tableId) {
      const isAvailable = await Reservation.checkAvailability(tableId, reservationDate, reservationTime);
      
      if (!isAvailable) {
        return res.status(400).json({
          error: 'La mesa seleccionada no está disponible en ese horario'
        });
      }

      // Verificar que la mesa tenga capacidad suficiente
      const table = await Table.findById(tableId);
      if (table.capacity < partySize) {
        return res.status(400).json({
          error: `La mesa seleccionada solo tiene capacidad para ${table.capacity} personas`
        });
      }
    } else {
      // Si no se especificó mesa, buscar una disponible automáticamente
      const availableTables = await Reservation.getAvailableTables(
        restaurantId, reservationDate, reservationTime, partySize
      );

      if (availableTables.length === 0) {
        return res.status(400).json({
          error: 'No hay mesas disponibles para esa fecha, hora y número de personas'
        });
      }

      // Asignar la primera mesa disponible (la de menor capacidad que cumpla)
      req.body.tableId = availableTables[0].id;
    }

    const reservationData = {
      userId: req.user.id,
      restaurantId,
      tableId: req.body.tableId || tableId,
      reservationDate,
      reservationTime,
      partySize,
      specialRequests
    };

    const newReservation = await Reservation.create(reservationData);

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reservation: newReservation
    });

  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      error: 'Error al crear reserva',
      details: error.message
    });
  }
};

// Obtener disponibilidad (mesas disponibles para fecha/hora)
const getAvailability = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date, time, partySize } = req.query;

    if (!date || !time || !partySize) {
      return res.status(400).json({
        error: 'Fecha, hora y número de personas son requeridos'
      });
    }

    const availableTables = await Reservation.getAvailableTables(
      restaurantId, date, time, parseInt(partySize)
    );

    res.json({
      date,
      time,
      partySize: parseInt(partySize),
      available: availableTables.length > 0,
      availableTables
    });

  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({
      error: 'Error al verificar disponibilidad',
      details: error.message
    });
  }
};

// Obtener reservas del usuario actual
const getMyReservations = async (req, res) => {
  try {
    const { status, upcoming, past } = req.query;

    const filters = {
      status,
      upcoming: upcoming === 'true',
      past: past === 'true'
    };

    const reservations = await Reservation.findByUserId(req.user.id, filters);

    res.json({
      count: reservations.length,
      reservations
    });

  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      error: 'Error al obtener reservas',
      details: error.message
    });
  }
};

// Obtener reservas de un restaurante
const getRestaurantReservations = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date, status } = req.query;

    // Verificar que el usuario sea dueño del restaurante
    const isOwner = await Restaurant.isOwner(restaurantId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para ver las reservas de este restaurante'
      });
    }

    const filters = { date, status };
    const reservations = await Reservation.findByRestaurantId(restaurantId, filters);

    res.json({
      count: reservations.length,
      reservations
    });

  } catch (error) {
    console.error('Error al obtener reservas del restaurante:', error);
    res.status(500).json({
      error: 'Error al obtener reservas',
      details: error.message
    });
  }
};

// Obtener reserva por ID
const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    // Verificar permisos: debe ser el usuario que hizo la reserva o el dueño del restaurante
    const isOwner = await Restaurant.isOwner(reservation.restaurant_id, req.user.id);
    const isCustomer = reservation.user_id === req.user.id;

    if (!isOwner && !isCustomer) {
      return res.status(403).json({
        error: 'No tienes permiso para ver esta reserva'
      });
    }

    res.json({ reservation });

  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({
      error: 'Error al obtener reserva',
      details: error.message
    });
  }
};

// Actualizar estado de reserva (confirmar/rechazar por restaurante)
const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        error: 'Estado inválido. Debe ser: confirmed, cancelled o completed'
      });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    // Solo el dueño del restaurante puede cambiar el estado
    const isOwner = await Restaurant.isOwner(reservation.restaurant_id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para modificar esta reserva'
      });
    }

    const updatedReservation = await Reservation.updateStatus(id, status);

    res.json({
      message: 'Estado de reserva actualizado exitosamente',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error);
    res.status(500).json({
      error: 'Error al actualizar reserva',
      details: error.message
    });
  }
};

// Cancelar reserva (por el cliente)
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    // Solo el cliente que hizo la reserva puede cancelarla
    if (reservation.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permiso para cancelar esta reserva'
      });
    }

    // Verificar que la reserva no esté ya cancelada
    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        error: 'Esta reserva ya está cancelada'
      });
    }

    // Verificar que se pueda cancelar (mínimo 2 horas antes)
    const canCancel = await Reservation.canBeCancelled(id);
    if (!canCancel) {
      return res.status(400).json({
        error: 'No se puede cancelar una reserva con menos de 2 horas de anticipación'
      });
    }

    const cancelledReservation = await Reservation.cancel(id);

    res.json({
      message: 'Reserva cancelada exitosamente',
      reservation: cancelledReservation
    });

  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      error: 'Error al cancelar reserva',
      details: error.message
    });
  }
};

module.exports = {
  createReservation,
  getAvailability,
  getMyReservations,
  getRestaurantReservations,
  getReservationById,
  updateReservationStatus,
  cancelReservation
};