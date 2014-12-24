var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var CompanyConstants = require('../constants/CompanyConstants');

var TaskData = require('../utils/TaskData');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';
var MAX_COMPANIES_TO_COMPARE = TaskData.MAX_COMPANIES_TO_COMPARE;
console.log('TaskData',TaskData);

var _companies = {};
var _selected_companies = {};
var _max_companies_selected = false;


function fetch(){
  return $.getJSON(TaskData.JSON_URL)
    .done(function(data) {
      _companies = {};
      for(var i in data){
        console.log(i, data[i])
        _companies[data[i].id] = data[i];
      }
      // _companies = {
      //   1: {title: 'company1', metrics: {test: 5, test1: 0}},
      //   2: {title: 'company2', metrics: {test: 14, test1: 0}},
      //   3: {title: 'company2', metrics: {test: 1, test1: 30}},
      // }
      console.log(_companies)
      
    });
}

function selectCompany(id) {
  var selected_len = _.keys(_selected_companies).length;
  if(selected_len == MAX_COMPANIES_TO_COMPARE){
    return false;
  }
  if(selected_len == MAX_COMPANIES_TO_COMPARE - 1){
    _max_companies_selected = true;
  }
  _selected_companies[id] = _companies[id];

};

function deselectCompany(id) {
  delete _selected_companies[id];
  _max_companies_selected = false;
};

function toggle(id) {
  if(id in _selected_companies){
    deselectCompany(id);
  } else {
    selectCompany(id);
    
  }
};

var CompanyStore = assign({}, EventEmitter.prototype, {

  /**
   * Get the entire collection of Companies.
   * @return {object}
   */
  getAll: function() {
    return _companies;
  },
  getSelected: function() {
    return _selected_companies;
  },

  isMaxSelected: function() {
    return _max_companies_selected;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// Register to handle all updates
AppDispatcher.register(function(payload) {
  var action = payload.action;
  var text;

  switch(action.actionType) {
    case CompanyConstants.COMPANY_TOGGLE:
      toggle(action.id);
      break;

    case CompanyConstants.FETCH:
      fetch()
      .done(function() {
        CompanyStore.emitChange();
        
      });
      break
    default:
      return true;
  }

  // This often goes in each case that should trigger a UI change. This store
  // needs to trigger a UI change after every view action, so we can make the
  // code less repetitive by putting it here.  We need the default case,
  // however, to make sure this only gets called after one of the cases above.
  CompanyStore.emitChange();

  return true; // No errors.  Needed by promise in Dispatcher.
});

module.exports = CompanyStore;