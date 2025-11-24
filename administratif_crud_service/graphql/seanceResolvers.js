const { UserInputError } = require('apollo-server-express');

const seanceResolvers = {
  Query: {
    getSeances: async (_, __, { models }) => {
      try {
        console.log('📊 Getting all seances via GraphQL');
        // Return empty array since we're using REST API
        return [];
      } catch (error) {
        console.error('Error fetching seances:', error);
        throw new Error('Failed to fetch seances');
      }
    },

    getSeancesByGroupe: async (_, { id_groupe }, { models }) => {
      try {
        console.log(`📊 Getting seances for group ${id_groupe} via GraphQL`);
        // Return empty array since we're using REST API
        return [];
      } catch (error) {
        console.error('Error fetching seances by groupe:', error);
        throw new Error('Failed to fetch seances by groupe');
      }
    },

    getSeancesByDay: async (_, { day_of_week }, { models }) => {
      try {
        console.log(`📊 Getting seances for day ${day_of_week} via GraphQL`);
        // Return empty array since we're using REST API
        return [];
      } catch (error) {
        console.error('Error fetching seances by day:', error);
        throw new Error('Failed to fetch seances by day');
      }
    }
  },

  Mutation: {
    createSeance: async (_, { input }, { models, checkConflict }) => {
      try {
        console.log('🔄 Creating seance via GraphQL (mock):', input);
        
        // Validate required fields
        const requiredFields = ['id_salle', 'id_groupe', 'id_enseignant', 'day_of_week', 'heure_debut', 'heure_fin'];
        const missingFields = requiredFields.filter(field => !input[field]);
        
        if (missingFields.length > 0) {
          throw new UserInputError(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Create mock seance
        const mockSeance = {
          id: Math.floor(Math.random() * 1000),
          ...input,
          salle: { numero: 'Mock Room' },
          matiere: { nom: 'Mock Subject' },
          groupe: { nom: 'Mock Group' },
          enseignant: { nom: 'Mock', prenom: 'Teacher' }
        };

        console.log('✅ Mock seance created successfully');
        return mockSeance;
        
      } catch (error) {
        console.error('❌ Error creating seance:', error);
        if (error instanceof UserInputError) throw error;
        throw new Error(`Failed to create seance: ${error.message}`);
      }
    },

    updateSeance: async (_, { input }, { models, checkConflict }) => {
      try {
        console.log('🔄 Updating seance via GraphQL (mock):', input);
        
        // Return mock updated seance
        const mockSeance = {
          ...input,
          salle: { numero: 'Mock Room' },
          matiere: { nom: 'Mock Subject' },
          groupe: { nom: 'Mock Group' },
          enseignant: { nom: 'Mock', prenom: 'Teacher' }
        };

        return mockSeance;
      } catch (error) {
        console.error('Error updating seance:', error);
        throw new Error('Failed to update seance');
      }
    },

    deleteSeance: async (_, { id }, { models }) => {
      try {
        console.log(`🗑️ Deleting seance ${id} via GraphQL (mock)`);
        return true;
      } catch (error) {
        console.error('Error deleting seance:', error);
        throw new Error('Failed to delete seance');
      }
    },

    checkSeanceConflict: async (_, { input }, { models, checkConflict }) => {
      try {
        console.log('🔍 Checking conflicts via GraphQL (mock):', input);
        // Return empty array - conflicts are checked in REST API
        return [];
      } catch (error) {
        console.error('Error checking conflicts:', error);
        throw new Error('Failed to check conflicts');
      }
    }
  }
};

module.exports = seanceResolvers;