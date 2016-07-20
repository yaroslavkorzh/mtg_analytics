/**
 * Provides CRUD interface for a collection of json objects.
 *
 * @author Jason Nadro
 * @license MIT
 * @version 0.1
 */

 'use strict';

/**
 * Database is a collection (array) of json objects.
 *
 * @param {string} name - Used to uniquely identify the database.
 * @constructor
 */
function Database(name, uniqueId) {
  // @todo should really make this data private
  this.name = name;
  this.uniqueId = uniqueId || "";
  this.storage = localStorage;

  this.data = JSON.parse(this.storage.getItem(this.name));
  if (this.data === null) {
    this.clear();    
  }
}

/**
 * Clears all entries from the database.
 */
Database.prototype.clear = function() {
  // @todo should really make this data private
  this.data = [];
  this.storage.setItem(this.name, JSON.stringify(this.data));
}

/**
 * Returns the number of objects in the collection.
 *
 * @this {Database}
 * @return {number} - How many objects are in the collection.
 */
Database.prototype.length = function() {
  return this.data.length;
}

// Implement a CRUD interface

/**
 * Implements the C in CRUD by inserting a new object into
 * the collection.
 *
 * @this {Database}
 * @param {object} value - The object to insert.
 */
Database.prototype.insert = function(value) {
  if (this.uniqueId !== "") {
    for (var i = 0; i < this.data.length; i++) {
      // @todo What if this.uniqueId is undefined for either?
      // @todo What if the property is an object?
      // @todo What if the property is an array?
      if (this.data[i][this.uniqueId] === value[this.uniqueId]) {
        return i;
      }
    } 
  }

  var i = this.data.push(value) - 1;
  this.storage.setItem(this.name, JSON.stringify(this.data));   

  return i;
};

/**
 * Implements the R in CRUD by finding an existing
 * object based on supplied function
 *
 * @this {Database}
 * @param {number} i - Index to find in the array.
 */
Database.prototype.find = function(i) {
  return this.data[i];
};

/**
 * Implements the U in CRUD by updating the item in the
 * collection and saving the collection to localStorage.
 *
 * Becasuse I am lazy the update just wholesale replaces
 * the existing object with the one passed in.
 *
 * @this {Database}
 * @param {number} i - Index to update in the array.
 * @param {object} value - the data to update.
 */
Database.prototype.update = function(i, value) {
  // if this is a valid index.
  if (i >= 0 && i < this.data.length) {    
    var obj = this.find(i);
    // if we found the object and they are the same
    // object (they have a unique ID and they match.)
    if (obj[this.uniqueId] === value[this.uniqueId] 
        && value[this.uniqueId] !== undefined) {
      this.data[i] = value;
      this.storage.setItem(this.name, JSON.stringify(this.data));
    }
  }
};

/**
 * Implements the D in CRUD by removing an item from the 
 * collection and saving the collection to localStorage.
 *
 * @this {Database}
 * @param {number} i - Index to remove from the array.
 */
Database.prototype.delete = function(i) {
  this.data.splice(i, 1);
  this.storage.setItem(this.name, JSON.stringify(this.data));
};

/**
 * Returns all objects in the collection.
 *
 * @this {Database}
 * @todo Make this a generic version of find.
 */
Database.prototype.query = function() {
  return this.data;
};

