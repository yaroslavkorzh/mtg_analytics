/**
 * @author Jason Nadro
 * @license MIT
 * @version 0.1
 */

'use strict';
 
var testObj = {
      name: "Lorem Ipsum",
      number: 101.1
    };

// this will only work for simple properites
// and if the properties are in the same order.
function compareObjects(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function assert(condition, msg) {
  if (condition) {
    console.log("\tPASSED: " + msg);
    return true;
  } else {
    console.log("\tFAILED: " + msg);
    return false;
  }
}

function test(name, testFunc) {
  // Clear local storage before each test
  window.localStorage.clear();
  console.log("Running..." + name);
  testFunc();
}

test("Database Constructor", function() {
  var db = new Database("testDatabase");
  assert(db.length() === 0, "Database should be empty upon creation.");
});

test("Database Insert", function() {
  var db = new Database("testDatabase");
  var i = db.insert(testObj);
  assert(db.length() === 1, "Database should only contain 1 object.");
  assert(i === 0, "Insert should return the index of the object.");

  var collection = JSON.parse(window.localStorage.getItem(db.name));
  assert(Array.isArray(collection) === true, "Collection should be an array.");
  assert(collection.length === 1, "Serialized collection should contain 1 object.");
  assert(compareObjects(collection[0], testObj), "First item in collection should be testObj.");

  i = db.insert(testObj);
  assert(db.length() === 2, "Database should contain 2 objects.");
});

test("Database unique insert", function() {
  var db = new Database("testDatabase", "name");
  var i = db.insert(testObj);
  var j = db.insert(testObj);
  assert(db.length() === 1, "Inserting the same object shouldn't work.");
  assert(i === j, "Inserting the same object should give the same index.");

  var k = db.insert({ name: "New Item", number: 42 });
  assert(db.length() === 2, "Insert of new object should work.");
  assert(k !== i, "Index of new object should be different.");
});

test("Database Find", function() {
  var db = new Database("testDatabase");
  var i = db.insert(testObj);
  var found = db.find(i);
  assert(compareObjects(found, testObj), "Test object equals database object.");
});

test("Database Remove", function() {
  var db = new Database("testDatabase");
  var i = db.insert(testObj);
  db.delete(i);
  assert(db.find(i) === undefined, "Shouldn't be able to find removed object.");
  assert(db.length() === 0, "Database should be empty.");
});

test("Database Clear", function() {
  var db = new Database("testDatabase");
  for (var i = 0; i < 10; i++) {
    db.insert(testObj);
  }
  assert(db.length() === 10, "Database should contain 10 objects.");

  db.clear();
  assert(db.length() === 0, "Database should be empty after a clear.");
});

test("Existing Database", function() {
  var db = new Database("testDatabase");
  db.insert(testObj);
  db.insert(testObj);

  var newDb = new Database("testDatabase");
  assert(newDb.length() === 2, "Database by the same name should have the same items.");
});

test("Querying all items", function() {
  var db = new Database("testDatabase");
  var items = db.query();
  assert(Array.isArray(items) === true, "Queried items should be an array.");
  assert(items.length === 0, "Array should be empty.");

  db.insert(testObj);
  db.insert(testObj);
  db.insert(testObj);

  assert(items.length === 3, "Should have 3 items after 3 insertions.");
});
