require('dotenv').config(); // Load the environment variables from the .env file

const mongoose = require('mongoose');

// Define the schemas before using them in the mongoose model
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
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' } // Link to the Theme model 
});

const Theme = mongoose.model('Theme', themeSchema);
const Set = mongoose.model('Set', setSchema);

const setData = require('./data/setData.json');
const themeData = require('./data/themeData.json');

async function initialize() {
    try {
        await mongoose.connect(process.env.MONGODB_LOGIN, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to the database');
    } catch (err) {
        console.error(`Failed to connect to the database: ${err}`);
    }
}

async function insertData() {
    try {
        await Theme.insertMany(themeData);
        console.log('Themes inserted successfully.');

        const themes = await Theme.find();
        const themeMap = themes.reduce((map, theme) => {
            map[theme.id] = theme._id;
            return map;
        }, {});

        const updatedSets = setData.map(set => ({
            ...set,
            theme: themeMap[set.theme_id] 
        }));

        await Set.insertMany(updatedSets);
        console.log('Sets inserted successfully.');
    } catch (error) {
        console.error('Failed to insert data:', error);
    }
}

async function createTheme(data) {
    try {
        const theme = new Theme(data);
        await theme.save();
        console.log('Theme created:', theme);
        return theme;
    } catch (error) {
        console.error('Failed to create theme:', error);
        throw error;
    }
}

async function getAllTheme() {
    try {
        const themes = await Theme.find();
        return themes;
    } catch(error) {
        console.error('Failed to get themes:', error);
        throw error;
    }
}

async function updateSet(setNum, updateData) {
    try {
        const set = await Set.findOneAndUpdate({ set_num: setNum }, updateData, { new: true}).populate('theme'); // Return the updated document and populate the theme field with the theme data
        if (!set) {
            console.log(`Set with set_num ${setNum} not found.`);
            return null;
        }
        console.log('Set updated:', set);
        return set;
    } catch (error) {
        console.error('Failed to update set:', error);
        throw error;
    }
}

async function deleteSet(setId) {
    try {
        const result = await Set.findByIdAndDelete(setId);
        if (!result) {
            console.log(`Set with id ${setId} not found.`);
            return null;
        }
        console.log('Set deleted:', result);
    } catch (error) {
        console.error('Failed to delete set:', error);
        throw error;
    }
}

async function getSetByNum(setNum) {
    try {
        const set = await set.findOne({ set_num: setNum}).populate('theme');
        return set; // Return the set document
    } catch (error) {
        console.error('Failed to get set:', error);
        throw error;
    }
}

module.exports = { createTheme, getAllTheme, updateSet, deleteSet, getSetByNum}

initialize();
insertData();
