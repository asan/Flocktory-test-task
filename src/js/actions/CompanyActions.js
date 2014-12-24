var AppDispatcher = require('../dispatcher/AppDispatcher');
var CompanyConstants = require('../constants/CompanyConstants');


var CompanyActions = {

  /**
   * Toggle whether a single Company is selected
   * @param  {object} Company
   */
  toggleComplete: function(id) {
    AppDispatcher.handleAction({
      actionType: CompanyConstants.COMPANY_TOGGLE,
      id: id
    });
  },
  fetch: function() {
    AppDispatcher.handleAction({
      actionType: CompanyConstants.FETCH
    });
  }

};

module.exports = CompanyActions;
