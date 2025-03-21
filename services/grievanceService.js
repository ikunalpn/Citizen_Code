const Grievance = require('../models/grievanceModel');

const GrievanceService = {
    create: (grievance, callback) => {
        Grievance.create(grievance, callback);
    },
    getAll: (callback) => {
        Grievance.getAll(callback);
    },
    getById: (grievanceId, callback) => {
        Grievance.getById(grievanceId, callback);
    },
    update: (grievanceId, grievance, callback) => {
        Grievance.update(grievanceId, grievance, callback);
    },
    delete: (grievanceId, callback) => {
        Grievance.delete(grievanceId, callback);
    },
    getByCitizenId: (citizenId, callback) => {
        Grievance.getByCitizenId(citizenId, callback);
    }
    //... other methods
};

module.exports = GrievanceService;