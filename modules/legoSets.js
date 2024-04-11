/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: __Yingtong Lyu__ Student ID: __143631224__ Date: __4/11/2024__
*
********************************************************************************/

const setData = require("../data/setData.json");
const themeData = require("../data/themeData.json");

require("dotenv").config(); //This will allow us to access the DB_USER, DB_DATABASE
const Sequelize = require("sequelize");

// let sets = []; // empty array to store processed LEGO set data

let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: {rejectUnauthorized: false, },
  }
});

const Theme = sequelize.define('Theme', {
    id: { 
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    name: Sequelize.STRING
}, { timestamps: false });
  
const Set = sequelize.define('Set', {
    set_num: { 
        type: Sequelize.STRING, 
        primaryKey: true 
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING
}, { timestamps: false });
  
Set.belongsTo(Theme, { 
    foreignKey: 'theme_id' 
});

// Initialize function
function initialize() {
    return new Promise(async (resolve, reject) => {
      try {
        await sequelize.sync();
  
        // Check for default themes in the DB
        const themesCount = await Theme.count();
        if (themesCount === 0) {
          // The theme table is empty, we can insert default themes
          await Theme.bulkCreate(themeData);
        }
  
        // Check for default sets in the DB
        const setsCount = await Set.count();
        if (setsCount === 0) {
          // The set table is empty, we can insert default sets
          await Set.bulkCreate(setData);
        }
  
        resolve();
      } catch (error) {
        console.error('Error syncing database:', error);
      }
    });
  }
  
// getAllSets function
async function getAllSets() {
    try{
      const sets = await Set.findAll({include: [Theme]});
      return sets;
    }catch(error){
      console.error("get all sets error: ", error);
      throw error;
    }
  }

// getSetByNum function
async function getSetByNum(setNum) {
    try{
      const set = await Set.findOne({
        where: { set_num: setNum},
        include: [Theme],
      });
  
      if(set){ 
        return set;
      }else{
        throw `Unable to find requested set: ${setNum}`;
      }
    }catch(err){
      console.error("getting set by set_num error:", err);
    }
  }

// getSetsByTheme function
async function getSetsByTheme(theme) {
    try {
      const sets = await Set.findAll({
        include: [Theme],
        where: {
          "$Theme.name$": {
            [Sequelize.Op.iLike]: `%${theme}%`,
          },
        },
      });
  
      if (sets.length > 0) {
        return sets;
      } else {
        throw `Unable to find requested sets: ${theme}`;
      }
    } catch (error) {
      console.error("getting set by theme error:", error);
      throw error; 
    }
  }

  const addSet = async(setData) =>{
    try{
        console.log(setData);
        await Set.create(setData);
    }catch(err){
        throw err.errors[0].message;
    }
  }
  
  const getAllThemes = async () =>{
    try{
      const themes = await Theme.findAll();
      return themes;
    }catch(err){
      throw err;
    }
  }
  
  const editSet = async (setNum, setData) => {
    try {
      await Set.update(setData, { where: { set_num: setNum } });
    } catch (err) {
      throw err.errors[0].message;
    }
  };
  
  //remove (delete)
  const deleteSet = async (setNum) =>{
    try{
      await Set.destroy({where: {set_num: setNum}});
    }catch(err){
      throw err.errors[0].message; 
    }
  }
  
  module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };