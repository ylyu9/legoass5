/********************************************************************************
* WEB322 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: __Yingtong Lyu__ Student ID: __143631224__ Date: __4/19/2024__
*
********************************************************************************/

// Load environment variables
require('dotenv').config();



const mongoose = require('mongoose');

// Schema definitions
const themeSchema = new mongoose.Schema({
    id: Number,
    name: String,
}, { collection: 'themes' });

const setSchema = new mongoose.Schema({
    set_num: { type: String, unique: true },
    name: String,
    year: Number,
    theme_id: Number,
    num_parts: Number,
    img_url: String,
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' }
});

// Model definitions
const Theme = mongoose.model('Theme', themeSchema);
const Set = mongoose.model('Set', setSchema);

// Database initialization
async function initDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_LOGIN, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

// Theme creation
async function addSet(setData) {
  try {
      const newSet = new Set(setData);
      await newSet.save();
      console.log('New set added:', newSet);
      return newSet;
  } catch (error) {
      console.error('Error adding new set:', error);
      throw error;  // Rethrow the error so it can be caught by the calling function
  }
}


// Fetch all themes
async function fetchAllThemes() {
    try {
        const themes = await Theme.find({});
        return themes;
    } catch (error) {
        console.error('Fetching themes failed:', error);
        throw error;
    }
}

// Update set information
async function editSet(setNumber, modifications) {
    try {
        const updatedSet = await Set.findOneAndUpdate({ set_num: setNumber }, modifications, { new: true }).populate('theme');
        if (!updatedSet) {
            console.log(`No set found with number ${setNumber}.`);
            return null;
        }
        console.log('Set updated:', updatedSet);
        return updatedSet;
    } catch (error) {
        console.error('Updating set failed:', error);
        throw error;
    }
}

// Delete a set
async function deleteSet(setNum) {
  try {
      const set = await Set.findOneAndDelete({ set_num: setNum });
      if (!set) {
          console.log(`No set found with set_num ${setNum}.`);
          return null;
      }
      console.log('Set removed:', set);
      return set;
  } catch (error) {
      console.error(`Error deleting set with set_num ${setNum}:`, error);
      throw error;
  }
}

// Get all sets
async function getAllSets() {
  try {
    const sets = await Set.find().populate('theme');
    return sets;
  } catch (error) {
    console.error('Error retrieving all sets:', error);
    throw error;
  }
}

// Retrieve a set by number
async function getSetByNum(setNum) {
  try {
      const set = await Set.findOne({ set_num: setNum }).populate('theme');
      return set;
  } catch (error) {
      console.error(`Error finding set by number ${setNum}:`, error);
      throw error;
  }
}

async function getSetsByTheme(themeName) {
  try {
    const theme = await Theme.findOne({ name: themeName });
    if (!theme) {
      throw new Error(`Theme ${themeName} not found`);
    }
    const sets = await Set.find({ theme: theme._id }).populate('theme');
    return sets;
  } catch (error) {
    console.error(`Error finding sets by theme ${themeName}:`, error);
    throw error;
  }
}

// Exporting the functions
module.exports = {
    Theme,
    addSet,
    fetchAllThemes,
    editSet,
    deleteSet,
    getSetByNum,
    getAllSets,
    getSetsByTheme
};

initDatabase();
